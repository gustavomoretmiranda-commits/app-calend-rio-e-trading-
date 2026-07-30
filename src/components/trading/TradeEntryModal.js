"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatDateLabel, fmtUSD } from "@/lib/date-utils";

export default function TradeEntryModal({ open, onOpenChange, date, accountId, items, strategies, runMutation }) {
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [strategyId, setStrategyId] = useState("");
  const [size, setSize] = useState("");
  const [time, setTime] = useState("");

  const total = items.reduce((sum, it) => sum + it.value, 0);
  const strategyByKey = Object.fromEntries(strategies.map((s) => [s.id, s]));

  async function addItem() {
    const raw = value.trim().replace(",", ".");
    const num = parseFloat(raw);
    if (Number.isNaN(num)) return;
    const sizeRaw = size.trim().replace(",", ".");
    const sizeNum = sizeRaw ? parseFloat(sizeRaw) : null;
    await runMutation("/api/trade-items", {
      method: "POST",
      body: { accountId, date, value: num, note: note.trim() || null, strategyId: strategyId || null, size: sizeNum, time: time || null },
    });
    setValue("");
    setNote("");
    setStrategyId("");
    setSize("");
    setTime("");
  }

  async function removeItem(id) {
    await runMutation(`/api/trade-items/${id}`, { method: "DELETE" });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={formatDateLabel(date)} description="Operações do dia" size="sm">
      <div className="space-y-1.5 mb-3">
        {items.length === 0 && <div className="text-xs text-muted py-1">Nenhuma operação registrada.</div>}
        {items.map((it) => {
          const strat = it.strategyId ? strategyByKey[it.strategyId] : null;
          return (
            <div
              key={it.id}
              className="flex items-center gap-2 bg-surface-2 rounded-md px-2.5 py-2 text-xs"
            >
              <span
                className="font-mono font-semibold shrink-0"
                style={{ color: it.value >= 0 ? "var(--color-profit)" : "var(--color-loss)" }}
              >
                {fmtUSD(it.value)}
              </span>
              {it.size != null && (
                <span className="text-muted shrink-0 font-mono">{it.size}L</span>
              )}
              {it.time && <span className="text-muted shrink-0 font-mono">{it.time}</span>}
              {it.note && <span className="text-muted truncate">{it.note}</span>}
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
              <button
                onClick={() => removeItem(it.id)}
                className="ml-auto text-muted hover:text-loss shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {items.length > 0 && (
        <div className="flex justify-between text-xs font-mono mb-3 px-0.5">
          <span className="text-muted">Total do dia</span>
          <span
            className="font-semibold"
            style={{ color: total >= 0 ? "var(--color-profit)" : "var(--color-loss)" }}
          >
            {fmtUSD(total)}
          </span>
        </div>
      )}

      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex gap-2">
          <input
            autoFocus
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="0,00"
            className="w-24 font-mono bg-surface-2 border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="number"
            step="0.01"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Lote"
            title="Tamanho do lote"
            className="w-20 font-mono bg-surface-2 border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            title="Horário (Brasília)"
            className="w-[105px] font-mono bg-surface-2 border border-border rounded-md px-2 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Nota (opcional)"
            className="flex-1 bg-surface-2 border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <select
          value={strategyId}
          onChange={(e) => setStrategyId(e.target.value)}
          className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">Sem estratégia</option>
          {strategies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <Button onClick={addItem} className="w-full">
          <Plus size={13} /> Adicionar operação
        </Button>
      </div>
    </Modal>
  );
}
