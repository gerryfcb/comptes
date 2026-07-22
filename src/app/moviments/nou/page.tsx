import Link from "next/link";
import { Icon, type IconName } from "@/design-system";
import { Screen } from "@/components/screen";
import styles from "@/features/shared.module.css";

const actions: Array<{ href: string; label: string; icon: IconName; subtitle: string }> = [
  { href: "/moviments/rapid", label: "Moviment ràpid", icon: "sparkles", subtitle: "Escriu o dicta una frase" },
  { href: "/moviments/nou/despesa", label: "Nova despesa", icon: "shopping", subtitle: "Registra'l en pocs segons" },
  { href: "/moviments/nou/ingres", label: "Nou ingrés", icon: "income", subtitle: "Registra'l en pocs segons" },
  { href: "/moviments/nou/transferencia", label: "Nova transferència", icon: "transfer", subtitle: "Registra-la en pocs segons" },
  { href: "/moviments/nou/estalvi", label: "Moviment d'estalvi", icon: "saving", subtitle: "Registra'l en pocs segons" },
];

export default function NewMovementPage() {
  return <Screen title="Nou moviment" eyebrow="Tria el tipus" backHref="/moviments"><div className={styles.settingsList}>{actions.map((action) => <Link className={styles.settingsLink} href={action.href} key={action.href}><span><Icon name={action.icon} /></span><div><b>{action.label}</b><small>{action.subtitle}</small></div><Icon name="chevron-right" /></Link>)}</div></Screen>;
}
