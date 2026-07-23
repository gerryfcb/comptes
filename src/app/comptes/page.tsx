"use client";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Icon, IconButton } from "@/design-system";
import { Screen } from "@/components/screen";
import { accountBalance, formatMoney, type Account } from "@/lib/app-data";
import { useAppStore } from "@/lib/app-store";
import styles from "@/features/shared.module.css";

function AccountCard({ account }: { account: Account }) {
  const { data } = useAppStore();
  return <article className={`${styles.accountCard} ${styles[account.color]}`} key={account.id}>
    <header><span className={styles.iconBox}><Icon name={account.icon} /></span><Link href={`/comptes/editar?id=${account.id}`} onClick={(event) => { if (!navigator.onLine) { event.preventDefault(); window.location.assign(event.currentTarget.href); } }}><IconButton label={`Editar ${account.name}`}><Icon name="more" /></IconButton></Link></header>
    <h2>{account.name}</h2><strong>{formatMoney(accountBalance(account, data.movements))}</strong>
    <p>{account.ownerIds.map((id) => data.people.find((person) => person.id === id)?.name).filter(Boolean).join(" i ") || "Sense propietari"} · {account.attributablePercentage}% atribuïble</p>
    {account.archived && <p><Badge tone="neutral">Arxivat</Badge></p>}
    <div className={styles.progress} aria-label={`${account.attributablePercentage}%`}><i style={{ width: `${account.attributablePercentage}%` }} /></div>
  </article>;
}

export default function AccountsPage() {
  const { data } = useAppStore();
  const [tab, setTab] = useState<"active" | "archived">("active");
  const active = data.accounts.filter((account) => !account.archived);
  const archived = data.accounts.filter((account) => account.archived);
  const accounts = tab === "active" ? active : archived;
  return <Screen title="Comptes" eyebrow="Patrimoni organitzat" action={<Link href="/comptes/nou" onClick={(event) => { if (!navigator.onLine) { event.preventDefault(); window.location.assign(event.currentTarget.href); } }}><Button leadingIcon={<Icon name="add" />}>Crear compte</Button></Link>}>
    <div className={styles.chips}>
      <button className={`${styles.chip} ${tab === "active" ? styles.chipActive : ""}`} onClick={() => setTab("active")}>Actius ({active.length})</button>
      <button className={`${styles.chip} ${tab === "archived" ? styles.chipActive : ""}`} onClick={() => setTab("archived")}>Arxivats ({archived.length})</button>
    </div>
    {!accounts.length && <article className={styles.empty}>{tab === "active" ? "Encara no hi ha comptes actius. Crea’n un per començar." : "No hi ha comptes arxivats."}</article>}
    <div className={styles.accountCards}>{accounts.map((account) => <AccountCard account={account} key={account.id} />)}</div>
  </Screen>;
}
