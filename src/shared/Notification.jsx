import { AlertTriangle, ArchiveX, Bell, ChevronRight, Clock3 } from 'lucide-react';
import ScrollArea from '@/shared/ScrollArea';

const severityStyles = {
	warning: {
		badge: 'bg-amber-500/12 text-amber-700 border-amber-500/15',
		icon: 'text-amber-600',
		dot: 'bg-amber-500',
	},
	danger: {
		badge: 'bg-rose-500/12 text-rose-700 border-rose-500/15',
		icon: 'text-rose-600',
		dot: 'bg-rose-500',
	},
	info: {
		badge: 'bg-sky-500/12 text-sky-700 border-sky-500/15',
		icon: 'text-sky-600',
		dot: 'bg-sky-500',
	},
};

function getIcon(type) {
	if (type === 'danger') return ArchiveX;
	if (type === 'warning') return AlertTriangle;
	return Bell;
}

export default function Notification({ notifications = [], onClose = () => {} }) {
	return (
		<div className="absolute right-0 top-12 z-50 w-[min(92vw,24rem)] overflow-hidden rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-[0_24px_60px_-28px_rgba(16,32,58,0.55)]">
			<div className="flex items-center justify-between border-b border-[var(--color-app-panel-border)] px-4 py-3">
				<div>
					<p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-base-text)]/50">Notificaciones</p>
					<h3 className="mt-1 text-sm font-semibold text-[var(--color-base-text)]">Alertas de inventario</h3>
				</div>

				<button
					type="button"
					onClick={onClose}
					className="rounded-full p-2 text-[var(--color-base-text)]/55 transition-colors hover:bg-[var(--color-app-panel-hover)] hover:text-[var(--color-base-text)]"
					aria-label="Cerrar notificaciones"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>

			<ScrollArea className="max-h-[24rem] p-2">
				{notifications.length ? (
					<div className="space-y-2">
						{notifications.map((item) => {
							const styles = severityStyles[item.type] ?? severityStyles.info;
							const Icon = getIcon(item.type);

							return (
								<div
									key={item.id}
									className="group flex gap-3 rounded-2xl border border-transparent px-3 py-3 transition-colors hover:border-[var(--color-app-panel-border)] hover:bg-[var(--color-app-panel-hover)]"
								>
									<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${styles.badge}`}>
										<Icon className={`h-4 w-4 ${styles.icon}`} />
									</div>

									<div className="min-w-0 flex-1">
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="text-sm font-semibold text-[var(--color-base-text)]">{item.title}</p>
												<p className="mt-0.5 text-xs text-[var(--color-base-text)]/62">{item.message}</p>
											</div>

											<span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
										</div>

										<div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[var(--color-base-text)]/45">
											<Clock3 className="h-3 w-3" />
											<span>{item.time}</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-base-bg)] text-[var(--color-base-text)]/45">
							<Bell className="h-5 w-5" />
						</div>
						<p className="text-sm font-semibold text-[var(--color-base-text)]">Sin notificaciones</p>
						<p className="text-xs text-[var(--color-base-text)]/55">Aquí verás alertas de stock bajo y productos agotados.</p>
					</div>
				)}
			</ScrollArea>
		</div>
	);
}

