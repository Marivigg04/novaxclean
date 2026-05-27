import { footerLinks } from './data';

export default function AdminFooter() {
	return (
		<footer className="mt-auto w-full bg-primary px-4 py-10 text-on-primary dark:bg-surface-container-lowest md:px-16">
			<div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-6 md:flex-row">
				<div className="flex flex-col items-center md:items-start">
					<h2 className="text-headline-md font-bold text-on-primary dark:text-primary">NovaxClean</h2>
					<p className="mt-1 text-body-md text-surface-variant dark:text-on-surface-variant">Limpieza que cuida, cuidado que se siente.</p>
				</div>

				<nav className="flex flex-wrap justify-center gap-6">
					{footerLinks.map((link) => (
						<a key={link.label} className="text-label-md text-surface-variant transition-colors hover:text-white dark:hover:text-primary" href={link.href}>
							{link.label}
						</a>
					))}
				</nav>

				<p className="text-label-md text-surface-variant/70 dark:text-on-surface-variant/70">© 2024 NovaxClean. Todos los derechos reservados.</p>
			</div>
		</footer>
	);
}
