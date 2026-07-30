"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { fmtBRL, fmtPct, mondayOfWeek, addDays, formatShortDate } from "@/lib/date-utils";
import Stat from "./Stat";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AddStrategyModal from "./AddStrategyModal";

const CHART_W = 600;
const CHART_H = 140;
const PAD_X = 10;
const PAD_Y = 14;

export default function AccountAnalytics({ acct, acctEntries, acctItems, strategies, runMutation }) {
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [addStrategyOpen, setAddStrategyOpen] = useState(false);
  const [deleteStrategyId, setDeleteStrategyId] = useState(null);

  const balance = acct.balance || 0;
  const strategyByKey = Object.fromEntries(strategies.map((s) => [s.id, s]));

  const flatItems = useMemo(() => {
    const flat = [];
    Object.entries(acctItems).forEach(([date, items]) => {
      items.forEach((it) => flat.push({ ...it, date }));
    });
    return flat;
  }, [acctItems]);

  const filteredItems = useMemo(() => {
    return flatItems
      .filter((it) => strategyFilter === "all" || it.strategyId === strategyFilter)
      .filter((it) => !dateFrom || it.date >= dateFrom)
      .filter((it) => !dateTo || it.date <= dateTo)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [flatItems, strategyFilter, dateFrom, dateTo]);

  const filteredEntries = useMemo(() => {
    const map = {};
    filteredItems.forEach((it) => {
      map[it.date] = (map[it.date] || 0) + it.value;
    });
    return map;
  }, [filteredItems]);

  const dates = useMemo(() => Object.keys(filteredEntries).sort(), [filteredEntries]);

  const stats = useMemo(() => {
    let total = 0;
    let best = null;
    let worst = null;
    dates.forEach((d) => {
      const v = filteredEntries[d];
      total += v;
      if (best === null || v > best.value) best = { date: d, value: v };
      if (worst === null || v < worst.value) worst = { date: d, value: v };
    });
    const posOps = filteredItems.filter((it) => it.value > 0).length;
    const negOps = filteredItems.filter((it) => it.value < 0).length;
    const withResult = posOps + negOps;
    const winRate = withResult > 0 ? (posOps / withResult) * 100 : 0;
    return { total, winRate, best, worst };
  }, [dates, filteredEntries, filteredItems]);

  const equity = useMemo(() => {
    return dates.reduce((acc, d) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].value : 0;
      acc.push({ date: d, value: prev + filteredEntries[d] });
      return acc;
    }, []);
  }, [dates, filteredEntries]);

  const weeks = useMemo(() => {
    const map = new Map();
    dates.forEach((d) => {
      const wk = mondayOfWeek(d);
      map.set(wk, (map.get(wk) || 0) + filteredEntries[d]);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([start, total]) => ({ start, end: addDays(start, 6), total }));
  }, [dates, filteredEntries]);

  const recentItems = useMemo(() => filteredItems.slice().reverse().slice(0, 40), [filteredItems]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setStrategyFilter("all")}
          className={`text-[11px] rounded-full border px-2.5 py-1.5 transition-colors ${
            strategyFilter === "all" ? "border-accent text-text" : "border-border text-muted"
          }`}
        >
          Todas
        </button>
        {strategies.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-1.5 text-[11px] rounded-full border px-2.5 py-1.5 cursor-pointer ${
              strategyFilter === s.id ? "border-accent text-text" : "border-border text-muted"
            }`}
            onClick={() => setStrategyFilter(s.id)}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.label}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteStrategyId(s.id);
              }}
              className="opacity-50 hover:opacity-100 hover:text-loss flex items-center"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
        <Button variant="ghost" onClick={() => setAddStrategyOpen(true)}>
          <Plus size={13} /> Nova estratégia
        </Button>
        <div className="flex items-center gap-2 ml-auto text-xs text-muted">
          <label className="flex items-center gap-1.5">
            De
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-surface-2 border border-border rounded-md px-2 py-1.5 text-xs outline-none focus:border-accent"
            />
          </label>
          <label className="flex items-center gap-1.5">
            Até
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-surface-2 border border-border rounded-md px-2 py-1.5 text-xs outline-none focus:border-accent"
            />
          </label>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-sm text-muted py-10 text-center">
          Nenhuma operação encontrada para esse filtro.
        </p>
      ) : (
        <>
          <div className="flex gap-3 flex-wrap mb-4">
            <Stat label="Saldo da conta" value={fmtBRL(balance)} color="var(--color-accent-5)" />
            <Stat
              label="Resultado total"
              value={fmtBRL(stats.total)}
              sub={fmtPct(stats.total, balance)}
              color={stats.total >= 0 ? "var(--color-profit)" : "var(--color-loss)"}
            />
            <Stat label="Taxa de acerto" value={`${stats.winRate.toFixed(0)}%`} color="var(--color-accent-5)" />
            <Stat
              label="Melhor dia"
              value={stats.best ? fmtBRL(stats.best.value) : "—"}
              sub={stats.best ? fmtPct(stats.best.value, balance) : null}
              color="var(--color-profit)"
            />
            <Stat
              label="Pior dia"
              value={stats.worst ? fmtBRL(stats.worst.value) : "—"}
              sub={stats.worst ? fmtPct(stats.worst.value, balance) : null}
              color="var(--color-loss)"
            />
          </div>

          <div className="bg-surface border border-border rounded-lg p-4 mb-4">
            <div className="text-[10.5px] text-muted font-mono uppercase tracking-wide mb-3">
              Curva de patrimônio
            </div>
            <EquityCurve points={equity} balance={balance} />
          </div>

          <div className="bg-surface border border-border rounded-lg p-4 mb-4">
            <div className="text-[10.5px] text-muted font-mono uppercase tracking-wide mb-3">
              Semanas positivas x negativas
            </div>
            <WeeklyBars weeks={weeks} balance={balance} />
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-[10.5px] text-muted font-mono uppercase tracking-wide mb-3">
              Operações {strategyFilter === "all" ? "recentes" : "da estratégia"}
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {recentItems.map((it) => {
                const pct = fmtPct(it.value, balance);
                const strat = it.strategyId ? strategyByKey[it.strategyId] : null;
                return (
                  <div
                    key={it.id}
                    className="flex items-center gap-2 bg-surface-2 rounded-md px-2.5 py-1.5 text-[11.5px]"
                  >
                    <span className="font-mono text-muted shrink-0">{formatShortDate(it.date)}</span>
                    <span
                      className="font-mono font-semibold shrink-0"
                      style={{ color: it.value >= 0 ? "var(--color-profit)" : "var(--color-loss)" }}
                    >
                      {fmtBRL(it.value)}
                      {pct && <span className="opacity-70"> ({pct})</span>}
                    </span>
                    {it.strategyId && (
                      <span
                        className="flex items-center gap-1 text-[10px] shrink-0 rounded-full border border-border px-1.5 py-0.5"
                        style={{ color: strat ? strat.color : "var(--color-muted)" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: strat ? strat.color : "var(--color-muted)" }}
                        />
                        {strat ? strat.label : "estratégia removida"}
                      </span>
                    )}
                    {it.note && <span className="text-muted truncate">{it.note}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <AddStrategyModal open={addStrategyOpen} onOpenChange={setAddStrategyOpen} runMutation={runMutation} />

      <ConfirmModal
        open={!!deleteStrategyId}
        onOpenChange={(v) => !v && setDeleteStrategyId(null)}
        title="Remover estratégia"
        description="Remover esta estratégia? Operações antigas que a usavam continuam registradas, só perdem a marcação."
        onConfirm={async () => {
          await runMutation(`/api/strategies/${deleteStrategyId}`, { method: "DELETE" });
          if (strategyFilter === deleteStrategyId) setStrategyFilter("all");
        }}
      />
    </div>
  );
}

function AxisLabels({ dates }) {
  if (dates.length === 0) return null;
  const idxs =
    dates.length <= 3 ? dates.map((_, i) => i) : [0, Math.floor((dates.length - 1) / 2), dates.length - 1];
  const unique = Array.from(new Set(idxs));
  return (
    <div className="flex justify-between text-[9.5px] font-mono text-muted mt-1.5 px-0.5">
      {unique.map((i) => (
        <span key={i}>{formatShortDate(dates[i])}</span>
      ))}
    </div>
  );
}

function EquityCurve({ points, balance }) {
  const n = points.length;
  const values = points.map((p) => p.value);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;

  const x = (i) => (n <= 1 ? CHART_W / 2 : PAD_X + (i / (n - 1)) * (CHART_W - 2 * PAD_X));
  const y = (v) => PAD_Y + (1 - (v - min) / range) * (CHART_H - 2 * PAD_Y);
  const yZero = y(0);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ");
  const areaPath =
    n > 1
      ? `${linePath} L ${x(n - 1).toFixed(1)} ${yZero.toFixed(1)} L ${x(0).toFixed(1)} ${yZero.toFixed(1)} Z`
      : "";
  const last = points[n - 1];

  return (
    <>
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-32" preserveAspectRatio="none">
        <line x1={PAD_X} y1={yZero} x2={CHART_W - PAD_X} y2={yZero} stroke="var(--color-border)" strokeWidth="1" />
        {areaPath && <path d={areaPath} fill="var(--color-accent)" opacity="0.1" />}
        {n > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {last && (
          <circle cx={x(n - 1)} cy={y(last.value)} r="4" fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth="2">
            <title>
              {`${formatShortDate(last.date)}: ${fmtBRL(last.value)}`}
              {fmtPct(last.value, balance) ? ` (${fmtPct(last.value, balance)})` : ""}
            </title>
          </circle>
        )}
      </svg>
      <AxisLabels dates={points.map((p) => p.date)} />
    </>
  );
}

function roundedBarPath(x, y, w, h, roundFarEnd) {
  const r = Math.min(4, h, w / 2);
  if (r <= 0.01) return `M ${x} ${y} h ${w} v ${h} h ${-w} Z`;
  if (roundFarEnd === "top") {
    return `M ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }
  return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} Z`;
}

function WeeklyBars({ weeks, balance }) {
  const n = weeks.length;
  const slot = (CHART_W - PAD_X * 2) / n;
  const barW = Math.max(2, Math.min(24, slot - 2));
  const half = (CHART_H - PAD_Y * 2) / 2;
  const yZero = PAD_Y + half;
  const maxAbs = Math.max(1, ...weeks.map((w) => Math.abs(w.total)));

  return (
    <>
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-32" preserveAspectRatio="none">
        <line x1={PAD_X} y1={yZero} x2={CHART_W - PAD_X} y2={yZero} stroke="var(--color-border)" strokeWidth="1" />
        {weeks.map((w, i) => {
          const cx = PAD_X + slot * i + slot / 2;
          const h = Math.max((Math.abs(w.total) / maxAbs) * (half - 4), 1);
          const isPos = w.total >= 0;
          const barY = isPos ? yZero - h : yZero;
          const color = isPos ? "var(--color-profit)" : "var(--color-loss)";
          return (
            <path
              key={w.start}
              d={roundedBarPath(cx - barW / 2, barY, barW, h, isPos ? "top" : "bottom")}
              fill={color}
            >
              <title>
                {`${formatShortDate(w.start)} – ${formatShortDate(w.end)}: ${fmtBRL(w.total)}`}
                {fmtPct(w.total, balance) ? ` (${fmtPct(w.total, balance)})` : ""}
              </title>
            </path>
          );
        })}
      </svg>
      <AxisLabels dates={weeks.map((w) => w.start)} />
    </>
  );
}
