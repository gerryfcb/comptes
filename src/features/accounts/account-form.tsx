"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Button, Input, type IconName } from "@/design-system";
import { Screen } from "@/components/screen";
import { newId, type AccountType } from "@/lib/app-data";
import { useAppStore } from "@/lib/app-store";
import styles from "../shared.module.css";

const accountTypes: Array<[AccountType, string]> = [["personal", "Personal"], ["shared", "Compartit"], ["saving", "Estalvi"], ["goal", "Objectiu"], ["other", "Altre"]];
const colors = [["blue", "Blau"], ["violet", "Violeta"], ["green", "Verd"], ["orange", "Taronja"]];
const icons: Array<[IconName, string]> = [["wallet", "Cartera"], ["accounts", "Comptes"], ["saving", "Estalvi"], ["goal", "Objectiu"]];

export function AccountForm({ title, action, accountId }: { title: string; action: string; accountId?: string }) {
  const { data, update } = useAppStore();
  const router = useRouter();
  const account = useMemo(() => data.accounts.find((item) => item.id === accountId), [data.accounts, accountId]);
  const [error, setError] = useState("");
  const hasMovements = account ? data.movements.some((movement) => movement.accountId === account.id || movement.destinationAccountId === account.id) : false;
  const hasRecurrences = account ? data.recurrences.some((recurrence) => recurrence.sourceAccountId === account.id || recurrence.destinationAccountId === account.id) : false;
  const hasGoals = account ? data.goals.some((goal) => goal.accountId === account.id) : false;
  const canDelete = Boolean(account) && !hasMovements && !hasRecurrences && !hasGoals;
  const owners = data.people.filter((person) => !person.archived || account?.ownerIds.includes(person.id));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const name = String(values.get("name") ?? "").trim();
    const initialBalance = Number(values.get("initialBalance"));
    const ownerIds = values.getAll("owners").map(String);
    if (!name || !Number.isFinite(initialBalance)) return setError("Revisa el nom i el saldo inicial.");
    const saved = {
      id: account?.id ?? newId("account"),
      name,
      initialBalance,
      type: String(values.get("type")) as AccountType,
      ownerIds,
      attributablePercentage: Math.max(0, Math.min(100, Number(values.get("share")) || 0)),
      color: String(values.get("color")),
      icon: String(values.get("icon")) as IconName,
      archived: account?.archived ?? false,
    };
    update((current) => ({ ...current, accounts: account ? current.accounts.map((item) => item.id === account.id ? saved : item) : [...current.accounts, saved] }));
    router.push("/comptes");
  }

  function toggleArchive() {
    if (!account) return;
    update((current) => ({ ...current, accounts: current.accounts.map((item) => item.id === account.id ? { ...item, archived: !item.archived } : item) }));
    router.push("/comptes");
  }

  function removeAccount() {
    if (!account) return;
    if (!canDelete) {
      setError("Aquest compte té historial o vincles actius. Pots arxivar-lo, però no eliminar-lo definitivament.");
      return;
    }
    if (!confirm("Vols eliminar definitivament aquest compte? Només es pot fer perquè encara no s’ha utilitzat.")) return;
    update((current) => ({ ...current, accounts: current.accounts.filter((item) => item.id !== account.id) }));
    router.push("/comptes");
  }

  return <Screen title={title} eyebrow={account ? "Edita les dades del compte" : "Nou compte"} backHref="/comptes">
    <form className={styles.form} onSubmit={submit}>
      <Input label="Nom" name="name" defaultValue={account?.name} placeholder="Nom del compte" required />
      <label className={styles.selectField}>Tipus<select name="type" defaultValue={account?.type ?? "personal"}>{accountTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <Input label="Saldo inicial" name="initialBalance" defaultValue={account?.initialBalance ?? 0} type="number" step="0.01" required hint={hasMovements ? "Aquest compte ja té moviments. Canviar el saldo inicial modificarà el saldo actual; fes-ho només si estàs corregint el punt de partida." : undefined} />
      <fieldset className={styles.fieldset}><legend>Propietaris</legend>{owners.map((person) => <label key={person.id}><input type="checkbox" name="owners" value={person.id} defaultChecked={account?.ownerIds.includes(person.id)} /> {person.name}{person.archived ? " · arxivada" : ""}</label>)}</fieldset>
      <Input label="Percentatge atribuïble" name="share" defaultValue={account?.attributablePercentage ?? 100} type="number" min="0" max="100" />
      <label className={styles.selectField}>Color<select name="color" defaultValue={account?.color ?? "blue"}>{colors.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <label className={styles.selectField}>Icona<select name="icon" defaultValue={account?.icon ?? "wallet"}>{icons.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {account && <article className={styles.statCard}>
        <p>{canDelete ? "Aquest compte encara no s’ha utilitzat. El pots eliminar definitivament si és un error." : "Aquest compte té historial o vincles. Pots arxivar-lo per ocultar-lo de l’ús habitual i conservar l’historial."}</p>
        <div className={styles.dangerActions}>
          <Button type="button" variant="secondary" onClick={toggleArchive}>{account.archived ? "Desarxivar compte" : "Arxivar / tancar compte"}</Button>
          <Button type="button" variant="danger" onClick={removeAccount}>Eliminar definitivament</Button>
        </div>
      </article>}
      <div className={styles.formActions}><Link href="/comptes"><Button variant="secondary" fullWidth>Cancel·la</Button></Link><Button type="submit" fullWidth>{action}</Button></div>
    </form>
  </Screen>;
}
