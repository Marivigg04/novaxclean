import { useEffect, useMemo, useRef, useState } from 'react'
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import caracasGeoJson from '../data/caracas.json'
import municipalitySales from '../data/municipalitySales.json'

function formatNumber(value) {
  return new Intl.NumberFormat('es-ES').format(value)
}

function normalizeName(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getFeatureName(feature) {
  return feature?.properties?.NAME_2 ?? feature?.properties?.name ?? feature?.id ?? ''
}

function interpolateBlue(scale) {
  if (scale >= 0.85) return '#1d4ed8'
  if (scale >= 0.65) return '#2563eb'
  if (scale >= 0.45) return '#3b82f6'
  if (scale >= 0.25) return '#60a5fa'
  return '#bfdbfe'
}

// 1. AÑADIMOS className A LAS PROPS
export default function LeafletCaracasMap({ data = municipalitySales, className }) {
  const geoRef = useRef(null)
  const [selectedMunicipality, setSelectedMunicipality] = useState(null)
  const [hoveredMunicipality, setHoveredMunicipality] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkTheme(); 

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  const tileUrl = isDarkMode 
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}" 
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const mapAttribution = isDarkMode
    ? '&copy; <a href="https://www.esri.com/">Esri</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO';

  const municipalities = data?.municipalities ?? []

  const salesByName = useMemo(() => {
    const map = new Map()
    municipalities.forEach((item) => {
      map.set(normalizeName(item.id), item)
    })
    return map
  }, [municipalities])

  const maxValue = useMemo(() => {
    return Math.max(...municipalities.map((item) => item.value), 1)
  }, [municipalities])

  const bounds = useMemo(() => {
    return L.geoJSON(caracasGeoJson).getBounds()
  }, [])

  const activeName = selectedMunicipality ?? hoveredMunicipality
  const activeData = activeName ? salesByName.get(normalizeName(activeName)) : null

  const sorted = useMemo(() => {
    return [...municipalities].sort((a, b) => b.value - a.value)
  }, [municipalities])

  const topMunicipality = sorted[0] ?? null

  const styleForName = (name) => {
    const key = normalizeName(name)
    const municipality = salesByName.get(key)
    const value = municipality?.value ?? 0
    const ratio = value / maxValue
    const isActive = name === selectedMunicipality || name === hoveredMunicipality

    return {
      color: isActive ? '#0f172a' : 'rgba(15, 23, 42, 0.48)',
      weight: isActive ? 2.4 : 1.2,
      fillColor: interpolateBlue(ratio),
      fillOpacity: isActive ? 0.95 : 0.82,
      opacity: 1,
    }
  }

  useEffect(() => {
    if (!geoRef.current) return

    geoRef.current.eachLayer((layer) => {
      const name = getFeatureName(layer.feature)
      layer.setStyle(styleForName(name))
    })
  }, [selectedMunicipality, hoveredMunicipality, salesByName, maxValue,isDarkMode])

  const handleEachFeature = (feature, layer) => {
    const name = getFeatureName(feature)
    const municipality = salesByName.get(normalizeName(name))
    const value = municipality?.value ?? 0

    layer.bindTooltip(
      `${name}: ${formatNumber(value)} ${data?.currency ?? 'ventas'}`,
      {
        sticky: true,
        direction: 'top',
        className: 'caracas-leaflet-tooltip',
      },
    )

    layer.on({
      mouseover: () => {
        setHoveredMunicipality(name)
        layer.bringToFront()
      },
      mouseout: () => {
        setHoveredMunicipality((current) => (current === name ? null : current))
      },
      click: () => {
        setSelectedMunicipality((current) => (current === name ? null : name))
      },
    })
  }

  return (
    // 2. APLICAMOS EL className Y HACEMOS QUE LA SECTION SEA flex-col
    <section className={`flex flex-col min-w-0 rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4 shadow-lg md:p-5 ${className || ''}`}>
      
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-base-text)]/55">
            {data?.period ?? 'Periodo'}
          </p>
          <h2 className="text-2xl font-semibold text-[var(--color-base-text)]">
            Mapa interactivo de Caracas
          </h2>
          <p className="mt-1 text-sm text-[var(--color-base-text)]/65">
            Haz clic sobre un municipio para ver detalle de ventas.
          </p>
        </div>
      </div>

      {/* 3. flex-1 min-h-0 PARA QUE EL CONTENEDOR DEL MAPA Y LAS TARJETAS OCUPE EL RESTO DEL ALTO */}
      <div className="flex-1 min-h-0 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        
        {/* 4. flex flex-col PARA QUE ESTA COLUMNA PASE EL ALTO A SU HIJO */}
        <div className="flex flex-col overflow-hidden rounded-3xl border border-[var(--color-app-line)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-brand)_6%,var(--color-base-surface))_0%,var(--color-base-surface)_100%)] p-2 shadow-[0_12px_30px_-18px_rgba(16,32,58,0.4)]">
          
          {/* 5. ELIMINAMOS h-[380px]. USAMOS relative Y flex-1 */}
          <div 
  className={`relative flex-1 w-full overflow-hidden rounded-2xl min-h-[300px] ${
    isDarkMode ? `
      [&_.leaflet-bar_a]:!bg-[var(--color-base-surface)] 
      [&_.leaflet-bar_a]:!text-[var(--color-base-text)] 
      [&_.leaflet-bar_a]:!border-[var(--color-app-panel-border)] 
      [&_.leaflet-bar_a:hover]:!bg-[var(--color-base-bg)] 
      [&_.leaflet-control-zoom]:!border 
      [&_.leaflet-control-zoom]:!border-[var(--color-app-panel-border)]
      [&_.leaflet-bar_a.leaflet-disabled]:!opacity-40
      [&_.leaflet-bar_a.leaflet-disabled]:!bg-[var(--color-base-surface)]
    ` : ""
  }`}
