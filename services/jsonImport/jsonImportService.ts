import { addAccount, replaceBuilders } from "@/services/accountService";
import { fetchPlayerFromApi } from "@/services/clashApi";
import { setLastJsonSync } from "@/storage/jsonSyncStorage";
import { getPlayerProfile, savePlayerProfile } from "@/storage/playerProfile";
import { useAccountStore } from "@/stores/accountStore";
import { BuilderUpgrade } from "@/types/upgrade";
import { getEntity } from "@/utils/getEntity";
import { randomUUID } from "expo-crypto";

type RawExport = {
  tag: string;
  timestamp: number; // seconds
  buildings?: { data: number; lvl: number; timer?: number; extra?: boolean; }[];
  traps?: { data: number; lvl: number; timer?: number; extra?: boolean; }[];
  heroes?: { data: number; lvl: number; timer?: number; extra?: boolean; }[];
};

type ImportResult =
  | { status: "NO_ACTIVE_BUILDERS" }
  | {
    status: "SUCCESS";
    activeCount: number;
    skippedExpired: number;
  };

/**
 * Basic structural validation of export JSON
 */
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

/**
 * Main Import Logic
 *
 * Design Principles:
 * - JSON is source of truth
 * - Profile builder count auto-adjusts if JSON proves it wrong
 * - Timing is internally consistent (start = now, end = now + remaining)
 * - Goblin assignment respects business rules
 */
export async function importVillageJson(
  rawText: string
): Promise<ImportResult> {
  let parsed: RawExport;

  const switchAccountStore = useAccountStore.getState().switchAccount;
  const { importJsonData } = useAccountStore.getState();
  // 1️⃣ Parse JSON safely
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("INVALID_JSON");
  }

  validateJson(parsed);

  console.log("📥 Import JSON tag:", parsed.tag);

  const profile = getPlayerProfile();
  const setLastSync = useAccountStore.getState().setLastSync;

  // API sync
  try {
    console.log("🚀 Calling Clash API...");
    const apiData = await fetchPlayerFromApi(parsed.tag);
    // console.log("🎯 API returned:", apiData);

    await addAccount(
      parsed.tag,
      apiData?.name ?? "Chief",
      "#fbbf24",
      apiData?.townHallLevel ?? 1,
      1
    )

    await switchAccountStore(parsed.tag);

  } catch {
  }



  const exportTimestampMs = parsed.timestamp * 1000;
  const now = Date.now();

  // 4️⃣ Extract buildings that have timers (active upgrades at export moment)
  const activeBuilderTasks = [
    ...(parsed.buildings?.filter((b) => typeof b.timer === "number") ?? []),
    ...(parsed.traps?.filter((t) => typeof t.timer === "number") ?? []),
    ...(parsed.heroes?.filter((h) => typeof h.timer === "number") ?? []),
  ]
  if (!activeBuilderTasks.length) {
    // No active upgrades → clear storage
    await replaceBuilders(parsed.tag, []);
    setLastSync(parsed.tag, now)
    setLastJsonSync(parsed.tag, Date.now());

    return { status: "NO_ACTIVE_BUILDERS" };
  }

  /**
   * 5️⃣ First Pass
   * Determine which upgrades are still valid (not expired)
   */
  const validUpgrades: {
    data: number;
    remainingNow: number;
    lvl: number;
    isGoblin: boolean;
  }[] = [];

  let skippedExpired = 0;

  for (const building of activeBuilderTasks) {
    const remainingMsAtExport = (building.timer ?? 0) * 1000;
    const realEndTime = exportTimestampMs + remainingMsAtExport;
    const remainingNow = Math.max(0, realEndTime - now);

    // If already completed by now → ignore
    if (remainingNow <= 0) {
      skippedExpired++;
      continue;
    }

    validUpgrades.push({
      data: building.data,
      remainingNow,
      lvl: building.lvl,
      isGoblin: building.extra === true
    });
  }


  if (!validUpgrades.length) {
    await replaceBuilders(parsed.tag, []);
    setLastSync(parsed.tag, now);
    setLastJsonSync(parsed.tag, now);
    return { status: "NO_ACTIVE_BUILDERS" };
  }

  /**
   * 6️⃣ Determine Real Builder Capacity
   *
   * JSON is source of truth.
   * If JSON shows more concurrent upgrades than profile allows,
   * profile must be updated.
   *
   * Clash max normal builders = 6
   * Goblin adds +1 (handled separately)
   */

  validUpgrades.sort((a, b) => a.remainingNow - b.remainingNow);

  const MAX_NORMAL_BUILDERS = 6;

  let updatedBuilderCount = profile.normalBuilderCount;

  if (validUpgrades.length > profile.normalBuilderCount) {
    updatedBuilderCount = Math.min(validUpgrades.length, MAX_NORMAL_BUILDERS);

    // Update profile if JSON proves user has more builders
    if (updatedBuilderCount !== profile.normalBuilderCount) {
      savePlayerProfile({
        ...profile,
        normalBuilderCount: updatedBuilderCount,
      });
    }
  }

  /**
   * 7️⃣ Slot Assignment
   *
   * - Fill normal builders first
   * - Then evaluate Goblin eligibility
   */

  const newUpgrades: BuilderUpgrade[] = [];

  let normalUsed = 0;

  for (const item of validUpgrades) {
    const startTime = now; // internally consistent timing
    const durationMinutes = Math.ceil(item.remainingNow / 60000);
    const endTime = now + item.remainingNow;

    let builderSlot: number | "G";

    // Fill normal builders first
    // if (normalUsed < updatedBuilderCount) {
    //   builderSlot = normalUsed;
    //   normalUsed++;
    // }
    // // Then evaluate Goblin
    // else if (
    //   !goblinUsed &&
    //   canUseGoblinBuilder(
    //     { ...profile, normalBuilderCount: updatedBuilderCount },
    //     newUpgrades
    //   )
    // ) {
    //   builderSlot = "G";
    //   goblinUsed = true;
    // } else {
    //   // If no slot available → ignore safely
    //   continue;
    // }

    if (item.isGoblin) {
      // 👈 JSON explicitly tells us this is the Goblin slot
      builderSlot = "G";
    } else if (normalUsed < updatedBuilderCount) {
      builderSlot = normalUsed;
      normalUsed++;
    } else {
      continue;
    }
    const entity = getEntity(item.data);

    if (!entity) {
      console.warn("Unknown entity: ", item.data);
      continue
    };

    newUpgrades.push({
      id: randomUUID(),
      dataId: item.data,
      entity: entity.name,
      type: entity.type,

      startTime,
      durationMinutes,
      endTime,

      builderType: builderSlot === "G" ? "GOBLIN" : "NORMAL",
      builderSlot,

      currentLevel: item.lvl,
      nextLevel: item.lvl + 1,

      isCompleted: false,
      source: "JSON",
    });
  }

  /**
   * 8️⃣ Replace All Stored Upgrades
   * JSON is authoritative → overwrite manual entries
   */
  console.log("Writing builders:", newUpgrades.length);

  // await replaceBuilders(parsed.tag, newUpgrades);

  // rescheduleAllBuilderNotifications();

  // setLastSync(parsed.tag, now);

  await importJsonData(parsed.tag, newUpgrades);
  setLastJsonSync(parsed.tag, now);

  return {
    status: "SUCCESS",
    activeCount: newUpgrades.length,
    skippedExpired,
  };
}