"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export default function Modal({ open, onOpenChange, title, description, children, size = "md" }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40" />
        <Dialog.Content
          className={`modal-content fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] ${SIZES[size]} bg-surface border border-border rounded-[28px] shadow-2xl shadow-black/40 z-50 max-h-[85vh] flex flex-col outline-none overflow-hidden`}
        >
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-border">
            <div>
              <Dialog.Title className="font-mono text-sm font-semibold text-text">{title}</Dialog.Title>
              <Dialog.Description className={description ? "text-xs text-muted mt-1" : "sr-only"}>
                {description || title}
              </Dialog.Description>
            </div>
            <Dialog.Close className="text-muted hover:text-text transition-colors shrink-0 mt-0.5">
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="px-5 py-4 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
