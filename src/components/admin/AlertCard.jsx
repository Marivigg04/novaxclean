export default function AlertCard() {
	return (
		<section className="flex items-start gap-4 rounded-xl border border-error/20 bg-error-container/20 p-4">
			<span className="material-symbols-outlined text-error">warning</span>
			<div>
				<h4 className="text-label-md font-bold text-error">Alerta de Suministro</h4>
				<p className="text-[12px] text-on-error-container">Proveedor 'HydroClean' reporta retraso de 48h por huelga de transporte.</p>
			</div>
		</section>
	);
}
