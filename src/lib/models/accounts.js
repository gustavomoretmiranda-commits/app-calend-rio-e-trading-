import { getDb } from "@/lib/db";

const ACCT_COLORS = ["#4fa3a0", "#c97b4a", "#8e7ccc", "#d8b85c", "#6e9bc7", "#c77ba0"];

export function listAccounts() {
  const db = getDb();
  return db
    .prepare("SELECT id, name, color, balance FROM accounts ORDER BY sort_order ASC")
    .all();
}

export function createAccount(name, balance) {
  const clean = String(name || "").trim();
  if (!clean) throw new Error("Nome da conta é obrigatório");
  const num = Number(balance);
  const cleanBalance = Number.isFinite(num) ? num : 0;

  const db = getDb();
  const { c: count } = db.prepare("SELECT COUNT(*) AS c FROM accounts").get();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const color = ACCT_COLORS[count % ACCT_COLORS.length];
  db.prepare(
    "INSERT INTO accounts (id, name, color, sort_order, balance) VALUES (?, ?, ?, ?, ?)"
  ).run(id, clean, color, count, cleanBalance);
  return { id, name: clean, color, balance: cleanBalance };
}

export function updateAccountBalance(id, balance) {
  const num = Number(balance);
  if (!Number.isFinite(num)) throw new Error("Saldo inválido");

  const db = getDb();
  const result = db.prepare("UPDATE accounts SET balance = ? WHERE id = ?").run(num, id);
  if (result.changes === 0) throw new Error("Conta não encontrada");
  return { id, balance: num };
}

export function deleteAccount(id) {
  const db = getDb();
  const result = db.prepare("DELETE FROM accounts WHERE id = ?").run(id);
  if (result.changes === 0) throw new Error("Conta não encontrada");
}
