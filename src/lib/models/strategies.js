import { getDb } from "@/lib/db";

const PALETTE = ["#4fa3a0", "#c97b4a", "#8e7ccc", "#d8b85c", "#6e9bc7", "#c77ba0", "#5fb0d9", "#b98cd9", "#7bbf6a", "#d97b9e"];

export function listStrategies() {
  const db = getDb();
  return db
    .prepare("SELECT id, label, color FROM strategies ORDER BY sort_order ASC")
    .all();
}

export function createStrategy(label) {
  const clean = String(label || "").trim();
  if (!clean) throw new Error("Nome da estratégia é obrigatório");

  const db = getDb();
  const { c: count } = db.prepare("SELECT COUNT(*) AS c FROM strategies").get();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const color = PALETTE[count % PALETTE.length];
  db.prepare("INSERT INTO strategies (id, label, color, sort_order) VALUES (?, ?, ?, ?)").run(
    id,
    clean,
    color,
    count
  );
  return { id, label: clean, color };
}

export function deleteStrategy(id) {
  const db = getDb();
  const result = db.prepare("DELETE FROM strategies WHERE id = ?").run(id);
  if (result.changes === 0) throw new Error("Estratégia não encontrada");
}
