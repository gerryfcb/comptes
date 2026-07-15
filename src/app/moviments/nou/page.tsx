import Link from "next/link";
import { Icon } from "@/design-system";
import { Screen } from "@/components/screen";
import styles from "@/features/shared.module.css";

const actions = [
  ["despesa", "Nova despesa", "shopping"],
  ["ingres", "Nou ingrés", "income"],
  ["transferencia", "Nova transferència", "transfer"],
  ["estalvi", "Moviment d’estalvi", "saving"],
] as const;

export default function NewMovementPage() {
  return <Screen title="Nou moviment" eyebrow="Tria el tipus" backHref="/moviments"><div className={styles.settingsList}>{actions.map(([href,label,icon]) => <Link className={styles.settingsLink} href={`/moviments/nou/${href}`} key={href}><span><Icon name={icon} /></span><div><b>{label}</b><small>Registra’l en pocs segons</small></div><Icon name="chevron-right" /></Link>)}</div></Screen>;
}
