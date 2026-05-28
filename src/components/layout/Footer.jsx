export default function Footer({
  links = [],
  brandLabel = 'NovaxClean',
  description = 'Limpieza que cuida, cuidado que se siente.',
  copyright = '© 2024 NovaxClean. Todos los derechos reservados.',
}) {
  return (
    <footer className="mt-auto w-full border-t border-outline-variant bg-surface/95 px-4 py-10 text-on-surface-variant backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-6 md:flex-row md:px-16">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <h2 className="text-headline-md font-bold text-primary">{brandLabel}</h2>

          <p className="max-w-sm text-center text-body-md text-on-surface-variant md:text-left">{description}</p>
          <p className="text-label-md text-outline md:text-left">{copyright}</p>
        </div>

        {links.length > 0 ? (
          <nav className="flex flex-wrap justify-center gap-6">
            {links.map((link) => (
              <a key={link.label} className="text-label-md text-on-surface-variant transition-colors hover:text-secondary" href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}