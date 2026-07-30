import { getDb } from "@/lib/db";

export function listEntries() {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT account_id AS accountId, date, SUM(value) AS total FROM trade_items GROUP BY account_id, date"
    )
    .all();
  const map = {};
  for (const row of rows) {
    if (!map[row.accountId]) map[row.accountId] = {};
    map[row.accountId][row.date] = row.total;
  }
  return map;
}

export function listTradeItems() {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, account_id AS accountId, date, value, note, strategy_id AS strategyId, sort_order AS sortOrder FROM trade_items ORDER BY date, sort_order"
    )
    .all();
  const map = {};
  for (const row of rows) {
    if (!map[row.accountId]) map[row.accountId] = {};
    if (!map[row.accountId][row.date]) map[row.accountId][row.date] = [];
    map[row.accountId][row.date].push({
      id: row.id,
      value: row.value,
      note: row.note,
      strategyId: row.strategyId,
      sortOrder: row.sortOrder,
    });
  }
  return map;
}

export function createTradeItem(accountId, date, value, note, strategyId) {
  if (!accountId || !date) throw new Error("Conta e data são obrigatórias");
  const num = Number(value);
  if (Number.isNaN(num)) throw new Error("Valor inválido");

  const db = getDb();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { maxOrder } = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM trade_items WHERE account_id = ? AND date = ?")
    .get(accountId, date);
  db.prepare(
    "INSERT INTO trade_items (id, account_id, date, value, note, strategy_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, accountId, date, num, note ? String(note).trim() : null, strategyId || null, maxOrder + 1);
  return {
    id,
    accountId,
    date,
    value: num,
    note: note ? String(note).trim() : null,
    strategyId: strategyId || null,
    sortOrder: maxOrder + 1,
  };
}

export function updateTradeItem(id, value, note, strategyId) {
  const db = getDb();
  const num = Number(value);
  if (Number.isNaN(num)) throw new Error("Valor inválido");
  const result = db
    .prepare("UPDATE trade_items SET value = ?, note = ?, strategy_id = ? WHERE id = ?")
    .run(num, note ? String(note).trim() : null, strategyId || null, id);
  if (result.changes === 0) throw new Error("Operação não encontrada");
  return { id, value: num, note: note ? String(note).trim() : null, strategyId: strategyId || null };
}

export function deleteTradeItem(id) {
  const db = getDb();
  const result = db.prepare("DELETE FROM trade_items WHERE id = ?").run(id);
  if (result.changes === 0) throw new Error("Operação não encontrada");
}
