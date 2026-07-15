import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "./utils";
import styles from "./components.module.css";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { label, variant = "ghost", className, type = "button", children, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cx(
          styles.button,
          styles.iconButton,
          styles[`button${variant[0].toUpperCase()}${variant.slice(1)}`],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
