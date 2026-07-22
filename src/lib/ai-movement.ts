import type { AppData, Movement, MovementKind } from "./app-data";
import { currentTimestamp, newId } from "./app-data";

export type ProposedMovement = {
  type: MovementKind | null;
  amount: number | null;
  date: string | null;
  accountId: string | null;
  destinationAccountId: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
  merchant: string | null;
  notes: string | null;
  confidence: number;
  missingFields: string[];
  explanation: string;
};

export const emptyProposal = (): ProposedMovement => ({
  type: null,
  amount: null,
  date: null,
  accountId: null,
  destinationAccountId: null,
  categoryId: null,
  subcategoryId: null,
  merchant: null,
  notes: null,
  confidence: 0,
  missingFields: [],
  explanation: "",
});

const isDate = (value: string | null) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

export function validateProposedMovement(data: AppData, proposal: ProposedMovement) {
  const missing = new Set<string>(proposal.missingFields);
  const type = proposal.type;
  const account = data.accounts.find((item) => item.id === proposal.accountId && !item.archived);
  const destination = data.accounts.find((item) => item.id === proposal.destinationAccountId && !item.archived);
  const category = data.categories.find((item) => item.id === proposal.categoryId && !item.archived);
  const subcategory = data.subcategories.find((item) => item.id === proposal.subcategoryId && !item.archived);

  if (!type) missing.add("type");
  if (!proposal.amount || proposal.amount <= 0) missing.add("amount");
  if (!isDate(proposal.date)) missing.add("date");
  if (!account) missing.add("accountId");
  if ((type === "transfer" || type === "saving") && (!destination || destination.id === account?.id)) missing.add("destinationAccountId");
  if ((type === "expense" || type === "income") && category && category.kind && category.kind !== "both" && category.kind !== type) missing.add("categoryId");
  if (subcategory && subcategory.categoryId !== category?.id) missing.add("subcategoryId");

  return { valid: missing.size === 0, missingFields: [...missing] };
}

export function proposalToMovement(proposal: ProposedMovement): Movement {
  if (!proposal.type || !proposal.amount || !proposal.date || !proposal.accountId) throw new Error("Incomplete movement proposal");
  const now = currentTimestamp();
  return {
    id: newId("movement"),
    localId: newId("local"),
    syncStatus: "local",
    kind: proposal.type,
    amount: proposal.amount,
    date: proposal.date,
    accountId: proposal.accountId,
    destinationAccountId: proposal.destinationAccountId ?? undefined,
    categoryId: proposal.categoryId ?? undefined,
    subcategoryId: proposal.subcategoryId ?? undefined,
    merchant: proposal.merchant ?? undefined,
    notes: proposal.notes ?? undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function sanitizeProposal(value: unknown, data: Pick<AppData, "accounts" | "categories" | "subcategories">): ProposedMovement {
  const raw = value && typeof value === "object" ? value as Partial<ProposedMovement> : {};
  const accountIds = new Set(data.accounts.map((item) => item.id));
  const categoryIds = new Set(data.categories.map((item) => item.id));
  const subcategoryIds = new Set(data.subcategories.map((item) => item.id));
  const type = raw.type && ["expense", "income", "transfer", "saving"].includes(raw.type) ? raw.type : null;
  return {
    type,
    amount: typeof raw.amount === "number" && Number.isFinite(raw.amount) ? raw.amount : null,
    date: typeof raw.date === "string" ? raw.date : null,
    accountId: raw.accountId && accountIds.has(raw.accountId) ? raw.accountId : null,
    destinationAccountId: raw.destinationAccountId && accountIds.has(raw.destinationAccountId) ? raw.destinationAccountId : null,
    categoryId: raw.categoryId && categoryIds.has(raw.categoryId) ? raw.categoryId : null,
    subcategoryId: raw.subcategoryId && subcategoryIds.has(raw.subcategoryId) ? raw.subcategoryId : null,
    merchant: typeof raw.merchant === "string" && raw.merchant.trim() ? raw.merchant.trim() : null,
    notes: typeof raw.notes === "string" && raw.notes.trim() ? raw.notes.trim() : null,
    confidence: typeof raw.confidence === "number" ? Math.max(0, Math.min(1, raw.confidence)) : 0,
    missingFields: Array.isArray(raw.missingFields) ? raw.missingFields.filter((item): item is string => typeof item === "string") : [],
    explanation: typeof raw.explanation === "string" ? raw.explanation : "",
  };
}
