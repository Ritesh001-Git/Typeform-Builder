"use client";

import { useEffect } from "react";
import { XIcon } from "@/components/icons";

export function Modal({
  title, onClose, children, footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-[2px] animate-fade-in p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-slide-up"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium">{title}</h2>
          <button
            onClick={onClose}
            className="focus-ring rounded-full p-1 text-muted hover:bg-paper"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title, message, confirmLabel = "Confirm", danger, onConfirm, onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button
            onClick={onCancel}
            className="focus-ring rounded-lg px-4 py-2 text-sm font-medium text-muted hover:bg-paper"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`focus-ring rounded-lg px-4 py-2 text-sm font-medium text-white ${
              danger ? "bg-danger hover:bg-danger/90" : "bg-accent hover:bg-accent-hover"
            }`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted">{message}</p>
    </Modal>
  );
}
