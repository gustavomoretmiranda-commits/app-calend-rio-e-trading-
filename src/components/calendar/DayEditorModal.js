"use client";

import { useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatDateLabel } from "@/lib/date-utils";

export default function DayEditorModal({ open, onOpenChange, date, state, runMutation }) {
  const [time, setTime] = useState("");
  const [label, setLabel] = useState("");
  const [editingId, setEditingId] = useState(null);

  const { tagConfig, dayTags, events } = state;
  const activeTags = dayTags[date] || [];
  const dayEvents = events[date] || [];

  async function toggleTag(tagKey) {
    const active = activeTags.includes(tagKey);
    await runMutation("/api/day-tags", { method: "POST", body: { date, tagKey, active: !active } });
  }

  function startEdit(ev) {
    setEditingId(ev.id);
    setTime(ev.time || "");
    setLabel(ev.label);
  }

  function cancelEdit() {
    setEditingId(null);
    setTime("");
    setLabel("");
  }

  async function saveEvent() {
    if (!label.trim()) return;
    if (editingId) {
      await runMutation(`/api/events/${editingId}`, { method: "PATCH", body: { date, time, label: label.trim() } });
      setEditingId(null);
    } else {
      await runMutation("/api/events", { method: "POST", body: { date, time, label: label.trim() } });
    }
    setTime("");
    setLabel("");
  }

  async function removeEvent(id) {
    if (editingId === id) cancelEdit();
    await runMutation(`/api/events/${id}`, { method: "DELETE" });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={formatDateLabel(date)} size="lg">
      <div className="flex flex-wrap gap-2 mb-4">
        {tagConfig.length === 0 && (
          <p className="text-xs text-muted">Nenhuma atividade criada. Adicione uma no calendário.</p>
        )}
        {tagConfig.map((cfg) => {
          const active = activeTags.includes(cfg.key);
          return (
            <button
              key={cfg.key}
              onClick={() => toggleTag(cfg.key)}
              className="px-2.5 py-1.5 rounded-full border text-[11.5px] transition-colors"
              style={
                active
                  ? { background: cfg.color, borderColor: cfg.color, color: "#0d1213" }
                  : { borderColor: "var(--color-border)", color: "var(--color-muted)" }
              }
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1.5 mb-4">
        {dayEvents.length === 0 && <p className="text-xs text-muted py-2">Nenhum evento adicionado ainda.</p>}
        {dayEvents.map((ev) => (
          <button
            key={ev.id}
            onClick={() => startEdit(ev)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-left transition-colors ${
              editingId === ev.id ? "bg-accent/15 border border-accent" : "bg-surface-2 border border-transparent hover:border-border"
            }`}
          >
            <span className="font-mono text-accent-4 min-w-[42px]">{ev.time || "--:--"}</span>
            <span className="flex-1">{ev.label}</span>
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                removeEvent(ev.id);
              }}
              className="text-muted hover:text-loss transition-colors flex items-center"
            >
              <Trash2 size={13} />
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="font-mono sm:w-[110px] bg-surface-2 border border-border rounded-xl px-2.5 py-2 text-xs outline-none focus:border-accent"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveEvent()}
          placeholder="Ex: Estudar edital, dentista, mercado..."
          className="flex-1 bg-surface-2 border border-border rounded-xl px-2.5 py-2 text-xs outline-none focus:border-accent"
        />
        {editingId && (
          <Button variant="ghost" onClick={cancelEdit}>
            <X size={13} /> Cancelar
          </Button>
        )}
        <Button onClick={saveEvent}>
          {editingId ? <Check size={13} /> : <Plus size={13} />}
          {editingId ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </Modal>
  );
}
