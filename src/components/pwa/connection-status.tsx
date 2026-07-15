"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/app-store";
import styles from "./connection-status.module.css";

export function ConnectionStatus() {
  const [online, setOnline] = useState(true);
  const [recovered, setRecovered] = useState(false);
  const { storageError } = useAppStore();

  useEffect(() => {
    const update = () => {
      const next = navigator.onLine;
      setOnline((previous) => {
        if (!previous && next) {
          setRecovered(true);
          window.setTimeout(() => setRecovered(false), 3500);
        }
        return next;
      });
    };

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (storageError) return <div className={styles.banner} role="alert">{storageError}</div>;
  if (!online) return <div className={styles.banner} role="status">Sense connexio. Pots continuar utilitzant Comptes; les dades es guarden en aquest dispositiu.</div>;
  if (recovered) return <div className={styles.banner} role="status">Connexio recuperada.</div>;
  return null;
}
