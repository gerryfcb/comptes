import type { HTMLAttributes } from "react";
import { cx } from "./utils";
import styles from "./components.module.css";

export function Badge({
  tone = "neutral",
  dot,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
  dot?: boolean;
}) {
  return (
    <span
      className={cx(
        styles.badge,
        styles[`badge${tone[0].toUpperCase()}${tone.slice(1)}`],
        dot && styles.badgeDot,
        className,
      )}
      {...props}
    />
  );
}
