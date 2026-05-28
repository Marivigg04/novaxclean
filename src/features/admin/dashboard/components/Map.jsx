import { ResponsiveChoropleth } from '@nivo/geo'

import caracasGeoJson from '../data/caracas.json'
import municipalitySales from '../data/municipalitySales.json'

const mapFeatures = caracasGeoJson.features.map((feature) => {
  let fixedCoordinates = feature.geometry.coordinates;

  if (feature.geometry.type === 'Polygon') {
    fixedCoordinates = feature.geometry.coordinates.map(ring => [...ring].reverse());
  } else if (feature.geometry.type === 'MultiPolygon') {
    fixedCoordinates = feature.geometry.coordinates.map(polygon => 
      polygon.map(ring => [...ring].reverse())
    );
  }

  return {
    ...feature,
    id: feature.properties.NAME_2,
    geometry: {
      ...feature.geometry,
      coordinates: fixedCoordinates
    }
  }
})

function formatNumber(value) {
  return new Intl.NumberFormat('es-ES').format(value)
}

export default function Map({ data = municipalitySales }) {
  const municipalities = data?.municipalities ?? []
  const maxValue = Math.max(...municipalities.map((item) => item.value), 1)

  const sorted = [...municipalities].sort((a, b) => b.value - a.value)
  const topMunicipalities = sorted.slice(0, 2)
  const bottomMunicipalities = sorted.slice(-2)

  return (
    <section className="min-w-0 flex h-full w-full flex-col rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4 shadow-lg md:p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-base-text)]/55">
            {data?.period ?? 'Periodo'}
          </p>
          <h2 className="text-2xl font-semibold text-[var(--color-base-text)]">
            Ventas por municipio
          </h2>
          <p className="mt-1 text-sm text-[var(--color-base-text)]/65">
            Caracas con zonas más vendidas y menos vendidas.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--color-base-text)]/60">
          <span className="rounded-full bg-[var(--color-base-bg)] px-3 py-1">
            {data?.currency ?? 'ventas'}
          </span>
        </div>
      </div>

      <div className="grid flex-1 gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl border border-[var(--color-app-line)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-brand)_6%,var(--color-base-surface))_0%,var(--color-base-surface)_100%)] p-3 shadow-[0_12px_30px_-18px_rgba(16,32,58,0.4)]">
          <div className="relative h-[380px] w-full">
            <ResponsiveChoropleth
              data={municipalities}
              features={mapFeatures}
              margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
              colors="blues"
              domain={[0, maxValue]}
              unknownColor="#e5e7eb"
              valueFormat={(value) => formatNumber(value)}
              
              // Ajustes de estilo para tooltips (soportar modo oscuro)
              theme={{
                tooltip: {
                  container: {
                    background: 'var(--app-surface)',
                    color: 'var(--app-text)',
                    boxShadow: '0 6px 18px rgba(2,6,23,0.6)',
                    padding: '8px 10px',
                    borderRadius: '6px',
                  },
                },
              }}

             projectionType="mercator"
              // 1. Centramos el lente en medio de la caja
              projectionTranslation={[0.5, 0.5]}
              // 2. Apuntamos a las coordenadas exactas del centro de Caracas
              projectionRotation={[66.9, -10.45, 0]} 
              
              // 3. ¡ZOOM AUMENTADO! 
              // Sube o baja este número para hacer el mapa más grande o más pequeño
              projectionScale={40000}
              
              borderWidth={1.5}
              borderColor="rgba(16, 32, 58, 0.75)"
            />

          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-[var(--color-app-line)] bg-[var(--color-base-bg)] p-3.5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-base-text)]">Más vendidas</h3>
            <div className="space-y-2.5">
              {topMunicipalities.map((municipality) => (
                <div key={municipality.id} className="rounded-xl bg-[var(--color-base-surface)] px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-base-text)]">{municipality.id}</p>
                      <p className="text-xs text-[var(--color-base-text)]/55">Municipio top</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-base-text)]">{formatNumber(municipality.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-app-line)] bg-[var(--color-base-bg)] p-3.5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-base-text)]">Menos vendidas</h3>
            <div className="space-y-2.5">
              {bottomMunicipalities.map((municipality) => (
                <div key={municipality.id} className="rounded-xl bg-[var(--color-base-surface)] px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-base-text)]">{municipality.id}</p>
                      <p className="text-xs text-[var(--color-base-text)]/55">Municipio bajo</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-base-text)]">{formatNumber(municipality.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-app-line)] bg-[var(--color-base-bg)] p-3.5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-base-text)]">Leyenda</h3>
            <div className="space-y-2 text-sm text-[var(--color-base-text)]/75">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[rgba(29,78,216,0.95)]" />
                <span>Ventas altas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[rgba(59,130,246,0.7)]" />
                <span>Ventas medias</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[rgba(191,219,254,0.9)]" />
                <span>Ventas bajas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}