import { notFound } from "next/navigation";
import { SettingsSection } from "@/features/settings/settings-section";

const sections = {
  categories: { title: "Categories", items: ["Habitatge", "Alimentació", "Transport", "Oci"] },
  subcategories: { title: "Subcategories", items: ["Supermercat", "Restaurants", "Transport públic", "Subscripcions"] },
  comptes: { title: "Comptes", items: ["Compte personal", "Compte compartit", "Estalvi personal", "Fons viatges", "Fons extres"] },
  objectius: { title: "Objectius", items: ["Fons viatges", "Fons extres"] },
  recurrencies: { title: "Moviments recurrents", items: [] },
  persones: { title: "Persones", items: ["Gerard", "Ariadna"] },
  "copies-de-seguretat": { title: "Còpies de seguretat", items: [] },
  "funcions-intelligents": { title: "Funcions intel·ligents", items: [] },
  "installar-iphone": { title: "Instal·lar a iPhone", items: [] },
  tema: { title: "Tema", items: [] },
  "dades-de-prova": { title: "Dades de prova", items: [] },
} as const;

export function generateStaticParams() {
  return Object.keys(sections).map((seccio) => ({ seccio }));
}

export default async function SettingsSectionPage({ params }: { params: Promise<{ seccio: string }> }) {
  const { seccio } = await params;
  const config = sections[seccio as keyof typeof sections];
  if (!config) notFound();
  return <SettingsSection section={seccio} title={config.title} items={[...config.items]} />;
}
