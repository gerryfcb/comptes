"use client";
import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Badge, Button, Icon, Input, List, ListItem, MoneyInput, parseMoneyInput, useTheme, type IconName, type ThemePreference } from "@/design-system";
import { Screen } from "@/components/screen";
import { currentIsoDate, formatMoney, newId, type Category, type Goal, type Person, type Recurrence, type RecurrenceMovementType, type Subcategory } from "@/lib/app-data";
import { backupFilename, createBackup, readBackup } from "@/lib/backup";
import { CATEGORY_LIBRARY, activateLibraryCategories, isLibraryCategoryActive } from "@/lib/category-library";
import { COLOR_PALETTE } from "@/lib/color-palette";
import { LAST_BACKUP_KEY, useAppStore } from "@/lib/app-store";
import styles from "../shared.module.css";

const themeOptions: Array<{ value: ThemePreference; label: string }> = [
  { value: "light", label: "Mode clar" }, { value: "dark", label: "Mode fosc" }, { value: "system", label: "Mode automàtic" },
];
const recurrenceTypes: Array<{ value: RecurrenceMovementType; label: string }> = [
  { value: "expense", label: "Despesa" }, { value: "income", label: "Ingrés" }, { value: "transfer", label: "Transferència" },
  { value: "goalContribution", label: "Aportació a objectiu" }, { value: "goalWithdrawal", label: "Retirada d’objectiu" },
];
const colors = COLOR_PALETTE;
const icons: Array<[IconName, string]> = [["wallet", "Cartera"], ["shopping", "Compres"], ["transport", "Transport"], ["income", "Ingrés"], ["saving", "Estalvi"], ["goal", "Objectiu"], ["filter", "Filtre"]];
function RecurrenceForm({ recurrence, onCancel }: { recurrence?: Recurrence; onCancel: () => void }) {
  const { data, update } = useAppStore();
  const [movementType, setMovementType] = useState<RecurrenceMovementType>(recurrence?.movementType ?? "expense");
  const [categoryId, setCategoryId] = useState(recurrence?.categoryId ?? "");
  const accounts = data.accounts.filter((account) => !account.archived || account.id === recurrence?.sourceAccountId || account.id === recurrence?.destinationAccountId);
  const categories = data.categories.filter((category) => !category.archived || category.id === recurrence?.categoryId);
  const subs = data.subcategories.filter((item) => item.categoryId === categoryId && (!item.archived || item.id === recurrence?.subcategoryId));
  const activeGoals = data.goals.filter((goal) => !goal.archived || goal.id === recurrence?.linkedGoalId);
  const needsSource = movementType !== "income";
  const needsDestination = movementType !== "expense";
  const isGoal = movementType === "goalContribution" || movementType === "goalWithdrawal";
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const now = currentIsoDate();
    const saved: Recurrence = {
      id: recurrence?.id ?? newId("rec"),
      name: String(form.get("name") || "").trim(),
      movementType,
      amount: parseMoneyInput(form.get("amount")),
      sourceAccountId: needsSource ? String(form.get("sourceAccountId") || "") : undefined,
      destinationAccountId: needsDestination ? String(form.get("destinationAccountId") || "") : undefined,
      categoryId: movementType === "expense" || movementType === "income" ? String(form.get("categoryId") || "") || undefined : undefined,
      subcategoryId: movementType === "expense" ? String(form.get("subcategoryId") || "") || undefined : undefined,
      linkedGoalId: isGoal ? String(form.get("linkedGoalId") || "") || undefined : undefined,
      dayOfMonth: Math.min(31, Math.max(1, Number(form.get("dayOfMonth")) || 1)),
      frequency: "monthly",
      startDate: String(form.get("startDate") || now),
      endDate: String(form.get("endDate") || "") || undefined,
      isActive: form.get("isActive") === "on",
      lastGeneratedAt: recurrence?.lastGeneratedAt,
      createdAt: recurrence?.createdAt ?? now,
      updatedAt: now,
    };
    if (!saved.name || !(saved.amount > 0) || (needsSource && !saved.sourceAccountId) || (needsDestination && !saved.destinationAccountId)) return;
    update((current) => ({ ...current, recurrences: recurrence ? current.recurrences.map((item) => item.id === recurrence.id ? saved : item) : [...current.recurrences, saved] }));
    onCancel();
  }
  return <article className={styles.statCard}><form className={styles.form} onSubmit={submit}>
    <Input label="Nom" name="name" defaultValue={recurrence?.name} required />
    <MoneyInput label="Import" name="amount" defaultValue={recurrence?.amount} required />
    <label className={styles.selectField}>Tipus<select value={movementType} onChange={(event) => setMovementType(event.target.value as RecurrenceMovementType)}>{recurrenceTypes.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}</select></label>
    {needsSource && <label className={styles.selectField}>Compte origen<select name="sourceAccountId" defaultValue={recurrence?.sourceAccountId} required><option value="">Selecciona...</option>{accounts.map((account) => <option value={account.id} key={account.id}>{account.name}{account.archived ? " · arxivat" : ""}</option>)}</select></label>}
    {needsDestination && <label className={styles.selectField}>Compte destí<select name="destinationAccountId" defaultValue={recurrence?.destinationAccountId} required><option value="">Selecciona...</option>{accounts.map((account) => <option value={account.id} key={account.id}>{account.name}{account.archived ? " · arxivat" : ""}</option>)}</select></label>}
    {(movementType === "expense" || movementType === "income") && <label className={styles.selectField}>Categoria<select name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Sense categoria</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>}
    {movementType === "expense" && <label className={styles.selectField}>Subcategoria<select name="subcategoryId" defaultValue={recurrence?.subcategoryId}><option value="">Sense subcategoria</option>{subs.map((subcategory) => <option value={subcategory.id} key={subcategory.id}>{subcategory.name}</option>)}</select></label>}
    {isGoal && <label className={styles.selectField}>Objectiu<select name="linkedGoalId" defaultValue={recurrence?.linkedGoalId}><option value="">Sense objectiu</option>{activeGoals.map((goal) => <option value={goal.id} key={goal.id}>{goal.name}{goal.archived ? " · arxivat" : ""}</option>)}</select></label>}
    <Input label="Dia del mes" name="dayOfMonth" type="number" min="1" max="31" defaultValue={recurrence?.dayOfMonth ?? 1} required />
    <Input label="Data d’inici" name="startDate" type="date" defaultValue={recurrence?.startDate ?? currentIsoDate()} required />
    <Input label="Data de finalització" name="endDate" type="date" defaultValue={recurrence?.endDate} />
    <label className={styles.checkbox}><input type="checkbox" name="isActive" defaultChecked={recurrence?.isActive ?? true} /> Recurrència activa</label>
    <div className={styles.formActions}><Button variant="secondary" fullWidth onClick={onCancel}>Cancel·la</Button><Button type="submit" fullWidth>{recurrence ? "Desa canvis" : "Crea recurrència"}</Button></div>
  </form></article>;
}

