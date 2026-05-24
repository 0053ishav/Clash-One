import { addAccount, getAccountByTag, replaceEntities, replaceUpgrades, updateAccount, updateBuilderCount } from "@/services/accountService";
import { fetchPlayerFromApi } from "@/services/clashApi";
import { ensureCraftedLoaded } from "@/services/craftedService";
import { setLastJsonSync } from "@/storage/jsonSyncStorage";
import { syncProfileFromApi } from "@/storage/playerProfile";
import { useAccountStore } from "@/stores/accountStore";
import { EntityType } from "@/types/entity";
import { Upgrade } from "@/types/upgrade";
import { getSessionSource, track } from "@/utils/analytics/analytics";
import { getEntity } from "@/utils/getEntity";
import { resyncNotifications } from "@/utils/notificationSync";
import { randomUUID } from "expo-crypto";

type RawExport = {
  tag: string;
  timestamp: number;

  buildings?: {
    data: number;
    lvl: number;
    timer?: number;
    extra?: boolean;

    types?: {
      data: number;
      modules?: {
        data: number;
        lvl: number;
        timer?: number;
      }[];
    }[];
  }[];

  traps?: { data: number; lvl: number; timer?: number; extra?: boolean }[];
  heroes?: { data: number; lvl: number; timer?: number; extra?: boolean }[];
  pets?: { data: number; lvl: number; timer?: number }[];
  guardians?: { data: number; lvl: number; timer?: number }[];
  helpers?: { data: number; lvl: number; helper_cooldown?: number }[];

  units?: { data: number; lvl: number; timer?: number; extra?: boolean }[];
  spells?: { data: number; lvl: number; timer?: number; extra?: boolean }[];
  siege_machines?: { data: number; lvl: number; timer?: number; extra?: boolean }[];
};

type ActiveTask = {
  data: number;
  lvl: number;
  timer: number;
  extra?: boolean;

  isCrafted?: boolean;
  moduleId?: number;
};


type ImportResult =
  | { status: "NO_ACTIVE_BUILDERS"; tag: string }
  | {
    status: "SUCCESS";
    activeCount: number;
    skippedExpired: number;
    tag: string;
  };


function validateJson(data: any) {
  if (!data || typeof data !== "object") {
    throw new Error("INVALID_STRUCTURE");
  }

  if (typeof data.tag !== "string") {
    throw new Error("INVALID_STRUCTURE");
  }

  if (typeof data.timestamp !== "number") {
    throw new Error("INVALID_STRUCTURE");
  }

  if (
    !Array.isArray(data.buildings) &&
    !Array.isArray(data.traps) &&
    !Array.isArray(data.heroes)
  ) {
    throw new Error("INVALID_STRUCTURE");
  }
}

export function resolveUpgradeType(entityType?: EntityType): Upgrade["upgradeType"] {
  if (entityType === "pet") return "PET";
  if (entityType === "lab") return "LAB";
  return "BUILDER";
}

export function normalizeEntityType(entityType?: EntityType): Upgrade["type"] {
  switch (entityType) {
    case "building":
      return "BUILDING";
    case "hero":
      return "HERO";
    case "pet":
      return "PET";
    case "guardian":
      return "GUARDIAN";
    case "lab":
      return "LAB";
    case "troop":
      return "LAB";
    case "siege":
      return "LAB";
    case "spell":
      return "LAB";
    default:
      return "BUILDING"; // fallback (safe)
  }
}

