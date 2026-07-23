"use client";

import { useMemo, useState } from "react";
import { COLOR_PALETTE } from "@/lib/color-palette";
import { BottomSheet } from "./bottom-sheet";
import { Icon, ICON_GROUPS, type IconName } from "./icons";
import styles from "./components.module.css";

export function ColorPicker({ label, name, value, onChange }: { label: string; name?: string; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const colorLabel = COLOR_PALETTE.find(([color]) => color === value)?.[1] ?? value;
  return (
    <div className={styles.compactPicker}>
      {name && <input type="hidden" name={name} value={value} />}
      <span className={styles.compactPickerLabel}>{label}</span>
      <button className={styles.compactPickerRow} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className={styles.colorDot} style={{ background: `var(--palette-${value})` }} />
        <span>{colorLabel}</span><Icon name="chevron-right" />
      </button>
      <BottomSheet open={open} title={`Tria el ${label.toLocaleLowerCase("ca")}`} onClose={() => setOpen(false)}>
        <div className={styles.colorGrid}>
          {COLOR_PALETTE.map(([color, optionLabel]) => (
            <button className={styles.colorChoice} data-selected={value === color} key={color} type="button" onClick={() => { onChange(color); setOpen(false); }}>
              <span className={styles.colorDot} style={{ background: `var(--palette-${color})` }} />
              <span>{optionLabel}</span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}

export function IconPicker({ label, name, value, onChange }: { label: string; name?: string; value: IconName; onChange: (value: IconName) => void }) {
  const [open, setOpen] = useState(false);
  const [groupLabel, setGroupLabel] = useState<string>();
  const selected = useMemo(() => ICON_GROUPS.flatMap((group) => group.items).find((item) => item.name === value), [value]);
  const group = ICON_GROUPS.find((item) => item.label === groupLabel);
  const close = () => { setOpen(false); setGroupLabel(undefined); };
  return (
    <div className={styles.compactPicker}>
      {name && <input type="hidden" name={name} value={value} />}
      <span className={styles.compactPickerLabel}>{label}</span>
      <button className={styles.compactPickerRow} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Icon name={value} /><span>{selected?.label ?? value}</span><Icon name="chevron-right" />
      </button>
      <BottomSheet open={open} title={group ? group.label : `Tria la ${label.toLocaleLowerCase("ca")}`} onClose={close}>
        {group ? <>
          <button className={styles.pickerBack} type="button" onClick={() => setGroupLabel(undefined)}><Icon name="arrow-left" /> Tots els grups</button>
          <div className={styles.iconGrid}>{group.items.map((item) => (
            <button className={styles.iconChoice} data-selected={value === item.name} key={item.name} type="button" onClick={() => { onChange(item.name); close(); }}>
              <Icon name={item.name} /><span>{item.label}</span>
            </button>
          ))}</div>
        </> : <div className={styles.iconGroupList}>{ICON_GROUPS.map((item) => (
          <button type="button" key={item.label} onClick={() => setGroupLabel(item.label)}>
            <span>{item.label}</span><Icon name="chevron-right" />
          </button>
        ))}</div>}
      </BottomSheet>
    </div>
  );
}
