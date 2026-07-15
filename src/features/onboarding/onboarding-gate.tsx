"use client";
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Button, Input } from "@/design-system";
import { Screen } from "@/components/screen";
import { createStarterData, type AppData } from "@/lib/app-data";
import { useAppStore } from "@/lib/app-store";
import styles from "../shared.module.css";

type BackupFile = { formatVersion?: number; exportedAt?: string; data?: AppData };

function isAppData(value: unknown): value is AppData {
  const data = value as AppData;
  return Boolean(data && data.version === 1 && Array.isArray(data.people) && Array.isArray(data.accounts) && Array.isArray(data.movements) && Array.isArray(data.recurrences));
}

function extractAppData(value: unknown) {
  if (isAppData(value)) return value;
  const backup = value as BackupFile;
  if (backup && isAppData(backup.data)) return backup.data;
  return null;
}

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { data, ready, resetGerardInitial, replaceData } = useAppStore();
  const [mode, setMode] = useState<"menu" | "zero" | "import">("menu");
  const [error, setError] = useState("");
  const needsOnboarding = ready && data.people.length === 0 && data.accounts.length === 0 && data.movements.length === 0;
  if (!ready) return null;
  if (!needsOnboarding) return <>{children}</>;

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const imported = extractAppData(parsed);
      if (!imported) return setError("El fitxer no té el format correcte de còpia de seguretat.");
      if (!confirm("Aquesta importació substituirà les dades locals actuals. Vols continuar?")) return;
      replaceData(imported);
    } catch {
      setError("No s’ha pogut llegir el fitxer JSON.");
    }
  };

  const startEmpty = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const userName = String(form.get("userName") ?? "").trim();
    const accountName = String(form.get("accountName") ?? "").trim();
    const initialBalance = Number(form.get("initialBalance"));
    if (!userName || !accountName || !Number.isFinite(initialBalance)) return setError("Indica el nom, el primer compte i un saldo inicial vàlid.");
    replaceData(createStarterData(userName, accountName, initialBalance));
  };

  return <Screen title="Configura Comptes" eyebrow="Primer ús">
    {mode === "menu" && <div className={styles.onboardingGrid}>
      <article className={styles.statCard}><h2>Plantilla Gerard</h2><p>Crea persones, comptes, categories, subcategories i recurrències mensuals base. És només una plantilla inicial.</p><Button onClick={() => { if (confirm("Vols carregar la plantilla Gerard? Substituirà l’estat inicial buit.")) resetGerardInitial(); }}>Començar amb plantilla Gerard</Button></article>
      <article className={styles.statCard}><h2>Començar de zero</h2><p>Crea una configuració mínima amb el teu nom i el primer compte.</p><Button onClick={() => setMode("zero")}>Començar de zero</Button></article>
      <article className={styles.statCard}><h2>Importar còpia</h2><p>Carrega un JSON exportat prèviament des d’aquesta app.</p><Button onClick={() => setMode("import")}>Importar còpia de seguretat</Button></article>
    </div>}
    {mode === "zero" && <article className={styles.statCard}><form className={styles.form} onSubmit={startEmpty}>
      <Input label="El teu nom" name="userName" placeholder="Ex. Ariadna" required />
      <Input label="Nom del primer compte" name="accountName" placeholder="Ex. Compte personal" required />
      <Input label="Saldo inicial" name="initialBalance" type="number" step="0.01" defaultValue={0} required />
      {error && <p className={styles.errorText} role="alert">{error}</p>}
      <div className={styles.formActions}><Button variant="secondary" onClick={() => setMode("menu")} fullWidth>Torna</Button><Button type="submit" fullWidth>Crear configuració</Button></div>
    </form></article>}
    {mode === "import" && <article className={styles.statCard}><p>Selecciona un fitxer <strong>comptes-backup-YYYY-MM-DD.json</strong>.</p><Input label="Fitxer JSON" type="file" accept="application/json,.json" onChange={importBackup} />{error && <p className={styles.errorText} role="alert">{error}</p>}<Button variant="secondary" onClick={() => setMode("menu")}>Torna</Button></article>}
  </Screen>;
}
