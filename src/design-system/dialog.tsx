"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";
import styles from "./components.module.css";

export function Dialog({
  open,
  title,
  description,
  children,
  confirmLabel = "Confirma",
  cancelLabel = "Cancel·la",
  destructive,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.dialog} onClose={onClose} onCancel={onClose}>
      <div className={styles.dialogContent}>
        <h2 className={styles.dialogTitle}>{title}</h2>
        {description && <p className={styles.dialogDescription}>{description}</p>}
        {children}
      </div>
      <div className={styles.dialogActions}>
        <Button variant="ghost" onClick={onClose}>{cancelLabel}</Button>
        {onConfirm && (
          <Button variant={destructive ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        )}
      </div>
    </dialog>
  );
}
