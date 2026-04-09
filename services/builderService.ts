import { getDB } from "@/db/database";
import { BuilderUpgrade } from "@/types/upgrade";

import { autoCompleteBuilderUpgrades } from "@/utils/autoCompleteUpgrades";

/**
 * Get all builder upgrades for an account
 */

export async function getBuilderUpgrades(tag: string): Promise<BuilderUpgrade[]> {
  const db = await getDB();

  const rows = await db.getAllAsync(
    `SELECT * FROM builders WHERE account_player_tag=?`,
    [tag]
  );

  const normalized: BuilderUpgrade[] = rows.map((r: any) => ({
    id: r.id,
    dataId: r.data_id,
    entity: r.entity,

    builderSlot:
      r.builder_slot === "G"
        ? ("G" as const)
        : (Number(r.builder_slot) as number),

    builderType: r.builder_type,

    startTime: Number(r.start_time),
    durationMinutes: Number(r.duration_minutes),
    endTime: Number(r.finish_timestamp),

    currentLevel: r.building_level ?? undefined,
    nextLevel: r.next_level ?? undefined,

    isCompleted: !!r.is_completed,
    source: r.source,

    isCrafted: r.is_crafted === 1,
    moduleId: r.module_id
  }));
  return autoCompleteBuilderUpgrades(normalized);
}


export async function getActiveBuilderUpgrades(tag: string): Promise<BuilderUpgrade[]> {
  const db = await getDB();
  const now = Date.now();

  const rows = await db.getAllAsync(
    `SELECT *
     FROM builders
     WHERE account_player_tag=?
     AND is_completed=0
     AND finish_timestamp>?`,
    [tag, now]
  );

  return rows.map((r: any) => ({
    id: r.id,
    dataId: r.data_id,
    entity: r.entity,

    builderSlot: r.builder_slot === "G" ? "G" : Number(r.builder_slot),
    builderType: r.builder_type,

    startTime: r.start_time,
    durationMinutes: r.duration_minutes,
    endTime: r.finish_timestamp,

    currentLevel: r.building_level ?? undefined,
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

export async function addBuilderUpgrade(tag: string, upgrade: BuilderUpgrade) {
  const db = await getDB();

  const existing = await db.getFirstAsync(
  `SELECT id FROM builders
   WHERE account_player_tag=? AND builder_slot=?`,
  [tag, upgrade.builderSlot]
);

if (existing) {
  throw new Error("BUILDER_SLOT_OCCUPIED");
}

  await db.runAsync(
    `INSERT INTO builders
    (id, account_player_tag, data_id, entity, builder_slot, builder_type,
    building_level, next_level, start_time, duration_minutes,
    finish_timestamp, is_completed, source, is_crafted, module_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      upgrade.id,
      tag,
      upgrade.dataId ?? null,
      upgrade.entity,
      // typeof upgrade.builderSlot === "number" ? upgrade.builderSlot : null,
      String(upgrade.builderSlot),
      upgrade.builderType,
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
export async function deleteBuilderUpgrade(id: string) {
  const db = await getDB();

  await db.runAsync(
    `DELETE FROM builders WHERE id=?`,
    [id]
  );
}

export async function cleanupCompletedUpgrades(tag: string) {
  const db = await getDB();
  const now = Date.now();

  await db.runAsync(
    `DELETE FROM builders
     WHERE account_player_tag=?
     AND finish_timestamp <= ?`,
    [tag, now]
  );
}