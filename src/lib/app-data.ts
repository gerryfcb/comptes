import type { IconName } from "@/design-system";

export type ThemePreference = "light" | "dark" | "system";
export type AccountType = "personal" | "shared" | "saving" | "goal" | "other";
export type MovementKind = "income" | "expense" | "transfer" | "saving";
export type SavingDirection = "contribution" | "withdrawal";
export type RecurrenceMovementType = "expense" | "income" | "transfer" | "goalContribution" | "goalWithdrawal";
export type RecurrenceFrequency = "monthly";

export type Person = { id: string; name: string; color?: string; archived?: boolean };
export type Account = {
  id: string; name: string; type: AccountType; initialBalance: number;
  ownerIds: string[]; attributablePercentage: number; color: string;
  icon: IconName; archived: boolean;
};
export type Category = { id: string; name: string; icon: IconName; color?: string; kind?: "expense" | "income" | "both"; order?: number; archived?: boolean };
export type Subcategory = { id: string; categoryId: string; name: string; order?: number; archived?: boolean };
export type Goal = { id: string; name: string; accountId: string; targetAmount: number; monthlyContribution?: number; archived?: boolean };
export type Movement = {
  id: string; kind: MovementKind; amount: number; date: string;
  accountId?: string; destinationAccountId?: string; categoryId?: string;
  subcategoryId?: string; merchant?: string; notes?: string; recurring?: boolean;
  goalId?: string; savingDirection?: SavingDirection; recurrenceId?: string; generatedForMonth?: string;
  createdAt?: string; updatedAt?: string; localId?: string; syncStatus?: "local";
};
export type Recurrence = {
  id: string; name: string; movementType: RecurrenceMovementType; amount: number;
  sourceAccountId?: string; destinationAccountId?: string; categoryId?: string;
  subcategoryId?: string; linkedGoalId?: string; dayOfMonth: number;
  frequency: RecurrenceFrequency; startDate: string; endDate?: string; isActive: boolean;
  lastGeneratedAt?: string; createdAt: string; updatedAt: string;
};
export type Preferences = { theme: ThemePreference; amountsHidden: boolean };
export type AppData = {
  version: 1; people: Person[]; accounts: Account[]; categories: Category[];
  subcategories: Subcategory[]; goals: Goal[]; movements: Movement[];
  recurrences: Recurrence[]; preferences: Preferences;
};

const categoryData: Array<[string, string[]]> = [
  ["Vehicle", ["Combustible", "Pàrquing", "Manteniment", "ITV", "Assegurança", "Impost de circulació", "Altres"]],
  ["Alimentació", ["Supermercat", "Esmorzar", "Berenar", "Restaurant", "Menjar per emportar", "Bars", "Altres"]],
  ["Habitatge", ["Lloguer", "Llum", "Aigua", "Internet", "Taxes / Escombraries", "Altres"]],
  ["Esport", ["Natació / Gimnàs / Spa", "Pàdel", "Material esportiu", "Competicions / Inscripcions", "Altres"]],
  ["Compres", ["Roba", "Electrònica", "Casa", "Regals", "Altres"]],
  ["Salut", ["Farmàcia", "Metges / Especialistes", "Dentista", "Òptica", "Altres"]],
  ["Altres", ["Finances", "Impostos", "Tràmits", "Activitats", "Altres"]],
];

const slug = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const localDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
export const currentIsoDate = () => isoDate(new Date());
export const currentTimestamp = () => new Date().toISOString();

const recurrenceDateForMonth = (year: number, monthIndex: number, dayOfMonth: number) => {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return isoDate(new Date(year, monthIndex, Math.min(Math.max(1, dayOfMonth), lastDay)));
};

