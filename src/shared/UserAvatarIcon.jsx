const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-20 w-20 text-2xl',
};

export default function UserAvatarIcon({ avatar, name, size = 'md', className = '' }) {
  const label = String(avatar ?? name?.[0] ?? 'U').slice(0, 2).toUpperCase();
  const resolvedSize = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-primary font-bold text-on-primary ${resolvedSize} ${className}`}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}