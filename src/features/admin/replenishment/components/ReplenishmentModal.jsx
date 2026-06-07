import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  CheckCircle2, 
  LoaderCircle, 
  Package2, 
  Truck, 
  Minus, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  FastForward,
  Compass,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Container
} from 'lucide-react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvent, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import {
  applyReceiptToItems,
  getStockStatus,
  normalizeReplenishmentItems,
  suggestReplenishmentQuantity,
} from '../replenishmentData';

const DEFAULT_SUPPLIERS_BY_CONTEXT = {
  inventory: [
    { id: 'disti-andes', name: 'Distribuidora Los Andes', warehouseLabel: 'Disti Los Andes - Centro de despacho', lat: 10.4652, lng: -66.8949 },
    { id: 'logistica-metropolitana', name: 'Logística Metropolitana', warehouseLabel: 'Logística Metropolitana - Patio A', lat: 10.4922, lng: -66.8802 },
    { id: 'supply-caracas', name: 'Supply Caracas', warehouseLabel: 'Supply Caracas - Planta Oeste', lat: 10.4588, lng: -66.9191 },
  ],
  materials: [
    { id: 'quimlab-industrial', name: 'Quimlab Industrial', warehouseLabel: 'Quimlab Industrial - Planta principal', lat: 10.4639, lng: -66.8973 },
    { id: 'envapack', name: 'Envapack', warehouseLabel: 'Envapack - Centro de envases', lat: 10.4971, lng: -66.8764 },
    { id: 'printlab', name: 'PrintLab', warehouseLabel: 'PrintLab - Almacén de etiquetas', lat: 10.4744, lng: -66.9254 },
  ],
};

const EMPTY_SUPPLIERS = [];

const WAREHOUSE_POINTS = {
  inventory: {
    lat: 10.4811,
    lng: -66.9036,
    label: 'Almacén Central Novaxclean',
  },
  suppliers: {
    lat: 10.4702,
    lng: -66.8879,
    label: 'Planta del Proveedor',
  },
};

const TRACKING_STEPS = [
  { key: 'confirmed', title: 'Orden Confirmada por Proveedor', detail: 'Pedido recibido y validado.' },
  { key: 'loading', title: 'Cargando Mercancía en Planta', detail: 'Preparando salida de bultos y pallets.' },
  { key: 'route', title: 'Cargamento en Ruta', detail: 'El camión avanza hacia Novaxclean.' },
  { key: 'bay', title: 'Camión en Bahía de Descarga', detail: 'Llegó al almacén central y espera recepción.' },
];

const PRE_TRACK_STEP_DURATION_MS = [1800, 2000];
const TRUCK_RIDE_DURATION_MS = 9500;

function getItemIcon(category = '') {
  const norm = category.toLowerCase();
  if (norm.includes('quim') || norm.includes('insumo') || norm.includes('materia') || norm.includes('acid') || norm.includes('base')) {
    return <FlaskConical className="h-4 w-4 text-purple-500 shrink-0" />;
  }
  if (norm.includes('envas') || norm.includes('botella') || norm.includes('empaq') || norm.includes('pote') || norm.includes('tapa')) {
    return <Container className="h-4 w-4 text-blue-500 shrink-0" />;
  }
  return <Package2 className="h-4 w-4 text-secondary shrink-0" />;
}

