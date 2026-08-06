import { getDb } from "@/lib/db";

export function listEvents(userId) {
  const db = getDb();
  const rows = db.prepare("SELECT id, date, time, label FROM events WHERE user_id = ? ORDER BY date, time").all(userId);
  const map = {};
  for (const ev of rows) {
    if (!map[ev.date]) map[ev.date] = [];
    map[ev.date].push({ id: ev.id, time: ev.time, label: ev.label });
  }
  return map;
}

export function createEvent(userId, date, time, label) {
  const clean = String(label || "").trim();
  if (!clean) throw new Error("Descrição do evento é obrigatória");
  if (!date) throw new Error("Data é obrigatória");

  const db = getDb();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  db.prepare("INSERT INTO events (id, date, time, label, user_id) VALUES (?, ?, ?, ?, ?)").run(
    id,
    date,
    time || null,
    clean,
    userId
  );
  return { id, date, time: time || null, label: clean };
}

export function updateEvent(userId, id, { date, time, label }) {
  const clean = String(label || "").trim();
  if (!clean) throw new Error("Descrição do evento é obrigatória");
  if (!date) throw new Error("Data é obrigatória");

  const db = getDb();
  const result = db
    .prepare("UPDATE events SET date = ?, time = ?, label = ? WHERE id = ? AND user_id = ?")
    .run(date, time || null, clean, id, userId);
  if (result.changes === 0) throw new Error("Evento não encontrado");
  return { id, date, time: time || null, label: clean };
}

export function deleteEvent(userId, id) {
  const db = getDb();
  const result = db.prepare("DELETE FROM events WHERE id = ? AND user_id = ?").run(id, userId);
  if (result.changes === 0) throw new Error("Evento não encontrado");
}
