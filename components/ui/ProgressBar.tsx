type ProgressBarProps = {
  value: number;
  label: string;
};

export default function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className="ds-progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="ds-progress__fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}
