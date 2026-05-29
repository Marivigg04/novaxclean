export default function PageHeader({ title, subtitle, children, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-base-text)]">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-[var(--color-base-text)]/62">{subtitle}</p> : null}
        </div>

        {children ? <div className="ml-4 flex items-center">{children}</div> : null}
      </div>
    </div>
  );
}
