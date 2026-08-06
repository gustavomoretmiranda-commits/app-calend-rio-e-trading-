import { getDb } from "@/lib/db";

const WEEK_DAY_KEYS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const PERIOD_KEYS = ["manha", "tarde", "noite"];

export function listWeekly(userId) {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, day_key AS dayKey, period, start_time AS start, tag_key AS tagKey, date FROM weekly_blocks WHERE user_id = ?"
    )
    .all(userId);

  const map = {};
  WEEK_DAY_KEYS.forEach((k) => (map[k] = []));
  for (const row of rows) {
    if (!map[row.dayKey]) map[row.dayKey] = [];
    map[row.dayKey].push({
      id: row.id,
      start: row.start,
      tagKey: row.tagKey,
      period: row.period,
      date: row.date || null,
    });
  }
  return map;
}

export function createWeeklyBlock(userId, dayKey, period, start, tagKey, date) {
  if (!WEEK_DAY_KEYS.includes(dayKey)) throw new Error("Dia da semana inválido");
  if (!PERIOD_KEYS.includes(period)) throw new Error("Período inválido");
  if (!tagKey) throw new Error("Atividade é obrigatória");

  const db = getDb();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  db.prepare(
    "INSERT INTO weekly_blocks (id, day_key, period, start_time, tag_key, date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, dayKey, period, start || "00:00", tagKey, date || null, userId);
  return { id, dayKey, period, start: start || "00:00", tagKey, date: date || null };
}

export function deleteWeeklyBlock(userId, id) {
  const db = getDb();
  const result = db.prepare("DELETE FROM weekly_blocks WHERE id = ? AND user_id = ?").run(id, userId);
  if (result.changes === 0) throw new Error("Bloco não encontrado");
}

export function listWeeklyCompletions(userId) {
  const db = getDb();
  return db
    .prepare("SELECT block_id AS blockId, date FROM weekly_completions WHERE user_id = ?")
    .all(userId)
    .map((r) => `${r.blockId}|${r.date}`);
}

export function toggleWeeklyCompletion(userId, blockId, date) {
  if (!date) throw new Error("Data é obrigatória");
  const db = getDb();
  const block = db.prepare("SELECT 1 FROM weekly_blocks WHERE id = ? AND user_id = ?").get(blockId, userId);
  if (!block) throw new Error("Bloco não encontrado");

  const existing = db.prepare("SELECT 1 FROM weekly_completions WHERE block_id = ? AND date = ?").get(blockId, date);
  if (existing) {
    db.prepare("DELETE FROM weekly_completions WHERE block_id = ? AND date = ?").run(blockId, date);
    return { blockId, date, completed: false };
  }
  db.prepare("INSERT INTO weekly_completions (block_id, date, user_id) VALUES (?, ?, ?)").run(blockId, date, userId);
  return { blockId, date, completed: true };
}

export function listWeeklySkips(userId) {
  const db = getDb();
  return db
    .prepare("SELECT block_id AS blockId, date FROM weekly_skips WHERE user_id = ?")
    .all(userId)
    .map((r) => `${r.blockId}|${r.date}`);
}

export function moveWeeklyOccurrence(userId, blockId, fromDate, { dayKey, period, start, date }) {
  if (!WEEK_DAY_KEYS.includes(dayKey)) throw new Error("Dia da semana inválido");
  if (!PERIOD_KEYS.includes(period)) throw new Error("Período inválido");
  if (!date) throw new Error("Data de destino é obrigatória");

  const db = getDb();
  const block = db
    .prepare("SELECT day_key AS dayKey, period, start_time AS start, tag_key AS tagKey, date FROM weekly_blocks WHERE id = ? AND user_id = ?")
    .get(blockId, userId);
  if (!block) throw new Error("Bloco não encontrado");

  const nextStart = start || block.start;

  if (block.date) {
    db.prepare(
      "UPDATE weekly_blocks SET day_key = ?, period = ?, start_time = ?, date = ? WHERE id = ? AND user_id = ?"
    ).run(dayKey, period, nextStart, date, blockId, userId);
    return { id: blockId, dayKey, period, start: nextStart, tagKey: block.tagKey, date };
  }

  if (fromDate) {
    db.prepare("INSERT OR IGNORE INTO weekly_skips (block_id, date, user_id) VALUES (?, ?, ?)").run(
      blockId,
      fromDate,
      userId
    );
  }
  return createWeeklyBlock(userId, dayKey, period, nextStart, block.tagKey, date);
}
