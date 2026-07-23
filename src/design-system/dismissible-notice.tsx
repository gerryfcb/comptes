"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./icons";
import styles from "./components.module.css";

export function DismissibleNotice({ id, version = 1, persistence = "session", title, message, icon, tone = "info", children, onDismiss }: {
  id: string; version?: number; persistence?: "session" | "local"; title?: string; message: string; icon?: ReactNode;
  tone?: "info" | "warning" | "success" | "error"; children?: ReactNode; onDismiss?: () => void;
}) {
  const key = `comptes-notice-${id}-v${version}`;
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const storage = persistence === "local" ? localStorage : sessionStorage;
    const frame = window.requestAnimationFrame(() => setVisible(storage.getItem(key) !== "dismissed"));
    return () => window.cancelAnimationFrame(frame);
  }, [key, persistence]);
  if (!visible) return null;
  return <article className={styles.dismissibleNotice} data-tone={tone} role={tone === "error" ? "alert" : "status"}>
    {icon && <span className={styles.noticeIcon}>{icon}</span>}
    <div>{title && <h2>{title}</h2>}<p>{message}</p>{children && <div className={styles.noticeActions}>{children}</div>}</div>
    <button className={styles.noticeClose} type="button" aria-label="Tanca l’avís" onClick={() => {
      const storage = persistence === "local" ? localStorage : sessionStorage;
      storage.setItem(key, "dismissed"); setVisible(false); onDismiss?.();
    }}><Icon name="close" /></button>
  </article>;
}
