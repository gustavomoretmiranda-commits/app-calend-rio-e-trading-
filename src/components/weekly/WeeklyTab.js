"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Repeat, X } from "lucide-react";
import { PERIODS, WEEK_DAYS, addDays, formatShortDate, mondayOfWeek, todayKey } from "@/lib/date-utils";
import IconNavButton from "@/components/ui/IconNavButton";
import Button from "@/components/ui/Button";
import AddBlockModal from "./AddBlockModal";

export default function WeeklyTab({ state, runMutation }) {
  const [addTarget, setAddTarget] = useState(null);
  const [weekStartKey, setWeekStartKey] = useState(() => mondayOfWeek(todayKey()));
  const { tagConfig, weekly } = state;

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

  async function removeBlock(id) {
    await runMutation(`/api/weekly/${id}`, { method: "DELETE" });
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
          <div key={dayKey} className="bg-surface border border-border rounded-lg p-2.5">
            <div className="font-mono text-xs text-center pb-2 mb-2.5 border-b border-border">
              {dayLabel} <span className="text-muted">· {formatShortDate(colDate)}</span>
            </div>
            {PERIODS.map((p) => {
              const blocks = (weekly[dayKey] || [])
                .filter((b) => (b.period || "manha") === p.key)
                .filter((b) => !b.date || b.date === colDate)
                .slice()
                .sort((a, b) => a.start.localeCompare(b.start));
              return (
                <div
                  key={p.key}
                  className="mb-3 pb-2.5 border-b border-dashed border-border last:border-0 last:mb-0 last:pb-0"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wide text-accent-5 mb-1.5">
                    {p.label}
                  </div>
                  {blocks.length === 0 && <div className="text-[10.5px] text-muted py-0.5">Vazio</div>}
                  {blocks.map((b) => {
                    const cfg = tagByKey[b.tagKey];
                    return (
                      <div
                        key={b.id}
                        className="relative bg-surface-2 rounded-md px-2 py-1.5 mb-1.5 text-[11.5px]"
                        style={{ borderLeft: `3px solid ${cfg ? cfg.color : "#666"}` }}
                      >
                        <button
                          onClick={() => removeBlock(b.id)}
                          className="absolute top-1 right-1.5 text-muted hover:text-loss"
                        >
                          <X size={11} />
                        </button>
                        <span className="font-mono text-accent-5 flex items-center gap-1">
                          {b.start}
                          {!b.date && <Repeat size={9} className="text-muted" />}
                        </span>
                        {cfg ? cfg.label : "(atividade removida)"}
                        {b.date && <span className="block text-muted text-[10px]">só esta semana</span>}
                      </div>
                    );
                  })}
                  <button
                    onClick={() => setAddTarget({ dayKey, period: p.key, date: colDate })}
                    className="w-full flex items-center justify-center gap-1 text-[10.5px] text-muted border border-dashed border-border rounded-md py-1.5 mt-1 hover:text-accent hover:border-accent transition-colors"
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
