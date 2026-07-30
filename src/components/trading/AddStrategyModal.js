"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function AddStrategyModal({ open, onOpenChange, runMutation }) {
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    if (!label.trim()) return;
    try {
      await runMutation("/api/strategies", { method: "POST", body: { label: label.trim() } });
      setLabel("");
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
      title="Nova estratégia"
      description="Crie um tipo de estratégia para marcar nas suas operações."
      size="sm"
    >
      <input
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Ex: Rompimento, Suporte e resistência..."
        className="w-full bg-surface-2 border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-accent mb-2"
      />
      {error && <p className="text-xs text-loss mb-2">{error}</p>}
      <div className="flex justify-end gap-2 mt-3">
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
