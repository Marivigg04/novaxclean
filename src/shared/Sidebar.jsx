import { useState, useEffect } from 'react'
import {
  FlaskConical,
  LogOut,
  Package,
  Settings2,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import logoAumc from '../assets/Logo AUMC.png'
import logoAumo from '../assets/Logo AUMO.png'

const items = [
  { key: 'ventas', label: 'Ventas', icon: ShoppingCart, to: '/admin', end: true },
  { key: 'inventario', label: 'Inventario', icon: Package, to: '/admin/inventory' },
  { key: 'materia-prima', label: 'Materia Prima', icon: FlaskConical, to: '/admin/raw-materials' },
  { key: 'ajustes', label: 'Ajustes', icon: Settings2, to: '/admin/settings' },
]

export default function Sidebar({ active = 'ventas', onSelect = () => {}, isOpen = false }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem('sidebarCollapsed')
      return raw === 'true'
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    // expose sidebar width as a CSS variable using pixels (exact values match w-28 / w-72)
    // w-28 = 7rem = 112px, w-72 = 18rem = 288px (assuming root font-size 16px)
    const width = collapsed ? '112px' : '288px'
    document.documentElement.style.setProperty('--sidebar-width', width)
  }, [collapsed])

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', collapsed ? 'true' : 'false')
    } catch (e) {
      // ignore write errors (e.g., private mode)
    }
  }, [collapsed])

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 h-screen ${collapsed ? 'w-72 md:w-28' : 'w-72'} shrink-0 transform flex-col overflow-hidden text-[var(--color-base-text)] shadow-2xl border-r border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] transition-all duration-300 md:static md:z-auto md:flex md:h-auto md:min-h-0 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ fontFamily: 'Inter, sans-serif' }}
      aria-label="Sidebar de navegación"
    >
      <div
        className="flex h-20 items-center border-b border-[var(--color-app-panel-border)] px-3"
        style={{
          backgroundColor: 'var(--color-base-surface)',
        }}
      >
        <div className="flex items-center gap-3">
          <img alt="Logo AUMC" src={logoAumc} className={`sidebar-logo-light rounded-xl object-cover transition-all duration-200 ${collapsed ? 'h-25 w-25 md:h-16 md:w-16' : 'h-25 w-25'}`} />
          <img alt="Logo AUMO" src={logoAumo} className={`sidebar-logo-dark rounded-xl object-cover transition-all duration-200 ${collapsed ? 'md:hidden h-25 w-25' : 'h-25 w-25'}`} />
          <div className={`transition-all duration-200 ${collapsed ? 'md:opacity-0 md:max-w-0 md:overflow-hidden' : ''}`}>
            <h2 className="text-lg font-semibold leading-tight">Novaxclean</h2>
            <p className="text-sm text-[var(--color-base-text)]/65">Panel de control</p>
          </div>
        </div>

        <button
          onClick={() => setCollapsed((s) => !s)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expandir' : 'Colapsar'}
          className="ml-auto rounded p-1 text-[var(--color-base-text)] hover:bg-[var(--color-app-panel-border)] hidden md:block"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="px-6 py-4 pb-6">
        {items.map((item) => {
          const isActive = active === item.key
          const Icon = item.icon
          // For navigation items with a `to` path use NavLink so routes are consistent.
          if (item.to) {
            return (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.end}
                onClick={() => onSelect(item.key)}
                title={item.label}
                className={({ isActive: navIsActive }) =>
                    `group relative mb-2 flex w-full items-center ${collapsed ? 'justify-start md:justify-center px-3 py-3 md:px-2 md:py-2 gap-3 md:gap-0' : 'gap-3 px-3 py-3'} overflow-hidden rounded-xl text-left transition-all duration-200 focus:outline-none ${
                      navIsActive ? 'bg-[color-mix(in_srgb,var(--color-brand)_16%,transparent)] text-[var(--color-base-text)]' : ''
                    }`
                  }
              >
                {({ isActive: navIsActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-2 bottom-2 w-1 origin-center rounded-r-full bg-[var(--color-brand)] transition-all duration-200 ${
                        navIsActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-100'
                      }`}
                    />

                    <span className={`relative z-10 flex-none text-[18px] transition-transform duration-200 group-hover:translate-x-0.5 ${collapsed ? 'md:mx-auto' : ''}`}>
                      <Icon className={collapsed ? 'h-6 w-6' : 'h-7 w-7'} />
                    </span>
                    <span className={`relative z-10 flex-1 text-sm font-medium transition-opacity duration-200 ${collapsed ? 'md:hidden' : ''}`}>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          }

          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              title={item.label}
              className={`group relative mb-2 flex w-full items-center ${collapsed ? 'justify-start md:justify-center px-3 py-3 md:px-2 md:py-2 gap-3 md:gap-0' : 'gap-3 px-3 py-3'} overflow-hidden rounded-xl text-left transition-all duration-200 focus:outline-none`}
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
              <span className={`relative z-10 flex-none text-[18px] transition-transform duration-200 group-hover:translate-x-0.5 ${collapsed ? 'md:mx-auto' : ''}`}>
                <Icon className={collapsed ? 'h-6 w-6' : 'h-5 w-5'} />
              </span>
              <span className={`relative z-10 flex-1 text-sm font-medium transition-opacity duration-200 ${collapsed ? 'md:hidden' : ''}`}>{item.label}</span>
            </button>
          )
        })}
      </nav>

    </aside>
  )
}
