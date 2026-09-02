type StatDisplayProps = {
  value: string | number;
  label: string;
};

export default function StatDisplay({ value, label }: StatDisplayProps) {
  return (
    <div className="ds-stat">
      <div className="ds-stat__value">{value}</div>
      <div className="ds-stat__label">{label}</div>
    </div>
  );
}
