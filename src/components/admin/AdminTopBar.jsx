export default function AdminTopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 py-4 shadow-sm glass-panel md:px-16">
      <div className="flex items-center gap-4">
        <button className="material-symbols-outlined text-primary md:hidden" type="button">menu</button>
        <div className="hidden w-96 items-center rounded-full border border-outline-variant/50 bg-surface-container px-4 py-2 transition-all focus-within:ring-2 focus-within:ring-primary/20 md:flex">
          <span className="material-symbols-outlined text-outline">search</span>
          <input className="ml-2 w-full border-none bg-transparent text-body-md focus:ring-0" placeholder="Buscar pedidos, productos..." type="text" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex gap-4">
          <button className="relative text-on-surface-variant transition-colors hover:text-primary" type="button">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-error"></span>
          </button>
          <button className="text-on-surface-variant transition-colors hover:text-primary" type="button">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>

        <div className="flex items-center gap-3 border-l border-outline-variant/50 pl-4">
          <div className="hidden text-right sm:block">
            <p className="text-label-md font-bold leading-none text-primary">Admin NovaxClean</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-on-surface-variant">Super User</p>
          </div>
          <img
            alt="Avatar"
            className="h-10 w-10 rounded-full border-2 border-primary-container"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDggHlEKI9-BAayU1IMtm4itoyS8PkdZy58CXdhpwhZpYUs8D4fye14Dag42sn-5ZF1176u2sgE2UzoXiYtC2om9xsn3Pf7xKfUiS7ASFbiZNagl5drU2fbnjfFZ3W5Y4GfXC1XVZLFDL3RMt4_DOAoE6BThi4_c9gOEc8pnzNtK6dSbGZt2HmQO-ZgmVpKpQjAI3JBO5QAAHVhyAAGMPN-KyYgbH45nWjAl_oE7SXU1i9BRlN-swa35AqgJVPugC7VjPscdA4v9CM"
          />
        </div>
      </div>
    </header>
  );
}
