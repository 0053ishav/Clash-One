import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("coc_tracker.db");

    // WAL prevents most lock errors
    await db.execAsync(`
      PRAGMA journal_mode=WAL;
      PRAGMA foreign_keys=ON;
    `);
  }

  return db;
}