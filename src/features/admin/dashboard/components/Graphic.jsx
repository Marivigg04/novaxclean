import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function formatNumber(value) {
  return new Intl.NumberFormat('es-ES').format(value)
}

// Creamos un Tooltip personalizado para que se vea premium con Tailwind
const CustomTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-2 text-xs text-[var(--color-base-text)] shadow-xl">
        <p className="mb-1 font-semibold">{payload[0].payload.name}</p>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--color-brand)]"></span>
          <span>{formatNumber(payload[0].value)} <span className="text-[var(--color-base-text)]/55">{currency}</span></span>
        </div>
      </div>
    )
  }
  return null
}

export default function Graphic({ data, sortOrder = 'desc' }) {
  const products = data?.products ?? []
  const period = data?.period ?? 'Periodo Actual'
  const currency = data?.currency ?? 'unidades'

  const chartData = useMemo(() => {
    const sorted = [...products].sort((a, b) => 
      sortOrder === 'asc' ? a.soldTotal - b.soldTotal : b.soldTotal - a.soldTotal
    )
    return sorted.slice(0, 5)
  }, [products, sortOrder])

  return (
    <section className="min-w-0 h-full w-full rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-8">
      
      {/* Cabecera */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand)]">
            {period}
          </span>
          <h2 className="text-2xl font-extrabold text-[var(--color-base-text)]">
            {sortOrder === 'asc' ? 'Productos menos vendidos' : 'Productos más vendidos'}
          </h2>
        </div>
        <div className="rounded-md bg-[var(--color-brand)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-brand)]">
          Top 5
        </div>
      </div>

      {/* Gráfico Recharts */}
      <div className="h-[430px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-app-line)" />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              interval={0}
              tick={{ fill: 'color-mix(in srgb, var(--color-base-text) 70%, transparent)', fontSize: 9, fontWeight: 500 }}
              tickFormatter={(value) => typeof value === 'string' && value.length > 18 ? `${value.substring(0, 18)}...` : value}
              angle={-20}
              textAnchor="end"
              height={50}
              dx={-4}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--color-base-text)', fontSize: 11 }}
              tickFormatter={(value) => formatNumber(value)}
            />
            
            <Tooltip 
              content={<CustomTooltip currency={currency} />} 
              cursor={{ fill: 'color-mix(in srgb, var(--color-brand) 8%, transparent)' }}
            />
            
            <Bar 
              dataKey="soldTotal" 
              fill="var(--color-brand)"
              radius={[6, 6, 0, 0]} // Bordes redondeados arriba
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}