function RecurrencesSettings() {
  const { data, update } = useAppStore();
  const [editing, setEditing] = useState<Recurrence | "new" | null>(null);
  const [message, setMessage] = useState("");
  const active = data.recurrences.filter((recurrence) => recurrence.isActive).length;
  if (editing) return <Screen title={editing === "new" ? "Nova recurrència" : "Edita recurrència"} eyebrow="Moviments recurrents" backHref="/configuracio/recurrencies"><RecurrenceForm recurrence={editing === "new" ? undefined : editing} onCancel={() => setEditing(null)} /></Screen>;
  return <Screen title="Moviments recurrents" eyebrow={`${active} recurrències actives`} backHref="/configuracio" action={<Button leadingIcon={<Icon name="add" />} onClick={() => setEditing("new")}>Crear</Button>}>
    {message && <p className={styles.successCard} role="status">{message}</p>}
    <div className={styles.listCard}>{!data.recurrences.length && <p className={styles.empty}>Encara no hi ha recurrències.</p>}{data.recurrences.map((recurrence) => {
      const generated = data.movements.some((movement) => movement.recurrenceId === recurrence.id);
      return <article className={styles.movement} key={recurrence.id}><span className={styles.movementIcon}><Icon name={recurrence.movementType === "income" ? "income" : recurrence.movementType === "expense" ? "shopping" : recurrence.movementType === "transfer" ? "transfer" : "saving"} /></span><div><b>{recurrence.name}</b><small>{formatMoney(recurrence.amount)} · dia {recurrence.dayOfMonth}{generated ? " · amb historial" : ""}</small></div><aside><Badge tone={recurrence.isActive ? "success" : "neutral"}>{recurrence.isActive ? "Activa" : "Inactiva"}</Badge><span className={styles.rowActions}><button onClick={() => setEditing(recurrence)}>Edita</button><button onClick={() => update((current) => ({ ...current, recurrences: current.recurrences.map((item) => item.id === recurrence.id ? { ...item, isActive: !item.isActive, updatedAt: currentIsoDate() } : item) }))}>{recurrence.isActive ? "Desactiva" : "Activa"}</button><button onClick={() => { const text = generated ? "Aquesta recurrència ja ha generat moviments. Eliminar la regla no eliminarà els moviments existents. Vols continuar?" : "Vols eliminar definitivament aquesta recurrència?"; if (confirm(text)) { update((current) => ({ ...current, recurrences: current.recurrences.filter((item) => item.id !== recurrence.id) })); setMessage(generated ? "Recurrència eliminada. Els moviments generats es conserven." : "Recurrència eliminada correctament."); } }}>Elimina</button></span></aside></article>;
    })}</div>
  </Screen>;
}

