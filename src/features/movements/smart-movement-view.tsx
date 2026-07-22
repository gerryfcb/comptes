"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon, Input, MoneyInput } from "@/design-system";
import { Screen } from "@/components/screen";
import { emptyProposal, proposalToMovement, validateProposedMovement, type ProposedMovement } from "@/lib/ai-movement";
import { currentIsoDate, type MovementKind } from "@/lib/app-data";
import { useAppStore } from "@/lib/app-store";
import styles from "../shared.module.css";

const CONSENT_KEY = "comptes-ai-consent-v1";
const typeLabels: Record<MovementKind, string> = { expense: "Despesa", income: "Ingrés", transfer: "Transferència", saving: "Estalvi" };

export function SmartMovementView() {
  const { data, update } = useAppStore();
  const router = useRouter();
  const [text, setText] = useState("");
  const [proposal, setProposal] = useState<ProposedMovement | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [consent, setConsent] = useState(() => typeof window !== "undefined" && localStorage.getItem(CONSENT_KEY) === "yes");
  const activeAccounts = data.accounts.filter((item) => !item.archived);
  const activeCategories = data.categories.filter((item) => !item.archived);
  const activeSubcategories = data.subcategories.filter((item) => !item.archived);

  async function interpret() {
    setMessage("");
    if (!navigator.onLine) return setMessage("La interpretació intel·ligent necessita connexió.");
    if (!consent) return setMessage("Per interpretar el moviment, enviarem aquesta frase al servei d'IA. No s'enviarà l'historial complet de Comptes.");
    if (text.trim().length < 3) return setMessage("Escriu una frase curta sobre el moviment.");
    setLoading(true);
    try {
      const response = await fetch("/api/ai/parse-movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          today: currentIsoDate(),
          accounts: activeAccounts.map(({ id, name }) => ({ id, name })),
          categories: activeCategories.map(({ id, name, kind }) => ({ id, name, kind })),
          subcategories: activeSubcategories.map(({ id, name, categoryId }) => ({ id, name, categoryId })),
        }),
      });
      if (response.status === 503) return setMessage("La funció intel·ligent encara no està configurada. Pots continuar amb el formulari manual.");
      if (!response.ok) return setMessage("No s'ha pogut interpretar la frase. Pots continuar amb el formulari normal.");
      const result = await response.json() as { proposal?: ProposedMovement };
      setProposal(result.proposal ?? emptyProposal());
    } catch {
      setMessage("No s'ha pogut contactar amb la interpretació intel·ligent. Pots continuar amb el formulari manual.");
    } finally {
      setLoading(false);
    }
  }

  function confirmConsent() {
    localStorage.setItem(CONSENT_KEY, "yes");
    setConsent(true);
    setMessage("");
  }

  function save() {
    if (!proposal || saving) return;
    const checked = validateProposedMovement(data, proposal);
    if (!checked.valid) return setMessage(`Falten dades per confirmar: ${checked.missingFields.join(", ")}.`);
    setSaving(true);
    update((current) => ({ ...current, movements: [...current.movements, proposalToMovement(proposal)] }));
    router.push("/moviments");
  }

  return (
    <Screen title="Explica el moviment" eyebrow="Moviment ràpid" backHref="/moviments/nou">
      <article className={styles.statCard}>
        <p>Escriu o dicta una frase curta. Les frases només s&apos;envien al servei d&apos;IA quan prems Interpretar.</p>
        <label className={styles.textAreaField}>Frase<textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} placeholder="Ex.: He gastat 18,40 EUR al supermercat amb el compte compartit." /></label>
        {!consent && <div className={styles.noticeInline}><b>Privacitat</b><p>Per interpretar el moviment, enviarem aquesta frase al servei d&apos;IA. No s&apos;enviarà l&apos;historial complet de Comptes.</p><div className={styles.inlineActions}><Button type="button" onClick={confirmConsent}>Continuar</Button><Button type="button" variant="secondary" onClick={() => setMessage("Pots continuar amb el formulari manual normal.")}>Ara no</Button></div></div>}
        <div className={styles.formActions}><Button type="button" variant="secondary" leadingIcon={<Icon name="phone" />} onClick={() => setMessage("Pots fer servir el dictat del teclat de l'iPhone dins del camp de text.")}>Micròfon</Button><Button type="button" onClick={() => void interpret()} disabled={loading}>{loading ? "Interpretant..." : "Interpretar"}</Button></div>
        {message && <p className={styles.errorText} role="status">{message}</p>}
      </article>

      {proposal && <article className={styles.statCard}>
        <h2>Esborrany detectat</h2>
        <div className={styles.form}>
          <label className={styles.selectField}>Tipus<select value={proposal.type ?? ""} onChange={(event) => setProposal({ ...proposal, type: event.target.value as MovementKind || null })}><option value="">No ho he pogut determinar</option>{Object.entries(typeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <MoneyInput label="Import" value={proposal.amount ?? ""} onValueChange={(value) => setProposal({ ...proposal, amount: value })} />
          <Input label="Data" type="date" value={proposal.date ?? ""} onChange={(event) => setProposal({ ...proposal, date: event.target.value || null })} />
          <label className={styles.selectField}>Compte<select value={proposal.accountId ?? ""} onChange={(event) => setProposal({ ...proposal, accountId: event.target.value || null })}><option value="">Selecciona...</option>{activeAccounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}</select></label>
          {(proposal.type === "transfer" || proposal.type === "saving") && <label className={styles.selectField}>Compte destí<select value={proposal.destinationAccountId ?? ""} onChange={(event) => setProposal({ ...proposal, destinationAccountId: event.target.value || null })}><option value="">Selecciona...</option>{activeAccounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}</select></label>}
          {(proposal.type === "expense" || proposal.type === "income") && <label className={styles.selectField}>Categoria<select value={proposal.categoryId ?? ""} onChange={(event) => setProposal({ ...proposal, categoryId: event.target.value || null, subcategoryId: null })}><option value="">Sense categoria</option>{activeCategories.filter((category) => !category.kind || category.kind === "both" || category.kind === proposal.type).map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>}
          {(proposal.type === "expense" || proposal.type === "income") && <label className={styles.selectField}>Subcategoria<select value={proposal.subcategoryId ?? ""} onChange={(event) => setProposal({ ...proposal, subcategoryId: event.target.value || null })}><option value="">Sense subcategoria</option>{activeSubcategories.filter((item) => item.categoryId === proposal.categoryId).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>}
          <Input label={proposal.type === "income" ? "Origen" : "Comerç"} value={proposal.merchant ?? ""} onChange={(event) => setProposal({ ...proposal, merchant: event.target.value || null })} />
          <Input label="Notes" value={proposal.notes ?? ""} onChange={(event) => setProposal({ ...proposal, notes: event.target.value || null })} />
          {proposal.explanation && <p>{proposal.explanation}</p>}
          <div className={styles.formActions}><Button type="button" variant="secondary" onClick={() => router.push(`/moviments/nou/${proposal.type === "income" ? "ingres" : proposal.type === "transfer" ? "transferencia" : proposal.type === "saving" ? "estalvi" : "despesa"}`)}>Editar detalls</Button><Button type="button" disabled={saving} onClick={save}>{saving ? "Guardant..." : "Confirmar i guardar"}</Button></div>
        </div>
      </article>}
    </Screen>
  );
}
