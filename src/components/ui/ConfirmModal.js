"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Remover",
  onConfirm,
  danger = true,
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm">
      <div className="flex gap-3">
        <div
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
            danger ? "bg-loss/15 text-loss" : "bg-accent/15 text-accent"
          }`}
        >
          <TriangleAlert size={16} />
        </div>
        <p className="text-sm text-muted leading-relaxed">{description}</p>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={handleConfirm} disabled={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
