import Link from "next/link";
import type { IconName } from "./icons";
import { Icon } from "./icons";
import { cx } from "./utils";
import styles from "./components.module.css";

export type NavigationItem = {
  href: string;
  label: string;
  icon: IconName;
};

export function BottomNavigation({
  items,
  activeHref,
  label = "Navegació principal",
}: {
  items: NavigationItem[];
  activeHref: string;
  label?: string;
}) {
  return (
    <nav className={styles.bottomNav} aria-label={label}>
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cx(styles.navItem, active && styles.navItemActive)}
          >
            <Icon name={item.icon} size={22} />
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
