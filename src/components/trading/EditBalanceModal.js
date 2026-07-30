"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function EditBalanceModal({ open, onOpenChange, account, runMutation }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open && account) setValue(String(account.balance ?? 0));
  }, [open, account]);

  if (!account) return null;

  async function save() {
    const raw = value.trim().replace(",", ".");
    const num = parseFloat(raw);
    if (Number.isNaN(num)) return;
    await runMutation(`/api/accounts/${account.id}`, { method: "PATCH", body: { balance: num } });
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Saldo da conta"
      description={account.name}
      size="sm"
    >
      <input
        autoFocus
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="0,00"
        className="w-full font-mono bg-surface-2 border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-accent mb-2"
      />
      <div className="flex justify-end gap-2 mt-3">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={save}>
          <Check size={13} /> Salvar
        </Button>
      </div>
    </Modal>
  );
}
