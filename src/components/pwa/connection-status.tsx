"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { DismissibleNotice } from "@/design-system";
import { useAppStore } from "@/lib/app-store";
import styles from "./connection-status.module.css";

export function ConnectionStatus() {
  const [online, setOnline] = useState(true);
  const [recovered, setRecovered] = useState(false);
  const pathname = usePathname();
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
  if (!online && pathname === "/") return <div className={styles.notice}><DismissibleNotice id="offline" title="Sense connexió" message="Pots continuar utilitzant Comptes. Les funcions intel·ligents i les actualitzacions no estaran disponibles." tone="warning" /></div>;
  if (recovered) return <div className={styles.toast} role="status">Connexió recuperada</div>;
  return null;
}
