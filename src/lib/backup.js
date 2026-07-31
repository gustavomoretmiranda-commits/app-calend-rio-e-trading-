import fs from "node:fs";
import path from "node:path";
import { getDb } from "./db";

const DATA_DIR = path.join(process.cwd(), "data");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const DB_PATH = path.join(DATA_DIR, "app.db");
const MAX_BACKUPS = 14;
const INTERVAL_MS = 24 * 60 * 60 * 1000;

function runBackup() {
  try {
    if (!fs.existsSync(DB_PATH)) return;
    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const db = getDb();
    db.exec("PRAGMA wal_checkpoint(TRUNCATE)");

    const stamp = new Date().toISOString().slice(0, 10);
    const dest = path.join(BACKUP_DIR, `app-${stamp}.db`);
    fs.copyFileSync(DB_PATH, dest);

    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("app-") && f.endsWith(".db"))
      .sort();
    while (files.length > MAX_BACKUPS) {
      fs.unlinkSync(path.join(BACKUP_DIR, files.shift()));
    }

    console.log(`[backup] snapshot saved: ${dest} (${files.length} kept)`);
  } catch (err) {
    console.error("[backup] failed:", err);
  }
}

export function startBackupScheduler() {
  runBackup();
  setInterval(runBackup, INTERVAL_MS).unref();
}
