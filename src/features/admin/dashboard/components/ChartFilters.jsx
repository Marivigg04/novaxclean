import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowDownUp, Check } from 'lucide-react'

export default function ChartFilters({
  categories = [],
  selectedCategory = 'all',
  selectedSort = 'desc',
  onCategoryChange = () => {},
  onSortChange = () => {},
}) {
  // Estado para controlar si nuestro menú personalizado está abierto o cerrado
  const [isSortOpen, setIsSortOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Efecto para cerrar el menú si el usuario hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sortOptions = [
    { value: 'desc', label: 'Más vendidos' },
    { value: 'asc', label: 'Menos vendidos' },
  ]

  const currentSortLabel = sortOptions.find(opt => opt.value === selectedSort)?.label

  return (
    <div className="mb-6 rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            Filtros
          </p>
          <h3 className="text-base font-bold text-[var(--color-base-text)]">
            Categoría y Orden
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          
          {/* Segmented Control de Categorías */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[var(--color-app-line)] bg-[var(--color-base-bg)] p-1.5">
            <button
              type="button"
              onClick={() => onCategoryChange('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-[var(--color-base-surface)] text-[var(--color-brand)] shadow-sm border border-[var(--color-app-line)]'
                  : 'text-[var(--color-base-text)]/65 hover:text-[var(--color-base-text)] hover:bg-[var(--color-base-surface)]'
              }`}
            >
              Todos
            </button>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-[var(--color-base-surface)] text-[var(--color-brand)] shadow-sm border border-[var(--color-app-line)]'
                    : 'text-[var(--color-base-text)]/65 hover:text-[var(--color-base-text)] hover:bg-[var(--color-base-surface)]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="hidden h-8 w-px bg-[var(--color-app-line)] sm:block"></div>

          {/* MENÚ DESPLEGABLE PERSONALIZADO */}
          <div className="relative group w-full sm:w-auto" ref={dropdownRef}>
            
            {/* Botón que abre el menú */}
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`flex items-center justify-between w-full sm:w-[180px] bg-[var(--color-base-surface)] border text-sm font-medium rounded-xl pl-3 pr-3 py-2 transition-all shadow-sm
                ${isSortOpen 
                  ? 'border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 text-[var(--color-brand)]' 
                  : 'border-[var(--color-app-line)] text-[var(--color-base-text)]/75 hover:bg-[var(--color-base-bg)] hover:border-[var(--color-app-panel-border)]'
                }`}
            >
              <div className="flex items-center gap-2">
                <ArrowDownUp className={`h-4 w-4 ${isSortOpen ? 'text-[var(--color-brand)]' : 'text-[var(--color-base-text)]/45'}`} />
                <span>{currentSortLabel}</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isSortOpen ? 'rotate-180 text-[var(--color-brand)]' : 'text-[var(--color-base-text)]/45'}`} />
            </button>

            {/* Lista de opciones flotante */}
            {isSortOpen && (
              <div className="absolute z-50 top-full right-0 mt-2 w-full min-w-[180px] rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-top-2 duration-200">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value)
                      setIsSortOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors
                      ${selectedSort === option.value 
                        ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)] font-semibold' 
                        : 'text-[var(--color-base-text)]/70 hover:bg-[var(--color-base-bg)] hover:text-[var(--color-base-text)]'
                      }`}
                  >
                    {option.label}
                    {/* Icono de check para la opción seleccionada */}
                    {selectedSort === option.value && (
                      <Check className="h-4 w-4 text-[var(--color-brand)]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}