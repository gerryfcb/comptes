import type { IconName } from "@/design-system";
import type { AppData, Category, Subcategory } from "./app-data";

export type LibraryCategory = {
  id: string;
  name: string;
  kind: "expense" | "income";
  icon: IconName;
  color: string;
  recommended?: boolean;
  subcategories: string[];
};

export const CATEGORY_LIBRARY: LibraryCategory[] = [
  { id: "income", name: "Ingressos", kind: "income", icon: "coins", color: "green", recommended: true, subcategories: ["Nòmina", "Hores extres", "Feines puntuals", "Prestacions", "Pensió", "Reemborsaments", "Interessos", "Dividends", "Venda d'objectes", "Regals rebuts", "Altres ingressos"] },
  { id: "housing", name: "Habitatge", kind: "expense", icon: "house", color: "blue", recommended: true, subcategories: ["Lloguer", "Hipoteca", "Electricitat", "Aigua", "Gas", "Internet", "Comunitat", "Assegurança de la llar", "Taxes i escombraries", "Manteniment i reparacions", "Mobles i decoració", "Neteja de la llar", "Altres"] },
  { id: "food", name: "Alimentació", kind: "expense", icon: "cart", color: "orange", recommended: true, subcategories: ["Supermercat", "Fleca", "Esmorzars i berenars", "Restaurants", "Menjar per emportar", "Cafès", "Bars", "Altres"] },
  { id: "transport", name: "Transport i vehicle", kind: "expense", icon: "car", color: "indigo", recommended: true, subcategories: ["Combustible", "Aparcament", "Peatges", "Transport públic", "Taxi / VTC", "Manteniment", "Reparacions", "Assegurança", "ITV", "Impost de circulació", "Rentat", "Altres"] },
  { id: "health", name: "Salut", kind: "expense", icon: "heart", color: "red", recommended: true, subcategories: ["Farmàcia", "Metge", "Dentista", "Fisioteràpia", "Psicologia", "Òptica", "Assegurança mèdica", "Altres"] },
  { id: "leisure", name: "Oci i cultura", kind: "expense", icon: "star", color: "violet", subcategories: ["Cinema", "Concerts", "Espectacles", "Llibres", "Videojocs", "Aficions", "Sortides", "Altres"] },
  { id: "sport", name: "Esport", kind: "expense", icon: "trophy", color: "cyan", subcategories: ["Gimnàs", "Natació", "Pàdel", "Entrenaments", "Material esportiu", "Competicions", "Altres"] },
  { id: "subscriptions", name: "Subscripcions", kind: "expense", icon: "subscription", color: "purple", subcategories: ["Streaming", "Música", "Programari", "Emmagatzematge al núvol", "Premsa", "Telefonia", "Altres"] },
  { id: "shopping", name: "Compres", kind: "expense", icon: "bag", color: "pink", recommended: true, subcategories: ["Roba", "Calçat", "Electrònica", "Casa i parament", "Regals", "Cura personal", "Altres"] },
  { id: "family", name: "Família i educació", kind: "expense", icon: "family", color: "yellow", subcategories: ["Escola", "Guarderia", "Material escolar", "Activitats", "Formació", "Mascotes", "Altres"] },
  { id: "travel", name: "Viatges", kind: "expense", icon: "suitcase", color: "teal", subcategories: ["Transport", "Allotjament", "Menjar", "Activitats", "Assegurança de viatge", "Altres"] },
  { id: "finance", name: "Finances i tràmits", kind: "expense", icon: "receipt", color: "slate", subcategories: ["Comissions", "Interessos", "Impostos", "Multes", "Gestoria", "Tràmits", "Altres"] },
];

const clean = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("ca").trim();

export function isLibraryCategoryActive(data: AppData, item: LibraryCategory) {
  return data.categories.some((category) => category.id === `library-${item.id}` || clean(category.name) === clean(item.name));
}

export function activateLibraryCategories(data: AppData, ids: string[]): AppData {
  const categories: Category[] = [...data.categories];
  const subcategories: Subcategory[] = [...data.subcategories];

  for (const id of ids) {
    const item = CATEGORY_LIBRARY.find((entry) => entry.id === id);
    if (!item) continue;

    let category = categories.find((entry) => entry.id === `library-${item.id}` || clean(entry.name) === clean(item.name));
    if (category) {
      category = { ...category, kind: item.kind, icon: category.icon ?? item.icon, color: category.color ?? item.color, archived: false };
      categories.splice(categories.findIndex((entry) => entry.id === category!.id), 1, category);
    } else {
      category = { id: `library-${item.id}`, name: item.name, kind: item.kind, icon: item.icon, color: item.color, order: categories.length + 1, archived: false };
      categories.push(category);
    }

    item.subcategories.forEach((name, index) => {
      const existing = subcategories.find((entry) => entry.categoryId === category!.id && clean(entry.name) === clean(name));
      if (existing) {
        subcategories.splice(subcategories.findIndex((entry) => entry.id === existing.id), 1, { ...existing, archived: false });
      } else {
        subcategories.push({ id: `library-${item.id}-${index}`, categoryId: category!.id, name, order: index + 1, archived: false });
      }
    });
  }

  return { ...data, categories, subcategories };
}
