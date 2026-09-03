"use client";

import { useState } from "react";

type ChecklistItemProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

/**
 * Same visual base as components/ui/Checkbox, plus a one-time "cross it
 * off" animation (pop + glowing strikethrough) that plays only on the
 * click that actually checks the item -- not on mount or on already-checked
 * items, so loading a day that's already done doesn't replay it.
 */
export default function ChecklistItem({ label, checked, onChange }: ChecklistItemProps) {
  const [justChecked, setJustChecked] = useState(false);

  function handleChange() {
    if (!checked) {
      setJustChecked(true);
    }
    onChange();
  }

  return (
    <label
      className={["ds-checkbox", "ds-checklist-item", justChecked && "ds-checklist-item--pop"]
        .filter(Boolean)
        .join(" ")}
      onAnimationEnd={() => setJustChecked(false)}
    >
      <input type="checkbox" checked={checked} onChange={handleChange} />
      <span className="ds-checklist-item__label">{label}</span>
    </label>
  );
}
