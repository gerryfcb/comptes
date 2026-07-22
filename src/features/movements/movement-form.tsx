"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet, Button, ColorPicker, Icon, Input, MoneyInput, parseMoneyInput } from "@/design-system";
import { Screen } from "@/components/screen";
import { currentTimestamp, newId, type MovementKind, type SavingDirection } from "@/lib/app-data";
import { CATEGORY_LIBRARY, activateLibraryCategories } from "@/lib/category-library";
import { useAppStore } from "@/lib/app-store";
import styles from "../shared.module.css";

const today = () => new Date().toLocaleDateString("en-CA");

export function MovementForm({ title, action, kind, movementId }: { title: string; action: string; kind: MovementKind; movementId?: string }) {
  const { data, update } = useAppStore();
  const router = useRouter();
  const movement = data.movements.find((item) => item.id === movementId);
  const [categoryId, setCategoryId] = useState(movement?.categoryId ?? "");
  const [subcategoryId, setSubcategoryId] = useState(movement?.subcategoryId ?? "");
  const [categorySheet, setCategorySheet] = useState(false);
  const [subcategorySheet, setSubcategorySheet] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [customColor, setCustomColor] = useState(kind === "income" ? "green" : "blue");
  const [subcategoryName, setSubcategoryName] = useState("");
  const activeAccounts = data.accounts.filter((account) => !account.archived || account.id === movement?.accountId || account.id === movement?.destinationAccountId);
  const categories = data.categories.filter((category) => (!category.archived || category.id === movement?.categoryId) && (!category.kind || category.kind === "both" || category.kind === kind));
  const subs = useMemo(() => data.subcategories.filter((item) => item.categoryId === categoryId && (!item.archived || item.id === movement?.subcategoryId)), [data.subcategories, categoryId, movement?.subcategoryId]);
  const activeGoals = data.goals.filter((goal) => !goal.archived || goal.id === movement?.goalId);
  const transfer = kind === "transfer" || kind === "saving";
  const category = categories.find((item) => item.id === categoryId);
  const subcategory = subs.find((item) => item.id === subcategoryId);
  const needsCategory = kind === "expense" || kind === "income";

  function activateCategory(libraryId: string) {
    const item = CATEGORY_LIBRARY.find((entry) => entry.id === libraryId);
    if (!item) return;
    const existing = data.categories.find((entry) => entry.name.toLocaleLowerCase("ca") === item.name.toLocaleLowerCase("ca"));
    update((current) => activateLibraryCategories(current, [libraryId]));
    setCategoryId(existing?.id ?? `library-${libraryId}`);
    setSubcategoryId("");
    setCategorySheet(false);
  }

  function createCustomCategory() {
    const name = customCategory.trim();
    if (!name) return;
    const existing = data.categories.find((entry) => entry.name.toLocaleLowerCase("ca") === name.toLocaleLowerCase("ca"));
    if (existing) {
      setCategoryId(existing.id);
      setSubcategoryId("");
      setCategorySheet(false);
      return;
    }
    const id = newId("cat");
    update((current) => ({ ...current, categories: [...current.categories, { id, name, kind: kind === "income" ? "income" : "expense", icon: kind === "income" ? "coins" : "tag", color: customColor, order: current.categories.length + 1, archived: false }] }));
    setCategoryId(id);
    setSubcategoryId("");
    setCategorySheet(false);
    setCustomCategory("");
  }

  function createSubcategory() {
    const name = subcategoryName.trim();
    if (!name || !categoryId) return;
    const id = newId("sub");
    update((current) => ({ ...current, subcategories: [...current.subcategories, { id, categoryId, name, order: current.subcategories.filter((item) => item.categoryId === categoryId).length + 1, archived: false }] }));
    setSubcategoryId(id);
    setSubcategoryName("");
    setSubcategorySheet(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = parseMoneyInput(form.get("amount"));
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
      categoryId: needsCategory ? categoryId || undefined : undefined,
      subcategoryId: needsCategory ? subcategoryId || undefined : undefined,
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

  return (
    <Screen title={title} eyebrow={movement ? "Edita el moviment" : "Dades locals"} backHref="/moviments">
      <form className={styles.form} onSubmit={submit}>
        {!activeAccounts.length && <article className={styles.noticeInline}><b>Necessites un compte</b><p>Crea el primer compte abans de registrar aquest moviment.</p><Link href="/comptes/nou"><Button>Crear compte</Button></Link></article>}
        <MoneyInput label="Import" name="amount" defaultValue={movement?.amount ?? ""} required />
        <Input label="Data" name="date" type="date" defaultValue={movement?.date ?? today()} required />
        <label className={styles.selectField}>{kind === "income" ? "Compte destí" : transfer ? "Compte d'origen" : "Compte"}<select name="accountId" defaultValue={movement?.accountId} required><option value="">Selecciona...</option>{activeAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}{a.archived ? " - arxivat" : ""}</option>)}</select></label>
        {transfer && <label className={styles.selectField}>Compte de destinació<select name="destinationAccountId" defaultValue={movement?.destinationAccountId} required><option value="">Selecciona...</option>{activeAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}{a.archived ? " - arxivat" : ""}</option>)}</select></label>}
        {kind === "saving" && <><label className={styles.selectField}>Operació<select name="savingDirection" defaultValue={movement?.savingDirection ?? "contribution"}><option value="contribution">Aportació</option><option value="withdrawal">Retirada</option></select></label><label className={styles.selectField}>Objectiu<select name="goalId" defaultValue={movement?.goalId} required><option value="">Selecciona...</option>{activeGoals.map((g) => <option value={g.id} key={g.id}>{g.name}{g.archived ? " - tancat" : ""}</option>)}</select></label></>}
        {needsCategory && <><input name="categoryId" type="hidden" value={categoryId} /><button className={styles.fieldButton} type="button" onClick={() => setCategorySheet(true)}><span><small>Categoria</small><b>{category?.name ?? "Sense categoria"}</b></span><Icon name="chevron-right" /></button></>}
        {needsCategory && <><input name="subcategoryId" type="hidden" value={subcategoryId} /><button className={styles.fieldButton} type="button" onClick={() => categoryId ? setSubcategorySheet(true) : setCategorySheet(true)}><span><small>{kind === "income" ? "Tipus d'ingrés" : "Subcategoria"}</small><b>{subcategory?.name ?? "Sense subcategoria"}</b></span><Icon name="chevron-right" /></button></>}
        {needsCategory && <Input label={kind === "income" ? "Origen" : "Comerç"} name="merchant" defaultValue={movement?.merchant} placeholder="Opcional" />}
        <Input label="Notes" name="notes" defaultValue={movement?.notes} placeholder="Opcional" />
        {kind === "expense" && <label className={styles.checkbox}><input type="checkbox" name="recurring" defaultChecked={movement?.recurring} /> Moviment recurrent</label>}
        <div className={styles.formActions}><Link href="/moviments"><Button variant="secondary" fullWidth>Cancel·la</Button></Link><Button type="submit" fullWidth>{action}</Button></div>
      </form>

      <BottomSheet open={categorySheet} title="Categoria" description="Selecciona una categoria, crea'n una o activa'n una de la biblioteca." onClose={() => setCategorySheet(false)}>
        <div className={styles.selectorList}>
          <button className={!categoryId ? styles.choiceActive : ""} type="button" onClick={() => { setCategoryId(""); setSubcategoryId(""); setCategorySheet(false); }}>Sense categoria</button>
          {categories.map((item) => <button className={categoryId === item.id ? styles.choiceActive : ""} type="button" key={item.id} onClick={() => { setCategoryId(item.id); setSubcategoryId(""); setCategorySheet(false); }}><Icon name={item.icon} /><span>{item.name}</span></button>)}
        </div>
        <div className={styles.sheetSection}><h3>Explorar biblioteca</h3><div className={styles.libraryGrid}>{CATEGORY_LIBRARY.filter((item) => item.kind === (kind === "income" ? "income" : "expense")).map((item) => <button key={item.id} type="button" onClick={() => activateCategory(item.id)}><Icon name={item.icon} /><span>{item.name}<small>{item.subcategories.length} subcategories</small></span></button>)}</div></div>
        <div className={styles.sheetSection}><h3>Crear categoria</h3><div className={styles.form}><Input label="Nom" value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} /><ColorPicker label="Color" value={customColor} onChange={setCustomColor} /><Button type="button" onClick={createCustomCategory}>Crear i seleccionar</Button></div></div>
      </BottomSheet>

      <BottomSheet open={subcategorySheet} title={kind === "income" ? "Tipus d'ingrés" : "Subcategoria"} description="Selecciona una opció o crea'n una de nova." onClose={() => setSubcategorySheet(false)}>
        <div className={styles.selectorList}>
          <button className={!subcategoryId ? styles.choiceActive : ""} type="button" onClick={() => { setSubcategoryId(""); setSubcategorySheet(false); }}>Sense subcategoria</button>
          {subs.map((item) => <button className={subcategoryId === item.id ? styles.choiceActive : ""} type="button" key={item.id} onClick={() => { setSubcategoryId(item.id); setSubcategorySheet(false); }}>{item.name}</button>)}
        </div>
        {categoryId && <div className={styles.sheetSection}><h3>Crear subcategoria</h3><div className={styles.form}><Input label="Nom" value={subcategoryName} onChange={(event) => setSubcategoryName(event.target.value)} /><Button type="button" onClick={createSubcategory}>Crear i seleccionar</Button></div></div>}
      </BottomSheet>
    </Screen>
  );
}