export function createInitialRecurrences(now = new Date()): Recurrence[] {
  const createdAt = isoDate(now);
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const base = { frequency: "monthly" as const, dayOfMonth: 1, startDate, isActive: true, createdAt, updatedAt: createdAt };
  return [
    { ...base, id: "rec-sou-mensual", name: "Sou mensual", movementType: "income", amount: 1837, destinationAccountId: "account-personal" },
    { ...base, id: "rec-prestec-moto", name: "Préstec moto", movementType: "expense", amount: 134.32, sourceAccountId: "account-personal", categoryId: "cat-vehicle", subcategoryId: "sub-vehicle-6" },
    { ...base, id: "rec-parquing", name: "Pàrquing", movementType: "expense", amount: 75, sourceAccountId: "account-personal", categoryId: "cat-vehicle", subcategoryId: "sub-vehicle-1" },
    { ...base, id: "rec-asseguranca-cotxe", name: "Assegurança cotxe", movementType: "expense", amount: 35.07, sourceAccountId: "account-personal", categoryId: "cat-vehicle", subcategoryId: "sub-vehicle-4" },
    { ...base, id: "rec-asseguranca-vida", name: "Assegurança vida", movementType: "expense", amount: 19.7, sourceAccountId: "account-personal", categoryId: "cat-altres", subcategoryId: "sub-altres-0" },
    { ...base, id: "rec-gimnas", name: "Natació / Gimnàs / Spa", movementType: "expense", amount: 50, sourceAccountId: "account-personal", categoryId: "cat-esport", subcategoryId: "sub-esport-0" },
    { ...base, id: "rec-chatgpt", name: "ChatGPT", movementType: "expense", amount: 7.99, sourceAccountId: "account-personal", categoryId: "cat-altres", subcategoryId: "sub-altres-0" },
    { ...base, id: "rec-transferencia-compartit", name: "Transferència al compte compartit", movementType: "transfer", amount: 670, sourceAccountId: "account-personal", destinationAccountId: "account-shared" },
    { ...base, id: "rec-fons-viatges", name: "Aportació fons viatges", movementType: "goalContribution", amount: 100, sourceAccountId: "account-personal", destinationAccountId: "account-travel", linkedGoalId: "goal-travel" },
    { ...base, id: "rec-fons-extres", name: "Aportació fons extres", movementType: "goalContribution", amount: 100, sourceAccountId: "account-personal", destinationAccountId: "account-extra", linkedGoalId: "goal-extra" },
    { ...base, id: "rec-estalvi-personal", name: "Aportació estalvi personal", movementType: "goalContribution", amount: 277.38, sourceAccountId: "account-personal", destinationAccountId: "account-saving", linkedGoalId: "goal-saving" },
  ];
}

