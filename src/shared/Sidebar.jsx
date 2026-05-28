import {
  LogOut,
  Package,
  Settings2,
  ShoppingCart,
} from 'lucide-react'

const items = [
  { key: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { key: 'inventario', label: 'Inventario', icon: Package },
  { key: 'ajustes', label: 'Ajustes', icon: Settings2 },
  { key: 'cerrar-sesion', label: 'Cerrar sesión', icon: LogOut },
]

export default function Sidebar({ active = 'ventas', onSelect = () => {}, isOpen = false }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 h-screen w-72 shrink-0 transform flex-col overflow-hidden text-[var(--color-base-text)] shadow-2xl border-r border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] transition-transform duration-300 md:static md:z-auto md:flex md:h-auto md:min-h-0 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ fontFamily: 'Inter, sans-serif' }}
      aria-label="Sidebar de navegación"
    >
      <div className="flex h-20 items-center border-b border-[var(--color-app-panel-border)] px-5">
        <div>
          <h2 className="text-lg font-semibold leading-tight">Novaxclean</h2>
          <p className="text-sm text-[var(--color-base-text)]/65">Panel de control</p>
        </div>
      </div>

      <nav className="px-3 py-4 pb-6">
        {items.map((item) => {
          const isActive = active === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className="group relative mb-2 flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left transition-all duration-200 focus:outline-none"
              style={{
                backgroundColor: isActive ? 'color-mix(in srgb, var(--color-brand) 16%, transparent)' : 'transparent',
                color: isActive ? 'var(--color-base-text)' : 'color-mix(in srgb, var(--color-base-text) 72%, transparent)',
                boxShadow: isActive ? 'inset 0 0 0 1px var(--color-app-panel-border)' : 'none',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`absolute left-0 top-2 bottom-2 w-1 origin-center rounded-r-full bg-[var(--color-brand)] transition-all duration-200 ${
                  isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-100'
                }`}
              />
              <span className="relative z-10 flex-none text-[18px] transition-transform duration-200 group-hover:translate-x-0.5">
                <Icon className="h-5 w-5" />
              </span>
              <span className="relative z-10 flex-1 text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

    </aside>
  )
}
