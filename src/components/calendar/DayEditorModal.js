"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatDateLabel } from "@/lib/date-utils";

export default function DayEditorModal({ open, onOpenChange, date, state, runMutation }) {
  const [time, setTime] = useState("");
  const [label, setLabel] = useState("");

  const { tagConfig, dayTags, events } = state;
  const activeTags = dayTags[date] || [];
  const dayEvents = events[date] || [];

  async function toggleTag(tagKey) {
    const active = activeTags.includes(tagKey);
    await runMutation("/api/day-tags", { method: "POST", body: { date, tagKey, active: !active } });
  }

  async function addEvent() {
    if (!label.trim()) return;
    await runMutation("/api/events", { method: "POST", body: { date, time, label: label.trim() } });
    setTime("");
    setLabel("");
  }

  async function removeEvent(id) {
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
          <div key={ev.id} className="flex items-center gap-2.5 bg-surface-2 rounded-md px-3 py-2 text-xs">
            <span className="font-mono text-accent-4 min-w-[42px]">{ev.time || "--:--"}</span>
            <span className="flex-1">{ev.label}</span>
            <button onClick={() => removeEvent(ev.id)} className="text-muted hover:text-loss transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="font-mono sm:w-[110px] bg-surface-2 border border-border rounded-md px-2.5 py-2 text-xs outline-none focus:border-accent"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addEvent()}
          placeholder="Ex: Estudar edital, dentista, mercado..."
          className="flex-1 bg-surface-2 border border-border rounded-md px-2.5 py-2 text-xs outline-none focus:border-accent"
        />
        <Button onClick={addEvent}>
          <Plus size={13} /> Adicionar
        </Button>
      </div>
    </Modal>
  );
}