export function createDemoData(): AppData {
  const categories: Category[] = categoryData.map(([name], index) => ({
    id: `cat-${slug(name)}`, name, icon: index === 0 ? "transport" : index === 1 || index === 4 ? "shopping" : "wallet",
  }));
  const subcategories = categoryData.flatMap(([category, names]) =>
    names.map((name, index) => ({ id: `sub-${slug(category)}-${index}`, categoryId: `cat-${slug(category)}`, name })));
  const people = [{ id: "person-gerard", name: "Gerard", color: "blue", archived: false }, { id: "person-ariadna", name: "Ariadna", color: "violet", archived: false }];
  const accounts: Account[] = [
    { id: "account-personal", name: "Compte personal", type: "personal", initialBalance: 100, ownerIds: ["person-gerard"], attributablePercentage: 100, color: "blue", icon: "wallet", archived: false },
    { id: "account-shared", name: "Compte compartit", type: "shared", initialBalance: 200, ownerIds: ["person-gerard", "person-ariadna"], attributablePercentage: 50, color: "violet", icon: "accounts", archived: false },
    { id: "account-saving", name: "Estalvi personal", type: "saving", initialBalance: 300, ownerIds: ["person-gerard"], attributablePercentage: 100, color: "green", icon: "saving", archived: false },
    { id: "account-travel", name: "Fons viatges", type: "goal", initialBalance: 400, ownerIds: ["person-gerard", "person-ariadna"], attributablePercentage: 50, color: "orange", icon: "goal", archived: false },
    { id: "account-extra", name: "Fons extres", type: "goal", initialBalance: 50, ownerIds: ["person-gerard"], attributablePercentage: 100, color: "blue", icon: "goal", archived: false },
  ];
  const movements: Movement[] = [
    { id: "mov-1", kind: "income", amount: 1837, date: localDate(-5), accountId: "account-personal", merchant: "Nòmina" },
    { id: "mov-2", kind: "transfer", amount: 670, date: localDate(-4), accountId: "account-personal", destinationAccountId: "account-shared", notes: "Aportació mensual" },
    { id: "mov-3", kind: "saving", savingDirection: "contribution", amount: 277.38, date: localDate(-3), accountId: "account-personal", destinationAccountId: "account-saving", goalId: "goal-saving" },
    { id: "mov-4", kind: "saving", savingDirection: "contribution", amount: 100, date: localDate(-2), accountId: "account-personal", destinationAccountId: "account-travel", goalId: "goal-travel" },
    { id: "mov-5", kind: "expense", amount: 75, date: localDate(-1), accountId: "account-personal", categoryId: "cat-vehicle", subcategoryId: "sub-vehicle-1", merchant: "Pàrquing" },
    { id: "mov-6", kind: "expense", amount: 50, date: localDate(), accountId: "account-personal", categoryId: "cat-esport", subcategoryId: "sub-esport-0", merchant: "Gimnàs" },
  ];
  return {
    version: 1, people, accounts, categories, subcategories,
    goals: [
      { id: "goal-saving", name: "Estalvi personal", accountId: "account-saving", targetAmount: 5000, monthlyContribution: 277.38, archived: false },
      { id: "goal-travel", name: "Fons viatges", accountId: "account-travel", targetAmount: 2000, monthlyContribution: 100, archived: false },
      { id: "goal-extra", name: "Fons extres", accountId: "account-extra", targetAmount: 1000, monthlyContribution: 100, archived: false },
    ],
    movements, recurrences: createInitialRecurrences(), preferences: { theme: "system", amountsHidden: false },
  };
}

export function createEmptyData(): AppData {
  return { version: 1, people: [], accounts: [], categories: [], subcategories: [], goals: [], movements: [], recurrences: [], preferences: { theme: "system", amountsHidden: false } };
}

export function createInitialGerardData() {
  return createDemoData();
}

export function createStarterData(userName: string, accountName: string, initialBalance: number): AppData {
  const personId = newId("person");
  const accountId = newId("account");
  return {
    version: 1,
    people: [{ id: personId, name: userName, color: "blue", archived: false }],
    accounts: [{
      id: accountId, name: accountName, type: "personal", initialBalance,
      ownerIds: [personId], attributablePercentage: 100, color: "blue", icon: "wallet", archived: false,
    }],
    categories: [],
    subcategories: [],
    goals: [],
    movements: [],
    recurrences: [],
    preferences: { theme: "system", amountsHidden: false },
  };
}

export const formatMoney = (value: number) => new Intl.NumberFormat("ca-ES", { style: "currency", currency: "EUR" }).format(value);
export const newId = (prefix: string) => `${prefix}-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`;

export function accountBalance(account: Account, movements: Movement[]) {
  return movements.reduce((balance, movement) => {
    if (movement.kind === "income" && movement.accountId === account.id) return balance + movement.amount;
    if (movement.kind === "expense" && movement.accountId === account.id) return balance - movement.amount;
    if ((movement.kind === "transfer" || movement.kind === "saving") && movement.accountId === account.id) return balance - movement.amount;
    if ((movement.kind === "transfer" || movement.kind === "saving") && movement.destinationAccountId === account.id) return balance + movement.amount;
    return balance;
  }, account.initialBalance);
}

export const movementIcon = (kind: MovementKind): IconName =>
  kind === "income" ? "income" : kind === "expense" ? "shopping" : kind === "saving" ? "saving" : "transfer";

