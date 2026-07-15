import Link from "next/link";
import { Icon } from "@/design-system";
import { Screen } from "@/components/screen";
import styles from "@/features/shared.module.css";

const settings = [
  ["categories", "Categories", "Agrupa les teves despeses", "filter"],
  ["subcategories", "Subcategories", "Ajusta el nivell de detall", "movements"],
  ["comptes", "Comptes", "Preferències dels comptes", "accounts"],
  ["objectius", "Objectius", "Metes i progrés", "goal"],
  ["recurrencies", "Moviments recurrents", "Automatitza el mes", "transfer"],
  ["persones", "Persones", "Propietaris i participants", "person"],
  ["copies-de-seguretat", "Còpies de seguretat", "Exporta o importa dades", "transfer"],
  ["installar-iphone", "Instal·lar a iPhone", "Afegeix l’app a inici", "home"],
  ["tema", "Tema", "Clar, fosc o automàtic", "eye"],
  ["dades-de-prova", "Dades de prova", "Restableix la demo", "transfer"],
] as const;

export default function SettingsPage() {
  return <Screen title="Configuració" eyebrow="Comptes al teu gust"><div className={styles.settingsList}>{settings.map(([href,title,description,icon]) => <Link className={styles.settingsLink} href={`/configuracio/${href}`} key={href}><span><Icon name={icon} /></span><div><b>{title}</b><small>{description}</small></div><Icon name="chevron-right" /></Link>)}</div></Screen>;
}
