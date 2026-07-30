import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

const DEFAULT_TAGS = [
  ["corrida", "Corrida", "#4fa3a0", 1],
  ["academia", "Academia", "#c97b4a", 1],
  ["estudo", "Estudo", "#8e7ccc", 0],
  ["evento", "Evento", "#d8b85c", 0],
  ["tarefa", "Tarefa", "#6e9bc7", 0],
  ["mercado", "Mercado", "#c77ba0", 1],
];

function addColumnIfMissing(db, table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tag_config (
      key TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      color TEXT NOT NULL,
      highlight INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS day_tags (
      date TEXT NOT NULL,
      tag_key TEXT NOT NULL REFERENCES tag_config(key) ON DELETE CASCADE,
      PRIMARY KEY (date, tag_key)
    );
    CREATE INDEX IF NOT EXISTS idx_day_tags_date ON day_tags(date);

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT,
      label TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

    CREATE TABLE IF NOT EXISTS weekly_blocks (
      id TEXT PRIMARY KEY,
      day_key TEXT NOT NULL,
      period TEXT NOT NULL,
      start_time TEXT NOT NULL,
      tag_key TEXT NOT NULL REFERENCES tag_config(key) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_weekly_day ON weekly_blocks(day_key);

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trade_entries (
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      value REAL NOT NULL,
      PRIMARY KEY (account_id, date)
    );
    CREATE INDEX IF NOT EXISTS idx_entries_account ON trade_entries(account_id);

    CREATE TABLE IF NOT EXISTS trade_items (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      value REAL NOT NULL,
      note TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_trade_items_account_date ON trade_items(account_id, date);

    CREATE TABLE IF NOT EXISTS strategies (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      color TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
  `);

  addColumnIfMissing(db, "weekly_blocks", "date", "TEXT");
  addColumnIfMissing(db, "accounts", "balance", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "trade_items", "strategy_id", "TEXT");

  const { c } = db.prepare("SELECT COUNT(*) AS c FROM tag_config").get();
  if (c === 0) {
    const insert = db.prepare(
      "INSERT INTO tag_config (key, label, color, highlight, sort_order) VALUES (?, ?, ?, ?, ?)"
    );
    DEFAULT_TAGS.forEach(([key, label, color, highlight], i) =>
      insert.run(key, label, color, highlight, i)
    );
  }

  const { c: itemCount } = db.prepare("SELECT COUNT(*) AS c FROM trade_items").get();
  if (itemCount === 0) {
    const oldEntries = db.prepare("SELECT account_id, date, value FROM trade_entries").all();
    if (oldEntries.length > 0) {
      const insertItem = db.prepare(
        "INSERT INTO trade_items (id, account_id, date, value, note, sort_order) VALUES (?, ?, ?, ?, NULL, 0)"
      );
      oldEntries.forEach((row, i) => {
        const id = `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`;
        insertItem.run(id, row.account_id, row.date, row.value);
      });
    }
  }
}

let db;

export function getDb() {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  migrate(db);
  return db;
}