export function compareMovementsDesc(a: Movement, b: Movement) {
  const date = b.date.localeCompare(a.date);
  if (date !== 0) return date;
  return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
}

export function normalizeAppData(data: AppData): AppData {
  const recurrences = Array.isArray(data.recurrences) ? data.recurrences : [];
  const hasBaseAccounts = data.accounts.some((account) => account.id === "account-personal");
  return {
    ...data,
    recurrences: recurrences.length === 0 && hasBaseAccounts ? createInitialRecurrences() : recurrences,
    people: data.people.map((person) => ({ ...person, archived: person.archived ?? false })),
    accounts: data.accounts.map((account) => ({ ...account, archived: account.archived ?? false })),
    categories: data.categories.map((category, index) => ({ ...category, color: category.color ?? "blue", kind: category.kind ?? "expense", order: category.order ?? index + 1, archived: category.archived ?? false })),
    subcategories: data.subcategories.map((subcategory, index) => ({ ...subcategory, order: subcategory.order ?? index + 1, archived: subcategory.archived ?? false })),
    goals: data.goals.map((goal) => ({ ...goal, monthlyContribution: goal.monthlyContribution ?? 0, archived: goal.archived ?? false })),
    movements: data.movements.map((movement) => {
      const createdAt = movement.createdAt ?? `${movement.date}T12:00:00.000Z`;
      return { ...movement, localId: movement.localId ?? movement.id, syncStatus: movement.syncStatus ?? "local", createdAt, updatedAt: movement.updatedAt ?? createdAt };
    }),
    preferences: { theme: data.preferences?.theme ?? "system", amountsHidden: data.preferences?.amountsHidden ?? false },
  };
}

export function isRecurrencePending(recurrence: Recurrence, movements: Movement[], date = new Date()) {
  if (!recurrence.isActive) return false;
  const key = monthKey(date);
  const currentMonthStart = `${key}-01`;
  if (recurrence.startDate > currentMonthStart) return false;
  if (recurrence.endDate && recurrence.endDate < currentMonthStart) return false;
  return !movements.some((movement) => movement.recurrenceId === recurrence.id && movement.generatedForMonth === key);
}

export function pendingRecurrences(data: AppData, date = new Date()) {
  return data.recurrences.filter((recurrence) => isRecurrencePending(recurrence, data.movements, date));
}

export function recurrenceToMovement(recurrence: Recurrence, amount = recurrence.amount, date = new Date()): Movement {
  const key = monthKey(date);
  const movementDate = recurrenceDateForMonth(date.getFullYear(), date.getMonth(), recurrence.dayOfMonth);
  const now = currentTimestamp();
  const base = {
    id: newId("movement"),
    localId: newId("local"),
    syncStatus: "local" as const,
    amount,
    date: movementDate,
    merchant: recurrence.name,
    notes: "Generat des de moviment recurrent",
    recurring: true,
    recurrenceId: recurrence.id,
    generatedForMonth: key,
    createdAt: now,
    updatedAt: now,
  };
  if (recurrence.movementType === "income") return { ...base, kind: "income", accountId: recurrence.destinationAccountId, categoryId: recurrence.categoryId };
  if (recurrence.movementType === "expense") return { ...base, kind: "expense", accountId: recurrence.sourceAccountId, categoryId: recurrence.categoryId, subcategoryId: recurrence.subcategoryId };
  if (recurrence.movementType === "transfer") return { ...base, kind: "transfer", accountId: recurrence.sourceAccountId, destinationAccountId: recurrence.destinationAccountId };
  return {
    ...base,
    kind: "saving",
    accountId: recurrence.sourceAccountId,
    destinationAccountId: recurrence.destinationAccountId,
    goalId: recurrence.linkedGoalId,
    savingDirection: recurrence.movementType === "goalWithdrawal" ? "withdrawal" : "contribution",
  };
}
