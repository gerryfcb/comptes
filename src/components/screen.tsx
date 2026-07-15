import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/design-system";
import styles from "./screen.module.css";

export function Screen({ title, eyebrow, action, backHref, backLabel = "Torna enrere", children }: { title: string; eyebrow?: string; action?: ReactNode; backHref?: string; backLabel?: string; children: ReactNode }) {
  return <main className={styles.screen}><div className={styles.content}><header className={styles.header}>{backHref && <Link className={styles.backLink} href={backHref} aria-label={backLabel}><Icon name="arrow-left" /></Link>}<div className={styles.heading}>{eyebrow && <p>{eyebrow}</p>}<h1>{title}</h1></div>{action && <div className={styles.action}>{action}</div>}</header>{children}</div></main>;
}
