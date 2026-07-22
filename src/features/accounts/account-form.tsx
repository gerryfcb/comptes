"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet, Button, ColorPicker, IconPicker, Input, MoneyInput, parseMoneyInput, type IconName } from "@/design-system";
import { Screen } from "@/components/screen";
import { newId, type AccountType } from "@/lib/app-data";
import { useAppStore } from "@/lib/app-store";
import styles from "../shared.module.css";

const accountTypes: Array<[AccountType, string]> = [["personal", "Personal"], ["shared", "Compartit"], ["saving", "Estalvi"], ["goal", "Objectiu"], ["other", "Altre"]];
const shareOptions = [100, 75, 50, 25];

function suggestedAccountStyle(type: AccountType, name: string): { icon: IconName; color: string } {
  const clean = name.toLocaleLowerCase("ca");
  if (clean.includes("viatge")) return { icon: "suitcase", color: "teal" };
  if (clean.includes("emerg")) return { icon: "shield", color: "orange" };
  if (clean.includes("efectiu")) return { icon: "cash", color: "yellow" };
  if (clean.includes("invers")) return { icon: "investments", color: "indigo" };
  if (type === "shared") return { icon: "accounts", color: "violet" };
  if (type === "saving") return { icon: "piggy-bank", color: "green" };
  if (type === "goal") return { icon: "goal", color: "teal" };
  return { icon: "card", color: "blue" };
}

