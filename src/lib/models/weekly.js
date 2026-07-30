import { getDb } from "@/lib/db";

const WEEK_DAY_KEYS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
const PERIOD_KEYS = ["manha", "tarde", "noite"];

export function listWeekly() {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, day_key AS dayKey, period, start_time AS start, tag_key AS tagKey, date FROM weekly_blocks"
    )
    .all();

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

export function createWeeklyBlock(dayKey, period, start, tagKey, date) {
  if (!WEEK_DAY_KEYS.includes(dayKey)) throw new Error("Dia da semana inválido");
  if (!PERIOD_KEYS.includes(period)) throw new Error("Período inválido");
  if (!tagKey) throw new Error("Atividade é obrigatória");

  const db = getDb();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  db.prepare(
    "INSERT INTO weekly_blocks (id, day_key, period, start_time, tag_key, date) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, dayKey, period, start || "00:00", tagKey, date || null);
  return { id, dayKey, period, start: start || "00:00", tagKey, date: date || null };
}

export function deleteWeeklyBlock(id) {
  const db = getDb();
  const result = db.prepare("DELETE FROM weekly_blocks WHERE id = ?").run(id);
  if (result.changes === 0) throw new Error("Bloco não encontrado");
}
