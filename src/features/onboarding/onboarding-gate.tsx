"use client";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Button, Icon, Input, type IconName } from "@/design-system";
import { Screen } from "@/components/screen";
import { CATEGORY_LIBRARY, activateLibraryCategories } from "@/lib/category-library";
import { COLOR_PALETTE } from "@/lib/color-palette";
import { createEmptyData, formatMoney, newId, type Account, type AccountType, type AppData, type Person } from "@/lib/app-data";
import { readBackup } from "@/lib/backup";
import { useAppStore } from "@/lib/app-store";
import styles from "../shared.module.css";

type AccountDraft = Omit<Account, "id" | "archived"> & { preset: string };
const presets: Array<{ id:string; name:string; type:AccountType; icon:IconName; color:string }> = [
  { id:"personal", name:"Compte personal", type:"personal", icon:"wallet", color:"blue" },
  { id:"shared", name:"Compte compartit", type:"shared", icon:"accounts", color:"violet" },
  { id:"saving", name:"Compte d’estalvi", type:"saving", icon:"saving", color:"green" },
  { id:"travel", name:"Fons de viatges", type:"goal", icon:"goal", color:"teal" },
  { id:"emergency", name:"Fons d’emergència", type:"goal", icon:"goal", color:"orange" },
  { id:"cash", name:"Efectiu", type:"other", icon:"wallet", color:"yellow" },
  { id:"investments", name:"Inversions", type:"saving", icon:"saving", color:"indigo" },
  { id:"other", name:"Altres", type:"other", icon:"wallet", color:"slate" },
];

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { data, ready, corruptData, resetGerardInitial, replaceData } = useAppStore();
  const [mode, setMode] = useState<"menu" | "wizard" | "import">("menu");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [shared, setShared] = useState(false);
  const [others, setOthers] = useState<Person[]>([]);
  const [accounts, setAccounts] = useState<AccountDraft[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const mainPersonId = useMemo(() => "onboarding-main-person", []);
  const people = useMemo<Person[]>(() => name.trim() ? [{ id:mainPersonId, name:name.trim(), color:"blue", archived:false }, ...others] : others, [mainPersonId, name, others]);
  const needsOnboarding = ready && !corruptData && data.people.length === 0 && data.accounts.length === 0 && data.movements.length === 0;

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    setError(""); const file = event.target.files?.[0]; if (!file) return;
    try { const imported = readBackup(JSON.parse(await file.text()) as unknown); if (!imported.valid) return setError(imported.reason); if (!confirm("Aquesta importació substituirà les dades locals actuals. Vols continuar?")) return; replaceData(imported.data); window.location.assign("/?onboarding=done"); }
    catch { setError("No s’ha pogut llegir el fitxer JSON."); }
  };

  const next = () => {
    setError("");
    if (step === 1 && !name.trim()) return setError("Escriu el teu nom per continuar.");
    if (step === 2 && shared && (!others.length || others.some((person) => !person.name.trim()))) return setError("Afegeix almenys una persona i completa’n el nom.");
    if (step === 3 && accounts.length === 0) return setError("Selecciona almenys un compte.");
    setStep((value) => Math.min(6, value + 1));
  };
  const togglePreset = (id: string) => setAccounts((current) => current.some((item) => item.preset === id) ? current.filter((item) => item.preset !== id) : [...current, (() => { const preset = presets.find((item) => item.id === id)!; return { preset:id, name:preset.name, type:preset.type, icon:preset.icon, color:preset.color, initialBalance:0, ownerIds:id === "shared" ? people.map((person) => person.id) : [mainPersonId], attributablePercentage:id === "shared" ? 50 : 100 }; })()]);
  const updateAccount = (preset: string, patch: Partial<AccountDraft>) => setAccounts((current) => current.map((item) => item.preset === preset ? { ...item, ...patch } : item));
  const finish = () => {
    const validOwnerIds = new Set(people.map((person) => person.id));
    let nextData: AppData = { ...createEmptyData(), people, accounts:accounts.map(({ preset, ...account }) => ({ ...account, ownerIds:account.ownerIds.filter((id) => validOwnerIds.has(id)).length ? account.ownerIds.filter((id) => validOwnerIds.has(id)) : [mainPersonId], id:`onboarding-${preset}`, archived:false })) };
    nextData = activateLibraryCategories(nextData, categoryIds);
    replaceData(nextData);
    window.location.assign("/?onboarding=done");
  };

  if (!ready) return null;
  if (corruptData) return <Screen title="Cal recuperar les dades" eyebrow="Les dades originals no s’han esborrat"><article className={styles.statCard}><p>Importa una còpia de seguretat vàlida per continuar.</p><Input label="Importar còpia de seguretat" type="file" accept="application/json,.json" onChange={importBackup} />{error && <p className={styles.errorText}>{error}</p>}</article></Screen>;
  if (!needsOnboarding) return <>{children}</>;

  if (mode === "menu") return <Screen title="Configura Comptes" eyebrow="Primer ús"><div className={styles.onboardingGrid}>
    <article className={styles.statCard}><Icon name="person" /><h2>Començar de zero</h2><p>Configura persones, comptes, saldos i categories en pocs minuts.</p><Button onClick={() => setMode("wizard")}>Començar</Button></article>
    <article className={styles.statCard}><h2>Plantilla Gerard</h2><p>Opció separada amb la configuració de la plantilla existent.</p><Button variant="secondary" onClick={() => { if (confirm("Vols carregar la plantilla Gerard?")) { resetGerardInitial(); window.location.assign("/?onboarding=done"); } }}>Utilitzar plantilla</Button></article>
    <article className={styles.statCard}><h2>Importar còpia</h2><p>Recupera una configuració exportada anteriorment.</p><Button variant="secondary" onClick={() => setMode("import")}>Importar</Button></article>
  </div></Screen>;
  if (mode === "import") return <Screen title="Importar còpia" backHref="#"><article className={styles.statCard}><Input label="Fitxer JSON" type="file" accept="application/json,.json" onChange={importBackup} />{error && <p className={styles.errorText}>{error}</p>}<Button variant="secondary" onClick={() => setMode("menu")}>Torna</Button></article></Screen>;

  const titles = ["Com et dius?","Com utilitzaràs Comptes?","Tria els comptes","Activa categories","Saldos inicials","Ja ho tens tot preparat"];
  return <Screen title={titles[step - 1]} eyebrow={`Pas ${step} de 6`}>
    <div className={styles.wizardProgress} aria-label={`Pas ${step} de 6`}><i style={{ width:`${step / 6 * 100}%` }} /></div>
    {step === 1 && <article className={styles.wizardCard}><div className={styles.previewPeople}><span>Tu</span><span>Comptes</span></div><p>Utilitzarem aquest nom per personalitzar Comptes.</p><Input label="Nom" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></article>}
    {step === 2 && <article className={styles.wizardCard}><div className={styles.choiceGrid}><button className={!shared ? styles.choiceActive : ""} onClick={() => { setShared(false); setOthers([]); }}><Icon name="person" />Només jo</button><button className={shared ? styles.choiceActive : ""} onClick={() => setShared(true)}><Icon name="accounts" />També amb altres persones</button></div>{shared && <div className={styles.dynamicList}>{others.map((person) => <div key={person.id}><Input label="Nom" value={person.name} onChange={(event) => setOthers((current) => current.map((item) => item.id === person.id ? { ...item, name:event.target.value } : item))} /><select aria-label="Color" value={person.color} onChange={(event) => setOthers((current) => current.map((item) => item.id === person.id ? { ...item, color:event.target.value } : item))}>{COLOR_PALETTE.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select><Button variant="ghost" onClick={() => setOthers((current) => current.filter((item) => item.id !== person.id))}>Elimina</Button></div>)}<Button variant="secondary" onClick={() => setOthers((current) => [...current, { id:newId("person"), name:"", color:"violet", archived:false }])}>Afegir una altra persona</Button></div>}<p>També podràs afegir o modificar persones més endavant.</p></article>}
    {step === 3 && <article className={styles.wizardCard}><p>Els comptes serveixen per saber d’on surten i on són els diners.</p><div className={styles.libraryGrid}>{presets.map((preset) => { const selected = accounts.some((item) => item.preset === preset.id); return <button key={preset.id} className={selected ? styles.choiceActive : ""} onClick={() => togglePreset(preset.id)}><Icon name={preset.icon} />{preset.name}</button>; })}</div>{accounts.map((account) => <div className={styles.accountDraft} key={account.preset}><Input label="Nom del compte" value={account.name} onChange={(event) => updateAccount(account.preset,{name:event.target.value})} /><label>Tipus<select value={account.type} onChange={(event) => updateAccount(account.preset,{type:event.target.value as AccountType})}><option value="personal">Personal</option><option value="shared">Compartit</option><option value="saving">Estalvi</option><option value="goal">Objectiu</option><option value="other">Altre</option></select></label><label>Icona<select value={account.icon} onChange={(event) => updateAccount(account.preset,{icon:event.target.value as IconName})}><option value="wallet">Cartera</option><option value="accounts">Compartit</option><option value="saving">Estalvi</option><option value="goal">Objectiu</option></select></label><label>Propietaris<div className={styles.ownerChecks}>{people.map((person) => <label key={person.id}><input type="checkbox" checked={account.ownerIds.includes(person.id)} onChange={(event) => updateAccount(account.preset,{ ownerIds:event.target.checked ? [...account.ownerIds,person.id] : account.ownerIds.filter((id) => id !== person.id) })} />{person.name || "Sense nom"}</label>)}</div></label><label>Color<select value={account.color} onChange={(event) => updateAccount(account.preset,{color:event.target.value})}>{COLOR_PALETTE.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>)}</article>}
    {step === 4 && <article className={styles.wizardCard}><p>Activa només les categories que vulguis utilitzar ara. Sempre en podràs afegir més.</p><div className={styles.inlineActions}><Button size="small" onClick={() => setCategoryIds(CATEGORY_LIBRARY.filter((item) => item.recommended).map((item) => item.id))}>Seleccionar recomanades</Button><Button size="small" variant="secondary" onClick={() => setCategoryIds([])}>Desmarcar totes</Button></div><div className={styles.libraryGrid}>{CATEGORY_LIBRARY.map((item) => <button key={item.id} className={categoryIds.includes(item.id) ? styles.choiceActive : ""} onClick={() => setCategoryIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current,item.id])}><Icon name={item.icon} /><span>{item.name}<small>{item.subcategories.length} opcions</small></span></button>)}</div></article>}
    {step === 5 && <article className={styles.wizardCard}><p>Aquest és el saldo que tens ara mateix. No es registrarà com un ingrés.</p>{accounts.map((account) => <Input key={account.preset} label={account.name} type="number" step="0.01" value={account.initialBalance} onChange={(event) => updateAccount(account.preset,{ initialBalance:Number(event.target.value) })} />)}</article>}
    {step === 6 && <article className={styles.summaryCard}><Icon name="check" size={36} /><h2>Ja ho tens tot preparat</h2><ul><li>{people.length} {people.length === 1 ? "persona creada" : "persones creades"}</li><li>{accounts.length} {accounts.length === 1 ? "compte creat" : "comptes creats"}</li><li>{categoryIds.length} {categoryIds.length === 1 ? "categoria activada" : "categories activades"}</li><li>Patrimoni inicial: <strong>{formatMoney(accounts.reduce((sum,item) => sum + item.initialBalance * item.attributablePercentage / 100,0))}</strong></li></ul><Button fullWidth onClick={finish}>Començar a utilitzar Comptes</Button><Button fullWidth variant="secondary" onClick={() => setStep(1)}>Revisar configuració</Button></article>}
    {error && <p className={styles.errorText} role="alert">{error}</p>}
    {step < 6 && <div className={styles.stickyActions}><Button variant="secondary" fullWidth onClick={() => step === 1 ? setMode("menu") : setStep((value) => value - 1)}>Enrere</Button><Button fullWidth onClick={next}>Continuar</Button></div>}
  </Screen>;
}
