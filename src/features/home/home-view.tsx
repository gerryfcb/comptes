"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FloatingActionButton, Icon, IconButton } from "@/design-system";
import { Screen } from "@/components/screen";
import { accountBalance, compareMovementsDesc, formatMoney, movementIcon, pendingRecurrences } from "@/lib/app-data";
import { LAST_BACKUP_KEY, useAppStore } from "@/lib/app-store";
import styles from "../shared.module.css";

const sameMonth = (value: string, date = new Date()) => { const d = new Date(`${value}T12:00:00`); return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear(); };
function Amount({ value, hidden }: { value: number; hidden: boolean }) { return <>{hidden ? "••••••" : formatMoney(value)}</>; }

export function HomeView({ date, recurrencesGenerated = false }: { date: string; recurrencesGenerated?: boolean }) {
  const router = useRouter();
  const [showGeneratedMessage, setShowGeneratedMessage] = useState(recurrencesGenerated);
  const [backupReminder, setBackupReminder] = useState(false);
  const { data, update } = useAppStore(); const hidden = data.preferences.amountsHidden;
  const pending = pendingRecurrences(data);
  const active = data.accounts.filter((a) => !a.archived); const balances = new Map(active.map((a) => [a.id, accountBalance(a, data.movements)]));
  const wealth = active.reduce((sum, a) => sum + (balances.get(a.id) ?? 0) * a.attributablePercentage / 100, 0);
  const month = data.movements.filter((m) => sameMonth(m.date)); const income = month.filter((m) => m.kind === "income").reduce((s, m) => s + m.amount, 0); const expenses = month.filter((m) => m.kind === "expense").reduce((s, m) => s + m.amount, 0); const savings = month.filter((m) => m.kind === "saving" && m.savingDirection === "contribution").reduce((s, m) => s + m.amount, 0) - month.filter((m) => m.kind === "saving" && m.savingDirection === "withdrawal").reduce((s, m) => s + m.amount, 0);
  const recent = [...data.movements].sort(compareMovementsDesc).slice(0, 5);
  useEffect(() => {
    if (!recurrencesGenerated) return;
    router.replace("/");
    const timeout = window.setTimeout(() => setShowGeneratedMessage(false), 4500);
    return () => window.clearTimeout(timeout);
  }, [recurrencesGenerated, router]);
  useEffect(() => {
    const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
    const postponed = localStorage.getItem("comptes-backup-reminder-after");
    const dueByDate = !lastBackup || Date.now() - new Date(lastBackup).getTime() > 30 * 24 * 60 * 60 * 1000;
    const canShow = !postponed || Date.now() > new Date(postponed).getTime();
    setBackupReminder(data.movements.length >= 20 && dueByDate && canShow);
  }, [data.movements.length]);
  return <Screen eyebrow={date} title={`Bon dia, ${data.people[0]?.name ?? "!"}`} action={<Link href="/configuracio"><IconButton label="Configuració" variant="secondary"><Icon name="settings" /></IconButton></Link>}>
    {showGeneratedMessage && <article className={styles.successCard}><h2>Moviments recurrents generats</h2><p>Els saldos, moviments i estadístiques ja estan actualitzats.</p></article>}
    {backupReminder && <article className={styles.noticeCard}><div><h2>Convé fer una còpia de seguretat</h2><p>Les dades només són en aquest dispositiu.</p></div><Link className={styles.reviewButton} href="/configuracio/copies-de-seguretat">Fer còpia</Link><button type="button" onClick={() => { const later = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); localStorage.setItem("comptes-backup-reminder-after", later); setBackupReminder(false); }}>Recorda-m’ho més endavant</button></article>}
    {pending.length > 0 && <article className={styles.noticeCard}><div><h2>Tens moviments recurrents pendents</h2><p>{pending.length} moviments preparats per revisar i generar aquest mes.</p></div><Link className={styles.reviewButton} href="/recurrencies-pendents">Revisar</Link></article>}
    <section className={styles.hero}><div className={styles.heroTop}><span>Patrimoni atribuïble</span><IconButton label={hidden ? "Mostrar imports" : "Ocultar imports"} className={styles.glassButton} onClick={() => update((s) => ({ ...s, preferences: { ...s.preferences, amountsHidden: !hidden } }))}><Icon name={hidden ? "eye-off" : "eye"} /></IconButton></div><strong className={styles.heroAmount}><Amount value={wealth} hidden={hidden} /></strong><p>Calculat segons el percentatge de cada compte</p></section>
    <section className={styles.section}><h2>Resum dels comptes</h2><div className={styles.accountGrid}>{active.map((a) => <article className={`${styles.miniCard} ${styles[a.color]}`} key={a.id}><span className={styles.iconBox}><Icon name={a.icon} /></span><p>{a.name}</p><strong><Amount value={balances.get(a.id) ?? 0} hidden={hidden} /></strong></article>)}</div></section>
    <section className={styles.section}><div className={styles.sectionTitle}><div><h2>Activitat del mes</h2><p>{new Intl.DateTimeFormat("ca-ES", { month: "long" }).format(new Date())}</p></div></div><article className={styles.chartCard}><div className={styles.donut}><div><small>Estalvi</small><strong>{hidden ? "••" : formatMoney(savings)}</strong></div></div><ul className={styles.legend}><li><i className={styles.dotBlue}/><span>Ingressos</span><b><Amount value={income} hidden={hidden}/></b></li><li><i className={styles.dotCoral}/><span>Despeses</span><b><Amount value={expenses} hidden={hidden}/></b></li><li><i className={styles.dotGreen}/><span>Estalvi</span><b><Amount value={savings} hidden={hidden}/></b></li></ul></article></section>
    <section className={styles.section}><div className={styles.sectionTitle}><h2>Últims moviments</h2><Link href="/moviments">Veure tots</Link></div><div className={styles.listCard}>{recent.map((m) => <article className={styles.movement} key={m.id}><span className={styles.movementIcon}><Icon name={movementIcon(m.kind)}/></span><div><b>{m.merchant || data.categories.find((c) => c.id === m.categoryId)?.name || (m.kind === "saving" ? "Estalvi" : "Transferència")}</b><small>{data.accounts.find((a) => a.id === m.accountId)?.name}</small></div><aside><b className={m.kind === "income" ? styles.positive : ""}>{hidden ? "••••" : formatMoney((m.kind === "expense" ? -1 : 1) * m.amount)}</b><small>{m.date}</small></aside></article>)}</div></section>
    <Link href="/moviments/nou"><FloatingActionButton label="Afegir moviment" /></Link>
  </Screen>;
}
