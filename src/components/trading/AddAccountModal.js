"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function AddAccountModal({ open, onOpenChange, runMutation, onCreated }) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    if (!name.trim()) return;
    try {
      const raw = balance.trim().replace(",", ".");
      const num = raw === "" ? 0 : parseFloat(raw);
      const created = await runMutation("/api/accounts", {
        method: "POST",
        body: { name: name.trim(), balance: Number.isNaN(num) ? 0 : num },
      });
      onCreated?.(created.id);
      setName("");
      setBalance("");
      setError("");
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nova conta"
      description="Ex: Conta FTMO, Conta real, Conta demo..."
      size="sm"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Nome da conta"
        className="w-full bg-surface-2 border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-accent mb-2"
      />
      <input
        type="number"
        step="0.01"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Saldo inicial (R$, opcional)"
        className="w-full font-mono bg-surface-2 border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-accent mb-2"
      />
      {error && <p className="text-xs text-loss mb-2">{error}</p>}
      <div className="flex justify-end gap-2 mt-3">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={submit}>
          <Plus size={13} /> Criar
        </Button>
      </div>
    </Modal>
  );
}
