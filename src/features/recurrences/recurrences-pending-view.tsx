"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input } from "@/design-system";
import { Screen } from "@/components/screen";
import { currentIsoDate, formatMoney, pendingRecurrences, recurrenceToMovement, type RecurrenceMovementType } from "@/lib/app-data";
import { useAppStore } from "@/lib/app-store";
import styles from "../shared.module.css";

const typeLabel: Record<RecurrenceMovementType, string> = {
  expense: "Despesa",
  income: "Ingrés",
  transfer: "Transferència",
  goalContribution: "Aportació a objectiu",
  goalWithdrawal: "Retirada d’objectiu",
};

export function RecurrencesPendingView() {
  const router = useRouter();
  const { data, update } = useAppStore();
  const pending = pendingRecurrences(data);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const isSelected = (id: string) => selected[id] ?? true;
  const selectedCount = pending.filter((recurrence) => isSelected(recurrence.id)).length;
  const accountName = (id?: string) => id ? data.accounts.find((account) => account.id === id)?.name : undefined;
  const categoryName = (id?: string) => id ? data.categories.find((category) => category.id === id)?.name : undefined;
  const amountValue = (id: string, fallback: number) => amounts[id] ?? String(fallback);

  const confirm = () => {
    setError("");
    setFieldErrors({});
    const chosen = pending.filter((recurrence) => isSelected(recurrence.id));
    if (!chosen.length) {
      setError("Selecciona almenys un moviment recurrent.");
      return;
    }
    const nextFieldErrors: Record<string, string> = {};
    const validAmounts = new Map<string, number>();
    chosen.forEach((recurrence) => {
      const amount = Number(amountValue(recurrence.id, recurrence.amount));
      if (!Number.isFinite(amount) || amount <= 0) nextFieldErrors[recurrence.id] = "Introdueix un import superior a 0.";
      else validAmounts.set(recurrence.id, amount);
    });
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("Revisa els imports marcats abans de confirmar.");
      return;
    }
    setSubmitting(true);
    let generatedCount = 0;
    update((current) => {
      const currentPending = pendingRecurrences(current).filter((recurrence) => chosen.some((item) => item.id === recurrence.id));
      const generated = currentPending.map((recurrence) => recurrenceToMovement(recurrence, validAmounts.get(recurrence.id) ?? recurrence.amount));
      generatedCount = generated.length;
      const now = currentIsoDate();
      return {
        ...current,
        movements: [...current.movements, ...generated],
        recurrences: current.recurrences.map((recurrence) => currentPending.some((item) => item.id === recurrence.id) ? { ...recurrence, lastGeneratedAt: now, updatedAt: now } : recurrence),
      };
    });
    if (generatedCount === 0) {
      setSubmitting(false);
      setError("Aquestes recurrències ja no estan pendents aquest mes.");
      return;
    }
    window.setTimeout(() => router.replace("/?recurrencies=generated"), 0);
  };

  return <Screen title="Moviments recurrents pendents" eyebrow="Revisió mensual" backHref="/">
    {pending.length === 0 ? <article className={styles.statCard}><p>No tens moviments recurrents pendents aquest mes.</p><Link href="/"><Button>Torna a Inici</Button></Link></article> : <>
      <article className={styles.statCard}><p>Revisa els imports d’aquest mes. Pots desmarcar qualsevol moviment abans de confirmar.</p><strong>{selectedCount} seleccionats</strong>{error && <p className={styles.errorText} role="alert">{error}</p>}</article>
      <div className={styles.recurrenceList}>{pending.map((recurrence) => {
        const source = accountName(recurrence.sourceAccountId);
        const destination = accountName(recurrence.destinationAccountId);
        const category = categoryName(recurrence.categoryId);
        return <article className={styles.recurrenceCard} key={recurrence.id}>
          <label className={styles.recurrenceTop}>
            <input type="checkbox" checked={isSelected(recurrence.id)} onChange={(event) => setSelected((current) => ({ ...current, [recurrence.id]: event.target.checked }))} />
            <span><b>{recurrence.name}</b><small>{typeLabel[recurrence.movementType]} · dia {recurrence.dayOfMonth}</small></span>
          </label>
          <Input label="Import puntual" type="number" min="0.01" step="0.01" value={amountValue(recurrence.id, recurrence.amount)} onChange={(event) => setAmounts((current) => ({ ...current, [recurrence.id]: event.target.value }))} aria-invalid={Boolean(fieldErrors[recurrence.id])} />
          {fieldErrors[recurrence.id] && <p className={styles.fieldError} role="alert">{fieldErrors[recurrence.id]}</p>}
          <dl className={styles.recurrenceMeta}>
            {source && <><dt>Origen</dt><dd>{source}</dd></>}
            {destination && <><dt>Destí</dt><dd>{destination}</dd></>}
            {category && <><dt>Categoria</dt><dd>{category}</dd></>}
            <dt>Import base</dt><dd>{formatMoney(recurrence.amount)}</dd>
          </dl>
        </article>;
      })}</div>
      <div className={styles.stickyActions}><Link href="/"><Button variant="secondary" fullWidth>Cancel·la</Button></Link><Button fullWidth onClick={confirm} disabled={submitting}>{submitting ? "Generant..." : "Confirmar recurrències"}</Button></div>
    </>}
  </Screen>;
}
