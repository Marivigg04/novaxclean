import React from 'react'

export default function Card({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel,
  children,
  className = '',
}) {
  const isPositive = trend >= 0

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border border-[var(--color-app-panel-border)] p-5
        bg-[var(--color-base-surface)]
        shadow-lg transition-all duration-200
        hover:translate-y-[-6px]
        hover:border-[var(--color-app-line)]
        ${className}
      `}
    >
      {/* Top gradient accent */}
      <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-[var(--color-brand)] via-[var(--color-brand-light)] to-transparent opacity-70" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-[var(--color-base-text)]/70">
            {title}
          </p>

          <h3 className="text-3xl font-bold mt-1">
            <span className="bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand-light)] bg-clip-text text-transparent">{value}</span>
          </h3>
        </div>

        {Icon && (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--color-brand)]/15 text-[var(--color-brand)] ring-1 ring-[var(--color-brand)]/10">
            <Icon size={22} />
          </div>
        )}
      </div>

      {(trend !== undefined || description) && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--color-base-text)]/65">
            {description}
          </div>

          {trend !== undefined && (
            <div
              className={`text-sm font-medium px-2 py-1 rounded-md ${isPositive ? 'bg-[var(--color-status-positive)]/10' : 'bg-[var(--color-status-negative)]/10'}`}
              style={{ color: isPositive ? 'var(--color-status-positive)' : 'var(--color-status-negative)' }}
            >
              {isPositive ? '+' : ''}
              {trend}%
              {trendLabel && (
                <span className="ml-1 opacity-80">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  )
}