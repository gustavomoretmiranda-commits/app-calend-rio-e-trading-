import { getDb } from "@/lib/db";

export function listEntries(userId) {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT ti.account_id AS accountId, ti.date, SUM(ti.value) AS total
       FROM trade_items ti
       JOIN accounts a ON a.id = ti.account_id
       WHERE a.user_id = ?
       GROUP BY ti.account_id, ti.date`
    )
    .all(userId);
  const map = {};
  for (const row of rows) {
    if (!map[row.accountId]) map[row.accountId] = {};
    map[row.accountId][row.date] = row.total;
  }
  return map;
}

export function listTradeItems(userId) {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT ti.id, ti.account_id AS accountId, ti.date, ti.value, ti.note,
              ti.strategy_id AS strategyId, ti.size, ti.time, ti.sort_order AS sortOrder
       FROM trade_items ti
       JOIN accounts a ON a.id = ti.account_id
       WHERE a.user_id = ?
       ORDER BY ti.date, ti.sort_order`
    )
    .all(userId);
  const map = {};
  for (const row of rows) {
    if (!map[row.accountId]) map[row.accountId] = {};
    if (!map[row.accountId][row.date]) map[row.accountId][row.date] = [];
    map[row.accountId][row.date].push({
      id: row.id,
      value: row.value,
      note: row.note,
      strategyId: row.strategyId,
      size: row.size,
      time: row.time,
      sortOrder: row.sortOrder,
    });
  }
  return map;
}

export function createTradeItem(userId, accountId, date, value, note, strategyId, size, time) {
  if (!accountId || !date) throw new Error("Conta e data são obrigatórias");
  const num = Number(value);
  if (Number.isNaN(num)) throw new Error("Valor inválido");
  const sizeNum = size === null || size === undefined || size === "" ? null : Number(size);
  if (sizeNum !== null && Number.isNaN(sizeNum)) throw new Error("Tamanho do lote inválido");
  const timeVal = time ? String(time).trim() : null;

  const db = getDb();
  const owned = db.prepare("SELECT 1 FROM accounts WHERE id = ? AND user_id = ?").get(accountId, userId);
  if (!owned) throw new Error("Conta não encontrada");

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { maxOrder } = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM trade_items WHERE account_id = ? AND date = ?")
    .get(accountId, date);
  db.prepare(
    "INSERT INTO trade_items (id, account_id, date, value, note, strategy_id, size, time, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(id, accountId, date, num, note ? String(note).trim() : null, strategyId || null, sizeNum, timeVal, maxOrder + 1);
  return {
    id,
    accountId,
    date,
    value: num,
    note: note ? String(note).trim() : null,
    strategyId: strategyId || null,
    size: sizeNum,
    time: timeVal,
    sortOrder: maxOrder + 1,
  };
}

export function updateTradeItem(userId, id, value, note, strategyId, size, time) {
  const db = getDb();
  const num = Number(value);
  if (Number.isNaN(num)) throw new Error("Valor inválido");
  const sizeNum = size === null || size === undefined || size === "" ? null : Number(size);
  if (sizeNum !== null && Number.isNaN(sizeNum)) throw new Error("Tamanho do lote inválido");
  const timeVal = time ? String(time).trim() : null;
  const result = db
    .prepare(
      `UPDATE trade_items SET value = ?, note = ?, strategy_id = ?, size = ?, time = ?
       WHERE id = ? AND account_id IN (SELECT id FROM accounts WHERE user_id = ?)`
    )
    .run(num, note ? String(note).trim() : null, strategyId || null, sizeNum, timeVal, id, userId);
  if (result.changes === 0) throw new Error("Operação não encontrada");
  return { id, value: num, note: note ? String(note).trim() : null, strategyId: strategyId || null, size: sizeNum, time: timeVal };
}

export function deleteTradeItem(userId, id) {
  const db = getDb();
  const result = db
    .prepare("DELETE FROM trade_items WHERE id = ? AND account_id IN (SELECT id FROM accounts WHERE user_id = ?)")
    .run(id, userId);
  if (result.changes === 0) throw new Error("Operação não encontrada");
}
