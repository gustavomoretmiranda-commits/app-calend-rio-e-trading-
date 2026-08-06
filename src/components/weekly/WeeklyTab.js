"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Repeat, X } from "lucide-react";
import { PERIODS, WEEK_DAYS, addDays, formatShortDate, mondayOfWeek, todayKey } from "@/lib/date-utils";
import IconNavButton from "@/components/ui/IconNavButton";
import Button from "@/components/ui/Button";
import AddBlockModal from "./AddBlockModal";

export default function WeeklyTab({ state, runMutation }) {
  const [addTarget, setAddTarget] = useState(null);
  const [weekStartKey, setWeekStartKey] = useState(() => mondayOfWeek(todayKey()));
  const [dragging, setDragging] = useState(null);
  const [dropZone, setDropZone] = useState(null);
  const { tagConfig, weekly, weeklyCompletions = [], weeklySkips = [] } = state;

  if (tagConfig.length === 0) {
    return (
      <p className="text-sm text-muted py-10 text-center">
        Crie atividades na aba &quot;Calendário principal&quot; primeiro — elas aparecerão aqui como opções
        para montar sua rotina.
      </p>
    );
  }

  const tagByKey = Object.fromEntries(tagConfig.map((t) => [t.key, t]));
  const weekEndKey = addDays(weekStartKey, 6);
  const completedSet = new Set(weeklyCompletions);
  const skippedSet = new Set(weeklySkips);

  async function removeBlock(id) {
    await runMutation(`/api/weekly/${id}`, { method: "DELETE" });
  }

  async function toggleDone(blockId, date) {
    await runMutation(`/api/weekly/${blockId}/complete`, { method: "POST", body: { date } });
  }

  async function handleDrop(dayKey, period, date, zoneKey) {
    setDropZone(null);
    if (!dragging) return;
    const { id, fromDate, start, originZone } = dragging;
    setDragging(null);
    if (zoneKey === originZone && date === fromDate) return;
    await runMutation(`/api/weekly/${id}/move`, {
      method: "POST",
      body: { fromDate, dayKey, period, start, date },
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <IconNavButton onClick={() => setWeekStartKey((k) => addDays(k, -7))}>
          <ChevronLeft size={15} />
        </IconNavButton>
        <div className="font-mono text-sm min-w-[150px] text-center">
          {formatShortDate(weekStartKey)} – {formatShortDate(weekEndKey)}
        </div>
        <IconNavButton onClick={() => setWeekStartKey((k) => addDays(k, 7))}>
          <ChevronRight size={15} />
        </IconNavButton>
        <Button variant="ghost" onClick={() => setWeekStartKey(mondayOfWeek(todayKey()))}>
          Hoje
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {WEEK_DAYS.map(({ key: dayKey, label: dayLabel }, i) => {
          const colDate = addDays(weekStartKey, i);
          return (
          <div key={dayKey} className="bg-surface border border-border rounded-2xl p-2.5">
            <div className="font-mono text-xs text-center pb-2 mb-2.5 border-b border-border">
              {dayLabel} <span className="text-muted">· {formatShortDate(colDate)}</span>
            </div>
            {PERIODS.map((p) => {
              const zoneKey = `${dayKey}-${p.key}`;
              const blocks = (weekly[dayKey] || [])
                .filter((b) => (b.period || "manha") === p.key)
                .filter((b) => !b.date || b.date === colDate)
                .filter((b) => !skippedSet.has(`${b.id}|${colDate}`))
                .slice()
                .sort((a, b) => a.start.localeCompare(b.start));
              return (
                <div
                  key={p.key}
                  onDragOver={(e) => {
                    if (!dragging) return;
                    e.preventDefault();
                    if (dropZone !== zoneKey) setDropZone(zoneKey);
                  }}
                  onDragLeave={() => setDropZone((z) => (z === zoneKey ? null : z))}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(dayKey, p.key, colDate, zoneKey);
                  }}
                  className={`mb-3 pb-2.5 -mx-1 px-1 rounded-xl border-b border-dashed last:border-0 last:mb-0 last:pb-0 transition-colors ${
                    dropZone === zoneKey ? "border-accent bg-accent/10" : "border-border"
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase tracking-wide text-accent-5 mb-1.5">
                    {p.label}
                  </div>
                  {blocks.length === 0 && <div className="text-[10.5px] text-muted py-0.5">Vazio</div>}
                  {blocks.map((b) => {
                    const cfg = tagByKey[b.tagKey];
                    const done = completedSet.has(`${b.id}|${colDate}`);
                    return (
                      <div
                        key={b.id}
                        draggable
                        onDragStart={() => setDragging({ id: b.id, fromDate: colDate, start: b.start, originZone: zoneKey })}
                        onDragEnd={() => {
                          setDragging(null);
                          setDropZone(null);
                        }}
                        className={`relative flex items-start gap-1.5 bg-surface-2 rounded-xl pl-2 pr-6 py-1.5 mb-1.5 text-[11.5px] cursor-grab active:cursor-grabbing ${
                          dragging?.id === b.id ? "opacity-40" : ""
                        }`}
                      >
                        <button
                          onClick={() => toggleDone(b.id, colDate)}
                          title={done ? "Marcar como não feito" : "Marcar como feito"}
                          className={`shrink-0 mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                            done ? "bg-profit border-profit text-bg" : "border-border text-transparent hover:border-accent"
                          }`}
                        >
                          <Check size={9} strokeWidth={3} />
                        </button>
                        <div className={`min-w-0 ${done ? "opacity-50 line-through" : ""}`}>
                          <span className="font-mono text-accent-5 flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: cfg ? cfg.color : "#666" }}
                            />
                            {b.start}
                            {!b.date && <Repeat size={9} className="text-muted" />}
                          </span>
                          {cfg ? cfg.label : "(atividade removida)"}
                          {b.date && <span className="block text-muted text-[10px]">só esta semana</span>}
                        </div>
                        <button
                          onClick={() => removeBlock(b.id)}
                          className="absolute top-1 right-1.5 text-muted hover:text-loss"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => setAddTarget({ dayKey, period: p.key, date: colDate })}
                    className="w-full flex items-center justify-center gap-1 text-[10.5px] text-muted border border-dashed border-border rounded-full py-1.5 mt-1 hover:text-accent hover:border-accent transition-colors"
                  >
                    <Plus size={10} /> Adicionar
                  </button>
                </div>
              );
            })}
          </div>
          );
        })}
      </div>

      <AddBlockModal
        open={!!addTarget}
        onOpenChange={(v) => !v && setAddTarget(null)}
        target={addTarget}
        tagConfig={tagConfig}
        runMutation={runMutation}
      />
    </div>
  );
}
