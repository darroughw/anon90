"use client";

type SwitchProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function Switch({ label, checked, onCheckedChange, disabled }: SwitchProps) {
  return (
    <label className="ds-switch-row">
      <span className="ds-switch-row__label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className="ds-switch"
        onClick={() => onCheckedChange(!checked)}
      >
        <span className="ds-switch__thumb" />
      </button>
    </label>
  );
}
