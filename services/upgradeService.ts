import { getDB } from "@/db/database";
import { Upgrade } from "@/types/upgrade";
import { deriveCompletionState } from "@/utils/deriveCompletionState";


/**
 * Get all builder upgrades for an account
 */

export async function getUpgrades(tag: string): Promise<Upgrade[]> {
  const db = await getDB();

  const rows = await db.getAllAsync(
    `SELECT * FROM upgrades WHERE account_player_tag=?`,
    [tag]
  );

  const normalized: Upgrade[] = rows.map((r: any) => ({
    id: r.id,
    accountTag: r.account_player_tag,
    dataId: r.data_id,
    entity: r.entity,

    type: r.type,
    upgradeType: r.upgrade_type,

    builderSlot:
      r.builder_slot === "G"
        ? "G"
        : r.builder_slot != null
          ? Number(r.builder_slot)
          : undefined,

    builderType: r.builder_type,

    labSlot:
      r.lab_slot === "GOBLIN"
        ? "GOBLIN"
        : r.lab_slot === "NORMAL"
          ? "NORMAL"
          : undefined,

    startTime: Number(r.start_time),
    durationMinutes: Number(r.duration_minutes),
    endTime: Number(r.finish_timestamp),

    currentLevel: r.current_level ?? undefined,
    nextLevel: r.next_level ?? undefined,

    isCompleted: !!r.is_completed,
    source: r.source,

    isCrafted: r.is_crafted === 1,
    moduleId: r.module_id
  }));
  return deriveCompletionState(normalized);
}


export async function getActiveUpgrades(tag: string): Promise<Upgrade[]> {
  const db = await getDB();
  const now = Date.now();

  const rows = await db.getAllAsync(
    `SELECT *
     FROM upgrades
     WHERE account_player_tag=?
     AND is_completed=0
     AND finish_timestamp>?`,
    [tag, now]
  );

  return rows.map((r: any) => ({
    id: r.id,
    accountTag: r.account_player_tag,

    dataId: r.data_id,
    entity: r.entity,

    type: r.type,
    upgradeType: r.upgrade_type,

    builderSlot:
      r.builder_slot === "G"
        ? "G"
        : r.builder_slot != null
          ? Number(r.builder_slot)
          : undefined,
    builderType: r.builder_type,

    labSlot:
      r.lab_slot === "GOBLIN"
        ? "GOBLIN"
        : r.lab_slot === "NORMAL"
          ? "NORMAL"
          : undefined,

    startTime: r.start_time,
    durationMinutes: r.duration_minutes,
    endTime: r.finish_timestamp,

    currentLevel: r.current_level ?? undefined,
    nextLevel: r.next_level ?? undefined,

    isCrafted: r.is_crafted === 1,
    moduleId: r.module_id,

    isCompleted: !!r.is_completed,
    source: r.source,
  }));
}


/**
 * Insert a single upgrade
 */

export async function addUpgrade(tag: string, upgrade: Upgrade) {
  const db = await getDB();

  if (upgrade.upgradeType === "BUILDER") {
    const existing = await db.getFirstAsync(
      `SELECT id FROM upgrades
   WHERE account_player_tag=? 
   AND builder_slot=?
   AND is_completed=0`,
      [tag, String(upgrade.builderSlot)]
    );

    if (existing) {
      throw new Error("BUILDER_SLOT_OCCUPIED");
    }
  }

  await db.runAsync(
    `INSERT INTO upgrades
    (id, account_player_tag, data_id, entity, type, upgrade_type, builder_slot, builder_type,
    current_level, next_level, start_time, duration_minutes,
    finish_timestamp, is_completed, source, is_crafted, module_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      upgrade.id,
      tag,
      upgrade.dataId ?? null,
      upgrade.entity,

      upgrade.type,
      upgrade.upgradeType,

      upgrade.builderSlot != null ? String(upgrade.builderSlot) : null,
      upgrade.builderType ?? null,

      upgrade.currentLevel ?? null,
      upgrade.nextLevel ?? null,

      upgrade.startTime,
      upgrade.durationMinutes,
      upgrade.endTime,

      upgrade.isCompleted ? 1 : 0,
      upgrade.source ?? null,

      upgrade.isCrafted ? 1 : 0,
      upgrade.moduleId ?? null
    ]
  );
}

/**
 * Delete one upgrade
 */
export async function deleteUpgrade(id: string) {
  const db = await getDB();

  await db.runAsync(
    `DELETE FROM upgrades WHERE id=?`,
    [id]
  );
}

export async function cleanupCompletedUpgrades(tag: string) {
  const db = await getDB();
  const now = Date.now();

  await db.runAsync(
    `DELETE FROM upgrades
     WHERE account_player_tag=?
     AND finish_timestamp <= ?`,
    [tag, now]
  );
}

export async function completeFinishedUpgrades(tag: string) {
  const db = await getDB();
  const now = Date.now();

  await db.runAsync(
    `UPDATE upgrades
     SET is_completed = 1
     WHERE account_player_tag = ?
     AND is_completed = 0
     AND finish_timestamp <= ?`,
    [tag, now]
  );
}