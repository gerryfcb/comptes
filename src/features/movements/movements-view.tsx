"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BottomSheet, Button, FloatingActionButton, Icon, Input } from "@/design-system";
import { Screen } from "@/components/screen";
import { compareMovementsDesc, formatMoney, movementIcon, type MovementKind } from "@/lib/app-data";
import { useAppStore } from "@/lib/app-store";
import styles from "../shared.module.css";

const actions = [["rapid", "Moviment ràpid", "sparkles"], ["despesa", "Nova despesa", "shopping"], ["ingres", "Nou ingrés", "income"], ["transferencia", "Nova transferència", "transfer"], ["estalvi", "Moviment d'estalvi", "saving"]] as const;
const labels: Record<MovementKind, string> = { expense: "Despesa", income: "Ingrés", transfer: "Transferència", saving: "Estalvi" };

export function MovementsView() {
  const { data, update } = useAppStore();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [account, setAccount] = useState("");
  const [category, setCategory] = useState("");
  const [sheet, setSheet] = useState(false);
  const visible = useMemo(() => [...data.movements].sort(compareMovementsDesc).filter((item) => {
    const accountName = data.accounts.find((a) => a.id === item.accountId)?.name ?? "";
    const destination = data.accounts.find((a) => a.id === item.destinationAccountId)?.name ?? "";
    const categoryName = data.categories.find((c) => c.id === item.categoryId)?.name ?? "";
    const haystack = `${item.merchant ?? ""} ${item.notes ?? ""} ${accountName} ${destination} ${categoryName}`.toLowerCase();
    return (!type || item.kind === type) && (!account || item.accountId === account || item.destinationAccountId === account) && (!category || item.categoryId === category) && haystack.includes(query.toLowerCase());
  }), [data, query, type, account, category]);

  return <Screen title="Moviments" eyebrow="Tota la teva activitat" action={<Button leadingIcon={<Icon name="add" />} onClick={() => setSheet(true)}>Afegir</Button>}>
    <div className={styles.toolbar}><Input label="Cerca" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Comerç, categoria o compte" leadingIcon={<Icon name="search" />} />
      <div className={styles.filterGrid}><label className={styles.compactSelect}>Tipus<select value={type} onChange={(e) => setType(e.target.value)}><option value="">Tots</option>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <label className={styles.compactSelect}>Compte<select value={account} onChange={(e) => setAccount(e.target.value)}><option value="">Tots</option>{data.accounts.map((a) => <option value={a.id} key={a.id}>{a.name}</option>)}</select></label>
      <label className={styles.compactSelect}>Categoria<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Totes</option>{data.categories.filter((c) => !c.archived).map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label></div>
    </div>
    <div className={styles.listCard}>{!visible.length && <p className={styles.empty}>No hi ha moviments amb aquests filtres.</p>}{visible.map((item) => {
      const origin = data.accounts.find((a) => a.id === item.accountId)?.name ?? "Compte";
      const destination = data.accounts.find((a) => a.id === item.destinationAccountId)?.name;
      const categoryName = data.categories.find((c) => c.id === item.categoryId)?.name;
      const title = item.merchant || categoryName || labels[item.kind];
      const signed = item.kind === "expense" ? -item.amount : item.kind === "income" ? item.amount : item.amount;
      return <article className={styles.movement} key={item.id}><span className={styles.movementIcon}><Icon name={movementIcon(item.kind)} /></span><div><b>{title}</b><small>{origin}{destination ? ` -> ${destination}` : ""}</small></div><aside><b className={item.kind === "income" ? styles.positive : ""}>{item.kind === "transfer" || item.kind === "saving" ? formatMoney(item.amount) : formatMoney(signed)}</b><small>{new Intl.DateTimeFormat("ca-ES").format(new Date(`${item.date}T12:00:00`))}</small><span className={styles.rowActions}><Link href={`/moviments/${item.id}/editar?tipus=${item.kind}`}>Edita</Link><button onClick={() => { if (confirm("Vols eliminar aquest moviment?")) update((current) => ({ ...current, movements: current.movements.filter((movement) => movement.id !== item.id) })); }}>Elimina</button></span></aside></article>;
    })}</div>
    <FloatingActionButton label="Afegir moviment" onClick={() => setSheet(true)} />
    <BottomSheet open={sheet} title="Nou moviment" description="Què vols registrar?" onClose={() => setSheet(false)}><div className={styles.settingsList}>{actions.map(([href, label, icon]) => <Link className={styles.settingsLink} href={href === "rapid" ? "/moviments/rapid" : `/moviments/nou/${href}`} key={href}><span><Icon name={icon} /></span><div><b>{label}</b><small>{href === "rapid" ? "Escriu o dicta una frase" : "Desa'l al dispositiu"}</small></div><Icon name="chevron-right" /></Link>)}</div></BottomSheet>
  </Screen>;
}