export function AccountForm({ title, action, accountId }: { title: string; action: string; accountId?: string }) {
  const { data, update } = useAppStore();
  const router = useRouter();
  const account = useMemo(() => data.accounts.find((item) => item.id === accountId), [data.accounts, accountId]);
  const owners = data.people.filter((person) => !person.archived || account?.ownerIds.includes(person.id));
  const defaultOwners = account?.ownerIds ?? (owners.length === 1 ? [owners[0].id] : []);
  const defaultStyle = suggestedAccountStyle(account?.type ?? "personal", account?.name ?? "");
  const [error, setError] = useState("");
  const [type, setType] = useState<AccountType>(account?.type ?? "personal");
  const [name, setName] = useState(account?.name ?? "");
  const [ownerIds, setOwnerIds] = useState<string[]>(defaultOwners);
  const [share, setShare] = useState(account?.attributablePercentage ?? (defaultOwners.length > 1 ? 50 : 100));
  const [color, setColor] = useState(account?.color ?? defaultStyle.color);
  const [icon, setIcon] = useState<IconName>(account?.icon ?? defaultStyle.icon);
  const [personSheet, setPersonSheet] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonColor, setNewPersonColor] = useState("violet");
  const hasMovements = account ? data.movements.some((movement) => movement.accountId === account.id || movement.destinationAccountId === account.id) : false;
  const hasRecurrences = account ? data.recurrences.some((recurrence) => recurrence.sourceAccountId === account.id || recurrence.destinationAccountId === account.id) : false;
  const hasGoals = account ? data.goals.some((goal) => goal.accountId === account.id) : false;
  const canDelete = Boolean(account) && !hasMovements && !hasRecurrences && !hasGoals;
  const multipleOwners = ownerIds.length > 1;

  function createPerson() {
    const personName = newPersonName.trim();
    if (!personName) return setError("Escriu el nom de la persona.");
    const id = newId("person");
    update((current) => ({ ...current, people: [...current.people, { id, name: personName, color: newPersonColor, archived: false }] }));
    setOwnerIds((current) => [...current, id]);
    setNewPersonName("");
    setPersonSheet(false);
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const trimmedName = name.trim();
    const initialBalance = parseMoneyInput(values.get("initialBalance"));
    if (!trimmedName || !Number.isFinite(initialBalance)) return setError("Revisa el nom i el saldo inicial.");
    if (!ownerIds.length) return setError("Selecciona almenys una persona propietària.");
    const saved = {
      id: account?.id ?? newId("account"),
      name: trimmedName,
      initialBalance,
      type,
      ownerIds,
      attributablePercentage: multipleOwners ? Math.max(0, Math.min(100, share)) : 100,
      color,
      icon,
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
    if (!canDelete) return setError("Aquest compte té historial o vincles actius. Pots arxivar-lo, però no eliminar-lo definitivament.");
    if (!confirm("Vols eliminar definitivament aquest compte? Només es pot fer perquè encara no s'ha utilitzat.")) return;
    update((current) => ({ ...current, accounts: current.accounts.filter((item) => item.id !== account.id) }));
    router.push("/comptes");
  }

  return (
    <Screen title={title} eyebrow={account ? "Edita les dades del compte" : "Nou compte"} backHref="/comptes">
      <form className={styles.form} onSubmit={submit}>
        <Input label="Nom" value={name} onChange={(event) => {
          const next = event.target.value;
          setName(next);
          if (!account) {
            const style = suggestedAccountStyle(type, next);
            setIcon(style.icon);
            setColor(style.color);
          }
        }} placeholder="Nom del compte" required />
        <label className={styles.selectField}>Tipus<select value={type} onChange={(event) => {
          const next = event.target.value as AccountType;
          setType(next);
          if (!account) {
            const style = suggestedAccountStyle(next, name);
            setIcon(style.icon);
            setColor(style.color);
          }
        }}>{accountTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <MoneyInput label="Saldo inicial" name="initialBalance" defaultValue={account?.initialBalance ?? 0} required hint={hasMovements ? "Aquest compte ja té moviments. Canviar el saldo inicial modificarà el saldo actual; fes-ho només si corregeixes el punt de partida." : undefined} />
        <fieldset className={styles.fieldset}><legend>Propietaris</legend>{owners.map((person) => <label key={person.id}><input type="checkbox" checked={ownerIds.includes(person.id)} onChange={(event) => setOwnerIds((current) => event.target.checked ? [...new Set([...current, person.id])] : current.filter((id) => id !== person.id))} /> {person.name}{person.archived ? " - arxivada" : ""}</label>)}<Button type="button" size="small" variant="secondary" onClick={() => setPersonSheet(true)}>+ Crear persona</Button></fieldset>
        {multipleOwners ? <article className={styles.noticeInline}><b>Quina part d&apos;aquest compte forma part del teu patrimoni?</b><p>Aquest percentatge només serveix per calcular la teva part del patrimoni. No modifica el saldo real del compte.</p><div className={styles.quickGrid}>{shareOptions.map((option) => <button className={share === option ? styles.choiceActive : ""} type="button" key={option} onClick={() => setShare(option)}>{option}%</button>)}<button className={!shareOptions.includes(share) ? styles.choiceActive : ""} type="button" onClick={() => setShare(50)}>Altre</button></div><Input label="Percentatge personalitzat" type="number" min="0" max="100" step="0.01" value={share} onChange={(event) => setShare(Math.max(0, Math.min(100, Number(event.target.value) || 0)))} /></article> : <p className={styles.noticeInline}>Amb un sol propietari, el percentatge atribuïble es desa al 100%.</p>}
        <ColorPicker label="Color" value={color} onChange={setColor} />
        <IconPicker label="Icona" value={icon} onChange={setIcon} />
        {error && <p className={styles.error} role="alert">{error}</p>}
        {account && <article className={styles.statCard}>
          <p>{canDelete ? "Aquest compte encara no s'ha utilitzat. El pots eliminar definitivament si és un error." : "Aquest compte té historial o vincles. El pots arxivar per ocultar-lo de l'ús habitual i conservar l'historial."}</p>
          <div className={styles.dangerActions}>
            <Button type="button" variant="secondary" onClick={toggleArchive}>{account.archived ? "Desarxivar compte" : "Arxivar / tancar compte"}</Button>
            <Button type="button" variant="danger" onClick={removeAccount}>Eliminar definitivament</Button>
          </div>
        </article>}
        <div className={styles.formActions}><Link href="/comptes"><Button variant="secondary" fullWidth>Cancel·la</Button></Link><Button type="submit" fullWidth>{action}</Button></div>
      </form>
      <BottomSheet open={personSheet} title="Crear persona" description="Quedarà seleccionada com a propietària del compte." onClose={() => setPersonSheet(false)}>
        <div className={styles.form}>
          <Input label="Nom" value={newPersonName} onChange={(event) => setNewPersonName(event.target.value)} />
          <ColorPicker label="Color" value={newPersonColor} onChange={setNewPersonColor} />
          <Button onClick={createPerson}>Crear i seleccionar</Button>
        </div>
      </BottomSheet>
    </Screen>
  );
}
