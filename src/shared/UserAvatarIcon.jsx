const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-20 w-20 text-2xl',
};

export default function UserAvatarIcon({ avatar, name, size = 'md', className = '' }) {
  const isImageAvatar = typeof avatar === 'string' && /^(data:|https?:|blob:)/.test(avatar);
  const label = String(avatar ?? name?.[0] ?? 'U').slice(0, 2).toUpperCase();
  const resolvedSize = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  if (isImageAvatar) {
    return (
      <img
        src={avatar}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover ${resolvedSize} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-primary font-bold text-on-primary ${resolvedSize} ${className}`}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}