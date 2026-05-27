export default function CatalogFooter({ links, onBackToLanding }) {
  return (
    <footer className="mt-auto flex w-full flex-col items-center justify-between gap-6 bg-primary px-4 py-10 text-on-primary md:flex-row md:px-16">
      <div className="flex flex-col items-center gap-2 md:items-start">
        <button className="text-headline-md font-bold text-on-primary" type="button" onClick={onBackToLanding}>NovaxClean</button>
        <p className="max-w-sm text-center text-body-md text-surface-variant md:text-left">
          © 2024 NovaxClean. Limpieza que cuida, cuidado que se siente.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {links.map((link) => (
          <a key={link.label} className="text-label-md text-surface-variant transition-colors hover:text-white" href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}