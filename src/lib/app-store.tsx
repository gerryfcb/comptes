"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createDemoData, createEmptyData, createInitialGerardData, normalizeAppData, type AppData } from "./app-data";
export { formatMoney } from "./app-data";

const STORAGE_KEY = "comptes-data-v1";
const CORRUPT_STORAGE_KEY = "comptes-data-v1-corrupt";
type Store = {
  data: AppData; ready: boolean; storageError: string; update: (recipe: (current: AppData) => AppData) => void;
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
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Hydrate the client repository once after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setData(normalizeAppData(JSON.parse(stored) as AppData));
    } catch {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) localStorage.setItem(CORRUPT_STORAGE_KEY, stored);
      localStorage.removeItem(STORAGE_KEY);
      setStorageError("Les dades locals no es podien llegir. S'ha creat un estat net i s'ha conservat una copia tecnica de recuperacio al dispositiu.");
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
        setStorageError("No s'han pogut desar les dades en aquest dispositiu. Exporta una copia abans de continuar.");
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
      setStorageError("No s'han pogut desar les dades en aquest dispositiu. Exporta una copia abans de continuar.");
    }
    setData(normalized);
  }, []);
  const value = useMemo(() => ({
    data, ready, storageError, update, replaceData,
    resetDemo: () => replaceData(createDemoData()),
    clearAll: () => { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(CORRUPT_STORAGE_KEY); setData(createEmptyData()); },
    resetGerardInitial: () => replaceData(createInitialGerardData()),
  }), [data, ready, storageError, update, replaceData]);
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error("useAppStore must be used inside AppStoreProvider");
  return store;
}
