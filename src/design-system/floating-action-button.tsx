import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Icon } from "./icons";
import { cx } from "./utils";
import styles from "./components.module.css";

export const FloatingActionButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { label?: string }
>(function FloatingActionButton(
  { label = "Afegeix", className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cx(styles.fab, className)}
      {...props}
    >
      <Icon name="add" size={26} />
    </button>
  );
});
