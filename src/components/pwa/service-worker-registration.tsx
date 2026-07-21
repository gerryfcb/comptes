"use client";
import { useEffect, useState } from "react";
import styles from "./connection-status.module.css";

export function ServiceWorkerRegistration() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    let refreshing = false;
    const controllerChange = () => { if (!refreshing) { refreshing = true; window.location.reload(); } };
    navigator.serviceWorker.addEventListener("controllerchange", controllerChange);
    void navigator.serviceWorker.register("/sw.js").then((registration) => {
      if (registration.waiting) setWaiting(registration.waiting);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => { if (worker.state === "installed" && navigator.serviceWorker.controller) setWaiting(worker); });
      });
      void registration.update();
    });
    return () => navigator.serviceWorker.removeEventListener("controllerchange", controllerChange);
  }, []);
  if (!waiting) return null;
  return <div className={styles.banner} role="status">Hi ha una actualització disponible. <button type="button" onClick={() => waiting.postMessage({ type: "SKIP_WAITING" })}>Actualitzar</button></div>;
}
