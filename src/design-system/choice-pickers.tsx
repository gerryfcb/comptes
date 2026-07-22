"use client";

import { COLOR_PALETTE } from "@/lib/color-palette";
import { Icon, ICON_GROUPS, type IconName } from "./icons";
import styles from "./components.module.css";

export function ColorPicker({ label, name, value, onChange }: { label: string; name?: string; value: string; onChange: (value: string) => void }) {
  return (
    <fieldset className={styles.choiceField}>
      <legend>{label}</legend>
      {name && <input type="hidden" name={name} value={value} />}
      <div className={styles.colorGrid}>
        {COLOR_PALETTE.map(([color, colorLabel]) => (
          <button className={styles.colorChoice} data-selected={value === color} key={color} type="button" onClick={() => onChange(color)}>
            <span className={styles.colorDot} style={{ background: `var(--palette-${color})` }} />
            <span>{colorLabel}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function IconPicker({ label, name, value, onChange }: { label: string; name?: string; value: IconName; onChange: (value: IconName) => void }) {
  return (
    <fieldset className={styles.choiceField}>
      <legend>{label}</legend>
      {name && <input type="hidden" name={name} value={value} />}
      <div className={styles.iconGroups}>
        {ICON_GROUPS.map((group) => (
          <section key={group.label}>
            <h3>{group.label}</h3>
            <div className={styles.iconGrid}>
              {group.items.map((item) => (
                <button className={styles.iconChoice} data-selected={value === item.name} key={item.name} type="button" onClick={() => onChange(item.name)}>
                  <Icon name={item.name} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </fieldset>
  );
}