>
            <MapContainer
              bounds={bounds}
              boundsOptions={{ padding: [10, 10] }}
              zoomControl
              scrollWheelZoom={false}
              className="absolute inset-0 h-full w-full"
            >
              {/* 1. Capa base (Fondo del mapa) */}
              <TileLayer
                key={tileUrl}
                attribution={mapAttribution}
                url={tileUrl}
              />

              {/* 2. Tus datos (Los polígonos azules de los municipios) */}
              <GeoJSON
                ref={geoRef}
                data={caracasGeoJson}
                style={(feature) => styleForName(getFeatureName(feature))}
                onEachFeature={handleEachFeature}
              />

              {/* 3. Capa de textos/etiquetas de Esri (Se pone al final para que flote sobre el azul) */}
              {isDarkMode && (
                <TileLayer
                  key="esri-labels"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                />
              )}
            </MapContainer>
          </div>
        </div>

        <div className="grid gap-3 overflow-y-auto">
          <div className="rounded-2xl border border-[var(--color-app-line)] bg-[var(--color-base-bg)] p-3.5">
            <h3 className="mb-2 text-sm font-semibold text-[var(--color-base-text)]">Municipio activo</h3>
            <p className="text-sm text-[var(--color-base-text)]/65">
              {activeData
                ? `${activeData.id}: ${formatNumber(activeData.value)} ${data?.currency ?? 'ventas'}`
                : 'Selecciona un municipio en el mapa'}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-app-line)] bg-[var(--color-base-bg)] p-3.5">
            <h3 className="mb-2 text-sm font-semibold text-[var(--color-base-text)]">Municipio top</h3>
            <p className="text-sm text-[var(--color-base-text)]/65">
              {topMunicipality
                ? `${topMunicipality.id}: ${formatNumber(topMunicipality.value)} ${data?.currency ?? 'ventas'}`
                : 'Sin datos'}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-app-line)] bg-[var(--color-base-bg)] p-3.5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-base-text)]">Leyenda</h3>
            <div className="space-y-2 text-sm text-[var(--color-base-text)]/75">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#1d4ed8]" />
                <span>Ventas altas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#3b82f6]" />
                <span>Ventas medias</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-[#bfdbfe]" />
                <span>Ventas bajas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}