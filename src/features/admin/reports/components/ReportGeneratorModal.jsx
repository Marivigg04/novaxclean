import { useEffect, useMemo, useState } from 'react';
import { BarChart3, ChevronDown, Download, FileDown, Filter, LayoutPanelTop, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

import ScrollArea from '@/shared/ScrollArea';
import productsSales from '@/features/admin/dashboard/data/productsSales.json';
import { inventoryProducts } from '@/features/admin/inventory/data/mockup';
import { materialRows } from '@/features/admin/materials/data/mockup';
import {
  assignSyntheticDate,
  createReportConfig,
  clampReportValue,
  formatCurrency,
  formatDate,
  formatShortDate,
  inventoryCategoryOptions,
  materialCategoryOptions,
  isDateWithinRange,
  reportFormats,
  reportPages,
  parseReportDate,
  reportPresetLabels,
} from '../data/reportData';

function clampPreviewItems(items, limit = 4) {
  return items.slice(0, limit);
}

function buildRangeLabel(startDate, endDate) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function getDateSpan(startDate, endDate) {
  const start = parseReportDate(startDate);
  const end = parseReportDate(endDate);
  const safeEnd = end.getTime() >= start.getTime() ? end : start;
  const totalDays = Math.max(1, Math.round((safeEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  return { start, end: safeEnd, totalDays };
}

function createTrendValues(totalDays, baseValue, accentValue) {
  return Array.from({ length: clampReportValue(Math.ceil(totalDays / 6), 4, 6) }, (_, index) => {
    const wave = Math.sin((index + 1) * 0.9) * 0.08;
    const scaled = baseValue + accentValue * (index / 6) + wave;

    return clampReportValue(scaled, 0.15, 0.98);
  });
}

function createTimelineLabels(startDate, endDate, points) {
  const start = parseReportDate(startDate);
  const end = parseReportDate(endDate);
  const count = Math.max(2, points);
  const span = Math.max(1, end.getTime() - start.getTime());

  return Array.from({ length: count }, (_, index) => {
    const ratio = count === 1 ? 0.5 : index / (count - 1);
    const date = new Date(start.getTime() + span * ratio);

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  });
}

function buildMunicipalityBreakdown(zones, totalDays, selectedCategories = []) {
  const municipalities = ['Chacao', 'Baruta', 'Libertador', 'Sucre', 'El Hatillo', 'Caracas Centro'];
  const selectedLabels = selectedCategories.length ? selectedCategories : municipalities;

  return selectedLabels.map((label, index) => {
    const source = zones[index % Math.max(1, zones.length)];
    const normalized = source?.soldTotal ?? 0;
    const modifier = 0.72 + (index * 0.07) + (totalDays % 5) * 0.015;

    return {
      id: `municipality-${label.toLowerCase().replace(/\s+/g, '-')}`,
      name: label,
      soldTotal: Math.round(normalized * modifier) || Math.round(100 + index * 25 + totalDays * 3),
    };
  });
}

function filterByDateRange(items, startDate, endDate) {
  return items.filter((item) => isDateWithinRange(item.reportDate, startDate, endDate));
}

function formatPercentage(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const prefix = safeValue > 0 ? '+' : '';

  return `${prefix}${safeValue.toFixed(1)}%`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildReportHtml(insights, config, reportTitle) {
  const activePageLabels = reportPages.filter((page) => config.pages[page.id]).map((page) => page.title).join(' · ');
  const salesRows = insights.sales.topProducts
    .map((product, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(product.name)}</td><td>${product.category ? escapeHtml(product.category) : 'Ventas'}</td><td>${product.soldTotal.toLocaleString('es-ES')}</td><td>${formatCurrency(product.revenue)}</td></tr>`)
    .join('');

  const municipalityRows = insights.sales.municipalityBreakdown
    .map((zone, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(zone.name)}</td><td>${zone.soldTotal.toLocaleString('es-ES')}</td></tr>`)
    .join('');

  const inventoryRows = insights.inventory.filteredProducts
    .slice(0, 12)
    .map((product, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(product.name)}</td><td>${escapeHtml(product.category)}</td><td>${product.stock}</td><td>${escapeHtml(product.status)}</td></tr>`)
    .join('');

  const materialRowsMarkup = insights.materials.filteredMaterials
    .slice(0, 12)
    .map((material, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(material.name)}</td><td>${escapeHtml(material.category)}</td><td>${material.stock} ${escapeHtml(material.unit)}</td><td>${escapeHtml(material.status)}</td></tr>`)
    .join('');

  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(reportTitle)}</title>
      <style>
        :root { color-scheme: light; }
        body { margin: 0; font-family: Arial, sans-serif; background: #f3f6fb; color: #10203a; }
        .sheet { max-width: 980px; margin: 24px auto; background: #fff; border: 1px solid #dbe3ee; border-radius: 20px; overflow: hidden; box-shadow: 0 22px 60px rgba(16,32,58,.12); }
        .header { padding: 28px 32px; background: linear-gradient(135deg, #10203a, #28476f); color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 8px 0 0; opacity: .86; }
        .meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
        .badge { border: 1px solid rgba(255,255,255,.2); border-radius: 999px; padding: 8px 12px; font-size: 12px; }
        .content { padding: 28px 32px 34px; }
        .section { margin-bottom: 22px; }
        .section h2 { margin: 0 0 10px; font-size: 18px; }
        .cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .card { border: 1px solid #dbe3ee; border-radius: 16px; padding: 14px; background: #f8fbff; }
        .card p { margin: 0; font-size: 12px; color: #5c6f88; text-transform: uppercase; letter-spacing: .08em; }
        .card strong { display: block; margin-top: 6px; font-size: 18px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border-bottom: 1px solid #e6edf5; padding: 10px 8px; text-align: left; font-size: 13px; }
        th { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #6b7b92; }
        .two-col { display: grid; grid-template-columns: 1.1fr .9fr; gap: 16px; }
        .panel { border: 1px solid #dbe3ee; border-radius: 18px; padding: 16px; }
        @media print { body { background: white; } .sheet { margin: 0; border: 0; border-radius: 0; box-shadow: none; } }
      </style>
    </head>
    <body>
      <div class="sheet">
        <div class="header">
          <h1>${escapeHtml(reportTitle)}</h1>
          <p>Reporte corporativo de Novaxclean</p>
          <div class="meta">
            <span class="badge">Rango: ${buildRangeLabel(config.startDate, config.endDate)}</span>
            <span class="badge">Formato: ${escapeHtml(reportFormats.find((item) => item.value === config.format)?.label ?? 'PDF Profesional')}</span>
            <span class="badge">Secciones: ${escapeHtml(activePageLabels || 'Ninguna')}</span>
          </div>
        </div>
        <div class="content">
          <div class="section">
            <h2>Resumen ejecutivo</h2>
            <div class="cards">
              <div class="card"><p>Ingresos</p><strong>${formatCurrency(insights.sales.totalRevenue)}</strong></div>
              <div class="card"><p>Unidades vendidas</p><strong>${insights.sales.totalUnits.toLocaleString('es-ES')}</strong></div>
              <div class="card"><p>Productos activos</p><strong>${insights.inventory.totalProducts}</strong></div>
              <div class="card"><p>Alertas críticas</p><strong>${insights.materials.criticalCount + insights.inventory.lowStock + insights.inventory.outOfStock}</strong></div>
            </div>
          </div>
          <div class="section two-col">
            <div class="panel">
              <h2>Tendencia de ingresos</h2>
              <p style="margin:0 0 12px;color:#5c6f88;">Variación ${formatPercentage(insights.sales.growth)} con ${insights.sales.trendLabels.length} puntos de control.</p>
              <table>
                <thead><tr><th>Punto</th><th>Etiqueta</th><th>Valor</th></tr></thead>
                <tbody>
                  ${insights.sales.trendValues.map((value, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(insights.sales.trendLabels[index] ?? `P${index + 1}`)}</td><td>${Math.round(value * 100)}%</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
            <div class="panel">
              <h2>Municipios</h2>
              <table>
                <thead><tr><th>#</th><th>Municipio</th><th>Ventas</th></tr></thead>
                <tbody>${municipalityRows}</tbody>
              </table>
            </div>
          </div>
          <div class="section two-col">
            <div class="panel">
              <h2>Top productos</h2>
              <table>
                <thead><tr><th>#</th><th>Producto</th><th>Categoría</th><th>Unidades</th><th>Ingresos</th></tr></thead>
                <tbody>${salesRows}</tbody>
              </table>
            </div>
            <div class="panel">
              <h2>Inventario incluido</h2>
              <table>
                <thead><tr><th>#</th><th>Producto</th><th>Categoría</th><th>Stock</th><th>Estado</th></tr></thead>
                <tbody>${inventoryRows}</tbody>
              </table>
            </div>
          </div>
          <div class="section panel">
            <h2>Materia prima incluida</h2>
            <table>
              <thead><tr><th>#</th><th>Insumo</th><th>Categoría</th><th>Stock</th><th>Estado</th></tr></thead>
              <tbody>${materialRowsMarkup}</tbody>
            </table>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

function buildReportCsv(insights, config, reportTitle) {
  const lines = [];
  lines.push(['Reporte', reportTitle].join(','));
  lines.push(['Rango', buildRangeLabel(config.startDate, config.endDate)].join(','));
  lines.push(['Formato', reportFormats.find((item) => item.value === config.format)?.label ?? 'Excel/CSV'].join(','));
  lines.push('');
  lines.push(['Resumen', 'Valor'].join(','));
  lines.push(['Ingresos', formatCurrency(insights.sales.totalRevenue)].join(','));
  lines.push(['Unidades vendidas', insights.sales.totalUnits.toLocaleString('es-ES')].join(','));
  lines.push(['Productos activos', String(insights.inventory.totalProducts)].join(','));
  lines.push(['Alertas críticas', String(insights.materials.criticalCount + insights.inventory.lowStock + insights.inventory.outOfStock)].join(','));
  lines.push('');
  lines.push(['Top productos', 'Categoría', 'Unidades', 'Ingresos'].join(','));
  insights.sales.topProducts.forEach((product) => {
    lines.push([product.name, product.category ?? 'Ventas', product.soldTotal.toLocaleString('es-ES'), formatCurrency(product.revenue)].join(','));
  });
  lines.push('');
  lines.push(['Municipio', 'Ventas'].join(','));
  insights.sales.municipalityBreakdown.forEach((zone) => {
    lines.push([zone.name, zone.soldTotal.toLocaleString('es-ES')].join(','));
  });
  lines.push('');
  lines.push(['Inventario', 'Estado', 'Stock'].join(','));
  insights.inventory.filteredProducts.slice(0, 20).forEach((product) => {
    lines.push([product.name, product.status, String(product.stock)].join(','));
  });
  lines.push('');
  lines.push(['Materia prima', 'Estado', 'Stock'].join(','));
  insights.materials.filteredMaterials.slice(0, 20).forEach((material) => {
    lines.push([material.name, material.status, String(material.stock)].join(','));
  });

  return `${lines.join('\n')}\n`;
}

function MiniSparkline({ values = [] }) {
  const points = values.length
    ? values.map((value, index) => `${12 + index * 26},${44 - value * 24}`).join(' ')
    : '12,36 38,30 64,24 90,20 116,16';

  const pathPoints = points
    .split(' ')
    .map((point) => `L ${point}`)
    .join(' ');

  return (
    <svg viewBox="0 0 140 52" className="h-14 w-full text-[var(--color-brand)]">
      <defs>
        <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <path d={`M 12 44 ${pathPoints} L 116 44 Z`} fill="url(#sparkGradient)" opacity="0.9" />
    </svg>
  );
}

function PageCard({ number, title, description, children, variant = 'compact' }) {
  const spacing = variant === 'full' ? 'p-4 sm:p-6' : 'p-3 sm:p-4';
  const titleSize = variant === 'full' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg';

  return (
    <article className={`rounded-[28px] border border-[var(--color-app-panel-border)] bg-[linear-gradient(180deg,var(--color-base-surface)_0%,rgba(255,255,255,0.75)_100%)] shadow-[0_20px_55px_-38px_rgba(16,32,58,0.8)] ${spacing}`}>
      <div className="flex flex-col gap-3 pb-4 border-b border-[var(--color-app-panel-border)] sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-base-text)]/50">Novaxclean</p>
          <h3 className={`mt-1 font-semibold text-[var(--color-base-text)] ${titleSize}`}>{title}</h3>
          <p className="mt-1 text-xs sm:text-sm text-[var(--color-base-text)]/60">{description}</p>
        </div>

        <div className="self-start rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-3 py-1.5 text-left shrink-0 sm:self-auto sm:py-2 sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/45">{number}</p>
          <p className="mt-0.5 text-[10px] sm:text-xs text-[var(--color-base-text)]/62">Reporte corporativo</p>
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </article>
  );
}

function SummaryPill({ label, value, tone = 'default' }) {
  const toneClasses = {
    default: 'border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)]',
    success: 'border-emerald-500/15 bg-emerald-500/8',
    warning: 'border-amber-500/15 bg-amber-500/8',
    danger: 'border-rose-500/15 bg-rose-500/8',
  };

  return (
    <div className={`rounded-2xl border px-3 py-3 ${toneClasses[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-base-text)]/50">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--color-base-text)]">{value}</p>
    </div>
  );
}

function SectionToggle({ checked, onChange, label, description }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${checked ? 'border-[var(--color-brand)]/35 bg-[color-mix(in_srgb,var(--color-brand)_8%,transparent)]' : 'border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] hover:bg-[var(--color-app-panel-hover)]'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-[var(--color-app-panel-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
      />
      <span>
        <span className="block text-sm font-semibold text-[var(--color-base-text)]">{label}</span>
        <span className="mt-0.5 block text-xs text-[var(--color-base-text)]/60">{description}</span>
      </span>
    </label>
  );
}

function Accordion({ title, description, open, onToggle, children, icon: Icon }) {
  return (
    <section className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-[0_12px_32px_-26px_rgba(16,32,58,0.65)]">
      <button type="button" onClick={onToggle} className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-base-bg)] text-[var(--color-brand)]">
            <Icon className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-[var(--color-base-text)]">{title}</span>
            <span className="mt-1 block text-xs text-[var(--color-base-text)]/58">{description}</span>
          </span>
        </div>

        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-[var(--color-base-text)]/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden border-t border-[var(--color-app-panel-border)] px-5 py-5">{children}</div>
      </div>
    </section>
  );
}

function PreviewPage({ pageId, config, insights, variant = 'compact' }) {
  const pagePadding = variant === 'full' ? 'gap-4' : 'gap-3';

  if (pageId === 'summary') {
    return (
      <div className={`grid ${pagePadding}`}>
        <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
          <SummaryPill label="Ingresos" value={formatCurrency(insights.sales.totalRevenue)} tone="success" />
          <SummaryPill label="Unidades vendidas" value={insights.sales.totalUnits.toLocaleString('es-ES')} />
          <SummaryPill label="Productos activos" value={`${insights.inventory.totalProducts}`} />
          <SummaryPill label="Alertas críticas" value={`${insights.materials.criticalCount + insights.inventory.lowStock + insights.inventory.outOfStock}`} tone="warning" />
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/50">Resumen operativo</p>
                <h4 className="mt-1 text-sm font-semibold text-[var(--color-base-text)]">KPI consolidado de la compañía</h4>
              </div>
              <span className="rounded-full border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-base-text)]/70">
                {formatShortDate(config.startDate)} - {formatShortDate(config.endDate)}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
              <div className="rounded-2xl bg-[var(--color-base-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">Ventas</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-base-text)]">{formatPercentage(insights.sales.growth)}</p>
                <p className="mt-1 text-sm text-[var(--color-base-text)]/62">Crecimiento frente al universo de referencia</p>
              </div>

              <div className="rounded-2xl bg-[var(--color-base-surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">Ticket promedio</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-base-text)]">{formatCurrency(insights.sales.averageTicket)}</p>
                <p className="mt-1 text-sm text-[var(--color-base-text)]/62">Valor medio por pedido en el rango</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/50">Secciones activas</p>
            <div className="mt-3 space-y-2 text-sm text-[var(--color-base-text)]/75">
              {reportPages.filter((page) => config.pages[page.id]).map((page) => (
                <div key={page.id} className="flex items-center justify-between rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-2">
                  <span>{page.title}</span>
                  <span className="text-xs text-[var(--color-base-text)]/55">OK</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageId === 'sales') {
    const showTrend = config.salesMetrics.revenueTrend;
    const showTopProducts = config.salesMetrics.topProducts;
    const showMap = config.salesMetrics.municipalityMap;

    return (
      <div className={`grid ${pagePadding}`}>
        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          {showTrend ? (
            <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/50">Ingresos</p>
                  <h4 className="mt-1 text-sm font-semibold text-[var(--color-base-text)]">Tendencia de ingresos y variación</h4>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">{formatPercentage(insights.sales.growth)}</span>
              </div>

              <div className="mt-4 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-3">
                <MiniSparkline values={insights.sales.trendValues} />
                <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-[var(--color-base-text)]/60">
                  {insights.sales.trendLabels.map((label) => (
                    <div key={label} className="rounded-xl bg-[var(--color-base-bg)] px-2 py-2 text-center font-medium">{label}</div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {showMap ? (
            <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/50">Filtros activos</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[color-mix(in_srgb,var(--color-brand)_10%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--color-brand)]">{insights.sales.municipalityBreakdown.length} municipios</span>
                <span className="rounded-full bg-[color-mix(in_srgb,var(--color-brand)_10%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--color-brand)]">{insights.sales.topProducts.length} productos</span>
              </div>

              <div className="mt-4 space-y-2">
                {insights.sales.municipalityBreakdown.map((zone, index) => (
                  <div key={zone.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-2.5">
                    <span className="text-sm text-[var(--color-base-text)]">{index + 1}. {zone.name}</span>
                    <span className="text-sm font-semibold text-[var(--color-base-text)]">{zone.soldTotal.toLocaleString('es-ES')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {showTopProducts ? (
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/50">Top 5 productos</p>
              <div className="mt-3 space-y-3">
                {insights.sales.topProducts.map((product, index) => (
                  <div key={product.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[var(--color-base-text)]">{index + 1}. {product.name}</span>
                      <span className="text-[var(--color-base-text)]/65">{product.soldTotal.toLocaleString('es-ES')} uds.</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-app-panel-hover)]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[color-mix(in_srgb,var(--color-brand)_58%,white)]" style={{ width: `${Math.max(18, 100 - index * 14)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-app-panel-surface)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/50">Mapa por municipio</p>
              <div className="mt-3 space-y-2">
                {insights.sales.municipalityBreakdown.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between rounded-2xl bg-[var(--color-base-bg)] px-3 py-2.5">
                    <span className="text-sm text-[var(--color-base-text)]">{zone.name}</span>
                    <span className="text-sm font-semibold text-[var(--color-base-text)]">{zone.soldTotal.toLocaleString('es-ES')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (pageId === 'inventory') {
    const activeProducts = insights.inventory.filteredProducts;
    const visibleProducts = config.inventoryFilters.includeFullStock ? activeProducts : activeProducts.filter((product) => product.status !== 'En stock');

    return (
      <div className={`grid ${pagePadding}`}>
        <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
          <SummaryPill label="Productos" value={`${insights.inventory.totalProducts}`} />
          <SummaryPill label="En stock" value={`${insights.inventory.inStock}`} tone="success" />
          <SummaryPill label="Stock bajo" value={`${insights.inventory.lowStock}`} tone="warning" />
          <SummaryPill label="Agotados" value={`${insights.inventory.outOfStock}`} tone="danger" />
        </div>

        <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/50">Filtro aplicado</p>
              <h4 className="mt-1 text-sm font-semibold text-[var(--color-base-text)]">Productos terminados incluidos en el reporte</h4>
            </div>

            <span className="rounded-full border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-base-text)]/65">{visibleProducts.length} ítems</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
            {clampPreviewItems(visibleProducts).map((product) => (
              <div key={product.sku} className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4">
                <p className="text-sm font-semibold text-[var(--color-base-text)] truncate">{product.name}</p>
                <p className="mt-1 text-xs text-[var(--color-base-text)]/58">SKU {product.sku}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-[var(--color-base-text)]/65">Stock</span>
                  <span className="font-semibold text-[var(--color-base-text)]">{product.stock}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-app-panel-hover)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[color-mix(in_srgb,var(--color-brand)_58%,white)]"
                    style={{ width: `${Math.min(100, Math.max(12, (product.stock / Math.max(product.minimum, 1)) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeMaterials = insights.materials.filteredMaterials;
  const visibleMaterials = config.materialFilters.includeFullStock ? activeMaterials : activeMaterials.filter((material) => material.status !== 'En stock');

  return (
    <div className={`grid ${pagePadding}`}>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <SummaryPill label="Insumos" value={`${insights.materials.totalMaterials}`} />
        <SummaryPill label="Críticos" value={`${insights.materials.criticalCount}`} tone="warning" />
        <SummaryPill label="Proveedores" value={`${insights.materials.totalSuppliers}`} tone="success" />
      </div>

      <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/50">Materia prima</p>
            <h4 className="mt-1 text-sm font-semibold text-[var(--color-base-text)]">Insumos incluidos en el reporte</h4>
          </div>

          <span className="rounded-full border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-base-text)]/65">{visibleMaterials.length} ítems</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          {clampPreviewItems(visibleMaterials).map((material) => (
            <div key={material.sku} className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-base-text)] truncate">{material.name}</p>
                  <p className="mt-1 text-xs text-[var(--color-base-text)]/58 truncate">{material.category}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] shrink-0 ${material.status === 'En stock' ? 'bg-emerald-500/10 text-emerald-600' : material.status === 'Stock bajo' ? 'bg-amber-500/12 text-amber-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {material.status === 'Stock bajo' ? 'Bajo' : material.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--color-base-text)]/70">{material.stock} / {material.minimum} {material.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FullPreviewModal({ isOpen = false, onClose = () => {}, config, visiblePages, reportTitle, reportInsights }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/65 p-0 backdrop-blur-md sm:p-4">
      <button type="button" className="fixed inset-0 h-full w-full" aria-label="Cerrar vista previa" onClick={onClose} />

      <div className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-[var(--color-base-bg)] sm:h-[92vh] sm:rounded-[32px] sm:border sm:border-[var(--color-app-panel-border)] sm:shadow-[0_24px_70px_-35px_rgba(16,32,58,0.9)]">
        <div className="flex items-center justify-between border-b border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-base-text)]/50">Vista previa completa</p>
            <h3 className="mt-1 text-lg sm:text-xl font-semibold text-[var(--color-base-text)]">{reportTitle}</h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--color-base-text)]/60">{buildRangeLabel(config.startDate, config.endDate)} · {reportFormats.find((item) => item.value === config.format)?.label}</p>
          </div>

          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--color-base-text)]/60 transition-colors hover:bg-[var(--color-app-panel-hover)] hover:text-[var(--color-base-text)]" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 px-4 py-5 sm:px-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
            {visiblePages.map((page) => (
              <PageCard
                key={page.id}
                number={`${page.number} de ${visiblePages.length}`}
                title={page.title}
                description={page.description}
                variant="full"
              >
                <PreviewPage pageId={page.id} config={config} insights={reportInsights} variant="full" />
              </PageCard>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default function ReportGeneratorModal({ isOpen = false, onClose = () => {}, preset = 'sales' }) {
  const [config, setConfig] = useState(() => createReportConfig(preset));
  const [openSections, setOpenSections] = useState({
    general: true,
    pages: true,
    sales: true,
    inventory: true,
  });
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'preview'
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timeoutId;
    let closingTimeoutId;

    if (isOpen) {
      const renderTimeout = setTimeout(() => {
        setIsRendered(true);
        setIsClosing(false);
      }, 0);
      return () => clearTimeout(renderTimeout);
    }

    if (isRendered) {
      closingTimeoutId = setTimeout(() => {
        setIsClosing(true);
      }, 0);
      timeoutId = window.setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 240);
    }

    return () => {
      if (closingTimeoutId) clearTimeout(closingTimeoutId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isOpen, isRendered]);

  useEffect(() => {
    if (!isOpen) {
      const resetTimeout = setTimeout(() => {
        setConfig(createReportConfig(preset));
        setOpenSections({
          general: true,
          pages: true,
          sales: true,
          inventory: true,
        });
        setIsFullPreviewOpen(false);
        setIsGenerating(false);
        setStatusMessage('');
        setActiveTab('config');
      }, 0);
      return () => clearTimeout(resetTimeout);
    }

    const initTimeout = setTimeout(() => {
      setConfig(createReportConfig(preset));
      setActiveTab('config');
    }, 0);
    return () => clearTimeout(initTimeout);
  }, [isOpen, preset]);

  const visiblePages = useMemo(() => reportPages.filter((page) => config.pages[page.id]), [config.pages]);
  const reportTitle = reportPresetLabels[preset] ?? reportPresetLabels.sales;

  const salesTimeline = useMemo(() => {
    return productsSales.products.map((item, index) => ({
      ...item,
      reportDate: assignSyntheticDate(index, productsSales.products.length),
    }));
  }, []);

  const zoneTimeline = useMemo(() => {
    return productsSales.zones.map((item, index) => ({
      ...item,
      reportDate: assignSyntheticDate(index, productsSales.zones.length),
    }));
  }, []);

  const inventoryTimeline = useMemo(() => {
    return inventoryProducts.map((item, index) => ({
      ...item,
      reportDate: assignSyntheticDate(index, inventoryProducts.length),
    }));
  }, []);

  const materialTimeline = useMemo(() => {
    return materialRows.map((item, index) => ({
      ...item,
      reportDate: assignSyntheticDate(index, materialRows.length),
    }));
  }, []);

  const reportInsights = useMemo(() => {
    const dateSpan = getDateSpan(config.startDate, config.endDate);
    const selectedSalesRows = filterByDateRange(salesTimeline, dateSpan.start, dateSpan.end);
    const selectedZones = filterByDateRange(zoneTimeline, dateSpan.start, dateSpan.end);
    const selectedInventory = filterByDateRange(inventoryTimeline, dateSpan.start, dateSpan.end);
    const selectedMaterials = filterByDateRange(materialTimeline, dateSpan.start, dateSpan.end);

    const selectedSalesRevenue = selectedSalesRows.reduce((sum, item) => sum + item.revenue, 0);
    const selectedSalesUnits = selectedSalesRows.reduce((sum, item) => sum + item.soldTotal, 0);
    const salesGrowth = salesTimeline.length ? ((selectedSalesRevenue / salesTimeline.reduce((sum, item) => sum + item.revenue, 0)) - 1) * 100 : 0;
    const salesAverageTicket = selectedSalesUnits ? selectedSalesRevenue / selectedSalesUnits : 0;
    const salesTopProductsLimit = clampReportValue(Math.ceil(dateSpan.totalDays / 7), 3, 5);
    const salesTrendValues = createTrendValues(dateSpan.totalDays, 0.45, clampReportValue(dateSpan.totalDays / 35, 0.1, 0.45));
    const trendLabels = createTimelineLabels(config.startDate, config.endDate, salesTrendValues.length);

    const filteredSalesProducts = config.salesMetrics.topProducts
      ? [...selectedSalesRows]
          .sort((a, b) => b.soldTotal - a.soldTotal)
          .slice(0, salesTopProductsLimit)
      : [];

    const municipalityBreakdown = config.salesMetrics.municipalityMap
      ? buildMunicipalityBreakdown(
          [...selectedZones].sort((a, b) => b.soldTotal - a.soldTotal),
          dateSpan.totalDays,
          ['Chacao', 'Baruta', 'Libertador', 'Sucre', 'El Hatillo', 'Caracas Centro'],
        )
      : [];

    const filteredInventoryProducts = selectedInventory.filter((product) => {
      const matchesCategory = config.inventoryFilters.categories.length ? config.inventoryFilters.categories.includes(product.category) : true;
      const matchesCritical = config.inventoryFilters.criticalOnly ? product.status !== 'En stock' : true;
      return matchesCategory && matchesCritical;
    });

    const filteredMaterials = selectedMaterials.filter((material) => {
      const matchesCategory = config.materialFilters.categories.length ? config.materialFilters.categories.includes(material.category) : true;
      const matchesCritical = config.materialFilters.criticalOnly ? material.status !== 'En stock' : true;
      return matchesCategory && matchesCritical;
    });

    const inventoryBase = selectedInventory.length ? selectedInventory : inventoryTimeline;
    const materialsBase = selectedMaterials.length ? selectedMaterials : materialTimeline;

    const inventoryData = {
      totalProducts: inventoryBase.length,
      inStock: inventoryBase.filter((item) => item.status === 'En stock').length,
      lowStock: inventoryBase.filter((item) => item.status === 'Stock bajo').length,
      outOfStock: inventoryBase.filter((item) => item.status === 'Agotado').length,
      filteredProducts: filteredInventoryProducts,
    };

    const materialsData = {
      totalMaterials: materialsBase.length,
      criticalCount: materialsBase.filter((item) => item.status !== 'En stock').length,
      totalSuppliers: new Set(materialsBase.map((item) => item.supplier)).size,
      filteredMaterials,
    };

    return {
      dateSpan,
      sales: {
        totalRevenue: selectedSalesRevenue,
        totalUnits: selectedSalesUnits,
        averageTicket: salesAverageTicket,
        growth: salesGrowth,
        trendValues: salesTrendValues,
        trendLabels,
        topProducts: filteredSalesProducts,
        municipalityBreakdown,
      },
      inventory: inventoryData,
      materials: materialsData,
    };
  }, [config, inventoryTimeline, materialTimeline, salesTimeline, zoneTimeline]);

  const togglePage = (pageId, checked) => {
    setConfig((current) => ({
      ...current,
      pages: {
        ...current.pages,
        [pageId]: checked,
      },
    }));
  };

  const toggleCategory = (section, value, checked) => {
    setConfig((current) => {
      const currentValues = current[section].categories;
      const nextValues = checked ? [...currentValues, value] : currentValues.filter((item) => item !== value);

      return {
        ...current,
        [section]: {
          ...current[section],
          categories: nextValues,
        },
      };
    });
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setStatusMessage('Preparando el reporte para descarga...');

    const reportFormat = reportFormats.find((item) => item.value === config.format)?.value ?? 'pdf';
    const fileNameBase = `${reportTitle.replace(/\s+/g, '-').toLowerCase()}-${config.startDate}-a-${config.endDate}`;

    try {
      if (reportFormat === 'excel') {
        const csvContent = buildReportCsv(reportInsights, config, reportTitle);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileNameBase}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setStatusMessage('Reporte CSV generado correctamente.');
      } else {
        const printFrame = document.createElement('iframe');
        printFrame.setAttribute('title', 'Vista previa de impresión del reporte');
        printFrame.setAttribute('aria-hidden', 'true');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '1px';
        printFrame.style.height = '1px';
        printFrame.style.border = '0';
        printFrame.style.opacity = '0';
        printFrame.style.pointerEvents = 'none';

        const cleanup = () => {
          if (printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame);
          }
        };

        printFrame.onload = () => {
          const printWindow = printFrame.contentWindow;

          if (!printWindow) {
            cleanup();
            throw new Error('No se pudo preparar la vista de impresión.');
          }

          printWindow.addEventListener('afterprint', cleanup, { once: true });
          printWindow.focus();
          printWindow.print();
          window.setTimeout(cleanup, 1500);
        };

        printFrame.srcdoc = buildReportHtml(reportInsights, config, reportTitle);
        document.body.appendChild(printFrame);
        setStatusMessage('Vista lista para imprimir o guardar como PDF.');
      }
    } catch (error) {
      console.error(error);
      setStatusMessage('No se pudo generar el reporte. Intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isRendered) return null;

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm sm:p-4 ${isClosing ? 'cart-modal-overlay-exit' : 'cart-modal-overlay-enter'}`} role="dialog" aria-modal="true" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`relative z-10 flex h-full w-full flex-col overflow-hidden bg-[var(--color-base-bg)] sm:h-[94vh] sm:max-w-[1660px] sm:rounded-[32px] sm:border sm:border-[var(--color-app-panel-border)] sm:shadow-[0_24px_70px_-35px_rgba(16,32,58,0.9)] ${isClosing ? 'cart-modal-panel-exit' : 'cart-modal-panel-enter'}`}>
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-base-text)]/50">Generación de reportes</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-[var(--color-base-text)]">{reportTitle}</h2>
            <p className="mt-1 text-sm text-[var(--color-base-text)]/60 hidden sm:block">Diseño corporativo, secciones activas y previsualización en tiempo real.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)] text-white shadow-sm transition-transform active:scale-95 disabled:cursor-wait disabled:opacity-70"
              title="Generar y Descargar Reporte"
            >
              {isGenerating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> : <Download className="h-4 w-4" />}
            </button>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--color-base-text)]/60 transition-colors hover:bg-[var(--color-app-panel-hover)] hover:text-[var(--color-base-text)]" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="flex border-b border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] lg:hidden shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all ${activeTab === 'config' ? 'border-[var(--color-brand)] text-[var(--color-brand)] bg-[color-mix(in_srgb,var(--color-brand)_4%,transparent)]' : 'border-transparent text-[var(--color-base-text)]/60 hover:text-[var(--color-base-text)]'}`}
          >
            Configuración
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-3 text-center text-sm font-semibold border-b-2 transition-all ${activeTab === 'preview' ? 'border-[var(--color-brand)] text-[var(--color-brand)] bg-[color-mix(in_srgb,var(--color-brand)_4%,transparent)]' : 'border-transparent text-[var(--color-base-text)]/60 hover:text-[var(--color-base-text)]'}`}
          >
            Vista Previa ({visiblePages.length})
          </button>
        </div>

        <div className="grid flex-1 min-h-0 gap-0 lg:grid-cols-[420px_minmax(0,1fr)]">
          <aside className={`min-h-0 border-b border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] lg:border-b-0 lg:border-r ${activeTab === 'config' ? 'block h-full' : 'hidden lg:block'}`}>
            <ScrollArea className="h-full px-4 py-4 sm:px-5">
              <div className="space-y-4 pb-5">
                <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-brand)_12%,transparent)] text-[var(--color-brand)]">
                      <LayoutPanelTop className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/45">Estado actual</p>
                      <p className="mt-1 text-sm text-[var(--color-base-text)]/72">{visiblePages.length} páginas activas · {reportFormats.find((item) => item.value === config.format)?.label}</p>
                    </div>
                  </div>

                  {statusMessage ? <p className="mt-3 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-2 text-sm text-[var(--color-base-text)]/72">{statusMessage}</p> : null}
                </div>

                <Accordion
                  title="Filtros generales"
                  description="Define el rango temporal y el formato del archivo."
                  open={openSections.general}
                  onToggle={() => setOpenSections((current) => ({ ...current, general: !current.general }))}
                  icon={Filter}
                >
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">Desde</span>
                        <input
                          type="date"
                          value={config.startDate}
                          onChange={(event) => setConfig((current) => ({ ...current, startDate: event.target.value }))}
                          className="w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-3 text-sm text-[var(--color-base-text)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">Hasta</span>
                        <input
                          type="date"
                          value={config.endDate}
                          onChange={(event) => setConfig((current) => ({ ...current, endDate: event.target.value }))}
                          className="w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-3 text-sm text-[var(--color-base-text)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
                        />
                      </label>
                    </div>

                    <div>
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">Formato</span>
                      <div className="grid grid-cols-2 gap-2">
                        {reportFormats.map((format) => {
                          const isSelected = config.format === format.value;

                          return (
                            <button
                              key={format.value}
                              type="button"
                              onClick={() => setConfig((current) => ({ ...current, format: format.value }))}
                              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${isSelected ? 'border-[var(--color-brand)] bg-[color-mix(in_srgb,var(--color-brand)_12%,transparent)] text-[var(--color-brand)] shadow-[0_12px_30px_-18px_rgba(16,32,58,0.5)]' : 'border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] text-[var(--color-base-text)]/72 hover:bg-[var(--color-app-panel-hover)]'}`}
                            >
                              {format.value === 'pdf' ? <FileDown className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                              {format.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Accordion>

                <Accordion
                  title="Páginas a incluir"
                  description="Activa o desactiva los bloques que formarán el documento final."
                  open={openSections.pages}
                  onToggle={() => setOpenSections((current) => ({ ...current, pages: !current.pages }))}
                  icon={PanelLeftOpen}
                >
                  <div className="space-y-3">
                    {reportPages.map((page) => (
                      <SectionToggle
                        key={page.id}
                        checked={config.pages[page.id]}
                        onChange={(checked) => togglePage(page.id, checked)}
                        label={`${page.number}: ${page.title}`}
                        description={page.description}
                      />
                    ))}
                  </div>
                </Accordion>

                <Accordion
                  title="Estadísticas de ventas"
                  description="Disponible cuando la página 2 está activa."
                  open={openSections.sales}
                  onToggle={() => setOpenSections((current) => ({ ...current, sales: !current.sales }))}
                  icon={BarChart3}
                >
                  <div className={`space-y-3 ${config.pages.sales ? '' : 'pointer-events-none opacity-50'}`}>
                    <SectionToggle
                      checked={config.salesMetrics.revenueTrend}
                      onChange={(checked) => setConfig((current) => ({ ...current, salesMetrics: { ...current.salesMetrics, revenueTrend: checked } }))}
                      label="Gráfico de Ingresos y Tendencias"
                      description="Incluye la evolución +12.4% del periodo."
                    />
                    <SectionToggle
                      checked={config.salesMetrics.topProducts}
                      onChange={(checked) => setConfig((current) => ({ ...current, salesMetrics: { ...current.salesMetrics, topProducts: checked } }))}
                      label="Top 5 productos más vendidos"
                      description="Tabla ejecutiva con ranking y barras de impacto."
                    />
                    <SectionToggle
                      checked={config.salesMetrics.municipalityMap}
                      onChange={(checked) => setConfig((current) => ({ ...current, salesMetrics: { ...current.salesMetrics, municipalityMap: checked } }))}
                      label="Mapa / desglose por municipio"
                      description="Chacao, Baruta, Centro y otras zonas comerciales."
                    />
                  </div>
                </Accordion>

                <Accordion
                  title="Inventario y materia prima"
                  description="Disponible cuando la página 3 o 4 está activa."
                  open={openSections.inventory}
                  onToggle={() => setOpenSections((current) => ({ ...current, inventory: !current.inventory }))}
                  icon={PanelLeftClose}
                >
                  <div className={`space-y-5 ${config.pages.inventory || config.pages.materials ? '' : 'pointer-events-none opacity-50'}`}>
                    <div className="space-y-3">
                      <SectionToggle
                        checked={config.inventoryFilters.includeFullStock}
                        onChange={(checked) => setConfig((current) => ({ ...current, inventoryFilters: { ...current.inventoryFilters, includeFullStock: checked } }))}
                        label="Incluir stock completo"
                        description="Muestra todos los productos terminados seleccionados."
                      />
                      <SectionToggle
                        checked={config.inventoryFilters.criticalOnly}
                        onChange={(checked) => setConfig((current) => ({ ...current, inventoryFilters: { ...current.inventoryFilters, criticalOnly: checked } }))}
                        label="Solo alertas críticas"
                        description="Stock bajo y agotados en productos terminados."
                      />
                    </div>

                    <div className="space-y-3 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">Categorías de inventario</p>
                        <p className="mt-1 text-xs text-[var(--color-base-text)]/58">Dejar vacío equivale a incluir todas las categorías.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {inventoryCategoryOptions.map((category) => {
                          const checked = config.inventoryFilters.categories.includes(category.value);

                          return (
                            <label key={category.value} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-2.5 text-sm text-[var(--color-base-text)]/78 transition-colors hover:bg-[var(--color-app-panel-hover)]">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => toggleCategory('inventoryFilters', category.value, event.target.checked)}
                                className="h-4 w-4 rounded border-[var(--color-app-panel-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                              />
                              <span>{category.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">Categorías de materia prima</p>
                        <p className="mt-1 text-xs text-[var(--color-base-text)]/58">Químicos, Envases, Tapas, Etiquetas y más.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {materialCategoryOptions.map((category) => {
                          const checked = config.materialFilters.categories.includes(category.value);

                          return (
                            <label key={category.value} className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-2.5 text-sm text-[var(--color-base-text)]/78 transition-colors hover:bg-[var(--color-app-panel-hover)]">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => toggleCategory('materialFilters', category.value, event.target.checked)}
                                className="h-4 w-4 rounded border-[var(--color-app-panel-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
                              />
                              <span>{category.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Accordion>

                <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/45">Acciones</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setIsFullPreviewOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-base-text)] transition-colors hover:bg-[var(--color-app-panel-hover)]"
                    >
                      <LayoutPanelTop className="h-4 w-4" />
                      Vista Previa Completa
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand)] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_28px_-14px_rgba(16,32,58,0.55)] transition-transform hover:scale-[0.99] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                    >
                      {isGenerating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> : <Download className="h-4 w-4" />}
                      Generar y Descargar Reporte
                    </button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>

          <section className={`min-h-0 bg-[radial-gradient(circle_at_top,_rgba(16,32,58,0.06),_transparent_34%),linear-gradient(180deg,var(--color-base-bg)_0%,rgba(255,255,255,0.68)_100%)] ${activeTab === 'preview' ? 'block h-full' : 'hidden lg:block'}`}>
            <ScrollArea className="h-full px-4 py-4 sm:px-5">
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pb-5">
                <div className="rounded-[28px] border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4 sm:p-5 shadow-[0_20px_55px_-42px_rgba(16,32,58,0.85)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-base-text)]/45">Previsualización estructurada</p>
                      <h3 className="mt-1 text-lg sm:text-xl font-semibold text-[var(--color-base-text)]">Reporte Novaxclean</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-[var(--color-base-text)]/60">
                      <span className="rounded-full border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-2.5 py-1">{buildRangeLabel(config.startDate, config.endDate)}</span>
                      <span className="rounded-full border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-2.5 py-1">{reportFormats.find((item) => item.value === config.format)?.label}</span>
                    </div>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-[var(--color-base-text)]/60">
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--color-brand)_12%,transparent)] px-2.5 py-1 font-semibold text-[var(--color-brand)]">{visiblePages.length} páginas activas</span>
                    <span className="rounded-full border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-2.5 py-1">Membrete corporativo</span>
                    <span className="rounded-full border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-2.5 py-1">Generación: {formatShortDate(config.endDate)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {reportPages.map((page) => {
                    const isVisible = config.pages[page.id];
                    const hiddenClass = isVisible ? 'max-h-[2000px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-3 pointer-events-none';

                    return (
                      <div key={page.id} className={`overflow-hidden transition-all duration-300 ease-out ${hiddenClass}`}>
                        <PageCard
                          number={`${page.number} de ${visiblePages.length || reportPages.length}`}
                          title={page.title}
                          description={page.description}
                          variant="full"
                        >
                          {isVisible ? <PreviewPage pageId={page.id} config={config} insights={reportInsights} variant="full" /> : null}
                        </PageCard>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </section>
        </div>
      </div>

      <FullPreviewModal
        isOpen={isFullPreviewOpen}
        onClose={() => setIsFullPreviewOpen(false)}
        config={config}
        visiblePages={visiblePages}
        reportTitle={reportTitle}
        reportInsights={reportInsights}
      />
    </div>
  );
}
