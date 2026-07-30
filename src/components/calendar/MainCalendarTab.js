"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Star, Trash2 } from "lucide-react";
import {
  MONTH_NAMES,
  WEEKDAY_HEAD,
  dateKey,
  todayKey,
  daysInMonth,
  firstWeekday,
  dayOfWeekKey,
} from "@/lib/date-utils";
import IconNavButton from "@/components/ui/IconNavButton";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DayEditorModal from "./DayEditorModal";
import AddTagModal from "./AddTagModal";

export default function MainCalendarTab({ state, runMutation }) {
  const now = new Date();
  const [cal, setCal] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(null);
  const [addTagOpen, setAddTagOpen] = useState(false);
  const [deleteTagKey, setDeleteTagKey] = useState(null);

  const { tagConfig, dayTags, events, weekly } = state;
  const tKey = todayKey();
  const tagByKey = useMemo(() => Object.fromEntries(tagConfig.map((t) => [t.key, t])), [tagConfig]);

  function shiftMonth(delta) {
    setCal((c) => {
      let m = c.m + delta;
      let y = c.y;
      if (m < 0) { m = 11; y -= 1; }
      if (m > 11) { m = 0; y += 1; }
      return { y, m };
    });
  }

  const cells = useMemo(() => {
    const { y, m } = cal;
    const n = daysInMonth(y, m);
    const offset = firstWeekday(y, m);
    const arr = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= n; d++) arr.push(dateKey(y, m, d));
    return arr;
  }, [cal]);

  async function toggleHighlight(key) {
    await runMutation(`/api/tags/${key}`, { method: "PATCH" });
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <IconNavButton onClick={() => shiftMonth(-1)}>
          <ChevronLeft size={15} />
        </IconNavButton>
        <div className="font-mono text-sm min-w-[150px] text-center capitalize">
          {MONTH_NAMES[cal.m]} {cal.y}
        </div>
        <IconNavButton onClick={() => shiftMonth(1)}>
          <ChevronRight size={15} />
        </IconNavButton>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tagConfig.map((cfg) => (
          <div
            key={cfg.key}
            className={`flex items-center gap-1.5 text-[11px] rounded-full border px-2.5 py-1.5 ${
              cfg.highlight ? "border-accent-4 text-text" : "border-border text-muted"
            }`}
          >
            <button
              onClick={() => toggleHighlight(cfg.key)}
              className="text-accent-4 hover:brightness-125 flex items-center"
              title="Destacar como principal"
            >
              <Star size={11} fill={cfg.highlight ? "currentColor" : "none"} />
            </button>
            <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
            {cfg.label}
            <button
              onClick={() => setDeleteTagKey(cfg.key)}
              className="opacity-50 hover:opacity-100 hover:text-loss flex items-center"
              title="Remover atividade"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
        <Button variant="ghost" onClick={() => setAddTagOpen(true)}>
          <Plus size={13} /> Nova atividade
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_HEAD.map((w) => (
          <div key={w} className="text-center text-[10px] font-mono uppercase tracking-wide text-muted pb-2">
            {w}
          </div>
        ))}
        {cells.map((key, i) => {
          if (!key) return <div key={`empty-${i}`} />;
          const isToday = key === tKey;
          const weeklyTagKeys = (weekly[dayOfWeekKey(key)] || [])
            .filter((b) => !b.date || b.date === key)
            .map((b) => b.tagKey);
          const tags = Array.from(new Set([...(dayTags[key] || []), ...weeklyTagKeys])).sort((a, b) => {
            const ca = tagByKey[a];
            const cb = tagByKey[b];
            return (cb?.highlight ? 1 : 0) - (ca?.highlight ? 1 : 0);
          });
          const highlightedLabels = Array.from(
            new Set(tags.filter((tk) => tagByKey[tk]?.highlight).map((tk) => tagByKey[tk].label))
          );
          const dayEvents = events[key] || [];
          return (
            <button
              key={key}
              onClick={() => setSelectedDate(key)}
              className={`min-h-[86px] text-left bg-surface border rounded-lg p-1.5 hover:border-accent transition-colors ${
                isToday ? "border-accent" : "border-border"
              }`}
            >
              <div className={`font-mono text-xs ${isToday ? "text-accent font-bold" : "text-muted"}`}>
                {Number(key.slice(-2))}
              </div>
              <div className="flex gap-1 flex-wrap mt-1">
                {tags.map((tk) => {
                  const cfg = tagByKey[tk];
                  if (!cfg) return null;
                  return (
                    <span
                      key={tk}
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: cfg.color,
                        boxShadow: cfg.highlight
                          ? "0 0 0 2px var(--color-surface), 0 0 0 3px var(--color-accent-4)"
                          : "none",
                      }}
                      title={cfg.label}
                    />
                  );
                })}
              </div>
              {highlightedLabels.length > 0 && (
                <div className="text-[9.5px] text-accent-4 mt-1 truncate">{highlightedLabels.join(", ")}</div>
              )}
              {dayEvents.length > 0 && (
                <div className="text-[9.5px] text-muted mt-1 truncate">
                  {dayEvents[0].label}
                  {dayEvents.length > 1 ? ` +${dayEvents.length - 1}` : ""}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <DayEditorModal
          open={!!selectedDate}
          onOpenChange={(v) => !v && setSelectedDate(null)}
          date={selectedDate}
          state={state}
          runMutation={runMutation}
        />
      )}

      <AddTagModal open={addTagOpen} onOpenChange={setAddTagOpen} runMutation={runMutation} />

      <ConfirmModal
        open={!!deleteTagKey}
        onOpenChange={(v) => !v && setDeleteTagKey(null)}
        title="Remover atividade"
        description={`Remover "${tagByKey[deleteTagKey]?.label}"? Ela será removida do calendário e da rotina semanal.`}
        onConfirm={() => runMutation(`/api/tags/${deleteTagKey}`, { method: "DELETE" })}
      />
    </div>
  );
}
