"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Button, Input } from "@/design-system";
import { Screen } from "@/components/screen";
import { currentTimestamp, newId, type MovementKind, type SavingDirection } from "@/lib/app-data";
import { useAppStore } from "@/lib/app-store";
import styles from "../shared.module.css";

const today = () => new Date().toLocaleDateString("en-CA");
export function MovementForm({ title, action, kind, movementId }: { title: string; action: string; kind: MovementKind; movementId?: string }) {
  const { data, update } = useAppStore();
  const router = useRouter();
  const movement = data.movements.find((item) => item.id === movementId);
  const [categoryId, setCategoryId] = useState(movement?.categoryId ?? "");
  const activeAccounts = data.accounts.filter((account) => !account.archived || account.id === movement?.accountId || account.id === movement?.destinationAccountId);
  const categories = data.categories.filter((category) => (!category.archived || category.id === movement?.categoryId) && (!category.kind || category.kind === "both" || category.kind === kind));
  const subs = useMemo(() => data.subcategories.filter((item) => item.categoryId === categoryId && (!item.archived || item.id === movement?.subcategoryId)), [data.subcategories, categoryId, movement?.subcategoryId]);
  const activeGoals = data.goals.filter((goal) => !goal.archived || goal.id === movement?.goalId);
  const transfer = kind === "transfer" || kind === "saving";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    const accountId = String(form.get("accountId") ?? "");
    const destinationAccountId = transfer ? String(form.get("destinationAccountId") ?? "") : undefined;
    if (!(amount > 0) || !accountId || (transfer && (!destinationAccountId || accountId === destinationAccountId))) return;
    const saved = {
      id: movement?.id ?? newId("movement"),
      localId: movement?.localId ?? newId("local"),
      syncStatus: "local" as const,
      kind,
      amount,
      accountId,
      destinationAccountId,
      date: String(form.get("date")),
      categoryId: (kind === "expense" || kind === "income") ? String(form.get("categoryId") || "") || undefined : undefined,
      subcategoryId: kind === "expense" ? String(form.get("subcategoryId") || "") || undefined : undefined,
      merchant: String(form.get("merchant") || "").trim() || undefined,
      notes: String(form.get("notes") || "").trim() || undefined,
      recurring: form.get("recurring") === "on",
      goalId: kind === "saving" ? String(form.get("goalId") || "") : undefined,
      savingDirection: kind === "saving" ? String(form.get("savingDirection")) as SavingDirection : undefined,
      createdAt: movement?.createdAt ?? currentTimestamp(),
      updatedAt: currentTimestamp(),
    };
    update((current) => ({ ...current, movements: movement ? current.movements.map((item) => item.id === movement.id ? saved : item) : [...current.movements, saved] }));
    router.push("/moviments");
  }

  return <Screen title={title} eyebrow={movement ? "Edita el moviment" : "Dades locals"} backHref="/moviments"><form className={styles.form} onSubmit={submit}>
    <Input label="Import" name="amount" type="number" min="0.01" step="0.01" defaultValue={movement?.amount} required />
    <Input label="Data" name="date" type="date" defaultValue={movement?.date ?? today()} required />
    <label className={styles.selectField}>{kind === "income" ? "Compte destí" : transfer ? "Compte d’origen" : "Compte"}<select name="accountId" defaultValue={movement?.accountId} required><option value="">Selecciona...</option>{activeAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}{a.archived ? " · arxivat" : ""}</option>)}</select></label>
    {transfer && <label className={styles.selectField}>Compte de destinació<select name="destinationAccountId" defaultValue={movement?.destinationAccountId} required><option value="">Selecciona...</option>{activeAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}{a.archived ? " · arxivat" : ""}</option>)}</select></label>}
    {kind === "saving" && <><label className={styles.selectField}>Operació<select name="savingDirection" defaultValue={movement?.savingDirection ?? "contribution"}><option value="contribution">Aportació</option><option value="withdrawal">Retirada</option></select></label><label className={styles.selectField}>Objectiu<select name="goalId" defaultValue={movement?.goalId} required><option value="">Selecciona...</option>{activeGoals.map((g) => <option value={g.id} key={g.id}>{g.name}{g.archived ? " · tancat" : ""}</option>)}</select></label></>}
    {(kind === "expense" || kind === "income") && <label className={styles.selectField}>Categoria {kind === "income" && "(opcional)"}<select name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}><option value="">Sense categoria</option>{categories.map((c) => <option value={c.id} key={c.id}>{c.name}{c.archived ? " · arxivada" : ""}</option>)}</select></label>}
    {kind === "expense" && <label className={styles.selectField}>Subcategoria<select name="subcategoryId" defaultValue={movement?.subcategoryId}><option value="">Sense subcategoria</option>{subs.map((s) => <option value={s.id} key={s.id}>{s.name}{s.archived ? " · arxivada" : ""}</option>)}</select></label>}
    {(kind === "expense" || kind === "income") && <Input label={kind === "income" ? "Origen" : "Comerç"} name="merchant" defaultValue={movement?.merchant} placeholder="Opcional" />}
    <Input label="Notes" name="notes" defaultValue={movement?.notes} placeholder="Opcional" />
    {kind === "expense" && <label className={styles.checkbox}><input type="checkbox" name="recurring" defaultChecked={movement?.recurring} /> Moviment recurrent</label>}
    <div className={styles.formActions}><Link href="/moviments"><Button variant="secondary" fullWidth>Cancel·la</Button></Link><Button type="submit" fullWidth>{action}</Button></div>
  </form></Screen>;
}
