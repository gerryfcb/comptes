"use client";
import { Screen } from "@/components/screen";
import { formatMoney } from "@/lib/app-data";
import { useAppStore } from "@/lib/app-store";
import styles from "@/features/shared.module.css";
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export default function StatisticsPage() {
  const { data } = useAppStore(); const now = new Date(); const current = monthKey(now); const previousDate = new Date(now.getFullYear(), now.getMonth() - 1); const previous = monthKey(previousDate);
  const totals = (key: string) => { const list = data.movements.filter((m) => m.date.startsWith(key)); const income = list.filter((m) => m.kind === "income").reduce((s,m) => s + m.amount,0); const expense = list.filter((m) => m.kind === "expense").reduce((s,m) => s + m.amount,0); const saving = list.filter((m) => m.kind === "saving").reduce((s,m) => s + (m.savingDirection === "withdrawal" ? -m.amount : m.amount),0); return { income, expense, saving }; };
  const currentTotals = totals(current); const previousTotals = totals(previous); const comparison = previousTotals.expense ? ((currentTotals.expense - previousTotals.expense) / previousTotals.expense) * 100 : 0;
  const expenses = data.movements.filter((m) => m.kind === "expense" && m.date.startsWith(current));
  const byCategory = data.categories.map((c) => ({ name: c.name, value: expenses.filter((m) => m.categoryId === c.id).reduce((s,m) => s + m.amount,0) })).filter((x) => x.value).sort((a,b) => b.value-a.value);
  const byAccount = data.accounts.map((a) => ({ name: a.name, value: expenses.filter((m) => m.accountId === a.id).reduce((s,m) => s + m.amount,0) })).filter((x) => x.value).sort((a,b) => b.value-a.value);
  const daily = currentTotals.expense / Math.max(1, now.getDate());
  return <Screen title="Estadístiques" eyebrow={new Intl.DateTimeFormat("ca-ES",{month:"long",year:"numeric"}).format(now)}><div className={styles.statsGrid}>
    <article className={styles.statCard}><p>Ingressos mensuals</p><strong>{formatMoney(currentTotals.income)}</strong></article><article className={styles.statCard}><p>Despeses mensuals</p><strong>{formatMoney(currentTotals.expense)}</strong></article><article className={styles.statCard}><p>Estalvi mensual</p><strong>{formatMoney(currentTotals.saving)}</strong></article><article className={styles.statCard}><p>Mitjana diària de despesa</p><strong>{formatMoney(daily)}</strong></article>
    <article className={styles.statCard}><p>Distribució per categories</p><ul className={styles.ranking}>{byCategory.map((x) => <li key={x.name}><span>{x.name}</span><b>{formatMoney(x.value)}</b></li>)}{!byCategory.length && <li>Sense despeses aquest mes</li>}</ul></article>
    <article className={styles.statCard}><p>Distribució per comptes</p><ul className={styles.ranking}>{byAccount.map((x) => <li key={x.name}><span>{x.name}</span><b>{formatMoney(x.value)}</b></li>)}{!byAccount.length && <li>Sense despeses aquest mes</li>}</ul></article>
    <article className={styles.statCard}><p>Comparació amb el mes anterior</p><strong>{comparison > 0 ? "+" : ""}{comparison.toFixed(1)}%</strong><p>{comparison <= 0 ? "Has reduït" : "Has augmentat"} la despesa respecte al mes anterior.</p></article>
  </div></Screen>;
}
