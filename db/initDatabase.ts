import { getDB } from "./database";

export async function initDatabase() {
  const db = await getDB();
  // temporary debug
  // await db.execAsync(`DROP TABLE IF EXISTS accounts`);

  // await db.execAsync(`DROP TABLE IF EXISTS upgrades`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      player_tag TEXT PRIMARY KEY,
      account_name TEXT NOT NULL,
      display_color TEXT NOT NULL,
      townhall_level INTEGER,
      builder_count INTEGER DEFAULT 1,
      last_updated INTEGER,
      notifications_enabled INTEGER DEFAULT 1
    );
  `);

  // await db.execAsync(`
  //   CREATE TABLE IF NOT EXISTS builders (
  //     id TEXT PRIMARY KEY,

  //     account_player_tag TEXT NOT NULL,

  //     data_id INTEGER,
  //     entity TEXT,

  //     builder_slot TEXT,
  //     builder_type TEXT,

  //     building_level INTEGER,
  //     next_level INTEGER,

  //     start_time INTEGER,
  //     duration_minutes INTEGER,
  //     finish_timestamp INTEGER,

  //     is_completed INTEGER DEFAULT 0,
  //     source TEXT,

  //     is_crafted INTEGER DEFAULT 0,
  //     module_id INTEGER,

  //     FOREIGN KEY(account_player_tag)
  //     REFERENCES accounts(player_tag)
  //     ON DELETE CASCADE,

  //     UNIQUE(account_player_tag, builder_slot)
  //   );
  // `);


  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS upgrades (
      id TEXT PRIMARY KEY,

      account_player_tag TEXT NOT NULL,

      data_id INTEGER,
      entity TEXT,
      type TEXT,
      sub_type TEXT,

      upgrade_type TEXT,

      builder_type TEXT,
      builder_slot TEXT,
      lab_slot TEXT,

      current_level INTEGER,
      next_level INTEGER,

      start_time INTEGER,
      duration_minutes INTEGER,
      finish_timestamp INTEGER,

      is_completed INTEGER DEFAULT 0,
      source TEXT,

      is_crafted INTEGER DEFAULT 0,
      module_id INTEGER,

      FOREIGN KEY(account_player_tag)
      REFERENCES accounts(player_tag)
      ON DELETE CASCADE,

      UNIQUE(account_player_tag, id)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,

  account_player_tag TEXT NOT NULL,

  data_id INTEGER,
  type TEXT,

  level INTEGER,
  cooldown INTEGER,

  is_active INTEGER DEFAULT 1,

  FOREIGN KEY(account_player_tag)
  REFERENCES accounts(player_tag)
  ON DELETE CASCADE
);  
  `)

  await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_upgrades_account_finish
      ON upgrades(account_player_tag, finish_timestamp);
  `);

  await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_upgrades_finish
      ON upgrades(finish_timestamp);
  `);
}