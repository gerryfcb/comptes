import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "./icons";
import { cx } from "./utils";
import styles from "./components.module.css";

export function List(props: HTMLAttributes<HTMLUListElement>) {
  return <ul {...props} className={cx(styles.list, props.className)} />;
}

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <li className={cx(styles.listItem, className)}>
      {leading}
      <div className={styles.listMain}>
        <span className={styles.listTitle}>{title}</span>
        {subtitle && <span className={styles.listSubtitle}>{subtitle}</span>}
      </div>
      {trailing}
      {onPress && (
        <button className={styles.listAction} type="button" onClick={onPress} aria-label="Obre">
          <Icon name="chevron-right" />
        </button>
      )}
    </li>
  );
}
