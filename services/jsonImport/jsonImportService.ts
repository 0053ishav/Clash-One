import { addAccount, getAccountByTag, updateAccount } from "@/services/accountService";
import { fetchPlayerFromApi } from "@/services/clashApi";
import { ensureCraftedLoaded } from "@/services/craftedService";
import { setLastJsonSync } from "@/storage/jsonSyncStorage";
import { syncProfileFromApi } from "@/storage/playerProfile";
import { useAccountStore } from "@/stores/accountStore";
import { EntityType } from "@/types/entity";
import { Upgrade } from "@/types/upgrade";
import { getSessionSource, track } from "@/utils/analytics/analytics";
import { getEntity } from "@/utils/getEntity";
import { projectHelperTimer } from "@/utils/helpers/projectHelperTimer";
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
    helper_timer?: number;
    helper_recurrent?: boolean;

    types?: {
      data: number;
      modules?: {
        data: number;
        lvl: number;
        timer?: number;
        helper_timer?: number;
        helper_recurrent?: boolean;
      }[];
    }[];
  }[];

  traps?: {
    data: number;
    lvl: number;
    timer?: number;
    extra?: boolean,
    helper_timer?: number;
    helper_recurrent?: boolean;
  }[];
  heroes?: {
    data: number;
    lvl: number;
    timer?: number;
    extra?: boolean,
    helper_timer?: number;
    helper_recurrent?: boolean;
  }[];

  pets?: { data: number; lvl: number; timer?: number }[];

  guardians?: {
    data: number;
    lvl: number;
    timer?: number,
    helper_timer?: number;
    helper_recurrent?: boolean;
  }[];

  helpers?: { data: number; lvl: number; helper_cooldown?: number }[];

  units?: {
    data: number;
    lvl: number;
    timer?: number;
    extra?: boolean,
    helper_timer?: number;
    helper_recurrent?: boolean;
  }[];
  spells?: {
    data: number;
    lvl: number;
    timer?: number;
    extra?: boolean,
    helper_timer?: number;
    helper_recurrent?: boolean;
  }[];
  siege_machines?: {
    data: number;
    lvl: number;
    timer?: number;
    extra?: boolean,
    helper_timer?: number;
    helper_recurrent?: boolean;
  }[];
};

