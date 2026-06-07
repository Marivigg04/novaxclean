export default function PageHeader({ title, subtitle, children, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-base-text)]">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-[var(--color-base-text)]/62">{subtitle}</p> : null}
        </div>

        {children ? (
          <div className="w-full md:w-auto md:shrink-0">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