function BackupSettings() {
  const { data, replaceData } = useAppStore();
  const [message, setMessage] = useState("");
  const [lastBackup, setLastBackup] = useState(() => typeof window === "undefined" ? "" : localStorage.getItem(LAST_BACKUP_KEY) ?? "");
  const exportBackup = async () => {
    const blob = new Blob([JSON.stringify(createBackup(data), null, 2)], { type: "application/json" });
    const filename = backupFilename();
    const file = new File([blob], filename, { type: "application/json" });
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: "Còpia de seguretat de Comptes" });
      else {
        const url = URL.createObjectURL(blob); const link = document.createElement("a");
        link.href = url; link.download = filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      const now = new Date().toISOString(); localStorage.setItem(LAST_BACKUP_KEY, now); setLastBackup(now); setMessage("Còpia creada correctament.");
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setMessage("No s’ha pogut crear la còpia. Torna-ho a provar.");
    }
  };
  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    setMessage("");
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = readBackup(JSON.parse(await file.text()) as unknown);
      if (!imported.valid) return setMessage(imported.reason);
      if (!confirm("Importar una còpia substituirà les dades actuals d’aquest dispositiu. Exporta una còpia abans d’importar. Vols continuar?")) return;
      replaceData(imported.data);
      setMessage("Còpia importada correctament. S’està obrint Inici…");
      event.target.value = "";
      window.setTimeout(() => window.location.assign("/"), 300);
    } catch { setMessage("El fitxer JSON està corrupte o no es pot llegir."); }
  };
  const lastBackupLabel = lastBackup ? new Intl.DateTimeFormat("ca-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(lastBackup)) : "Encara no has fet cap còpia";
  return <Screen title="Còpies de seguretat" eyebrow="Dades locals" backHref="/configuracio"><article className={styles.statCard}><p>Les dades es guarden només en aquest dispositiu. Una còpia de seguretat et permet recuperar-les si canvies de mòbil o s’esborren les dades de Safari.</p><p><strong>Última còpia:</strong> {lastBackupLabel}</p><div className={styles.noticeInline}><b>Exportar còpia</b><p>Desa-la a Fitxers, iCloud Drive, Google Drive o una carpeta segura.</p><Button onClick={() => void exportBackup()}>Exportar còpia</Button></div><div className={styles.noticeInline}><b>Importar còpia</b><p>Importar una còpia substituirà les dades actuals d’aquest dispositiu. Exporta una còpia abans d’importar.</p><Input label="Selecciona una còpia JSON" type="file" accept="application/json,.json" onChange={importBackup} /></div>{message && <p role="status">{message}</p>}</article></Screen>;
}