type ActiveTask = {
  data: number;
  lvl: number;
  timer: number;
  extra?: boolean;

  helper_timer?: number;
  helper_recurrent?: boolean;

  hasHelper?: boolean;
  recurrentHelper?: boolean;
  helperAppliedSeconds?: number;

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

  const helperMap = new Map<
    number,
    {
      level: number;
      cooldown: number;
    }
  >();

  for (const h of parsed.helpers ?? []) {
    entities.push({
      id: randomUUID(),
      dataId: h.data,
      type: "helper",
      level: h.lvl,
      cooldown: h.helper_cooldown,
    });
    helperMap.set(h.data, {
      level: h.lvl,
      cooldown: h.helper_cooldown ?? 0,
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

        helper_timer: b.helper_timer,
        helper_recurrent: b.helper_recurrent,
        hasHelper:
          b.helper_timer != null ||
          b.helper_recurrent === true
      })) ?? []),

    ...(parsed.traps
      ?.filter((t) => typeof t.timer === "number")
      .map((t) => ({
        data: t.data,
        lvl: t.lvl,
        timer: t.timer!,
        extra: t.extra,

        helper_timer: t.helper_timer,
        helper_recurrent: t.helper_recurrent,
        hasHelper:
          t.helper_timer != null ||
          t.helper_recurrent === true
      })) ?? []),

    ...(parsed.heroes
      ?.filter((h) => typeof h.timer === "number")
      .map((h) => ({
        data: h.data,
        lvl: h.lvl,
        timer: h.timer!,
        extra: h.extra,

        helper_timer: h.helper_timer,
        helper_recurrent: h.helper_recurrent,
        hasHelper:
          h.helper_timer != null ||
          h.helper_recurrent === true
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

        helper_timer: g.helper_timer,
        helper_recurrent: g.helper_recurrent,
        hasHelper:
          g.helper_timer != null ||
          g.helper_recurrent === true
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

            helper_timer: module.helper_timer,
            helper_recurrent: module.helper_recurrent,
            hasHelper:
              module.helper_timer != null ||
              module.helper_recurrent === true
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

      helper_timer: lab.helper_timer,
      helper_recurrent: lab.helper_recurrent,
      hasHelper:
        lab.helper_timer != null ||
        lab.helper_recurrent === true
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
    hasHelper?: boolean;
    recurrentHelper?: boolean;
    helperAppliedSeconds?: number;
    isCrafted?: boolean;
    moduleId?: number;
  }[] = [];

  let skippedExpired = 0;

  for (const item of activeBuilderTasks) {
    // const remainingMsAtExport = item.timer * 1000;

    let projectedTimer = item.timer;
    let helperAppliedSeconds = 0;

    const apprentice = helperMap.get(93000000);

    if (
      apprentice &&
      item.helper_timer != null &&
      item.helper_timer > 0
    ) {
      projectedTimer = projectHelperTimer({
        timer: item.timer,

        helperTimer: item.helper_timer,
        helperCooldown: apprentice.cooldown,
        helperLevel: apprentice.level,
        helperRecurrent: item.helper_recurrent === true,

      })
    }
    helperAppliedSeconds =
      Math.max(
        0,
        item.timer - projectedTimer
      );
 
    const remainingMsAtExport = projectedTimer * 1000;
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

      hasHelper: item.hasHelper,
      recurrentHelper: item.helper_recurrent === true,
      helperAppliedSeconds,
      isCrafted: item.isCrafted,
      moduleId: item.moduleId,
    });
  }

  const validLabTasks: ActiveTask[] = [];

  for (const lab of activeLabTasks) {
    // const remainingMsAtExport = lab.timer * 1000;

    let projectedTimer = lab.timer;
    let helperAppliedSeconds = 0;
    const assistant = helperMap.get(93000001);

    if (
      assistant &&
      lab.helper_timer != null &&
      lab.helper_timer > 0
    ) {
      projectedTimer = projectHelperTimer({
        timer: lab.timer,

        helperTimer: lab.helper_timer,
        helperCooldown: assistant.cooldown,

        helperLevel: assistant.level,

        helperRecurrent:
          lab.helper_recurrent === true,
      });
    }
    helperAppliedSeconds =
      Math.max(
        0,
        lab.timer - projectedTimer
      );
    const remainingMsAtExport =
      projectedTimer * 1000;
    const realEndTime = exportTimestampMs + remainingMsAtExport;
    const remainingNow = Math.max(0, realEndTime - now);

    if (remainingNow <= 0) continue;

    validLabTasks.push({
      ...lab,
      timer: remainingNow / 1000,
      recurrentHelper: lab.helper_recurrent === true,
      helperAppliedSeconds,
      hasHelper: lab.hasHelper,
    });
  }

  // =========================================================
  // 🔥 API SYNC (UNCHANGED)
  // =========================================================

  const busyBuildersFromJson = validUpgrades.filter((u) => {
    const entity = getEntity(u.data);


    if (!entity) {
      console.warn("Missing entity:", u.data);
      return false;
    }

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
      6
    );
  } else {
    await updateAccount(
      parsed.tag,
      apiData?.name ?? existing.name,
      existing.color,
      apiData?.townHallLevel ?? existing.townhall
    );
  }

  await switchAccountStore(parsed.tag);
  if (apiData) {
    const synced = syncProfileFromApi(parsed.tag, apiData);
    useAccountStore.getState().setProfile(parsed.tag, synced);
  }

  await new Promise((resolve) => setTimeout(resolve, 50));

  if (
    validUpgrades.length === 0 &&
    validLabTasks.length === 0
  ) {
    await importJsonData(
      parsed.tag,
      [],
      entities,
    );

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
        id: 1000097,
        slug: "crafted-defense",
        village: "home",
        type: "building" as EntityType,
        name: {
          en: "Crafted Defense"
        },
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
      entity: entity.name.en,

      type: normalizedType,
      upgradeType,

      hasHelper: item.hasHelper,
      recurrentHelper: item.recurrentHelper,

      helperAppliedSeconds:
        item.helperAppliedSeconds,

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
      entity: entity.name.en,

      type: normalizeEntityType(entity.type),
      upgradeType: "LAB",

      hasHelper: lab.hasHelper,
      recurrentHelper: lab.recurrentHelper,
      helperAppliedSeconds:
        lab.helperAppliedSeconds,

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
