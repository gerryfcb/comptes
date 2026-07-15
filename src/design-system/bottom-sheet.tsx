"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./components.module.css";

export function BottomSheet({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const sheet = ref.current;
    if (!sheet) return;
    if (open && !sheet.open) sheet.showModal();
    if (!open && sheet.open) sheet.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.sheet} onClose={onClose} onCancel={onClose}>
      <div className={styles.sheetHandle} aria-hidden="true" />
      <header className={styles.sheetHeader}>
        <h2 className={styles.sheetTitle}>{title}</h2>
        {description && <p className={styles.sheetDescription}>{description}</p>}
      </header>
      <div className={styles.sheetBody}>{children}</div>
    </dialog>
  );
}
