import type { IconName } from "@/design-system";

export type Movement = { id: number; category: string; account: string; amount: number; date: string; icon: IconName; kind: "income" | "expense" | "saving" | "transfer" };

// Dades exclusivament de demostració. Se substituiran per dades reals quan
// s'implementi la capa de persistència.
export const accounts = [
  { id: 1, name: "Compte personal", type: "Personal", balance: 1537.61, owners: "Gerard", share: 100, icon: "wallet" as IconName, tone: "blue" },
  { id: 2, name: "Compte compartit", type: "Compartit", balance: 1340, owners: "Gerard i Ariadna", share: 50, icon: "accounts" as IconName, tone: "violet" },
  { id: 3, name: "Estalvi personal", type: "Estalvi", balance: 2840, owners: "Gerard", share: 100, icon: "saving" as IconName, tone: "green" },
  { id: 4, name: "Fons viatges", type: "Objectiu", balance: 900, owners: "Gerard i Ariadna", share: 50, icon: "goal" as IconName, tone: "orange" },
  { id: 5, name: "Fons extres", type: "Objectiu", balance: 450, owners: "Gerard", share: 100, icon: "goal" as IconName, tone: "blue" },
] as const;

export const movements: Movement[] = [
  { id: 1, category: "Sou mensual", account: "Compte personal", amount: 1837, date: "1 jul.", icon: "income", kind: "income" },
  { id: 2, category: "Compte compartit", account: "Compte personal", amount: -670, date: "2 jul.", icon: "transfer", kind: "transfer" },
  { id: 3, category: "Estalvi personal", account: "Estalvi personal", amount: -277.38, date: "2 jul.", icon: "saving", kind: "saving" },
  { id: 4, category: "Estalvi viatges", account: "Fons viatges", amount: -100, date: "2 jul.", icon: "goal", kind: "saving" },
  { id: 5, category: "Extres", account: "Fons extres", amount: -100, date: "2 jul.", icon: "goal", kind: "saving" },
  { id: 6, category: "Préstec moto", account: "Compte personal", amount: -134.32, date: "3 jul.", icon: "transport", kind: "expense" },
  { id: 7, category: "Pàrquing", account: "Compte personal", amount: -75, date: "3 jul.", icon: "transport", kind: "expense" },
  { id: 8, category: "Assegurança cotxe", account: "Compte personal", amount: -35.07, date: "4 jul.", icon: "transport", kind: "expense" },
  { id: 9, category: "Assegurança vida", account: "Compte personal", amount: -19.7, date: "4 jul.", icon: "person", kind: "expense" },
  { id: 10, category: "Natació, gimnàs i spa", account: "Compte personal", amount: -50, date: "5 jul.", icon: "person", kind: "expense" },
  { id: 11, category: "ChatGPT", account: "Compte personal", amount: -7.99, date: "5 jul.", icon: "wallet", kind: "expense" },
];

export const formatMoney = (value: number) => new Intl.NumberFormat("ca-ES", { style: "currency", currency: "EUR" }).format(value);
