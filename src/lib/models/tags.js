import { getDb } from "@/lib/db";

function slugify(str) {
  const normalized = String(str).toLowerCase().normalize("NFD");
  let stripped = "";
  for (const ch of normalized) {
    const code = ch.codePointAt(0);
    const isDiacritic = code >= 0x0300 && code <= 0x036f; // combining marks
    if (!isDiacritic) stripped += ch;
  }
  return stripped.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function listTags(userId) {
  const db = getDb();
  return db
    .prepare("SELECT key, label, color, highlight, sort_order AS sortOrder FROM tag_config WHERE user_id = ? ORDER BY sort_order ASC")
    .all(userId)
    .map((t) => ({ ...t, highlight: !!t.highlight }));
}

export function createTag(userId, label) {
  const clean = String(label || "").trim();
  if (!clean) throw new Error("Nome da atividade é obrigatório");

  const db = getDb();
  const PALETTE = ["#4fa3a0", "#c97b4a", "#8e7ccc", "#d8b85c", "#6e9bc7", "#c77ba0", "#5fb0d9", "#b98cd9", "#7bbf6a", "#d97b9e"];
  const { c: count } = db.prepare("SELECT COUNT(*) AS c FROM tag_config WHERE user_id = ?").get(userId);

  const slug = slugify(clean) || "tag";
  let key = `${userId}:${slug}`;
  const exists = db.prepare("SELECT 1 FROM tag_config WHERE key = ?");
  let suffix = 1;
  while (exists.get(key)) {
    key = `${userId}:${slug}-${suffix}`;
    suffix++;
  }

  const color = PALETTE[count % PALETTE.length];
  db.prepare(
    "INSERT INTO tag_config (key, label, color, highlight, sort_order, user_id) VALUES (?, ?, ?, 0, ?, ?)"
  ).run(key, clean, color, count, userId);

  return { key, label: clean, color, highlight: false, sortOrder: count };
}

export function toggleTagHighlight(userId, key) {
  const db = getDb();
  const tag = db.prepare("SELECT highlight FROM tag_config WHERE key = ? AND user_id = ?").get(key, userId);
  if (!tag) throw new Error("Atividade não encontrada");
  const next = tag.highlight ? 0 : 1;
  db.prepare("UPDATE tag_config SET highlight = ? WHERE key = ? AND user_id = ?").run(next, key, userId);
  return { key, highlight: !!next };
}

export function deleteTag(userId, key) {
  const db = getDb();
  const result = db.prepare("DELETE FROM tag_config WHERE key = ? AND user_id = ?").run(key, userId);
  if (result.changes === 0) throw new Error("Atividade não encontrada");
}

export function setDayTag(userId, date, tagKey, active) {
  const db = getDb();
  if (active) {
    db.prepare("INSERT OR IGNORE INTO day_tags (date, tag_key, user_id) VALUES (?, ?, ?)").run(date, tagKey, userId);
  } else {
    db.prepare("DELETE FROM day_tags WHERE date = ? AND tag_key = ? AND user_id = ?").run(date, tagKey, userId);
  }
}

export function listDayTags(userId) {
  const db = getDb();
  const rows = db.prepare("SELECT date, tag_key AS tagKey FROM day_tags WHERE user_id = ?").all(userId);
  const map = {};
  for (const { date, tagKey } of rows) {
    if (!map[date]) map[date] = [];
    map[date].push(tagKey);
  }
  return map;
}
