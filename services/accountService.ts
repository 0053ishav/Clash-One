import { getDB } from "@/db/database";
import { BuilderUpgrade } from "@/types/upgrade";

export type Account = {
  tag: string;
  name: string;
  color: string;
  townhall: number;
  builderCount: number;
  lastUpdated?: number;
};

export const addAccount = async (
  tag: string,
  name: string,
  color: string,
  townhall: number,
  builderCount: number,
) => {
  const db = await getDB();

  await db.runAsync(
    `INSERT OR REPLACE INTO accounts
     (player_tag, account_name, display_color, townhall_level, builder_count, last_updated)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tag, name, color, townhall, builderCount, Date.now()]
  );
};

export const getAccounts = async (): Promise<Account[]> => {
  const db = await getDB();

  return await db.getAllAsync<Account>(`
    SELECT
      player_tag AS tag,
      account_name AS name,
      display_color AS color,
      townhall_level AS townhall,
      builder_count AS builderCount
      FROM accounts
      ORDER BY last_updated DESC
      `);
};

export async function getAccountByTag(
  tag: string
): Promise<Account | null> {
  const db = await getDB();

  const result = await db.getFirstAsync<Account>(
    `
      SELECT
      player_tag AS tag,
      account_name AS name,
      display_color AS color,
      townhall_level AS townhall,
      builder_count AS builderCount
    FROM accounts
    WHERE player_tag = ?
    `,
    [tag]
  );

  return result ?? null;
}

export const updateAccount = async (
  tag: string,
  name: string,
  color: string
) => {
  const db = await getDB();

  await db.runAsync(
    `UPDATE accounts
     SET account_name=?, display_color=?
     WHERE player_tag=?`,
    [name, color, tag]
  );
};

export const deleteAccount = async (tag: string) => {
  const db = await getDB();

  await db.runAsync(
    `DELETE FROM accounts WHERE player_tag=?`,
    [tag]
  );
};

export const updateAccountColor = async (tag: string, color: string) => {
  const db = await getDB();

  await db.runAsync(
    `UPDATE accounts
      SET display_color = ?
      WHERE player_tag = ?`,
    [color, tag]
  );
};

export const updateBuilderCount = async (tag: string, count: number) => {
  const db = await getDB();
  if (!tag) return;
  await db.runAsync(
    `UPDATE accounts
      SET builder_count = ?
      WHERE player_tag = ?`,
    [count, tag]
  );
};

export async function replaceBuilders(tag: string, upgrades: BuilderUpgrade[]) {
  const db = await getDB();
  if (!tag) return;
  try {
    await db.execAsync("BEGIN TRANSACTION");

    await db.runAsync(
      `DELETE FROM builders WHERE account_player_tag=?`,
      [tag]
    );

    for (const u of upgrades) {
      await db.runAsync(
        `INSERT INTO builders
        (id, account_player_tag, data_id, entity, builder_slot, builder_type,
        building_level, next_level, start_time, duration_minutes,
        finish_timestamp, is_completed, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.id,
          tag,
          u.dataId ?? null,
          u.entity,
          String(u.builderSlot),
          u.builderType,
          u.currentLevel ?? null,
          u.nextLevel ?? null,
          u.startTime,
          u.durationMinutes,
          u.endTime,
          u.isCompleted ? 1 : 0,
          u.source ?? null
        ]
      );
    }

    const builderCount = new Set(
      upgrades.map((u) => u.builderSlot)
    ).size;

    await db.runAsync(
      `UPDATE accounts
   SET builder_count = ?
   WHERE player_tag = ?`,
      [builderCount, tag]
    );

    await db.execAsync("COMMIT");
  } catch (e) {
    console.error("replaceBuilders failed:", e);
    await db.execAsync("ROLLBACK");
    throw e;
  }
};
/**
 * How JSON Import Should Use These
 */

// Paste JSON
//    ↓
// parse JSON
//    ↓
// fetch profile API
//    ↓
// addAccount()
//    ↓
// replaceBuilders()
//    ↓
// scheduleNotifications()
//    ↓
// updateWidget()