function InstallIPhoneSettings() {
  return <Screen title="Instal·lar a iPhone" eyebrow="PWA" backHref="/configuracio"><article className={styles.statCard}><p>Quan Comptes estigui publicada, podràs obrir-la a Safari i afegir-la a la pantalla d&apos;inici. Un cop instal·lada, les dades es guardaran localment al dispositiu i podràs utilitzar-la encara que no tinguis connexió.</p><div className={styles.noticeInline}><b>Mode desenvolupament local</b><p>Només per proves: necessita l&apos;ordinador encès, el servidor local obert i l&apos;iPhone a la mateixa Wi-Fi.</p></div><div className={styles.noticeInline}><b>Mode final publicat</b><p>No necessita ordinador encès. S&apos;obre des de la URL publicada, es pot afegir a la pantalla d&apos;inici, desa les dades al dispositiu i pot funcionar offline després d&apos;una primera càrrega. Fes backups JSON sovint.</p></div><ol className={styles.instructions}><li>Obre Comptes a Safari.</li><li>Prem Compartir.</li><li>Tria &quot;Afegir a pantalla d&apos;inici&quot;.</li><li>Confirma.</li><li>Obre Comptes des de la icona.</li></ol></article></Screen>;
}

function SmartSettings() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [consent, setConsent] = useState(() => typeof window !== "undefined" && localStorage.getItem("comptes-ai-consent-v1") === "yes");

  useEffect(() => {
    fetch("/api/ai/status").then((response) => response.json()).then((data: { configured?: boolean }) => setConfigured(Boolean(data.configured))).catch(() => setConfigured(false));
  }, []);

  return <Screen title="Funcions intel·ligents" eyebrow="Text i veu" backHref="/configuracio"><article className={styles.statCard}><p>Les frases s&apos;envien al servei d&apos;IA només quan prems Interpretar. No s&apos;envia l&apos;historial complet, backups ni moviments antics.</p><div className={styles.noticeInline}><b>Estat</b><p>{configured === null ? "Comprovant configuració..." : configured ? "Configurada" : "Encara no configurada"}</p></div><div className={styles.noticeInline}><b>Consentiment d&apos;IA</b><p>{consent ? "Has acceptat enviar frases puntuals per interpretar moviments." : "Encara no has acceptat l&apos;enviament de frases al servei d&apos;IA."}</p>{consent && <Button variant="secondary" onClick={() => { localStorage.removeItem("comptes-ai-consent-v1"); setConsent(false); }}>Retirar consentiment</Button>}</div><Link href="/moviments/rapid"><Button leadingIcon={<Icon name="sparkles" />}>Obrir Moviment ràpid</Button></Link></article></Screen>;
}

function PeopleSettings() {
  const { data, update } = useAppStore();
  const [editing, setEditing] = useState<Person | "new" | null>(null);
  const [message, setMessage] = useState("");
  const linked = (id: string) => data.accounts.some((account) => account.ownerIds.includes(id));
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    if (!name) return;
    const saved: Person = { id: editing && editing !== "new" ? editing.id : newId("person"), name, color: String(form.get("color") || "blue"), archived: editing && editing !== "new" ? editing.archived : false };
    update((current) => ({ ...current, people: editing && editing !== "new" ? current.people.map((person) => person.id === saved.id ? saved : person) : [...current.people, saved] }));
    setEditing(null); setMessage("Persona desada correctament.");
  };
  return <Screen title="Persones" eyebrow="Propietaris i participants" backHref="/configuracio" action={<Button leadingIcon={<Icon name="add" />} onClick={() => setEditing("new")}>Afegir</Button>}>
    {editing && <article className={styles.statCard}><form className={styles.form} onSubmit={save}><Input label="Nom" name="name" defaultValue={editing === "new" ? "" : editing.name} required /><label className={styles.selectField}>Color<select name="color" defaultValue={editing === "new" ? "blue" : editing.color ?? "blue"}>{colors.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><div className={styles.formActions}><Button variant="secondary" fullWidth onClick={() => setEditing(null)}>Cancel·la</Button><Button type="submit" fullWidth>Desa</Button></div></form></article>}
    {message && <p className={styles.successCard} role="status">{message}</p>}
    <div className={styles.listCard}>{data.people.map((person) => {
      const used = linked(person.id);
      return <article className={styles.movement} key={person.id}><span className={styles.movementIcon}><Icon name="person" /></span><div><b>{person.name}</b><small>{used ? "Vinculada a comptes" : "Sense vincles"} · {person.archived ? "arxivada" : "activa"}</small></div><aside><Badge tone={person.archived ? "neutral" : "success"}>{person.archived ? "Arxivada" : "Activa"}</Badge><span className={styles.rowActions}><button onClick={() => setEditing(person)}>Edita</button><button onClick={() => update((current) => ({ ...current, people: current.people.map((item) => item.id === person.id ? { ...item, archived: !item.archived } : item) }))}>{person.archived ? "Desarxiva" : "Arxiva"}</button><button onClick={() => { if (used) return setMessage("No pots eliminar aquesta persona perquè està vinculada a comptes. Pots arxivar-la."); if (confirm("Vols eliminar definitivament aquesta persona?")) { update((current) => ({ ...current, people: current.people.filter((item) => item.id !== person.id) })); setMessage("Persona eliminada correctament."); } }}>Elimina</button></span></aside></article>;
    })}</div>
  </Screen>;
}

