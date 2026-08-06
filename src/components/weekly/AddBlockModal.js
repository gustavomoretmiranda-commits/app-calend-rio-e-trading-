"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { WEEK_DAYS, PERIODS, formatShortDate } from "@/lib/date-utils";

export default function AddBlockModal({ open, onOpenChange, target, tagConfig, runMutation }) {
  const [time, setTime] = useState("");
  const [tagKey, setTagKey] = useState("");
  const [repeatAll, setRepeatAll] = useState(true);

  useEffect(() => {
    if (open) {
      setTime("");
      setTagKey("");
      setRepeatAll(true);
    }
  }, [open]);

  if (!target) return null;

  const dayLabel = WEEK_DAYS.find((d) => d.key === target.dayKey)?.label;
  const periodLabel = PERIODS.find((p) => p.key === target.period)?.label;

  async function submit() {
    if (!tagKey) return;
    await runMutation("/api/weekly", {
      method: "POST",
      body: {
        dayKey: target.dayKey,
        period: target.period,
        start: time || "00:00",
        tagKey,
        date: repeatAll ? null : target.date,
      },
    });
    onOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`Adicionar em ${dayLabel} · ${periodLabel}`} size="sm">
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-xs text-muted">
          Horário
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="font-mono bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-muted">
          Atividade
          <select
            value={tagKey}
            onChange={(e) => setTagKey(e.target.value)}
            className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">Selecione...</option>
            {tagConfig.map((cfg) => (
              <option key={cfg.key} value={cfg.key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-muted mt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={repeatAll}
            onChange={(e) => setRepeatAll(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          {repeatAll
            ? "Repetir todas as semanas"
            : `Só nesta semana (${formatShortDate(target.date)})`}
        </label>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={submit}>
          <Plus size={13} /> Adicionar
        </Button>
      </div>
    </Modal>
  );
}
