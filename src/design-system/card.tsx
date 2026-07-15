import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils";
import styles from "./components.module.css";

export function Card({
  elevated,
  interactive,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { elevated?: boolean; interactive?: boolean }) {
  return (
    <div
      className={cx(
        styles.card,
        elevated && styles.cardElevated,
        interactive && styles.cardInteractive,
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.cardHeader}>
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        {description && <p className={styles.cardDescription}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx(styles.cardBody, props.className)} />;
}

export function CardFooter(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx(styles.cardFooter, props.className)} />;
}
