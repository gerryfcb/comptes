import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "./utils";
import styles from "./components.module.css";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingElement?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, leadingIcon, trailingElement, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <div className={styles.inputWrap} data-invalid={Boolean(error)}>
        {leadingIcon}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={hint || error ? messageId : undefined}
          aria-invalid={Boolean(error)}
          className={cx(styles.input, className)}
          {...props}
        />
        {trailingElement}
      </div>
      {(error || hint) && (
        <p id={messageId} className={cx(styles.hint, error && styles.error)}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
