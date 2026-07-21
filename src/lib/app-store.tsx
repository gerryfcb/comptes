"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createDemoData, createEmptyData, createInitialGerardData, normalizeAppData, validateAppData, type AppData } from "./app-data";
export { formatMoney } from "./app-data";

const STORAGE_KEY = "comptes-data-v1";
const CORRUPT_STORAGE_KEY = "comptes-data-v1-corrupt";
export const LAST_BACKUP_KEY = "comptes-last-backup-at";
type Store = {
  data: AppData; ready: boolean; storageError: string; corruptData: boolean; update: (recipe: (current: AppData) => AppData) => void;
  resetDemo: () => void; clearAll: () => void;
  resetGerardInitial: () => void; replaceData: (next: AppData) => void;
};
const AppStoreContext = createContext<Store | null>(null);

function writeLocalData(next: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeAppData(next)));
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => createEmptyData());
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [corruptData, setCorruptData] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Hydrate the client repository once after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) {
        const checked = validateAppData(JSON.parse(stored) as unknown);
        if (!checked.valid) throw new Error(checked.reason);
        setData(checked.data);
      }
    } catch {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) localStorage.setItem(CORRUPT_STORAGE_KEY, stored);
      } catch { /* Preserve the original key at all costs. */ }
      setCorruptData(true);
      setStorageError("No s’han pogut llegir les dades locals. No s’han esborrat: importa una còpia de seguretat per recuperar l’app.");
    }
    setReady(true);
  }, []);
  const update = useCallback((recipe: (current: AppData) => AppData) => setData((current) => {
    const next = normalizeAppData(recipe(current));
    if (ready) {
      try {
        writeLocalData(next);
        setStorageError("");
      } catch {
        setStorageError("No s’han pogut desar les dades en aquest dispositiu. Exporta una còpia abans de continuar.");
        return current;
      }
    }
    return next;
  }), [ready]);
  const replaceData = useCallback((next: AppData) => {
    const normalized = normalizeAppData(next);
    try {
      writeLocalData(normalized);
      setStorageError("");
    } catch {
      setStorageError("No s’han pogut desar les dades en aquest dispositiu. Exporta una còpia abans de continuar.");
      return;
    }
    setData(normalized);
    setCorruptData(false);
  }, []);
  const value = useMemo(() => ({
    data, ready, storageError, corruptData, update, replaceData,
    resetDemo: () => replaceData(createDemoData()),
    clearAll: () => {
      try {
        localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(CORRUPT_STORAGE_KEY); setData(createEmptyData()); setStorageError(""); setCorruptData(false);
      } catch { setStorageError("No s’han pogut esborrar les dades d’aquest dispositiu."); }
    },
    resetGerardInitial: () => replaceData(createInitialGerardData()),
  }), [data, ready, storageError, corruptData, update, replaceData]);
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error("useAppStore must be used inside AppStoreProvider");
  return store;
}
