"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Plus, Repeat, Star, Trash2 } from "lucide-react";
import {
  MONTH_NAMES,
  WEEKDAY_HEAD,
  dateKey,
  todayKey,
  daysInMonth,
  firstWeekday,
  dayOfWeekKey,
  addDays,
  formatShortDate,
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

  function tagsForDate(key) {
    const weeklyTagKeys = (weekly[dayOfWeekKey(key)] || [])
      .filter((b) => !b.date || b.date === key)
      .map((b) => b.tagKey);
    return Array.from(new Set([...(dayTags[key] || []), ...weeklyTagKeys]));
  }

  async function toggleHighlight(key) {
    await runMutation(`/api/tags/${key}`, { method: "PATCH" });
  }

  async function toggleDayTag(date, tagKey) {
    const active = (dayTags[date] || []).includes(tagKey);
    await runMutation("/api/day-tags", { method: "POST", body: { date, tagKey, active: !active } });
  }

  function computeStreak(tagKey) {
    let cursor = tKey;
    if (!tagsForDate(cursor).includes(tagKey)) {
      cursor = addDays(cursor, -1);
      if (!tagsForDate(cursor).includes(tagKey)) return 0;
    }
    let count = 0;
    while (count < 3650 && tagsForDate(cursor).includes(tagKey)) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    return count;
  }

  const streaks = tagConfig
    .filter((t) => t.highlight)
    .map((t) => ({ ...t, streak: computeStreak(t.key) }))
    .filter((t) => t.streak > 0);

  const isCurrentMonth = cal.y === now.getFullYear() && cal.m === now.getMonth();
  const totalDaysInMonth = daysInMonth(cal.y, cal.m);
  const countedDays = isCurrentMonth ? now.getDate() : totalDaysInMonth;
  const monthCounts = {};
  for (let d = 1; d <= countedDays; d++) {
    tagsForDate(dateKey(cal.y, cal.m, d)).forEach((tk) => {
      monthCounts[tk] = (monthCounts[tk] || 0) + 1;
    });
  }
  const monthSummary = tagConfig
    .map((t) => ({ ...t, count: monthCounts[t.key] || 0 }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count);

  function relativeDayLabel(key) {
    if (key === tKey) return "Hoje";
    if (key === addDays(tKey, 1)) return "Amanhã";
    return formatShortDate(key);
  }

  const upcomingEventsList = [];
  for (let i = 0; i < 7; i++) {
    const key = addDays(tKey, i);
    (events[key] || []).forEach((ev) => upcomingEventsList.push({ ...ev, date: key }));
  }
  const upcomingEvents = upcomingEventsList
    .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? -1 : 1) : (a.time || "99:99").localeCompare(b.time || "99:99")))
    .slice(0, 6);

  const yesterdayKey = addDays(tKey, -1);
  const repeatCandidates = (dayTags[yesterdayKey] || []).filter(
    (tk) => tagByKey[tk] && !(dayTags[tKey] || []).includes(tk)
  );

  async function repeatYesterday() {
    for (const tk of repeatCandidates) {
      await runMutation("/api/day-tags", { method: "POST", body: { date: tKey, tagKey: tk, active: true } });
    }
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

      {upcomingEvents.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4 mb-4">
          <div className="text-[10.5px] text-muted font-mono uppercase tracking-wide mb-3">Próximos eventos</div>
          <div className="flex flex-col gap-1.5">
            {upcomingEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-2.5 bg-surface-2 rounded-xl px-3 py-2 text-xs">
                <span className="font-mono text-accent-5 shrink-0 w-14">{relativeDayLabel(ev.date)}</span>
                {ev.time && <span className="font-mono text-muted shrink-0">{ev.time}</span>}
                <span className="flex-1 truncate">{ev.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {streaks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {streaks.map((t) => (
            <div
              key={t.key}
              className="flex items-center gap-1.5 text-[11px] rounded-full border border-accent-4 px-2.5 py-1.5"
              style={{ color: t.color }}
            >
              <Flame size={12} />
              {t.label} · {t.streak} {t.streak === 1 ? "dia" : "dias"}
            </div>
          ))}
        </div>
      )}

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
        {repeatCandidates.length > 0 && (
          <Button variant="ghost" onClick={repeatYesterday}>
            <Repeat size={13} /> Repetir de ontem
          </Button>
        )}
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
          const tags = tagsForDate(key).sort((a, b) => {
            const ca = tagByKey[a];
            const cb = tagByKey[b];
            return (cb?.highlight ? 1 : 0) - (ca?.highlight ? 1 : 0);
          });
          const highlightedLabels = Array.from(
            new Set(tags.filter((tk) => tagByKey[tk]?.highlight).map((tk) => tagByKey[tk].label))
          );
          const dayEvents = events[key] || [];
          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedDate(key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedDate(key);
                }
              }}
              className={`min-h-[86px] text-left bg-surface border rounded-xl p-1.5 hover:border-accent transition-colors cursor-pointer ${
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
                    <button
                      key={tk}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDayTag(key, tk);
                      }}
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: cfg.color,
                        boxShadow: cfg.highlight
                          ? "0 0 0 2px var(--color-surface), 0 0 0 3px var(--color-accent-4)"
                          : "none",
                      }}
                      title={`${cfg.label} · clique para marcar/desmarcar`}
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
            </div>
          );
        })}
      </div>

      {monthSummary.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4 mt-4">
          <div className="text-[10.5px] text-muted font-mono uppercase tracking-wide mb-3">Resumo do mês</div>
          <div className="flex flex-wrap gap-3">
            {monthSummary.map((t) => (
              <div key={t.key} className="bg-surface-2 border border-border rounded-xl px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                  {t.label}
                </div>
                <div className="font-mono text-sm mt-0.5">
                  {t.count}
                  <span className="text-muted">/{countedDays}</span>
                  <span className="text-muted text-[10px] ml-1">
                    ({Math.round((t.count / countedDays) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
