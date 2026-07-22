import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "add" | "accounts" | "arrow-left" | "arrow-right" | "calendar" | "chart" | "check"
  | "chevron-right" | "close" | "eye" | "eye-off" | "filter" | "goal"
  | "home" | "income" | "more" | "movements" | "person" | "saving"
  | "search" | "settings" | "shopping" | "transfer" | "transport" | "wallet"
  | "card" | "bank" | "cash" | "coins" | "piggy-bank" | "investments" | "shield"
  | "house" | "building" | "key" | "bulb" | "water" | "gas" | "wifi" | "tools"
  | "car" | "motorbike" | "bike" | "bus" | "train" | "plane" | "parking" | "fuel"
  | "cart" | "bag" | "restaurant" | "coffee" | "drink" | "takeaway"
  | "heart" | "health" | "pharmacy" | "tooth" | "gym" | "swim" | "ball" | "trophy"
  | "cinema" | "music" | "game" | "book" | "gift" | "suitcase" | "pet" | "family" | "baby" | "education"
  | "subscription" | "phone" | "cloud" | "document" | "star" | "tag" | "receipt" | "briefcase" | "sparkles";

const paths: Record<IconName, ReactNode> = {
  add: <path d="M12 5v14M5 12h14" />,
  accounts: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h3" /></>,
  "arrow-left": <path d="M19 12H5m5-5-5 5 5 5" />,
  "arrow-right": <path d="M5 12h14m-5-5 5 5-5 5" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4m8-4v4M3 10h18" /></>,
  chart: <><path d="M4 19V9m6 10V5m6 14v-7m4 7H2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  "eye-off": <><path d="m3 3 18 18M10.6 6.2A9 9 0 0 1 12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-2.1 2.8M6.6 6.6C4 8.2 2.5 12 2.5 12s3.5 6 9.5 6a9 9 0 0 0 3.4-.6M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  filter: <path d="M4 6h16M7 12h10m-7 6h4" />,
  goal: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M12 4V2m8 10h2" /></>,
  home: <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  income: <path d="M12 3v14m-5-5 5 5 5-5M5 21h14" />,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  movements: <><path d="M4 7h16M4 12h10M4 17h7" /><path d="m17 14 3 3-3 3" /></>,
  person: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  saving: <><path d="M5 10c0-4 3-6 7-6s7 2 7 6v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM8 4 6 2m10 2 2-2M9 11h6" /><circle cx="12" cy="11" r="1" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.96 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H3v-4h.08A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V3h4v.08A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9 1.7 1.7 0 0 0 21 10v4h-.08A1.7 1.7 0 0 0 19.4 15Z" /></>,
  shopping: <><path d="M3 4h2l2 11h10l2-8H6" /><circle cx="9" cy="19" r="1" /><circle cx="17" cy="19" r="1" /></>,
  transfer: <path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4" />,
  transport: <><path d="M5 16V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v9M5 12h14M7 16h10M7 20v-2m10 2v-2" /><circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" /><circle cx="16" cy="15" r="1" fill="currentColor" stroke="none" /></>,
  wallet: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H19a1 1 0 0 1 1 1v15H6a2 2 0 0 1-2-2z" /><path d="M4 8h16M15 13h5v4h-5a2 2 0 0 1 0-4Z" /></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /></>,
  bank: <><path d="m3 9 9-5 9 5M5 10h14M6 10v8m4-8v8m4-8v8m4-8v8M4 20h16" /></>,
  cash: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 9v.01M18 15v.01" /></>,
  coins: <><ellipse cx="8" cy="7" rx="4" ry="2" /><path d="M4 7v4c0 1.1 1.8 2 4 2s4-.9 4-2V7" /><ellipse cx="16" cy="13" rx="4" ry="2" /><path d="M12 13v4c0 1.1 1.8 2 4 2s4-.9 4-2v-4" /></>,
  "piggy-bank": <><path d="M5 12a6 6 0 0 1 6-5h4a5 5 0 0 1 5 5v3h-2l-1 3h-3l-.7-2H9.7L9 18H6l-1-3H3v-3h2Z" /><path d="M8 7 6 4m8 6h.01" /></>,
  investments: <><path d="M4 19V5m0 14h16" /><path d="m6 15 4-4 3 3 5-7" /><path d="M15 7h3v3" /></>,
  shield: <path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z" />,
  house: <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  building: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8m-3 3 3 3m-6 0 2 2" /></>,
  bulb: <><path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-.8.8-1 1.6-1 3H9c0-1.4-.2-2.2-1-3Z" /></>,
  water: <path d="M12 3s6 6.1 6 11a6 6 0 0 1-12 0c0-4.9 6-11 6-11Z" />,
  gas: <><path d="M7 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16" /><path d="M7 9h9m0-3 3 3v8a2 2 0 0 0 2 2" /></>,
  wifi: <><path d="M4 9a12 12 0 0 1 16 0M7 12.5a7 7 0 0 1 10 0M10 16a3 3 0 0 1 4 0" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /></>,
  tools: <><path d="m14 7 3-3 3 3-3 3M4 20l7-7" /><path d="M5 4a5 5 0 0 0 6 6l8 8-3 3-8-8a5 5 0 0 0-6-6Z" /></>,
  car: <><path d="M5 16v-4l2-5h10l2 5v4M5 12h14M7 16h10M7 20v-2m10 2v-2" /><circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" /><circle cx="16" cy="15" r="1" fill="currentColor" stroke="none" /></>,
  motorbike: <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M8 17h4l3-6h-3m-1 0h-1l-2-3M14 14l4 3" /></>,
  bike: <><circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 17h5l3-7 4 7M11 17 8 10h4m2-3h3" /></>,
  bus: <><rect x="5" y="3" width="14" height="16" rx="3" /><path d="M5 10h14M8 19v2m8-2v2" /><circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" /><circle cx="16" cy="15" r="1" fill="currentColor" stroke="none" /></>,
  train: <><rect x="6" y="3" width="12" height="14" rx="3" /><path d="M6 9h12M9 21l3-4 3 4" /><circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" /></>,
  plane: <path d="M3 11h7L17 3l2 2-4 6h6l1 2-7 2-4 6-2-1 1-6H4z" />,
  parking: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M10 16V8h4a2.5 2.5 0 0 1 0 5h-4" /></>,
  fuel: <><path d="M6 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M6 10h10" /><path d="m16 7 3 3v7a2 2 0 0 0 2 2" /></>,
  cart: <><path d="M3 4h2l2 11h10l2-8H6" /><circle cx="9" cy="19" r="1" /><circle cx="17" cy="19" r="1" /></>,
  bag: <><path d="M6 8h12l1 13H5L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
  restaurant: <><path d="M7 3v8m-3-8v8m6-8v8M4 11h6v10" /><path d="M17 3v18M14 3h6v8a3 3 0 0 1-3 3" /></>,
  coffee: <><path d="M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z" /><path d="M16 10h2a2 2 0 0 1 0 4h-2M7 3v2m4-2v2m4-2v2" /></>,
  drink: <><path d="M6 3h12l-1 18H7L6 3Z" /><path d="M7 8h10M10 3l2 18" /></>,
  takeaway: <><path d="M7 7h10l-1 14H8L7 7Z" /><path d="M9 7V4h6v3M10 11h4" /></>,
  heart: <path d="M20.5 8.5c0 5-8.5 10.5-8.5 10.5S3.5 13.5 3.5 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8.5 2.5Z" />,
  health: <path d="M12 3v18M3 12h18" />,
  pharmacy: <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M12 8v8M8 12h8" /></>,
  tooth: <path d="M8 3c2 0 2.5 1 4 1s2-1 4-1c2.5 0 4 2 4 5 0 4-2 11-4 11-1.4 0-1-4-4-4s-2.6 4-4 4c-2 0-4-7-4-11 0-3 1.5-5 4-5Z" />,
  gym: <path d="M4 12h16M6 8v8M2 9v6m16-7v8m4-7v6" />,
  swim: <><path d="M4 17c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1M4 21c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1" /><path d="m12 5 4 4-5 4M8 9l4-4" /></>,
  ball: <><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18M5.6 6.2c4 2.4 8.8 2.4 12.8 0M5.6 17.8c4-2.4 8.8-2.4 12.8 0" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H4a4 4 0 0 0 4 4m8-4h4a4 4 0 0 1-4 4M12 13v5m-4 3h8" /></>,
  cinema: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 6v12M17 6v12M3 10h4m10 0h4M3 14h4m10 0h4" /></>,
  music: <path d="M9 18V5l10-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3Zm10-2a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z" />,
  game: <><path d="M7 10h10a5 5 0 0 1 4 8 3 3 0 0 1-5-1H8a3 3 0 0 1-5 1 5 5 0 0 1 4-8Z" /><path d="M8 14h4M10 12v4M16 14h.01M19 14h.01" /></>,
  book: <><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4Z" /><path d="M5 4v16" /></>,
  gift: <><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18" /><path d="M12 8C9 8 7 6.5 7 5a2 2 0 0 1 4 0c0 3-4 3-4 3m5 0c3 0 5-1.5 5-3a2 2 0 0 0-4 0c0 3 4 3 4 3" /></>,
  suitcase: <><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V5h6v2M8 20V7m8 13V7" /></>,
  pet: <><circle cx="6" cy="10" r="2" /><circle cx="10" cy="6" r="2" /><circle cx="14" cy="6" r="2" /><circle cx="18" cy="10" r="2" /><path d="M8 16c0-3 2-5 4-5s4 2 4 5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3Z" /></>,
  family: <><circle cx="8" cy="8" r="3" /><circle cx="16" cy="8" r="3" /><path d="M3 21a5 5 0 0 1 10 0M11 21a5 5 0 0 1 10 0" /></>,
  baby: <><circle cx="12" cy="8" r="4" /><path d="M8 15a5 5 0 0 0 8 0M9 8h.01M15 8h.01M6 21h12" /></>,
  education: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 12v4c3 2 7 2 10 0v-4" /></>,
  subscription: <><rect x="4" y="5" width="16" height="14" rx="3" /><path d="M8 12h8M13 9l3 3-3 3" /></>,
  phone: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>,
  cloud: <path d="M7 18h11a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2A3 3 0 0 0 7 18Z" />,
  document: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3Z" />,
  tag: <path d="M4 12V4h8l8 8-8 8-8-8Z" />,
  receipt: <><path d="M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1V3Z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2M3 12h18" /></>,
  sparkles: <><path d="m12 3 1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8L12 3Z" /><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Zm14 1 .7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7L19 15Z" /></>,
};

