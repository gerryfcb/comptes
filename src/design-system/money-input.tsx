"use client";

import { useState, type FocusEvent } from "react";
import { Input, type InputProps } from "./input";

type MoneyInputProps = Omit<InputProps, "type" | "value" | "defaultValue" | "onChange" | "name"> & {
  name?: string;
  value?: number | string;
  defaultValue?: number | string;
  allowNegative?: boolean;
  onValueChange?: (value: number) => void;
};

export function normalizeMoneyInput(value: string, allowNegative = false) {
  let next = value.replace(",", ".").replace(/[^\d.-]/g, "");
  const negative = allowNegative && next.startsWith("-");
  next = next.replace(/-/g, "");
  const [integer = "", ...decimals] = next.split(".");
  const decimal = decimals.join("");
  return `${negative ? "-" : ""}${integer}${decimals.length ? `.${decimal}` : ""}`;
}

export function parseMoneyInput(value: FormDataEntryValue | null) {
  const normalized = normalizeMoneyInput(String(value ?? ""));
  if (normalized === "" || normalized === "-") return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function MoneyInput({ name, value, defaultValue = "", allowNegative = false, onValueChange, onFocus, onBlur, ...props }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState(String(value ?? defaultValue));
  const normalized = normalizeMoneyInput(displayValue, allowNegative);

  const update = (next: string) => {
    const clean = normalizeMoneyInput(next, allowNegative);
    setDisplayValue(clean);
    onValueChange?.(parseMoneyInput(clean));
  };

  const focus = (event: FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === "0") event.currentTarget.select();
    onFocus?.(event);
  };

  const blur = (event: FocusEvent<HTMLInputElement>) => {
    if (displayValue === "" || displayValue === "-") update("0");
    onBlur?.(event);
  };

  return (
    <>
      {name && <input type="hidden" name={name} value={normalized === "" || normalized === "-" ? "0" : normalized} />}
      <Input
        {...props}
        inputMode="decimal"
        type="text"
        value={displayValue}
        onBlur={blur}
        onChange={(event) => update(event.target.value)}
        onFocus={focus}
      />
    </>
  );
}
