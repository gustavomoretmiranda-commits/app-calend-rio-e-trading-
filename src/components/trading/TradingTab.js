"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LineChart, Pencil, Plus, X } from "lucide-react";
import { MONTH_NAMES, WEEKDAY_HEAD, dateKey, todayKey, daysInMonth, firstWeekday, fmtBRL, fmtPct } from "@/lib/date-utils";
import IconNavButton from "@/components/ui/IconNavButton";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AddAccountModal from "./AddAccountModal";
import TradeEntryModal from "./TradeEntryModal";
import AccountAnalytics from "./AccountAnalytics";
import EditBalanceModal from "./EditBalanceModal";
import Stat from "./Stat";

export default function TradingTab({ state, runMutation }) {
  const now = new Date();
  const [cal, setCal] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState(null);
  const [entryDate, setEntryDate] = useState(null);
  const [viewMode, setViewMode] = useState("calendar");
  const [editBalanceOpen, setEditBalanceOpen] = useState(false);

  const { accounts, entries, tradeItems, strategies } = state;

  useEffect(() => {
    if (!activeAccountId || !accounts.some((a) => a.id === activeAccountId)) {
      setActiveAccountId(accounts[0]?.id || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  const acct = accounts.find((a) => a.id === activeAccountId) || null;
  const acctEntries = (acct && entries[acct.id]) || {};
  const acctItems = (acct && tradeItems[acct.id]) || {};
  const tKey = todayKey();

  function shiftMonth(delta) {
    setCal((c) => {
      let m = c.m + delta;
      let y = c.y;
      if (m < 0) { m = 11; y -= 1; }
      if (m > 11) { m = 0; y += 1; }
      return { y, m };
    });
  }

  const { cells, monthTotal, posCount, negCount, maxAbs } = useMemo(() => {
    const { y, m } = cal;
    const n = daysInMonth(y, m);
    const offset = firstWeekday(y, m);
    const arr = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= n; d++) arr.push(dateKey(y, m, d));

    let total = 0;
    let pos = 0;
    let neg = 0;
    let max = 1;
    Object.entries(acctEntries).forEach(([k, v]) => {
      const [ky, km] = k.split("-").map(Number);
      if (ky === y && km - 1 === m) {
        total += v;
        if (v > 0) pos++;
        if (v < 0) neg++;
        max = Math.max(max, Math.abs(v));
      }
    });
    return { cells: arr, monthTotal: total, posCount: pos, negCount: neg, maxAbs: max };
  }, [cal, acctEntries]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {accounts.map((a) => (
          <button
            key={a.id}
            onClick={() => setActiveAccountId(a.id)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              a.id === acct?.id ? "border-accent text-text" : "border-border text-muted"
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
            {a.name}
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteAccountId(a.id);
              }}
              className="opacity-60 hover:opacity-100 hover:text-loss flex items-center"
            >
              <X size={11} />
            </span>
          </button>
        ))}
        <Button variant="ghost" onClick={() => setAddAccountOpen(true)}>
          <Plus size={13} /> Nova conta
        </Button>
        {acct && (
          <button
            onClick={() => setEditBalanceOpen(true)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-text border border-border rounded-full px-3 py-1.5 transition-colors"
            title="Editar saldo da conta"
          >
            Saldo: {fmtBRL(acct.balance || 0)} <Pencil size={10} />
          </button>
        )}
        {acct && (
          <div className="flex gap-1 ml-auto bg-surface-2 border border-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                viewMode === "calendar" ? "bg-accent text-bg" : "text-muted hover:text-text"
              }`}
            >
              Calendário
            </button>
            <button
              onClick={() => setViewMode("analytics")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                viewMode === "analytics" ? "bg-accent text-bg" : "text-muted hover:text-text"
              }`}
            >
              <LineChart size={12} /> Análises
            </button>
          </div>
        )}
      </div>

      {!acct ? (
        <p className="text-sm text-muted py-10 text-center">
          Crie uma conta acima para começar a registrar seus dias de trading.
        </p>
      ) : viewMode === "analytics" ? (
        <AccountAnalytics
          acct={acct}
          acctEntries={acctEntries}
          acctItems={acctItems}
          strategies={strategies}
          runMutation={runMutation}
        />
      ) : (
        <>
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

          <div className="flex gap-3 flex-wrap mb-4">
            <Stat
              label="Resultado do mês"
              value={fmtBRL(monthTotal)}
              sub={fmtPct(monthTotal, acct.balance)}
              color={monthTotal >= 0 ? "var(--color-profit)" : "var(--color-loss)"}
            />
            <Stat label="Dias positivos" value={posCount} color="var(--color-profit)" />
            <Stat label="Dias negativos" value={negCount} color="var(--color-loss)" />
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAY_HEAD.map((w) => (
              <div key={w} className="text-center text-[10px] font-mono uppercase tracking-wide text-muted pb-2">
                {w}
              </div>
            ))}
            {cells.map((key, i) => {
              if (!key) return <div key={`e-${i}`} />;
              const val = acctEntries[key];
              const isToday = key === tKey;
              let bg;
              if (typeof val === "number" && val !== 0) {
                const intensity = 0.15 + 0.55 * (Math.abs(val) / maxAbs);
                bg =
                  val > 0
                    ? `rgba(79,191,127,${intensity.toFixed(2)})`
                    : `rgba(225,104,91,${intensity.toFixed(2)})`;
              }
              return (
                <button
                  key={key}
                  onClick={() => setEntryDate(key)}
                  style={{ background: bg }}
                  className={`min-h-[62px] flex flex-col justify-between text-left bg-surface border rounded-lg p-1.5 hover:border-accent transition-colors ${
                    isToday ? "border-accent" : "border-border"
                  }`}
                >
                  <span className={`font-mono text-xs ${isToday ? "text-accent font-bold" : "text-muted"}`}>
                    {Number(key.slice(-2))}
                  </span>
                  {typeof val === "number" && val !== 0 && (
                    <span
                      className="font-mono text-[11px] font-semibold"
                      style={{ color: val > 0 ? "var(--color-profit)" : "var(--color-loss)" }}
                    >
                      {fmtBRL(val)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      <AddAccountModal
        open={addAccountOpen}
        onOpenChange={setAddAccountOpen}
        runMutation={runMutation}
        onCreated={setActiveAccountId}
      />

      <EditBalanceModal
        open={editBalanceOpen}
        onOpenChange={setEditBalanceOpen}
        account={acct}
        runMutation={runMutation}
      />

      <ConfirmModal
        open={!!deleteAccountId}
        onOpenChange={(v) => !v && setDeleteAccountId(null)}
        title="Remover conta"
        description="Remover esta conta e todos os valores registrados nela?"
        onConfirm={async () => {
          await runMutation(`/api/accounts/${deleteAccountId}`, { method: "DELETE" });
        }}
      />

      {entryDate && acct && (
        <TradeEntryModal
          open={!!entryDate}
          onOpenChange={(v) => !v && setEntryDate(null)}
          date={entryDate}
          accountId={acct.id}
          items={acctItems[entryDate] || []}
          strategies={strategies}
          runMutation={runMutation}
        />
      )}
    </div>
  );
}
