import bcrypt from "bcryptjs";
import { getDb, DEFAULT_TAGS } from "@/lib/db";

function seedDefaultTags(db, userId) {
  const insert = db.prepare(
    "INSERT INTO tag_config (key, label, color, highlight, sort_order, user_id) VALUES (?, ?, ?, ?, ?, ?)"
  );
  DEFAULT_TAGS.forEach(([slug, label, color, highlight], i) => {
    insert.run(`${userId}:${slug}`, label, color, highlight, i, userId);
  });
}

export async function createUser(username, password) {
  const clean = String(username || "").trim();
  if (!clean) throw new Error("Usuário é obrigatório");
  if (!password || password.length < 6) throw new Error("Senha deve ter pelo menos 6 caracteres");

  const db = getDb();
  const existing = db.prepare("SELECT 1 FROM users WHERE username = ?").get(clean);
  if (existing) throw new Error("Esse usuário já existe");

  const passwordHash = await bcrypt.hash(password, 10);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  db.prepare(
    "INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)"
  ).run(id, clean, passwordHash, new Date().toISOString());

  seedDefaultTags(db, id);

  return { id, username: clean };
}

export async function verifyUserCredentials(username, password) {
  const db = getDb();
  const user = db.prepare("SELECT id, username, password_hash AS passwordHash FROM users WHERE username = ?").get(username);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, username: user.username };
}

export function getUserById(id) {
  const db = getDb();
  return db.prepare("SELECT id, username FROM users WHERE id = ?").get(id) || null;
}
