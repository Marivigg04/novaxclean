export default function FloatingActionButton() {
	return (
		<button className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-on-secondary shadow-lg transition-all hover:scale-105 active:scale-95 md:hidden" type="button">
			<span className="material-symbols-outlined">add</span>
		</button>
	);
}
