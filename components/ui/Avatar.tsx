type AvatarProps = {
  name: string;
  label?: string;
};

export default function Avatar({ name, label }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div className="ds-avatar" aria-hidden={label ? undefined : true} aria-label={label}>
      {initial}
    </div>
  );
}