function CategoriesSettings() {
  const { data, update } = useAppStore();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"mine" | "library">("mine");
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    if (!name) return;
    const saved: Category = { id: editing && editing !== "new" ? editing.id : newId("cat"), name, icon: String(form.get("icon") || "wallet") as IconName, color: String(form.get("color") || "blue"), kind: String(form.get("kind") || "expense") as Category["kind"], order: Number(form.get("order")) || data.categories.length + 1, archived: editing && editing !== "new" ? editing.archived : false };
    update((current) => ({ ...current, categories: editing && editing !== "new" ? current.categories.map((category) => category.id === saved.id ? saved : category) : [...current.categories, saved] }));
    setEditing(null); setMessage("Categoria desada correctament.");
  };
  return <Screen title="Categories" eyebrow="Gestió local" backHref="/configuracio" action={<Button leadingIcon={<Icon name="add" />} onClick={() => setEditing("new")}>Afegir</Button>}>
    <div className={styles.tabs} role="tablist"><button className={tab === "mine" ? styles.chipActive : ""} onClick={() => setTab("mine")}>Les meves categories</button><button className={tab === "library" ? styles.chipActive : ""} onClick={() => setTab("library")}>Biblioteca</button></div>
    {tab === "library" && <><article className={styles.statCard}><p>Activa un grup amb un toc. S’afegirà la categoria principal i les seves subcategories sense duplicar les que ja tens.</p><div className={styles.inlineActions}><Button size="small" onClick={() => { update((current) => activateLibraryCategories(current, CATEGORY_LIBRARY.filter((item) => item.recommended).map((item) => item.id))); setMessage("Categories recomanades activades."); }}>Activar recomanades</Button></div></article><div className={styles.libraryGrid}>{CATEGORY_LIBRARY.map((item) => { const active = isLibraryCategoryActive(data,item); return <button className={active ? styles.choiceActive : ""} key={item.id} onClick={() => { update((current) => activateLibraryCategories(current,[item.id])); setMessage(active ? `${item.name} ja estava activa.` : `${item.name} activada.`); }}><Icon name={item.icon} /><span>{item.name}<small>{active ? "Activa" : `${item.subcategories.length} subcategories`}</small></span></button>; })}</div></>}
    {tab === "mine" && <>
    {editing && <article className={styles.statCard}><form className={styles.form} onSubmit={save}><Input label="Nom" name="name" defaultValue={editing === "new" ? "" : editing.name} required /><label className={styles.selectField}>Tipus<select name="kind" defaultValue={editing === "new" ? "expense" : editing.kind ?? "expense"}><option value="expense">Despesa</option><option value="income">Ingrés</option><option value="both">Ambdós</option></select></label><label className={styles.selectField}>Color<select name="color" defaultValue={editing === "new" ? "blue" : editing.color ?? "blue"}>{colors.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className={styles.selectField}>Icona<select name="icon" defaultValue={editing === "new" ? "wallet" : editing.icon}>{icons.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><Input label="Ordre" name="order" type="number" defaultValue={editing === "new" ? data.categories.length + 1 : editing.order ?? 1} /><div className={styles.formActions}><Button variant="secondary" fullWidth onClick={() => setEditing(null)}>Cancel·la</Button><Button type="submit" fullWidth>Desa</Button></div></form></article>}
    {message && <p className={styles.successCard} role="status">{message}</p>}
    <div className={styles.listCard}>{[...data.categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((category) => {
      const used = data.movements.some((movement) => movement.categoryId === category.id);
      const hasSubcategories = data.subcategories.some((subcategory) => subcategory.categoryId === category.id);
      return <article className={styles.movement} key={category.id}><span className={`${styles.movementIcon} ${styles[category.color ?? "blue"]}`}><Icon name={category.icon} /></span><div><b>{category.name}</b><small>{category.kind === "income" ? "Ingrés" : category.kind === "both" ? "Ambdós" : "Despesa"} · {used ? "amb moviments" : hasSubcategories ? "amb subcategories" : "sense ús"} · {category.archived ? "arxivada" : "activa"}</small></div><aside><Badge tone={category.archived ? "neutral" : "success"}>{category.archived ? "Arxivada" : "Activa"}</Badge><span className={styles.rowActions}><button onClick={() => setEditing(category)}>Edita</button><button onClick={() => update((current) => ({ ...current, categories: current.categories.map((item) => item.id === category.id ? { ...item, archived: !item.archived } : item) }))}>{category.archived ? "Desarxiva" : "Arxiva"}</button><button onClick={() => { if (used || hasSubcategories) return setMessage("No pots eliminar aquesta categoria perquè ja té moviments o subcategories associades. Pots arxivar-la."); if (confirm("Vols eliminar definitivament aquesta categoria?")) { update((current) => ({ ...current, categories: current.categories.filter((item) => item.id !== category.id) })); setMessage("Categoria eliminada correctament."); } }}>Elimina</button></span></aside></article>;
    })}</div></>}
  </Screen>;
}

function SubcategoriesSettings() {
  const { data, update } = useAppStore();
  const [editing, setEditing] = useState<Subcategory | "new" | null>(null);
  const [message, setMessage] = useState("");
  const categoryOptions = data.categories.filter((category) => !category.archived || (editing !== "new" && editing?.categoryId === category.id));
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const categoryId = String(form.get("categoryId") || "");
    if (!name || !categoryId) return;
    const saved: Subcategory = { id: editing && editing !== "new" ? editing.id : newId("sub"), name, categoryId, order: Number(form.get("order")) || data.subcategories.length + 1, archived: editing && editing !== "new" ? editing.archived : false };
    update((current) => ({ ...current, subcategories: editing && editing !== "new" ? current.subcategories.map((subcategory) => subcategory.id === saved.id ? saved : subcategory) : [...current.subcategories, saved] }));
    setEditing(null); setMessage("Subcategoria desada correctament.");
  };
  return <Screen title="Subcategories" eyebrow="Gestió local" backHref="/configuracio" action={<Button leadingIcon={<Icon name="add" />} onClick={() => setEditing("new")} disabled={!data.categories.length}>Afegir</Button>}>
    {editing && <article className={styles.statCard}><form className={styles.form} onSubmit={save}><Input label="Nom" name="name" defaultValue={editing === "new" ? "" : editing.name} required /><label className={styles.selectField}>Categoria pare<select name="categoryId" defaultValue={editing === "new" ? categoryOptions[0]?.id : editing.categoryId} required>{categoryOptions.map((category) => <option value={category.id} key={category.id}>{category.name}{category.archived ? " · arxivada" : ""}</option>)}</select></label><Input label="Ordre" name="order" type="number" defaultValue={editing === "new" ? data.subcategories.length + 1 : editing.order ?? 1} /><div className={styles.formActions}><Button variant="secondary" fullWidth onClick={() => setEditing(null)}>Cancel·la</Button><Button type="submit" fullWidth>Desa</Button></div></form></article>}
    {message && <p className={styles.successCard} role="status">{message}</p>}
    <div className={styles.listCard}>{[...data.subcategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((subcategory) => {
      const used = data.movements.some((movement) => movement.subcategoryId === subcategory.id);
      const parent = data.categories.find((category) => category.id === subcategory.categoryId);
      return <article className={styles.movement} key={subcategory.id}><span className={styles.movementIcon}><Icon name="filter" /></span><div><b>{subcategory.name}</b><small>{parent?.name ?? "Sense categoria"} · {used ? "amb moviments" : "sense ús"} · {subcategory.archived ? "arxivada" : "activa"}</small></div><aside><Badge tone={subcategory.archived ? "neutral" : "success"}>{subcategory.archived ? "Arxivada" : "Activa"}</Badge><span className={styles.rowActions}><button onClick={() => setEditing(subcategory)}>Edita</button><button onClick={() => update((current) => ({ ...current, subcategories: current.subcategories.map((item) => item.id === subcategory.id ? { ...item, archived: !item.archived } : item) }))}>{subcategory.archived ? "Desarxiva" : "Arxiva"}</button><button onClick={() => { if (used) return setMessage("No pots eliminar aquesta subcategoria perquè ja té moviments associats. Pots arxivar-la."); if (confirm("Vols eliminar definitivament aquesta subcategoria?")) { update((current) => ({ ...current, subcategories: current.subcategories.filter((item) => item.id !== subcategory.id) })); setMessage("Subcategoria eliminada correctament."); } }}>Elimina</button></span></aside></article>;
    })}</div>
  </Screen>;
}

function GoalsSettings() {
  const { data, update } = useAppStore();
  const [editing, setEditing] = useState<Goal | "new" | null>(null);
  const [message, setMessage] = useState("");
  const accountOptions = data.accounts.filter((account) => !account.archived || (editing !== "new" && editing?.accountId === account.id));
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const accountId = String(form.get("accountId") || "");
    if (!name || !accountId) return;
    const saved: Goal = { id: editing && editing !== "new" ? editing.id : newId("goal"), name, accountId, targetAmount: parseMoneyInput(form.get("targetAmount")), monthlyContribution: parseMoneyInput(form.get("monthlyContribution")), archived: editing && editing !== "new" ? editing.archived : false };
    update((current) => ({ ...current, goals: editing && editing !== "new" ? current.goals.map((goal) => goal.id === saved.id ? saved : goal) : [...current.goals, saved] }));
    setEditing(null); setMessage("Objectiu desat correctament.");
  };
  return <Screen title="Objectius" eyebrow="Fons i metes" backHref="/configuracio" action={<Button leadingIcon={<Icon name="add" />} onClick={() => setEditing("new")} disabled={!data.accounts.length}>Afegir</Button>}>
    {editing && <article className={styles.statCard}><form className={styles.form} onSubmit={save}><Input label="Nom" name="name" defaultValue={editing === "new" ? "" : editing.name} required /><MoneyInput label="Import objectiu" name="targetAmount" defaultValue={editing === "new" ? 0 : editing.targetAmount} /><MoneyInput label="Aportacio mensual" name="monthlyContribution" defaultValue={editing === "new" ? 0 : editing.monthlyContribution ?? 0} /><label className={styles.selectField}>Compte vinculat<select name="accountId" defaultValue={editing === "new" ? accountOptions[0]?.id : editing.accountId} required>{accountOptions.map((account) => <option value={account.id} key={account.id}>{account.name}{account.archived ? " · arxivat" : ""}</option>)}</select></label><div className={styles.formActions}><Button variant="secondary" fullWidth onClick={() => setEditing(null)}>Cancel·la</Button><Button type="submit" fullWidth>Desa</Button></div></form></article>}
    {message && <p className={styles.successCard} role="status">{message}</p>}
    <div className={styles.listCard}>{data.goals.map((goal) => {
      const used = data.movements.some((movement) => movement.goalId === goal.id) || data.recurrences.some((recurrence) => recurrence.linkedGoalId === goal.id);
      const account = data.accounts.find((item) => item.id === goal.accountId);
      return <article className={styles.movement} key={goal.id}><span className={styles.movementIcon}><Icon name="goal" /></span><div><b>{goal.name}</b><small>{account?.name ?? "Sense compte"} · objectiu {formatMoney(goal.targetAmount)} · {used ? "amb historial" : "sense ús"}</small></div><aside><Badge tone={goal.archived ? "neutral" : "success"}>{goal.archived ? "Tancat" : "Actiu"}</Badge><span className={styles.rowActions}><button onClick={() => setEditing(goal)}>Edita</button><button onClick={() => update((current) => ({ ...current, goals: current.goals.map((item) => item.id === goal.id ? { ...item, archived: !item.archived } : item) }))}>{goal.archived ? "Reactivar" : "Tancar"}</button><button onClick={() => { if (used) return setMessage("Aquest objectiu té historial. Pots tancar-lo, però no eliminar-lo."); if (confirm("Vols eliminar definitivament aquest objectiu?")) { update((current) => ({ ...current, goals: current.goals.filter((item) => item.id !== goal.id) })); setMessage("Objectiu eliminat correctament."); } }}>Elimina</button></span></aside></article>;
    })}</div>
  </Screen>;
}

function AccountsSettings() {
  const { data } = useAppStore();
  return <Screen title="Comptes" eyebrow="Preferències dels comptes" backHref="/configuracio" action={<Link href="/comptes/nou"><Button leadingIcon={<Icon name="add" />}>Crear compte</Button></Link>}>
    <article className={styles.statCard}><p>Per editar un compte, obre’l amb “Edita”. Si no té moviments ni vincles, el podràs eliminar definitivament. Si té historial, el podràs arxivar o tancar.</p></article>
    <List>{data.accounts.map((account) => <ListItem key={account.id} title={account.name} subtitle={account.archived ? "Arxivat · conserva historial" : "Actiu"} trailing={<Link href={`/comptes/editar?id=${account.id}`}><Button size="small" variant="secondary">Edita</Button></Link>} />)}</List>
  </Screen>;
}

export function SettingsSection({ section, title }: { section: string; title: string; items: string[] }) {
  const { theme, setTheme } = useTheme();
  const { update, resetDemo, clearAll, resetGerardInitial } = useAppStore();
  const [message, setMessage] = useState("");
  if (section === "recurrencies") return <RecurrencesSettings />;
  if (section === "copies-de-seguretat") return <BackupSettings />;
  if (section === "funcions-intelligents") return <SmartSettings />;
  if (section === "installar-iphone") return <InstallIPhoneSettings />;
  if (section === "persones") return <PeopleSettings />;
  if (section === "categories") return <CategoriesSettings />;
  if (section === "subcategories") return <SubcategoriesSettings />;
  if (section === "objectius") return <GoalsSettings />;
  if (section === "comptes") return <AccountsSettings />;
  if (section === "tema") return <Screen title={title} eyebrow="Aparença" backHref="/configuracio"><div className={styles.settingsList}>{themeOptions.map((option) => <button className={`${styles.settingsLink} ${theme === option.value ? styles.chipActive : ""}`} key={option.value} onClick={() => { setTheme(option.value); update((current) => ({ ...current, preferences: { ...current.preferences, theme: option.value } })); }}><span><Icon name={option.value === "dark" ? "eye-off" : "eye"} /></span><div><b>{option.label}</b><small>{option.value === "system" ? "Segueix el dispositiu" : "Preferència fixa"}</small></div>{theme === option.value && <Icon name="check" />}</button>)}</div></Screen>;
  if (section === "dades-de-prova") return <Screen title={title} eyebrow="Dades locals" backHref="/configuracio"><article className={styles.statCard}><p>Pots recuperar la demo, restaurar la plantilla Gerard o esborrar-ho tot per tornar a l’onboarding.</p><div className={styles.settingsList}><Button onClick={() => { if (confirm("Vols restablir totes les dades de demo?")) { resetDemo(); setMessage("Dades de demo restablertes."); } }}>Restableix la demo</Button><Button onClick={() => { if (confirm("Això restaurarà la plantilla Gerard: persones, comptes, categories, subcategories i recurrències mensuals base. És una plantilla inicial, no una limitació de l’app. Vols continuar?")) { resetGerardInitial(); setMessage("Plantilla Gerard restaurada."); } }}>Restablir plantilla Gerard</Button><Button variant="danger" onClick={() => { if (confirm("Segur que vols esborrar totes les dades locals? Aquesta acció no es pot desfer.")) { clearAll(); setMessage("Totes les dades locals s’han esborrat."); } }}>Esborrar totes les dades</Button></div>{message && <p role="status">{message}</p>}</article></Screen>;
  return <Screen title={title} eyebrow="Gestió local" backHref="/configuracio"><p className={styles.empty}>Aquesta secció encara no té opcions configurables.</p></Screen>;
}
