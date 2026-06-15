export default function ProfileSection({ id, title, subtitle, children }) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-sm"
    >
      <header className="border-b border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)]/50 px-6 py-5 md:px-8">
        <h3 className="text-lg font-bold text-[var(--color-base-text)] md:text-xl">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--color-base-text)]/60">{subtitle}</p>
        ) : null}
      </header>
      <div className="px-6 py-6 md:px-8 md:py-8">{children}</div>
    </section>
  );
}
