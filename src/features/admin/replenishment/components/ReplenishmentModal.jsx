import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, LoaderCircle, Package2, Truck } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvent } from 'react-leaflet';
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

const PRE_TRACK_STEP_DURATION_MS = [1800, 2000, 2200];
const TRUCK_RIDE_DURATION_MS = 9500;
function toSupplierId(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function createTruckIcon() {
  return L.divIcon({
    className: 'novax-truck-icon',
    html: '<div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;background:#0f6ecf;border:2px solid #fff;border-radius:14px;box-shadow:0 10px 20px rgba(16,43,81,.32)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h10v8H3V7Z" fill="white" opacity="0.92"/><path d="M13 10h4.6l2.4 2.8V15h-7V10Z" fill="white" opacity="0.92"/><circle cx="7" cy="17" r="2.1" fill="#fff"/><circle cx="17" cy="17" r="2.1" fill="#fff"/></svg></div>',
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
  if (!route.length) return WAREHOUSE_POINTS.inventory;
  if (route.length === 1) return route[0];

  const segments = [];
  let total = 0;

  for (let i = 0; i < route.length - 1; i += 1) {
    const length = measureDistance(route[i], route[i + 1]);
    segments.push({ start: route[i], end: route[i + 1], length });
    total += length;
  }

  if (total === 0) return route[route.length - 1];

  let target = total * Math.min(Math.max(progress, 0), 1);

  for (const segment of segments) {
    if (target <= segment.length) {
      const ratio = segment.length === 0 ? 1 : target / segment.length;
      return [
        segment.start[0] + (segment.end[0] - segment.start[0]) * ratio,
        segment.start[1] + (segment.end[1] - segment.start[1]) * ratio,
      ];
    }
    target -= segment.length;
  }

  return route[route.length - 1];
}

function MapClickHandler({ onMapClick }) {
  useMapEvent('click', (event) => {
    if (onMapClick) onMapClick(event.latlng);
  });

  return null;
}

function ReplenishmentSuccess({ title }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-emerald-300/60 bg-emerald-50 p-8 text-center shadow-md"
    >
      <motion.div
        className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700"
        initial={{ scale: 0.3, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 16 }}
      >
        <CheckCircle2 className="h-10 w-10" />
      </motion.div>
      <h4 className="text-headline-lg font-bold text-emerald-900">{title}</h4>
      <p className="mt-2 text-body-md text-emerald-800">El stock fue actualizado correctamente y la tabla principal reflejará los nuevos valores.</p>
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

  const stepTimeoutRef = useRef(null);
  const rideFrameRef = useRef(null);
  const rideStartRef = useRef(0);
  const closeTimerRef = useRef(null);

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

  const supplierWarehouse = suppliersOptions.find((supplier) => supplier.id === selectedSupplier) ?? suppliersOptions[0] ?? {
    id: 'supplier-default',
    name: 'Proveedor seleccionado',
    warehouseLabel: 'Planta del proveedor',
    lat: WAREHOUSE_POINTS.suppliers.lat,
    lng: WAREHOUSE_POINTS.suppliers.lng,
  };

  const pointA = useMemo(() => ({ lat: supplierWarehouse.lat, lng: supplierWarehouse.lng, label: supplierWarehouse.warehouseLabel }), [supplierWarehouse]);
  const pointB = WAREHOUSE_POINTS.inventory;
  const routePath = useMemo(() => createRoutePath(pointA, pointB), [pointA]);
  const mapCenter = useMemo(() => [(pointA.lat + pointB.lat) / 2, (pointA.lng + pointB.lng) / 2], [pointA]);

  const truckIcon = useMemo(() => createTruckIcon(), []);
  const pointAIcon = useMemo(() => createPointIcon('A', '#143d70'), []);
  const pointBIcon = useMemo(() => createPointIcon('B', '#24a3ff'), []);

  useEffect(() => {
    let timeoutId;

    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      return undefined;
    }

    if (isRendered) {
      setIsClosing(true);
      timeoutId = window.setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 240);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isOpen, isRendered]);

  useEffect(() => {
    if (!isOpen) return;

    const initialItems = normalizedItems.filter((item) => item.status !== 'En stock').map(buildLineItem);
    setLineItems(initialItems.length ? initialItems : normalizedItems.slice(0, 3).map(buildLineItem));

    setSelectedSupplier((current) => current || suppliersOptions[0]?.id || '');
    setSelectedAddSku('');
    setFlowStage('form');
    setActiveStep(0);
    setShowSuccess(false);
    setTruckPosition([supplierWarehouse.lat, supplierWarehouse.lng]);
  }, [isOpen, normalizedItems, suppliersOptions]);

  useEffect(() => {
    if (flowStage !== 'tracking') return undefined;

    if (activeStep < 3) {
      stepTimeoutRef.current = window.setTimeout(() => setActiveStep((current) => current + 1), PRE_TRACK_STEP_DURATION_MS[activeStep]);
      return () => {
        if (stepTimeoutRef.current) {
          window.clearTimeout(stepTimeoutRef.current);
          stepTimeoutRef.current = null;
        }
      };
    }

    const animateRide = (timestamp) => {
      if (!rideStartRef.current) rideStartRef.current = timestamp;
      const elapsed = timestamp - rideStartRef.current;
      const progress = Math.min(elapsed / TRUCK_RIDE_DURATION_MS, 1);
      setTruckPosition(interpolateRoute(routePath, progress));

      if (progress < 1) {
        rideFrameRef.current = window.requestAnimationFrame(animateRide);
        return;
      }

      setActiveStep(3);
      setTruckPosition([pointB.lat, pointB.lng]);
    };

    rideFrameRef.current = window.requestAnimationFrame(animateRide);

    return () => {
      if (rideFrameRef.current) {
        window.cancelAnimationFrame(rideFrameRef.current);
        rideFrameRef.current = null;
      }
      rideStartRef.current = 0;
    };
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
    setTruckPosition([pointA.lat, pointA.lng]);
    rideStartRef.current = 0;
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
    <div className={`fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-primary/55 px-4 py-6 backdrop-blur-sm md:items-center ${isClosing ? 'cart-modal-overlay-exit' : 'cart-modal-overlay-enter'}`} role="dialog" aria-modal="true" aria-labelledby="replenishment-title" onClick={handleClose}>
      <div className={`cart-scrollbar my-auto max-h-[calc(100dvh-3rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-2xl ${isClosing ? 'cart-modal-panel-exit' : 'cart-modal-panel-enter'}`} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant bg-surface-container-low px-6 py-5 md:px-8">
          <div className="min-w-0">
            <p className="mb-1 text-label-md font-bold uppercase tracking-[0.14em] text-secondary">Reabastecimiento B2B</p>
            <h3 id="replenishment-title" className="text-headline-md font-bold text-primary">{flowStage === 'form' ? 'Solicitar reabastecimiento' : 'Tracking del proveedor a almacén'}</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">
              {flowStage === 'form'
                ? 'El formulario sugiere automáticamente los productos con stock bajo o agotado y su cantidad recomendada.'
                : 'Simulación logística de carga pesada desde el proveedor hasta el almacén central.'}
            </p>
          </div>
          <button type="button" onClick={handleClose} className="rounded-xl border border-outline-variant px-3 py-2 text-label-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container-lowest">Cerrar</button>
        </div>

        <div className="cart-scrollbar relative max-h-[calc(100dvh-11rem)] overflow-y-auto px-6 py-6 md:px-8">
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
                className="grid gap-6"
              >
                <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low p-5 shadow-sm md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-headline-md font-semibold text-primary">Formulario dinámico</h4>
                      <p className="mt-1 text-body-md text-on-surface-variant">{context === 'inventory' ? 'Productos terminados' : 'Químicos, envases e insumos'}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-xs font-semibold text-on-surface-variant">
                      <Truck className="h-4 w-4" />
                      Reabastecer
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-secondary">
                        <Package2 className="h-4 w-4" />
                        Sugerencias de stock bajo
                      </div>
                      <div className="grid gap-3">
                        {lineItems.map((item) => (
                          <div key={item.sku} className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-semibold text-primary">{item.name}</p>
                                <p className="text-xs text-on-surface-variant">{item.sku} · {item.category}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">{item.status || getStockStatus(item.stock, item.minimum)}</span>
                                <button
                                  type="button"
                                  onClick={() => setLineItems((current) => current.filter((lineItem) => lineItem.sku !== item.sku))}
                                  className="rounded-md border border-outline-variant px-2 py-1 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-lowest"
                                >
                                  Quitar
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                              <label className="min-w-0">
                                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Cantidad recomendada</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(event) => {
                                    const nextValue = Math.max(1, Number(event.target.value) || 1);
                                    setLineItems((current) => current.map((lineItem) => (lineItem.sku === item.sku ? { ...lineItem, quantity: nextValue } : lineItem)));
                                  }}
                                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors focus:border-secondary"
                                />
                              </label>
                              <div className="text-sm text-on-surface-variant">
                                Mínimo: <span className="font-semibold text-primary">{item.minimum}</span> · Actual: <span className="font-semibold text-primary">{item.stock}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="min-w-0 md:col-span-2">
                        <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Agregar otro producto</span>
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
                        <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Proveedor</span>
                        <select value={selectedSupplier} onChange={(event) => setSelectedSupplier(event.target.value)} className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors focus:border-secondary">
                          {suppliersOptions.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={handleClose} className="w-full rounded-xl border border-outline-variant px-4 py-3 text-body-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container-lowest">Cancelar</button>
                    <button type="button" onClick={() => setFlowStage('summary')} className="w-full rounded-xl bg-primary px-4 py-3 text-body-md font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-95">Ver resumen del pedido</button>
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
                <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 shadow-md md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">Resumen del pedido</p>
                      <h4 className="mt-1 text-headline-md font-semibold text-primary">Confirma el contenido antes de enviar</h4>
                    </div>
                    <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{lineItems.length} referencias</span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {lineItems.map((lineItem) => (
                      <div key={lineItem.sku} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-primary">{lineItem.name}</p>
                            <p className="text-xs text-on-surface-variant">{lineItem.sku} · {lineItem.category}</p>
                          </div>
                          <span className="rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">{lineItem.quantity} {lineItem.unit}</span>
                        </div>
                        <div className="mt-2 text-sm text-on-surface-variant">
                          Recomendada: <span className="font-semibold text-primary">{lineItem.recommendedQuantity}</span> · Estado después de recibir: <span className="font-semibold text-primary">{getStockStatus(Number(lineItem.stock) + Number(lineItem.quantity), Number(lineItem.minimum))}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                    <div className="flex items-center justify-between gap-3 border-b border-outline-variant pb-3">
                      <span className="text-body-md text-on-surface-variant">Proveedor</span>
                      <span className="text-body-md font-semibold text-primary">{supplierWarehouse.name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-b border-outline-variant py-3">
                      <span className="text-body-md text-on-surface-variant">Punto A</span>
                      <span className="text-body-md font-semibold text-primary">{pointA.label}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-3">
                      <span className="text-headline-md font-bold text-primary">Punto B</span>
                      <span className="text-headline-md font-black text-primary">Almacén Central Novaxclean</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={() => setFlowStage('form')} className="w-full rounded-xl border border-outline-variant px-4 py-3 text-body-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container-lowest">Volver al formulario</button>
                    <button type="button" onClick={handleSendOrder} className="w-full rounded-xl bg-primary px-4 py-3 text-body-md font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-95">Enviar pedido</button>
                  </div>
                </section>
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
                  <article className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low shadow-md">
                    <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest px-4 py-3 md:px-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">Tracking de reabastecimiento</p>
                        <p className="text-sm text-on-surface-variant">{pointA.label} &rarr; Almacén Central Novaxclean</p>
                      </div>
                      <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">Paso {activeStep + 1} de 4</span>
                    </div>

                    <div className="h-[380px] w-full md:h-[470px]">
                      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} className="h-full w-full" preferCanvas>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler />
                        <Polyline positions={routePath} pathOptions={{ color: '#0f6ecf', weight: 6, opacity: 0.85 }} />
                        <Marker position={[pointA.lat, pointA.lng]} icon={pointAIcon} />
                        <Marker position={[pointB.lat, pointB.lng]} icon={pointBIcon} />
                        <Marker position={truckPosition} icon={truckIcon} />
                      </MapContainer>
                    </div>
                  </article>

                  <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 shadow-sm">
                    <h5 className="text-base font-bold text-primary">Estado del cargamento</h5>
                    <p className="mt-1 text-sm text-on-surface-variant">Simulación logística de proveedor a almacén.</p>

                    <ol className="mt-5 space-y-4">
                      {TRACKING_STEPS.map((step, index) => {
                        const isDone = index < activeStep;
                        const isCurrent = index === activeStep;
                        const isFuture = index > activeStep;

                        return (
                          <li key={step.key} className="flex gap-3">
                            <div className="relative flex flex-col items-center">
                              <motion.span
                                className={`z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border ${isDone ? 'border-secondary bg-secondary text-on-primary' : isCurrent ? 'border-secondary bg-secondary/15 text-secondary' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant/50'}`}
                                animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                                transition={isCurrent ? { duration: 1.2, repeat: Infinity } : { duration: 0.2 }}
                              >
                                {isDone ? <CheckCircle2 className="h-4 w-4" /> : isCurrent ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Package2 className="h-3.5 w-3.5" />}
                              </motion.span>
                              {index < TRACKING_STEPS.length - 1 ? <span className={`mt-1 h-8 w-px ${isFuture ? 'bg-outline-variant' : 'bg-secondary/45'}`} /> : null}
                            </div>

                            <div className={`min-w-0 rounded-xl border px-3 py-2 ${isDone || isCurrent ? 'border-secondary/25 bg-secondary/5' : 'border-outline-variant bg-surface-container-lowest opacity-75'}`}>
                              <p className="text-sm font-semibold text-primary">{step.title}</p>
                              <p className="mt-1 text-xs text-on-surface-variant">{step.detail}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                </div>

                <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">Recepción en almacén</p>
                      <h5 className="mt-1 text-base font-bold text-primary">Camión en bahía de descarga</h5>
                    </div>
                    <button type="button" onClick={handleMarkReceived} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95">
                      Marcar como Recibido e Ingressar al Almacén
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Proveedor</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{supplierWarehouse.name}</p>
                    </div>
                    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Solicitudes</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{lineItems.length} referencias</p>
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