export const ICON_GROUPS: Array<{ label: string; items: Array<{ name: IconName; label: string }> }> = [
  { label: "Finances", items: [["wallet","Cartera"],["card","Targeta"],["bank","Banc"],["cash","Efectiu"],["coins","Monedes"],["saving","Estalvi"],["piggy-bank","Guardiola"],["chart","Gràfic"],["investments","Inversions"],["goal","Objectiu"],["shield","Emergència"]].map(([name,label]) => ({ name:name as IconName, label })) },
  { label: "Habitatge", items: [["house","Casa"],["building","Edifici"],["key","Clau"],["bulb","Llum"],["water","Aigua"],["gas","Gas"],["wifi","Wifi"],["tools","Reparacions"]].map(([name,label]) => ({ name:name as IconName, label })) },
  { label: "Transport", items: [["car","Cotxe"],["motorbike","Moto"],["bike","Bici"],["bus","Bus"],["train","Tren"],["plane","Avió"],["parking","Pàrquing"],["fuel","Combustible"],["transport","Transport"]].map(([name,label]) => ({ name:name as IconName, label })) },
  { label: "Alimentació", items: [["cart","Carro"],["shopping","Compres"],["bag","Bossa"],["restaurant","Restaurant"],["coffee","Cafè"],["drink","Copa"],["takeaway","Emportar"]].map(([name,label]) => ({ name:name as IconName, label })) },
  { label: "Salut i esport", items: [["heart","Cor"],["health","Salut"],["pharmacy","Farmàcia"],["tooth","Dent"],["gym","Gimnàs"],["swim","Natació"],["ball","Pilota"],["trophy","Trofeu"]].map(([name,label]) => ({ name:name as IconName, label })) },
  { label: "Vida", items: [["cinema","Cinema"],["music","Música"],["game","Videojoc"],["book","Llibre"],["gift","Regal"],["suitcase","Viatges"],["pet","Mascota"],["family","Família"],["baby","Nadó"],["education","Educació"]].map(([name,label]) => ({ name:name as IconName, label })) },
  { label: "Altres", items: [["sparkles","Intel·ligent"],["income","Ingrés"],["transfer","Transferència"],["subscription","Subscripció"],["phone","Telèfon"],["cloud","Núvol"],["document","Document"],["settings","Configuració"],["star","Estrella"],["tag","Etiqueta"],["filter","Filtre"],["receipt","Rebut"],["briefcase","Feina"]].map(([name,label]) => ({ name:name as IconName, label })) },
];

export function Icon({ name, size = 20, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return <svg aria-hidden="true" fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width={size} {...props}>{paths[name]}</svg>;
}