export async function importVillageJson(
  rawText: string
): Promise<ImportResult> {
  let parsed: RawExport;
  let apiData: Awaited<ReturnType<typeof fetchPlayerFromApi>> | null = null;

  const switchAccountStore = useAccountStore.getState().switchAccount;
  const importJsonData = useAccountStore.getState().importJsonData;

  try {
    parsed = JSON.parse(rawText);
    track("json_pipeline", {
      step: "parse",
      status: "success",
      source: getSessionSource(),
    });
  } catch (e) {
    track("json_pipeline", {
      step: "parse",
      status: "failed",
      error: e,
    });
    throw new Error("INVALID_JSON");
  }

  validateJson(parsed);

  await ensureCraftedLoaded();

  console.log("📥 Import JSON tag:", parsed.tag);

  const setLastSync = useAccountStore.getState().setLastSync;

  const exportTimestampMs = parsed.timestamp * 1000;
  const now = Date.now();

  // =========================================================
  // 🔥 STEP 1: BUILD ACTIVE TASK LIST (NORMAL + CRAFTED)
  // =========================================================

  const entities: {
    id: string;
    dataId: number;
    type: "helper" | "guardian" | "pet";
    level: number;
    cooldown?: number;
  }[] = [];

  for (const h of parsed.helpers ?? []) {
    entities.push({
      id: randomUUID(),
      dataId: h.data,
      type: "helper",
      level: h.lvl,
      cooldown: h.helper_cooldown,
    });
  }

  for (const p of parsed.pets ?? []) {
    entities.push({
      id: randomUUID(),
      dataId: p.data,
      type: "pet",
      level: p.lvl,
    });
  }

  for (const g of parsed.guardians ?? []) {
    entities.push({
      id: randomUUID(),
      dataId: g.data,
      type: "guardian",
      level: g.lvl,
    });
  }

  const activeBuilderTasks: ActiveTask[] = [];

  // ✅ Normal timers
  activeBuilderTasks.push(
    ...(parsed.buildings
      ?.filter((b) => typeof b.timer === "number")
      .map((b) => ({
        data: b.data,
        lvl: b.lvl,
        timer: b.timer!,
        extra: b.extra,
      })) ?? []),

    ...(parsed.traps
      ?.filter((t) => typeof t.timer === "number")
      .map((t) => ({
        data: t.data,
        lvl: t.lvl,
        timer: t.timer!,
        extra: t.extra,
      })) ?? []),

    ...(parsed.heroes
      ?.filter((h) => typeof h.timer === "number")
      .map((h) => ({
        data: h.data,
        lvl: h.lvl,
        timer: h.timer!,
        extra: h.extra,
      })) ?? []),

    ...(parsed.pets
      ?.filter((p) => typeof p.timer === "number")
      .map((p) => ({
        data: p.data,
        lvl: p.lvl,
        timer: p.timer!,
      })) ?? []),

    ...(parsed.guardians
      ?.filter((g) => typeof g.timer === "number")
      .map((g) => ({
        data: g.data,
        lvl: g.lvl,
        timer: g.timer!,
      })) ?? []),
  );


  // ✅ 🔥 Crafted defenses (modules)
  for (const building of parsed.buildings ?? []) {
    if (!building.types) continue;

    for (const type of building.types) {
      for (const module of type.modules ?? []) {
        if (typeof module.timer === "number") {
          activeBuilderTasks.push({
            data: type.data, // defense ID
            lvl: module.lvl ?? 1,
            timer: module.timer,

            isCrafted: true,
            moduleId: module.data,
          });
        }
      }
    }
  }

  const labSources = [
    ...(parsed.units ?? []),
    ...(parsed.spells ?? []),
    ...(parsed.siege_machines ?? []),
  ];

  const activeLabs = labSources.filter(
    (u) => typeof u.timer === "number"
  );

  const activeLabTasks: ActiveTask[] = [];

  for (const lab of activeLabs) {
    activeLabTasks.push({
      data: lab.data,
      lvl: lab.lvl,
      timer: lab.timer!,
      extra: lab.extra,
    })
  }

  // =========================================================
  // 🔥 STEP 2: VALIDATE ACTIVE UPGRADES
  // =========================================================

  const validUpgrades: {
    data: number;
    remainingNow: number;
    lvl: number;
    isGoblin: boolean;

    isCrafted?: boolean;
    moduleId?: number;
  }[] = [];

  let skippedExpired = 0;

  for (const item of activeBuilderTasks) {
    const remainingMsAtExport = item.timer * 1000;
    const realEndTime = exportTimestampMs + remainingMsAtExport;
    const remainingNow = Math.max(0, realEndTime - now);

    if (remainingNow <= 0) {
      skippedExpired++;
      continue;
    }

    validUpgrades.push({
      data: item.data,
      remainingNow,
      lvl: item.lvl,
      isGoblin: item.extra === true,

      isCrafted: item.isCrafted,
      moduleId: item.moduleId,
    });
  }

  const validLabTasks: ActiveTask[] = [];

  for (const lab of activeLabTasks) {
    const remainingMsAtExport = lab.timer * 1000;
    const realEndTime = exportTimestampMs + remainingMsAtExport;
    const remainingNow = Math.max(0, realEndTime - now);

    if (remainingNow <= 0) continue;

    validLabTasks.push({
      ...lab,
      timer: remainingNow / 1000,
    });
  }

  // =========================================================
  // 🔥 API SYNC (UNCHANGED)
  // =========================================================

  const busyBuildersFromJson = validUpgrades.filter((u) => {
    const entity = getEntity(u.data);

    if (!entity) return false;

    const type = resolveUpgradeType(entity.type);

    return type === "BUILDER";
  }).length;

  const totalBuilders = Math.max(1, Math.min(busyBuildersFromJson, 6));


  try {
    apiData = await fetchPlayerFromApi(parsed.tag);

    track("json_pipeline", {
      step: "fetch",
      status: "sucesss",
      source: getSessionSource(),
    });
  } catch (e) {
    track("json_pipeline", {
      step: "fetch",
      status: "failed",
      error: e,
    });
  }

  const existing = await getAccountByTag(parsed.tag);

  if (!existing) {
    await addAccount(
      parsed.tag,
      apiData?.name ?? "Chief",
      "#fbbf24",
      apiData?.townHallLevel ?? 1,
      totalBuilders
    );
  } else {
    await updateAccount(
      parsed.tag,
      apiData?.name ?? existing.name,
      existing.color,
      apiData?.townHallLevel ?? existing.townhall
    );
    await updateBuilderCount(parsed.tag, totalBuilders);
  }

  await switchAccountStore(parsed.tag);

  if (apiData) {
    const synced = syncProfileFromApi(parsed.tag, apiData);
    useAccountStore.getState().setProfile(parsed.tag, synced);
  }

  await new Promise((resolve) => setTimeout(resolve, 50));

  if (!validUpgrades.length || !activeBuilderTasks.length) {
    await replaceUpgrades(parsed.tag, []);
    await replaceEntities(parsed.tag, entities);
    setLastSync(parsed.tag, now);
    setLastJsonSync(parsed.tag, now);
    return { status: "NO_ACTIVE_BUILDERS", tag: parsed.tag };
  }

  // =========================================================
  // 🔥 BUILD FINAL UPGRADES
  // =========================================================

  validUpgrades.sort((a, b) => a.remainingNow - b.remainingNow);

  const newUpgrades: Upgrade[] = [];
  let normalUsed = 0;

  for (const item of validUpgrades) {
    const startTime = now;
    const durationMinutes = Math.ceil(item.remainingNow / 60000);
    const endTime = now + item.remainingNow;


    let entity = getEntity(item.data);

    // 🔥 force override for crafted
    if (item.isCrafted) {
      entity = {
        name: "Crafted Defense",
        type: "BUILDING" as EntityType,
      };
    }

    if (!entity) {
      console.warn("Unknown entity: ", item.data);
      continue;
    }

    const upgradeType = resolveUpgradeType(entity.type);
    const normalizedType = normalizeEntityType(entity.type);


    let builderSlot: number | "G" | undefined;

    if (upgradeType === "BUILDER") {
      if (item.isGoblin) {
        builderSlot = "G";
      } else if (normalUsed < totalBuilders) {
        builderSlot = normalUsed;
        normalUsed++;
      } else {
        continue;
      }
    }


    newUpgrades.push({
      id: randomUUID(),
      accountTag: parsed.tag,

      dataId: item.data,
      entity: entity.name,

      type: normalizedType,
      upgradeType,

      startTime,
      durationMinutes,
      endTime,

      builderType:
        upgradeType === "BUILDER"
          ? builderSlot === "G"
            ? "GOBLIN"
            : "NORMAL"
          : undefined,

      builderSlot:
        upgradeType === "BUILDER"
          ? builderSlot
          : undefined,

      currentLevel: item.lvl,
      nextLevel: item.lvl + 1,

      isCompleted: false,
      source: "JSON",

      moduleId: item.moduleId,
      isCrafted: item.isCrafted,
    });
  }

  for (const lab of validLabTasks) {
    const startTime = now;
    const durationMinutes = Math.ceil((lab.timer * 1000) / 60000);
    const endTime = now + lab.timer * 1000;

    const entity = getEntity(lab.data);
    if (!entity) continue;

    newUpgrades.push({
      id: randomUUID(),
      accountTag: parsed.tag,

      dataId: lab.data,
      entity: entity.name,

      type: normalizeEntityType(entity.type),
      upgradeType: "LAB",

      startTime,
      durationMinutes,
      endTime,

      builderSlot: undefined,
      builderType: undefined,

      labSlot: lab.extra === true ? "GOBLIN" : "NORMAL",

      currentLevel: lab.lvl,
      nextLevel: lab.lvl + 1,

      isCompleted: false,
      source: "JSON",
    });
  }
  console.log("Writing upgrades:", newUpgrades.length);

  try {
    await importJsonData(parsed.tag, newUpgrades, entities);
    track("json_pipeline", {
      step: "import",
      status: "sucesss",
      source: getSessionSource(),
    });

  } catch (e) {
    track("json_pipeline", {
      step: "import",
      status: "failed",
      error: e,
    });
  }
  setLastJsonSync(parsed.tag, now);

  await resyncNotifications();

  const builderCountOnly = newUpgrades.filter(
    (u) => u.upgradeType === "BUILDER"
  ).length;

  return {
    status: "SUCCESS",
    activeCount: builderCountOnly,
    skippedExpired,
    tag: parsed.tag,
  };
}
