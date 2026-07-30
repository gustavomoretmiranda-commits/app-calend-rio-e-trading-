import { getDb } from "@/lib/db";

const ACCT_COLORS = ["#4fa3a0", "#c97b4a", "#8e7ccc", "#d8b85c", "#6e9bc7", "#c77ba0"];

export function listAccounts(userId) {
  const db = getDb();
  return db
    .prepare("SELECT id, name, color, balance FROM accounts WHERE user_id = ? ORDER BY sort_order ASC")
    .all(userId);
}

export function createAccount(userId, name, balance) {
  const clean = String(name || "").trim();
  if (!clean) throw new Error("Nome da conta é obrigatório");
  const num = Number(balance);
  const cleanBalance = Number.isFinite(num) ? num : 0;

  const db = getDb();
  const { c: count } = db.prepare("SELECT COUNT(*) AS c FROM accounts WHERE user_id = ?").get(userId);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const color = ACCT_COLORS[count % ACCT_COLORS.length];
  db.prepare(
    "INSERT INTO accounts (id, name, color, sort_order, balance, user_id) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, clean, color, count, cleanBalance, userId);
  return { id, name: clean, color, balance: cleanBalance };
}

export function updateAccountBalance(userId, id, balance) {
  const num = Number(balance);
  if (!Number.isFinite(num)) throw new Error("Saldo inválido");

  const db = getDb();
  const result = db.prepare("UPDATE accounts SET balance = ? WHERE id = ? AND user_id = ?").run(num, id, userId);
  if (result.changes === 0) throw new Error("Conta não encontrada");
  return { id, balance: num };
}

export function deleteAccount(userId, id) {
  const db = getDb();
  const result = db.prepare("DELETE FROM accounts WHERE id = ? AND user_id = ?").run(id, userId);
  if (result.changes === 0) throw new Error("Conta não encontrada");
}