function toSupplierId(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createTruckIcon(angle = 0) {
  return L.divIcon({
    className: 'novax-truck-icon-container',
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <div class="gps-pulse-ring"></div>
        <div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:#001337;border:2.5px solid #fff;border-radius:12px;box-shadow:0 10px 20px rgba(16,43,81,.32);transform:rotate(${angle}deg);transition:transform 0.15s linear;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7h10v8H3V7Z" fill="white" opacity="0.92"/>
            <path d="M13 10h4.6l2.4 2.8V15h-7V10Z" fill="white" opacity="0.92"/>
            <circle cx="7" cy="17" r="2.1" fill="#fff"/>
            <circle cx="17" cy="17" r="2.1" fill="#fff"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function createPointIcon(label, background) {
  return L.divIcon({
    className: 'novax-point-icon',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:${background};color:#fff;font-weight:800;border-radius:999px;border:2px solid #fff;box-shadow:0 8px 18px rgba(16,43,81,.22);">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function createRoutePath(origin, destination) {
  const dx = destination.lng - origin.lng;
  const dy = destination.lat - origin.lat;
  const perpendicularX = -dy;
  const perpendicularY = dx;

  return [
    [origin.lat, origin.lng],
    [origin.lat + dy * 0.18 + perpendicularY * 0.05, origin.lng + dx * 0.18 + perpendicularX * 0.05],
    [origin.lat + dy * 0.42 - perpendicularY * 0.04, origin.lng + dx * 0.42 - perpendicularX * 0.04],
    [origin.lat + dy * 0.68 + perpendicularY * 0.03, origin.lng + dx * 0.68 + perpendicularX * 0.03],
    [destination.lat, destination.lng],
  ];
}

function measureDistance(a, b) {
  const dLat = b[0] - a[0];
  const dLng = b[1] - a[1];
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function interpolateRoute(route, progress) {
  if (!route.length) return { coords: [WAREHOUSE_POINTS.inventory.lat, WAREHOUSE_POINTS.inventory.lng], angle: 0 };
  if (route.length === 1) return { coords: route[0], angle: 0 };

  const segments = [];
  let total = 0;

  for (let i = 0; i < route.length - 1; i += 1) {
    const length = measureDistance(route[i], route[i + 1]);
    segments.push({ start: route[i], end: route[i + 1], length });
    total += length;
  }

  if (total === 0) return { coords: route[route.length - 1], angle: 0 };

  let target = total * Math.min(Math.max(progress, 0), 1);

  for (const segment of segments) {
    if (target <= segment.length) {
      const ratio = segment.length === 0 ? 1 : target / segment.length;
      const coords = [
        segment.start[0] + (segment.end[0] - segment.start[0]) * ratio,
        segment.start[1] + (segment.end[1] - segment.start[1]) * ratio,
      ];
      
      const dy = segment.end[0] - segment.start[0];
      const dx = segment.end[1] - segment.start[1];
      const angle = -Math.atan2(dy, dx) * (180 / Math.PI);
      return { coords, angle };
    }
    target -= segment.length;
  }

  const lastSegment = segments[segments.length - 1];
  const dy = lastSegment.end[0] - lastSegment.start[0];
  const dx = lastSegment.end[1] - lastSegment.start[1];
  const angle = -Math.atan2(dy, dx) * (180 / Math.PI);
  return { coords: route[route.length - 1], angle };
}

function MapClickHandler({ onMapClick }) {
  useMapEvent('click', (event) => {
    if (onMapClick) onMapClick(event.latlng);
  });

  return null;
}

function ChangeMapView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, bounds]);
  return null;
}

function ReplenishmentSuccess({ title }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-emerald-300/60 bg-emerald-50 dark:bg-emerald-950/20 p-6 md:p-8 text-center shadow-md"
    >
      <motion.div
        className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
        initial={{ scale: 0.3, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 16 }}
      >
        <CheckCircle2 className="h-10 w-10" />
      </motion.div>
      <h4 className="text-headline-lg font-bold text-emerald-900 dark:text-emerald-400">{title}</h4>
      <p className="mt-2 text-body-md text-emerald-800 dark:text-emerald-300/80">El stock fue actualizado correctamente y la tabla principal reflejará los nuevos valores.</p>
    </motion.div>
  );
}

export default function ReplenishmentModal({
  isOpen,
  onClose,
  context = 'inventory',
  items = [],
  suppliers = EMPTY_SUPPLIERS,
  onReceiveStock = () => {},
}) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [flowStage, setFlowStage] = useState('form');
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedAddSku, setSelectedAddSku] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [truckPosition, setTruckPosition] = useState([WAREHOUSE_POINTS.suppliers.lat, WAREHOUSE_POINTS.suppliers.lng]);
  const [showSuccess, setShowSuccess] = useState(false);

  const [truckAngle, setTruckAngle] = useState(0);
  const [transitProgress, setTransitProgress] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showCargoDetails, setShowCargoDetails] = useState(false);

  const stepTimeoutRef = useRef(null);
  const rideFrameRef = useRef(null);
  const rideStartRef = useRef(0);
  const closeTimerRef = useRef(null);
  const speedMultiplierRef = useRef(speedMultiplier);

  const normalizedItems = useMemo(() => normalizeReplenishmentItems(items), [items]);

  const buildLineItem = (item) => ({
    sku: item.sku,
    name: item.name,
    category: item.category,
    supplier: item.supplier,
    stock: item.stock,
    minimum: item.minimum,
    quantity: suggestReplenishmentQuantity(item.stock, item.minimum),
    recommendedQuantity: suggestReplenishmentQuantity(item.stock, item.minimum),
    unit: item.unit ?? 'Unidades',
    status: item.status,
  });

  const suppliersOptions = useMemo(() => {
    if (suppliers.length) return suppliers;

    const uniqueSuppliers = [...new Set(normalizedItems.map((item) => item.supplier).filter(Boolean))];
    if (!uniqueSuppliers.length) {
      return DEFAULT_SUPPLIERS_BY_CONTEXT[context] ?? DEFAULT_SUPPLIERS_BY_CONTEXT.inventory;
    }

    return uniqueSuppliers.map((supplier, index) => ({
      id: toSupplierId(supplier),
      name: supplier,
      warehouseLabel: `${supplier} - Planta central`,
      lat: WAREHOUSE_POINTS.suppliers.lat + ((index % 3) - 1) * 0.01,
      lng: WAREHOUSE_POINTS.suppliers.lng + ((index % 4) - 1.5) * 0.01,
    }));
  }, [context, normalizedItems, suppliers]);

  const supplierWarehouse = useMemo(() => {
    return suppliersOptions.find((supplier) => supplier.id === selectedSupplier) ?? suppliersOptions[0] ?? {
      id: 'supplier-default',
      name: 'Proveedor seleccionado',
      warehouseLabel: 'Planta del proveedor',
      lat: WAREHOUSE_POINTS.suppliers.lat,
      lng: WAREHOUSE_POINTS.suppliers.lng,
    };
  }, [suppliersOptions, selectedSupplier]);

  const pointA = useMemo(() => ({ lat: supplierWarehouse.lat, lng: supplierWarehouse.lng, label: supplierWarehouse.warehouseLabel }), [supplierWarehouse]);
  const pointB = WAREHOUSE_POINTS.inventory;
  const routePath = useMemo(() => createRoutePath(pointA, pointB), [pointA, pointB]);
  const mapCenter = useMemo(() => [(pointA.lat + pointB.lat) / 2, (pointA.lng + pointB.lng) / 2], [pointA, pointB]);

  const truckIcon = useMemo(() => createTruckIcon(truckAngle), [truckAngle]);
  const pointAIcon = useMemo(() => createPointIcon('A', '#001337'), []);
  const pointBIcon = useMemo(() => createPointIcon('B', '#2f5ea2'), []);

  // Update speed multiplier ref
  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  // Dark mode detector
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
    if (!isOpen) return undefined;

    const resetTimeout = setTimeout(() => {
      const initialItems = normalizedItems.filter((item) => item.status !== 'En stock').map(buildLineItem);
      setLineItems(initialItems.length ? initialItems : normalizedItems.slice(0, 3).map(buildLineItem));

      setSelectedSupplier((current) => current || suppliersOptions[0]?.id || '');
      setSelectedAddSku('');
      setFlowStage('form');
      setActiveStep(0);
      setShowSuccess(false);
      setTruckPosition([supplierWarehouse.lat, supplierWarehouse.lng]);
      setTruckAngle(0);
      setTransitProgress(0);
      setSpeedMultiplier(1);
    }, 0);

    return () => clearTimeout(resetTimeout);
  }, [isOpen, normalizedItems, suppliersOptions, supplierWarehouse.lat, supplierWarehouse.lng]);

  useEffect(() => {
    if (flowStage !== 'tracking') return undefined;

    // Wait step 0 & 1
    if (activeStep < 2) {
      stepTimeoutRef.current = window.setTimeout(() => {
        setActiveStep((current) => current + 1);
      }, PRE_TRACK_STEP_DURATION_MS[activeStep]);
      return () => {
        if (stepTimeoutRef.current) {
          window.clearTimeout(stepTimeoutRef.current);
          stepTimeoutRef.current = null;
        }
      };
    }

    // Step 2: Route animation
    if (activeStep === 2) {
      const animateRide = (timestamp) => {
        if (!rideStartRef.current) rideStartRef.current = timestamp;
        const elapsed = (timestamp - rideStartRef.current) * speedMultiplierRef.current;
        const progress = Math.min(elapsed / TRUCK_RIDE_DURATION_MS, 1);
        setTransitProgress(progress);

        const nextPos = interpolateRoute(routePath, progress);
        setTruckPosition(nextPos.coords);
        setTruckAngle(nextPos.angle);

        if (progress < 1) {
          rideFrameRef.current = window.requestAnimationFrame(animateRide);
          return;
        }

        // Arrival at Step 3
        setActiveStep(3);
        setTruckPosition([pointB.lat, pointB.lng]);
        setTruckAngle(nextPos.angle);
        setTransitProgress(1);
      };

      rideFrameRef.current = window.requestAnimationFrame(animateRide);

      return () => {
        if (rideFrameRef.current) {
          window.cancelAnimationFrame(rideFrameRef.current);
          rideFrameRef.current = null;
        }
        rideStartRef.current = 0;
      };
    }
  }, [activeStep, flowStage, pointB.lat, pointB.lng, routePath]);

  useEffect(() => () => {
    if (stepTimeoutRef.current) window.clearTimeout(stepTimeoutRef.current);
    if (rideFrameRef.current) window.cancelAnimationFrame(rideFrameRef.current);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
  }, []);

  const handleClose = () => {
    if (stepTimeoutRef.current) window.clearTimeout(stepTimeoutRef.current);
    if (rideFrameRef.current) window.cancelAnimationFrame(rideFrameRef.current);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    stepTimeoutRef.current = null;
    rideFrameRef.current = null;
    closeTimerRef.current = null;
    rideStartRef.current = 0;
    onClose();
  };

  const handleSendOrder = () => {
    setFlowStage('tracking');
    setActiveStep(0);
    setTransitProgress(0);
    setSpeedMultiplier(1);
    setTruckPosition([pointA.lat, pointA.lng]);
    setTruckAngle(0);
    rideStartRef.current = 0;
  };

  const handleSkipSimulation = () => {
    if (stepTimeoutRef.current) {
      window.clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
    if (rideFrameRef.current) {
      window.cancelAnimationFrame(rideFrameRef.current);
      rideFrameRef.current = null;
    }
    setActiveStep(3);
    setTransitProgress(1);
    setTruckPosition([pointB.lat, pointB.lng]);

    // Compute angle towards destination for last point
    const lastSeg = routePath[routePath.length - 1];
    const prevSeg = routePath[routePath.length - 2] || lastSeg;
    const dy = lastSeg[0] - prevSeg[0];
    const dx = lastSeg[1] - prevSeg[1];
    setTruckAngle(-Math.atan2(dy, dx) * (180 / Math.PI));
  };

  const handleMarkReceived = () => {
    const updatedItems = applyReceiptToItems(normalizedItems, lineItems);
    onReceiveStock(updatedItems, lineItems);
    setShowSuccess(true);
    closeTimerRef.current = window.setTimeout(() => {
      handleClose();
    }, 1300);
  };

  if (!isRendered) return null;

  const addItemToLineItems = (selectedSku) => {
    if (!selectedSku) return;
    const selected = normalizedItems.find((item) => item.sku === selectedSku);
    if (!selected) return;

    setLineItems((current) => {
      if (current.some((lineItem) => lineItem.sku === selectedSku)) {
        return current;
      }

      return [...current, buildLineItem(selected)];
    });
  };

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-primary/55 px-2 py-4 backdrop-blur-sm md:px-4 md:py-6 ${isClosing ? 'cart-modal-overlay-exit' : 'cart-modal-overlay-enter'}`} role="dialog" aria-modal="true" aria-labelledby="replenishment-title" onClick={handleClose}>
      <div className={`cart-scrollbar my-auto max-h-[calc(100dvh-2rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-2xl ${isClosing ? 'cart-modal-panel-exit' : 'cart-modal-panel-enter'}`} onClick={(event) => event.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant bg-surface-container-low px-4 py-4 md:px-8 md:py-5">
          <div className="min-w-0">
            <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.14em] text-secondary">Reabastecimiento B2B</p>
            <h3 id="replenishment-title" className="text-headline-md font-bold text-primary leading-tight">
              {flowStage === 'form' 
                ? 'Solicitar reabastecimiento' 
                : flowStage === 'summary' 
                  ? 'Verificar Orden de Compra' 
                  : 'Tracking en tiempo real'}
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant hidden sm:block">
              {flowStage === 'form'
                ? 'El formulario sugiere automáticamente los productos con stock bajo o agotado y su cantidad recomendada.'
                : flowStage === 'summary'
                  ? 'Revisa el documento pro-forma antes de confirmar el envío del pedido al proveedor.'
                  : 'Simulación logística satelital de carga pesada desde el proveedor hasta el almacén central.'}
            </p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low">Cerrar</button>
        </div>

        {/* Modal Scrollable Container */}
        <div className="cart-scrollbar relative max-h-[calc(100dvh-10.5rem)] overflow-y-auto px-4 py-4 md:px-8 md:py-6">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <ReplenishmentSuccess title="Mercancía ingresada al almacén" />
            ) : flowStage === 'form' ? (
              <motion.div
                key="replenishment-form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="grid gap-5"
              >
                <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low p-4 shadow-sm md:p-6">
                  
                  {/* Form Header Info */}
                  <div className="flex items-center justify-between gap-3 border-b border-outline-variant/60 pb-4 mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-primary">Formulario dinámico</h4>
                      <p className="text-xs text-on-surface-variant">{context === 'inventory' ? 'Productos terminados para despacho' : 'Químicos, envases e insumos de producción'}</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-xs font-bold text-on-surface-variant">
                      <Truck className="h-3.5 w-3.5" />
                      Reabastecer
                    </div>
                  </div>

                  {/* Dynamic Items List */}
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 md:p-5">
                      
                      {/* Sub-header with Quick Actions */}
                      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant/30 pb-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-secondary">
                          <Package2 className="h-4 w-4" />
                          Sugerencias de stock bajo
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setLineItems(current => current.map(item => ({ ...item, quantity: item.recommendedQuantity })));
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low/60 px-2.5 py-1.5 text-xs font-bold text-secondary hover:bg-surface-container-low transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Sugeridos
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setLineItems(current => current.map(item => ({ ...item, quantity: 0 })));
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low/60 px-2.5 py-1.5 text-xs font-bold text-error hover:bg-error-container/10 transition-colors"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Limpiar
                          </button>
                        </div>
                      </div>

                      {/* Items Cards Stack */}
                      <div className="grid gap-3">
                        {lineItems.length === 0 ? (
                          <div className="text-center py-6 text-sm text-on-surface-variant font-medium">
                            No hay productos en la lista. Agregue uno abajo.
                          </div>
                        ) : (
                          lineItems.map((item) => {
                            const currentStockVal = Number(item.stock) || 0;
                            const minStockVal = Number(item.minimum) || 1;
                            const progressPercentage = Math.min(100, Math.max(0, (currentStockVal / minStockVal) * 100));
                            
                            return (
                              <div key={item.sku} className="rounded-xl border border-outline-variant/70 bg-surface-container-low/60 p-3.5 transition-all hover:border-outline hover:bg-surface-container-low">
                                <div className="grid gap-3.5 md:grid-cols-[1.8fr_1.5fr_1.5fr_auto] md:items-center">
                                  
                                  {/* Col 1: Product info */}
                                  <div className="flex items-start justify-between md:block">
                                    <div className="min-w-0">
                                      <p className="font-bold text-primary text-sm md:text-base leading-snug truncate">{item.name}</p>
                                      <p className="text-xs text-on-surface-variant mt-0.5">{item.sku} · {item.category}</p>
                                      
                                      {/* Mobile Status badge */}
                                      <div className="mt-1.5 md:hidden">
                                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                                          item.stock <= 0
                                            ? 'border-error/30 bg-error/10 text-error'
                                            : item.stock <= item.minimum
                                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        }`}>
                                          {item.stock <= 0 ? 'Agotado' : item.stock <= item.minimum ? 'Stock bajo' : 'En stock'}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <button
                                      type="button"
                                      onClick={() => setLineItems((current) => current.filter((lineItem) => lineItem.sku !== item.sku))}
                                      className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs font-bold text-error hover:bg-error-container/10 md:hidden"
                                    >
                                      Quitar
                                    </button>
                                  </div>

                                  {/* Col 2: Stock Progress Gauge */}
                                  <div className="w-full">
                                    <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                                      <span>Nivel de Stock:</span>
                                      <span className="font-bold text-primary">{currentStockVal} / {minStockVal} {item.unit}</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden border border-outline-variant/30">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          currentStockVal <= 0 
                                            ? 'bg-error' 
                                            : currentStockVal <= minStockVal 
                                              ? 'bg-amber-500' 
                                              : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${progressPercentage}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Col 3: Custom Stepper Controls */}
                                  <div className="flex flex-col gap-1 sm:justify-start">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant md:hidden">Cantidad a pedir</span>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="flex items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-0.5 shadow-inner">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setLineItems((current) => current.map((lineItem) => 
                                              lineItem.sku === item.sku 
                                                ? { ...lineItem, quantity: Math.max(0, lineItem.quantity - 1) } 
                                                : lineItem
                                            ));
                                          }}
                                          className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                                        >
                                          <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        
                                        <input
                                          type="number"
                                          min="0"
                                          value={item.quantity}
                                          onChange={(event) => {
                                            const nextValue = Math.max(0, Number(event.target.value) || 0);
                                            setLineItems((current) => current.map((lineItem) => (lineItem.sku === item.sku ? { ...lineItem, quantity: nextValue } : lineItem)));
                                          }}
                                          className="w-12 border-0 bg-transparent text-center text-sm font-bold text-primary focus:ring-0 outline-none select-all"
                                        />
                                        
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setLineItems((current) => current.map((lineItem) => 
                                              lineItem.sku === item.sku 
                                                ? { ...lineItem, quantity: lineItem.quantity + 1 } 
                                                : lineItem
                                            ));
                                          }}
                                          className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                                        >
                                          <Plus className="h-3.5 w-3.5" />
                                        </button>
                                      </div>

                                      {item.quantity !== item.recommendedQuantity && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setLineItems((current) => current.map((lineItem) => 
                                              lineItem.sku === item.sku 
                                                ? { ...lineItem, quantity: item.recommendedQuantity } 
                                                : lineItem
                                            ));
                                          }}
                                          className="rounded-lg border border-secondary/20 bg-secondary/5 px-2 py-1 text-[11px] font-bold text-secondary hover:bg-secondary/15 transition-all"
                                          title="Usar cantidad recomendada por stock mínimo"
                                        >
                                          Rec: {item.recommendedQuantity}
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Col 4: Status badge (desktop) and Remove button (desktop) */}
                                  <div className="hidden md:flex items-center gap-3">
                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                      item.stock <= 0
                                        ? 'border-error/30 bg-error/10 text-error'
                                        : item.stock <= item.minimum
                                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    }`}>{item.stock <= 0 ? 'Agotado' : item.stock <= item.minimum ? 'Stock bajo' : 'En stock'}</span>
                                    
                                    <button
                                      type="button"
                                      onClick={() => setLineItems((current) => current.filter((lineItem) => lineItem.sku !== item.sku))}
                                      className="rounded-lg border border-outline-variant p-2 text-on-surface-variant hover:bg-surface-container-lowest hover:text-error transition-colors"
                                      title="Quitar de la lista"
                                    >
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                    </button>
                                  </div>

                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Inputs panel */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="min-w-0 md:col-span-2">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant">Agregar otro producto de la lista general</span>
                        <select
                          value={selectedAddSku}
                          onChange={(event) => {
                            const selectedSku = event.target.value;
                            setSelectedAddSku(selectedSku);
                            if (!selectedSku) return;
                            addItemToLineItems(selectedSku);
                            setSelectedAddSku('');
                          }}
                          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors focus:border-secondary"
                        >
                          <option value="">Seleccionar producto o insumo</option>
                          {normalizedItems
                            .filter((item) => !lineItems.some((lineItem) => lineItem.sku === item.sku))
                            .map((item) => (
                              <option key={item.sku} value={item.sku}>
                                {item.name} · {item.sku}
                              </option>
                            ))}
                        </select>
                      </label>

                      <label className="min-w-0 md:col-span-2">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant">Proveedor Logístico asignado</span>
                        <select value={selectedSupplier} onChange={(event) => setSelectedSupplier(event.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors focus:border-secondary">
                          {suppliersOptions.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {/* Quick Summaries Card */}
                    {lineItems.length > 0 && (
                      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-inner">
                        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
                          <div className="border-r border-outline-variant/60">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.08em]">Referencias</p>
                            <p className="text-xl font-black text-primary mt-0.5">{lineItems.length}</p>
                          </div>
                          <div className="border-r border-outline-variant/60 sm:border-r">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.08em]">Total Unidades</p>
                            <p className="text-xl font-black text-primary mt-0.5">
                              {lineItems.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0)}
                            </p>
                          </div>
                          <div className="col-span-2 sm:col-span-1 pt-2 sm:pt-0">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.08em]">Proveedor</p>
                            <p className="text-xs font-bold text-secondary truncate mt-1">
                              {supplierWarehouse.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={handleClose} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low sm:order-1">Cancelar</button>
                    <button 
                      type="button" 
                      onClick={() => setFlowStage('summary')} 
                      disabled={lineItems.length === 0 || lineItems.every(i => (Number(i.quantity) || 0) === 0)}
                      className="w-full rounded-xl bg-primary px-4 py-3 text-body-md font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed sm:order-2"
                    >
                      Ver resumen del pedido
                    </button>
                  </div>
                </section>
              </motion.div>
            ) : flowStage === 'summary' ? (
              <motion.section
                key="replenishment-summary"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
                className="grid gap-5"
              >
                <div className="border border-outline-variant bg-surface-container-low rounded-2xl overflow-hidden shadow-md p-4 sm:p-6 md:p-8">
                  
                  {/* Purchase Order Header */}
                  <div className="flex flex-col gap-4 border-b border-outline-variant/60 pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-lg bg-secondary/15 px-3 py-1 text-xs font-black text-secondary uppercase tracking-[0.1em] mb-2 border border-secondary/20">
                        Documento Pro-forma
                      </div>
                      <h4 className="text-xl md:text-2xl font-black text-primary">Orden de Compra B2B</h4>
                      <p className="text-xs text-on-surface-variant mt-1 font-medium">Fecha de emisión: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <p className="text-lg font-black text-secondary">NOVAXCLEAN S.A.</p>
                      <p className="text-xs text-on-surface-variant">Almacén Central de Distribución</p>
                      <p className="text-xs text-on-surface-variant">Caracas, Venezuela</p>
                    </div>
                  </div>

                  {/* Logistics flow visualizer */}
                  <div className="my-6 rounded-2xl bg-surface-container-lowest p-4 border border-outline-variant/40">
                    <h5 className="text-xs font-bold uppercase tracking-[0.1em] text-secondary mb-3">Flujo Logístico Programado</h5>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 rounded-xl bg-surface-container-low p-3 border border-outline-variant/60">
                        <span className="text-[9px] font-black uppercase text-on-surface-variant">Origen (Proveedor)</span>
                        <p className="text-sm font-bold text-primary mt-0.5 truncate">{supplierWarehouse.name}</p>
                        <p className="text-xs text-on-surface-variant truncate">{pointA.label}</p>
                      </div>
                      
                      <div className="flex items-center justify-center py-1 sm:px-4 shrink-0">
                        {/* Animated visual connector */}
                        <div className="flex flex-row items-center gap-1.5 sm:flex-col sm:gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-ping" />
                          <span className="h-1 w-12 bg-secondary/30 rounded-full sm:h-8 sm:w-1" />
                          <Truck className="h-5 w-5 text-secondary animate-bounce shrink-0" />
                          <span className="h-1 w-12 bg-secondary/30 rounded-full sm:h-8 sm:w-1" />
                        </div>
                      </div>

                      <div className="flex-1 rounded-xl bg-surface-container-low p-3 border border-outline-variant/60">
                        <span className="text-[9px] font-black uppercase text-on-surface-variant">Destino (Almacén)</span>
                        <p className="text-sm font-bold text-primary mt-0.5">Almacén Central Novaxclean</p>
                        <p className="text-xs text-on-surface-variant">Coordenadas: {pointB.lat}, {pointB.lng}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items table */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-[0.1em] text-secondary mb-3">Detalle del Pedido</h5>
                    
                    {/* Desktop table view */}
                    <div className="hidden md:block overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.08em] bg-surface-container-low/75">
                            <th className="py-3 px-4 rounded-l-xl">Producto</th>
                            <th className="py-3 px-4">Código (SKU)</th>
                            <th className="py-3 px-4 text-right">Cant. Solicitada</th>
                            <th className="py-3 px-4 text-right">Stock Actual</th>
                            <th className="py-3 px-4 rounded-r-xl text-center">Stock Proyectado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/40">
                          {lineItems.map((lineItem) => {
                            const nextStock = Number(lineItem.stock) + Number(lineItem.quantity);
                            const statusAfter = getStockStatus(nextStock, Number(lineItem.minimum));
                            return (
                              <tr key={lineItem.sku} className="text-sm text-primary hover:bg-surface-container-low/40 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    {getItemIcon(lineItem.category)}
                                    <span className="font-semibold">{lineItem.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-xs text-on-surface-variant font-mono">{lineItem.sku}</td>
                                <td className="py-3 px-4 text-right font-black text-secondary">{lineItem.quantity} {lineItem.unit}</td>
                                <td className="py-3 px-4 text-right text-on-surface-variant">{lineItem.stock}</td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-on-surface-variant text-xs">{lineItem.stock}</span>
                                    <span className="text-secondary text-xs font-bold font-mono">&rarr;</span>
                                    <span className="font-black text-primary text-sm">{nextStock}</span>
                                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                                      statusAfter === 'Agotado'
                                        ? 'bg-error'
                                        : statusAfter === 'Stock bajo'
                                          ? 'bg-amber-500'
                                          : 'bg-emerald-500'
                                    }`} title={`Estado proyectado: ${statusAfter}`} />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile card view */}
                    <div className="grid gap-3 md:hidden">
                      {lineItems.map((lineItem) => {
                        const nextStock = Number(lineItem.stock) + Number(lineItem.quantity);
                        const statusAfter = getStockStatus(nextStock, Number(lineItem.minimum));
                        return (
                          <div key={lineItem.sku} className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3.5 text-sm shadow-sm">
                            <div className="flex items-start justify-between gap-2 border-b border-outline-variant/30 pb-2 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {getItemIcon(lineItem.category)}
                                <div className="min-w-0">
                                  <p className="font-bold text-primary truncate leading-tight">{lineItem.name}</p>
                                  <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">{lineItem.sku}</p>
                                </div>
                              </div>
                              <span className="font-black text-secondary text-sm shrink-0">{lineItem.quantity} {lineItem.unit}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs text-on-surface-variant mt-1">
                              <span>Stock actual: <strong className="text-primary font-bold">{lineItem.stock}</strong></span>
                              <span className="flex items-center gap-1.5">
                                <span>Proyectado:</span>
                                <strong className="text-primary font-black">{nextStock}</strong>
                                <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                                  statusAfter === 'Agotado'
                                    ? 'bg-error'
                                    : statusAfter === 'Stock bajo'
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                }`} />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total summary */}
                  <div className="mt-6 border-t border-outline-variant/60 pt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-on-surface-variant max-w-md">
                      * El transporte iniciará una simulación en ruta. La mercancía será ingresada al inventario del sistema tras confirmarse la llegada física del camión a la bahía de descarga.
                    </div>
                    <div className="rounded-xl bg-surface-container-lowest px-4 py-2 border border-outline-variant/60 flex items-center justify-between gap-6 self-end sm:self-auto">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.05em]">Unidades totales:</span>
                      <span className="text-xl font-black text-secondary">
                        {lineItems.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0)}
                      </span>
                    </div>
                  </div>

                  {/* Summary Navigation buttons */}
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => setFlowStage('form')} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low sm:order-1">Volver al formulario</button>
                    <button type="button" onClick={handleSendOrder} className="w-full rounded-xl bg-primary px-4 py-3 text-body-md font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-95 sm:order-2">Enviar pedido</button>
                  </div>

                </div>
              </motion.section>
            ) : (
              <motion.section
                key="replenishment-tracking"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
                className="grid gap-5"
              >
                <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr] lg:items-stretch">
                  
                  {/* Left Column: Interactive GIS Map */}
                  <article className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low shadow-md flex flex-col">
                    <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest px-4 py-3 md:px-5 shrink-0">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">Tracking de reabastecimiento</p>
                        <p className="text-xs text-on-surface-variant font-semibold truncate max-w-[200px] sm:max-w-md">{pointA.label} &rarr; Almacén Central Novaxclean</p>
                      </div>
                      <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary shrink-0">Paso {activeStep + 1} de 4</span>
                    </div>

                    {/* Map Container Wrapper with dark-theme filter integration class */}
                    <div className="relative flex-1 min-h-[260px] md:min-h-[400px] w-full map-premium-theme">
                      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} className="absolute inset-0 h-full w-full" preferCanvas>
                        <ChangeMapView bounds={L.latLngBounds([[pointA.lat, pointA.lng], [pointB.lat, pointB.lng]])} />
                        <TileLayer
                          key={tileUrl}
                          attribution={mapAttribution}
                          url={tileUrl}
                        />
                        {isDarkMode && (
                          <TileLayer
                            key="esri-labels"
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                          />
                        )}
                        <MapClickHandler />
                        <Polyline positions={routePath} pathOptions={{ color: '#2f5ea2', weight: 6, opacity: 0.85 }} />
                        <Marker position={[pointA.lat, pointA.lng]} icon={pointAIcon} />
                        <Marker position={[pointB.lat, pointB.lng]} icon={pointBIcon} />
                        <Marker position={truckPosition} icon={truckIcon} />
                      </MapContainer>
                    </div>
                  </article>

                  {/* Right Column: Loading and route steps tracking panel */}
                  <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 md:p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/60">
                        <div>
                          <h5 className="text-base font-bold text-primary">Estado del cargamento</h5>
                          <p className="text-xs text-on-surface-variant">Simulación de ruta satelital.</p>
                        </div>
                        {activeStep < 3 && (
                          <button
                            type="button"
                            onClick={handleSkipSimulation}
                            className="inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                            title="Omitir el trayecto completo de simulación"
                          >
                            <FastForward className="h-3.5 w-3.5" />
                            Omitir
                          </button>
                        )}
                      </div>

                      {/* Realtime progress controls for Step 2 */}
                      {activeStep === 2 && (
                        <div className="mb-4 rounded-xl border border-secondary/20 bg-secondary/5 p-3.5 shadow-inner">
                          <div className="flex items-center justify-between text-xs font-bold text-secondary mb-1.5">
                            <span className="flex items-center gap-1.5">
                              <Compass className="h-4 w-4 animate-spin text-secondary" />
                              Transitando Caracas (ETA: {Math.ceil((TRUCK_RIDE_DURATION_MS * (1 - transitProgress)) / 1000)}s)
                            </span>
                            <span>{Math.round(transitProgress * 100)}%</span>
                          </div>
                          
                          <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden border border-outline-variant/30 mb-3">
                            <div 
                              className="h-full bg-secondary rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${transitProgress * 100}%` }}
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSpeedMultiplier(curr => curr === 1 ? 2 : curr === 2 ? 4 : 1)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-secondary/20 bg-surface-container-lowest py-1.5 text-xs font-bold text-secondary hover:bg-secondary/15 transition-all"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              Velocidad: {speedMultiplier}x
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Log timeline */}
                      <ol className="space-y-4">
                        {TRACKING_STEPS.map((step, index) => {
                          const isDone = index < activeStep;
                          const isCurrent = index === activeStep;
                          const isFuture = index > activeStep;

                          return (
                            <li key={step.key} className="flex gap-3">
                              <div className="relative flex flex-col items-center">
                                <motion.span
                                  className={`z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                                    isDone 
                                      ? 'border-emerald-500 bg-emerald-500 text-white' 
                                      : isCurrent 
                                        ? 'border-secondary bg-secondary/15 text-secondary' 
                                        : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant/40'
                                  }`}
                                  animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                                  transition={isCurrent ? { duration: 1.2, repeat: Infinity } : { duration: 0.2 }}
                                >
                                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : isCurrent ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Package2 className="h-3.5 w-3.5" />}
                                </motion.span>
                                {index < TRACKING_STEPS.length - 1 ? <span className={`mt-1 h-8 w-px ${isFuture ? 'bg-outline-variant/60' : 'bg-secondary/45'}`} /> : null}
                              </div>

                              <div className={`min-w-0 flex-1 rounded-xl border px-3 py-2 ${
                                isDone 
                                  ? 'border-emerald-500/25 bg-emerald-500/5' 
                                  : isCurrent 
                                    ? 'border-secondary/25 bg-secondary/5' 
                                    : 'border-outline-variant bg-surface-container-lowest opacity-75'
                              }`}>
                                <p className="text-xs font-bold text-primary">{step.title}</p>
                                <p className="mt-0.5 text-[11px] text-on-surface-variant">{step.detail}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </section>
                </div>

                {/* Receiver / Download central warehouse button card */}
                <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 md:p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">Recepción de mercancía</p>
                      <h5 className="mt-0.5 text-base font-bold text-primary">
                        {activeStep < 3 ? 'Camión en tránsito...' : '¡Camión en bahía de descarga!'}
                      </h5>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {activeStep < 3 
                          ? 'Esperando el arribo del cargamento para iniciar la descarga.' 
                          : 'El pedido ha llegado. Autorice el ingreso de unidades al inventario principal.'}
                      </p>
                    </div>
                    
                    {activeStep < 3 ? (
                      <button 
                        type="button" 
                        disabled 
                        className="w-full rounded-xl border border-outline-variant bg-surface-container-highest px-5 py-3 text-sm font-bold text-on-surface-variant/40 cursor-not-allowed sm:w-auto"
                      >
                        Esperando arribo...
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleMarkReceived} 
                        className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] sm:w-auto animate-pulse"
                      >
                        Ingresar al Almacén
                      </button>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2">
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Proveedor origen</p>
                      <p className="mt-0.5 text-xs md:text-sm font-bold text-primary truncate">{supplierWarehouse.name}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 truncate">{pointA.label}</p>
                    </div>
                    
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 transition-all">
                      <button 
                        type="button" 
                        onClick={() => setShowCargoDetails(!showCargoDetails)} 
                        className="flex w-full items-center justify-between text-left focus:outline-none"
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">Detalle del cargamento</p>
                          <p className="mt-0.5 text-xs md:text-sm font-bold text-primary">{lineItems.length} referencias</p>
                        </div>
                        <div className="text-secondary shrink-0 ml-2">
                          {showCargoDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {showCargoDetails && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-3 overflow-hidden border-t border-outline-variant/30 pt-3"
                          >
                            <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 cart-scrollbar">
                              {lineItems.map((item) => (
                                <div key={item.sku} className="flex items-center justify-between text-xs text-primary bg-surface-container-low/60 p-2 rounded-lg border border-outline-variant/30">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {getItemIcon(item.category)}
                                    <div className="truncate">
                                      <p className="font-semibold truncate">{item.name}</p>
                                      <p className="text-[10px] text-on-surface-variant font-mono">{item.sku}</p>
                                    </div>
                                  </div>
                                  <span className="font-bold text-secondary text-right shrink-0">{item.quantity} {item.unit}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </section>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
