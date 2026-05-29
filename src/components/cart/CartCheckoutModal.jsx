import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CheckCircle2, Circle, LoaderCircle, MessageCircle, Phone } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const paymentMethods = [
  { id: 'tarjeta', label: 'Tarjeta corporativa', description: 'Visa, Mastercard o American Express' },
  { id: 'transferencia', label: 'Transferencia bancaria', description: 'Confirmacion al acreditar el pago' },
  { id: 'pagomovil', label: 'Pago Movil', description: 'Pago rapido desde tu banco o app movil' },
];

const trackingSteps = [
  { key: 'received', title: 'Pedido Recibido', detail: 'Procesando orden.' },
  { key: 'preparing', title: 'Preparando Pedido', detail: 'Empacando productos en el almacen de Novaxclean (Punto A).' },
  { key: 'payment', title: 'Pago Procesado', detail: 'Verificando facturacion.' },
  { key: 'transit', title: 'Repartidor en Camino', detail: 'El motorizado salio desde Novaxclean hacia tu direccion.' },
  { key: 'arrived', title: 'El repartidor ha llegado', detail: 'Entrega completada con exito.' },
];

const PRE_TRACK_STEP_DURATION_MS = [2200, 2600, 2000];
const RIDE_DURATION_MS = 10000;
const PAYMENT_CONFIRMATION_MS = 1600;

const originPoint = {
  lat: 10.4811,
  lng: -66.9036,
  label: 'Almacen Central Novaxclean',
};

function getTextSeed(value = '') {
  return value
    .split('')
    .reduce((acc, char, index) => (acc + char.charCodeAt(0) * (index + 11)) % 100000, 0);
}

function createDestinationFromAddress(address, city) {
  const seed = getTextSeed(`${address}|${city}`);
  const latOffset = ((seed % 240) - 120) / 10000;
  const lngOffset = (((seed * 3) % 320) - 160) / 10000;

  return {
    lat: originPoint.lat + latOffset,
    lng: originPoint.lng + lngOffset,
    label: address || 'Av. Principal de Los Chorros, Caracas',
  };
}

async function geocodeDestination(address, city, signal) {
  const normalizedCity = city?.trim() || 'Caracas';
  const queryParts = [address, normalizedCity, 'Distrito Capital', 'Venezuela'].filter(Boolean);
  const query = queryParts.join(', ');

  if (!query.trim()) {
    return createDestinationFromAddress(address, city);
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 've');
  url.searchParams.set('viewbox', '-67.12,10.58,-66.76,10.34');
  url.searchParams.set('bounded', '1');
  url.searchParams.set('addressdetails', '1');

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      signal,
      headers: {
        'Accept-Language': 'es',
      },
    });

    if (!response.ok) {
      return createDestinationFromAddress(address, city);
    }

    const results = await response.json();
    const first = Array.isArray(results) ? results[0] : null;

    if (!first?.lat || !first?.lon) {
      return createDestinationFromAddress(address, city);
    }

    return {
      lat: Number(first.lat),
      lng: Number(first.lon),
      label: address || first.display_name || 'Direccion de entrega',
      display_name: first.display_name,
    };
  } catch {
    return createDestinationFromAddress(address, city);
  }
}

async function reverseGeocode(lat, lng) {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url.toString(), { headers: { 'Accept-Language': 'es' } });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.display_name || null;
  } catch {
    return null;
  }
}

function createRoutePath(origin, destination) {
  const dx = destination.lng - origin.lng;
  const dy = destination.lat - origin.lat;
  const perpendicularX = -dy;
  const perpendicularY = dx;

  return [
    [origin.lat, origin.lng],
    [origin.lat + dy * 0.18 + perpendicularY * 0.04, origin.lng + dx * 0.18 + perpendicularX * 0.04],
    [origin.lat + dy * 0.42 - perpendicularY * 0.03, origin.lng + dx * 0.42 - perpendicularX * 0.03],
    [origin.lat + dy * 0.68 + perpendicularY * 0.02, origin.lng + dx * 0.68 + perpendicularX * 0.02],
    [destination.lat, destination.lng],
  ];
}

function measureDistance(a, b) {
  const dLat = b[0] - a[0];
  const dLng = b[1] - a[1];
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function interpolateRoute(route, progress) {
  if (!route.length) return [originPoint.lat, originPoint.lng];
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

function ConfettiLayer() {
  const pieces = new Array(18).fill(null);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {pieces.map((_, index) => {
        const left = 6 + (index % 9) * 10;
        const delay = (index % 6) * 0.18;
        const duration = 2.4 + (index % 5) * 0.2;

        return (
          <motion.span
            key={`confetti-${index}`}
            className="absolute h-2 w-2 rounded-full bg-secondary/50"
            style={{ left: `${left}%`, top: '-5%' }}
            initial={{ y: -10, opacity: 0, scale: 0.4 }}
            animate={{ y: '110%', opacity: [0, 0.9, 0], rotate: [0, 130, 260], scale: [0.4, 1, 0.6] }}
            transition={{ delay, duration, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

function MapClickHandler({ onMapClick }) {
  useMapEvent('click', (event) => {
    if (onMapClick) {
      onMapClick(event.latlng);
    }
  });

  return null;
}

export default function CartCheckoutModal({ isOpen, onClose, onGoToCatalog = () => {} }) {
  const { user, isAuthenticated } = useAuth();
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [fulfillment, setFulfillment] = useState('delivery');
  const [addressMode, setAddressMode] = useState('registered');
  const [newAddress, setNewAddress] = useState({ street: '', city: '', postalCode: '' });
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  const [flowStage, setFlowStage] = useState('checkout');
  const [activeStep, setActiveStep] = useState(0);
  const [showArrivalBanner, setShowArrivalBanner] = useState(false);
  const [isResolvingDestination, setIsResolvingDestination] = useState(false);
  const [destination, setDestination] = useState(createDestinationFromAddress('', ''));
  const [matchedAddress, setMatchedAddress] = useState('');
  const [manualPlacementMode, setManualPlacementMode] = useState(false);
  const [riderPosition, setRiderPosition] = useState([originPoint.lat, originPoint.lng]);

  const stepTimeoutRef = useRef(null);
  const paymentTimeoutRef = useRef(null);
  const arrivalTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  const rideStartTimeRef = useRef(0);
  const geocodeAbortRef = useRef(null);

  const storePickupInfo = {
    address: 'Av. Principal 123, Torre Corporativa, Caracas, Distrito Capital',
    weekdayHours: 'Lunes a viernes de 8:00 am a 6:00 pm',
    saturdayHours: 'Sabados de 9:00 am a 1:00 pm',
  };

  const transferInfo = {
    bank: 'Banco Nacional de Comercio',
    accountHolder: 'NovaxClean C.A.',
    accountNumber: '0102-0201-20-1234567890',
    rif: 'J-12345678-9',
    reference: 'Pedido + nombre del cliente',
  };

  const paymentMobileInfo = {
    bank: 'Banco Nacional de Comercio',
    phone: '0412-555-7890',
    idNumber: 'J-12345678-9',
    beneficiary: 'NovaxClean C.A.',
    reference: 'Pedido + nombre del cliente',
  };

  const routePath = useMemo(() => createRoutePath(originPoint, destination), [destination]);
  const mapCenter = useMemo(() => [(originPoint.lat + destination.lat) / 2, (originPoint.lng + destination.lng) / 2], [destination]);

  const riderIcon = useMemo(
    () =>
      L.divIcon({
        className: 'novax-rider-icon',
        html: '<div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;background:#0f6ecf;border:2px solid #ffffff;border-radius:999px;box-shadow:0 8px 18px rgba(16,43,81,.35);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 17.5C6.32843 17.5 7 16.8284 7 16C7 15.1716 6.32843 14.5 5.5 14.5C4.67157 14.5 4 15.1716 4 16C4 16.8284 4.67157 17.5 5.5 17.5Z" fill="white"/><path d="M17.5 17.5C18.3284 17.5 19 16.8284 19 16C19 15.1716 18.3284 14.5 17.5 14.5C16.6716 14.5 16 15.1716 16 16C16 16.8284 16.6716 17.5 17.5 17.5Z" fill="white"/><path d="M10.5 6.5L12.2 10H16.3C17.6 10 18.4 11.4 17.8 12.6L16.6 15H14.8L15.7 13.2H11.6L10.3 10.6L8.3 12.2L7.1 10.7L10.5 6.5Z" fill="white"/></svg></div>',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      }),
    [],
  );

  const pointAIcon = useMemo(
    () =>
      L.divIcon({
        className: 'novax-point-icon',
        html: '<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:#143d70;color:#fff;font-weight:800;border-radius:999px;border:2px solid #fff;box-shadow:0 6px 14px rgba(20,61,112,.35);">A</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
    [],
  );

  const pointBIcon = useMemo(
    () =>
      L.divIcon({
        className: 'novax-point-icon',
        html: '<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:#24a3ff;color:#fff;font-weight:800;border-radius:999px;border:2px solid #fff;box-shadow:0 6px 14px rgba(36,163,255,.35);">B</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
    [],
  );

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
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isOpen, isRendered]);

  useEffect(() => {
    if (!isOpen) return;

    setPaymentMethod('');
    setFulfillment('delivery');
    setAddressMode('registered');
    setNewAddress({ street: '', city: '', postalCode: '' });
    setFlowStage('checkout');
    setActiveStep(0);
    setShowArrivalBanner(false);
    setIsResolvingDestination(false);
    setMatchedAddress('');
    setManualPlacementMode(false);
    setDestination(createDestinationFromAddress(address, city));
    setRiderPosition([originPoint.lat, originPoint.lng]);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isRendered) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRendered, onClose]);

  useEffect(() => {
    if (flowStage !== 'tracking') return undefined;

    if (activeStep < 3) {
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

    if (activeStep === 3) {
      const animateRide = (timestamp) => {
        if (!rideStartTimeRef.current) {
          rideStartTimeRef.current = timestamp;
        }

        const elapsed = timestamp - rideStartTimeRef.current;
        const progress = Math.min(elapsed / RIDE_DURATION_MS, 1);
        setRiderPosition(interpolateRoute(routePath, progress));

        if (progress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(animateRide);
          return;
        }

        setActiveStep(4);
        setFlowStage('delivered');
        setShowArrivalBanner(true);
      };

      animationFrameRef.current = window.requestAnimationFrame(animateRide);

      return () => {
        if (animationFrameRef.current) {
          window.cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        rideStartTimeRef.current = 0;
      };
    }

    return undefined;
  }, [activeStep, flowStage, routePath]);

  useEffect(
    () => () => {
      if (stepTimeoutRef.current) window.clearTimeout(stepTimeoutRef.current);
      if (paymentTimeoutRef.current) window.clearTimeout(paymentTimeoutRef.current);
      if (arrivalTimeoutRef.current) window.clearTimeout(arrivalTimeoutRef.current);
      if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current);
      if (geocodeAbortRef.current) geocodeAbortRef.current.abort();
    },
    [],
  );

  const handleClose = () => {
    if (stepTimeoutRef.current) window.clearTimeout(stepTimeoutRef.current);
    if (paymentTimeoutRef.current) window.clearTimeout(paymentTimeoutRef.current);
    if (arrivalTimeoutRef.current) window.clearTimeout(arrivalTimeoutRef.current);
    if (animationFrameRef.current) window.cancelAnimationFrame(animationFrameRef.current);
    if (geocodeAbortRef.current) geocodeAbortRef.current.abort();
    stepTimeoutRef.current = null;
    paymentTimeoutRef.current = null;
    arrivalTimeoutRef.current = null;
    animationFrameRef.current = null;
    geocodeAbortRef.current = null;
    rideStartTimeRef.current = 0;
    onClose();
  };

  const resolveDeliveryQuery = () => {
    if (fulfillment === 'pickup') {
      return {
        address: storePickupInfo.address,
        city: 'Caracas',
      };
    }

    if (addressMode === 'new') {
      return {
        address: [newAddress.street, newAddress.postalCode].filter(Boolean).join(', '),
        city: newAddress.city || city || 'Caracas',
      };
    }

    return {
      address: address || user?.address || registeredAddress || '',
      city: city || 'Caracas',
    };
  };

  const startTrackingFlow = async () => {
    if (isResolvingDestination) return;

    if (geocodeAbortRef.current) {
      geocodeAbortRef.current.abort();
    }

    const controller = new AbortController();
    geocodeAbortRef.current = controller;
    setIsResolvingDestination(true);

    const query = resolveDeliveryQuery();
    const resolvedDestination = await geocodeDestination(query.address, query.city, controller.signal);

    if (controller.signal.aborted) {
      return;
    }

    setDestination(resolvedDestination);
    setMatchedAddress(resolvedDestination.display_name || resolvedDestination.label || '');
    setManualPlacementMode(false);
    setRiderPosition([originPoint.lat, originPoint.lng]);
    setFlowStage('payment-confirmed');
    setIsResolvingDestination(false);
    geocodeAbortRef.current = null;

    paymentTimeoutRef.current = window.setTimeout(() => {
      setFlowStage('tracking');
      setActiveStep(0);
    }, PAYMENT_CONFIRMATION_MS);
  };

  const handleGoToCatalog = () => {
    handleClose();
    onGoToCatalog();
  };

  const handleMapClick = async (latlng) => {
    if (!latlng) return;

    const { lat, lng } = latlng;
    setDestination({ lat, lng, label: 'Marcado manualmente' });
    setRiderPosition([originPoint.lat, originPoint.lng]);
    const display = await reverseGeocode(lat, lng);
    setMatchedAddress(display || 'Marcado manualmente');
    setManualPlacementMode(false);
  };

  if (!isRendered) {
    return null;
  }

  const userSummary = [
    { label: 'Nombre', value: user?.name || 'No disponible' },
    { label: 'Correo', value: user?.email || 'No disponible' },
    { label: 'Telefono', value: user?.phone || 'No disponible' },
  ];

  const registeredAddress = user?.address || 'No hay direccion registrada para esta cuenta';
  const inTracking = flowStage === 'tracking' || flowStage === 'delivered';
  const canConfirmPayment = paymentMethod !== '' && flowStage === 'checkout' && !isResolvingDestination;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-primary/50 px-4 py-6 backdrop-blur-sm md:items-center ${isClosing ? 'cart-modal-overlay-exit' : 'cart-modal-overlay-enter'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      onClick={handleClose}
    >
      <div
        className={`cart-scrollbar my-auto max-h-[calc(100dvh-3rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-2xl ${isClosing ? 'cart-modal-panel-exit' : 'cart-modal-panel-enter'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant bg-surface-container-low px-6 py-5 md:px-8">
          <div className="min-w-0">
            <p className="mb-1 text-label-md font-bold uppercase tracking-[0.14em] text-secondary">{inTracking ? 'Seguimiento en Tiempo Real' : 'Checkout'}</p>
            <h3 id="checkout-title" className="text-headline-md font-bold text-primary">{inTracking ? 'Tracking de Pedido Novaxclean' : 'Confirma tu pedido'}</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">
              {inTracking
                ? 'Visualiza cada etapa del delivery y la ruta del repartidor en tiempo real.'
                : 'Selecciona un metodo de pago y completa los datos para continuar con la orden.'}
            </p>
          </div>

          <button className="rounded-xl border border-outline-variant px-3 py-2 text-label-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container-lowest" type="button" onClick={handleClose}>
            Cerrar
          </button>
        </div>

        <div className="cart-scrollbar relative max-h-[calc(100dvh-11rem)] overflow-y-auto px-6 py-6 md:px-8">
          <AnimatePresence mode="wait">
            {flowStage === 'checkout' ? (
              <motion.form
                key="checkout-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
              >
                <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low p-5 shadow-sm md:p-6">
                  <h4 className="mb-4 text-headline-md font-semibold text-primary">Datos registrados del usuario</h4>

                  <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                        {String(user?.avatar ?? user?.name?.[0] ?? 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-label-md font-bold text-primary">{user?.name || 'Usuario no autenticado'}</p>
                        <p className="text-sm text-on-surface-variant">{isAuthenticated ? 'Datos sincronizados desde tu sesion' : 'Inicia sesion para ver tus datos registrados'}</p>
                      </div>
                    </div>

                    <dl className="grid gap-3">
                      {userSummary.map((item) => (
                        <div key={item.label} className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
                          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{item.label}</dt>
                          <dd className="mt-1 break-words text-body-md font-semibold text-primary">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="mt-6">
                    <p className="mb-3 text-label-md font-semibold text-on-surface-variant">Modalidad de entrega</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${fulfillment === 'pickup' ? 'border-secondary bg-secondary/10' : 'border-outline-variant bg-surface-container-lowest'}`}>
                        <input className="mt-1" name="fulfillment" type="radio" value="pickup" checked={fulfillment === 'pickup'} onChange={() => setFulfillment('pickup')} />
                        <div className="min-w-0">
                          <p className="font-semibold text-primary">Pick Up</p>
                          <p className="text-sm text-on-surface-variant">Retiro en almacen para recogida directa.</p>
                        </div>
                      </label>
                      <label className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${fulfillment === 'delivery' ? 'border-secondary bg-secondary/10' : 'border-outline-variant bg-surface-container-lowest'}`}>
                        <input className="mt-1" name="fulfillment" type="radio" value="delivery" checked={fulfillment === 'delivery'} onChange={() => setFulfillment('delivery')} />
                        <div className="min-w-0">
                          <p className="font-semibold text-primary">Delivery</p>
                          <p className="text-sm text-on-surface-variant">Envio directo a la direccion indicada.</p>
                        </div>
                      </label>
                    </div>

                    {fulfillment === 'pickup' && (
                      <div className="mt-4 rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                        <p className="text-label-md font-bold text-primary">Retiro en tienda</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Direccion</p>
                            <p className="mt-1 text-body-md font-semibold text-primary">{storePickupInfo.address}</p>
                          </div>
                          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Horario</p>
                            <p className="mt-1 text-body-md font-semibold text-primary">{storePickupInfo.weekdayHours}</p>
                            <p className="mt-1 text-body-md font-semibold text-primary">{storePickupInfo.saturdayHours}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {fulfillment === 'delivery' && (
                    <div className="mt-6">
                      <p className="mb-3 text-label-md font-semibold text-on-surface-variant">Direccion de entrega</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${addressMode === 'registered' ? 'border-secondary bg-secondary/10' : 'border-outline-variant bg-surface-container-lowest'}`}>
                          <input className="mt-1" name="addressMode" type="radio" value="registered" checked={addressMode === 'registered'} onChange={() => setAddressMode('registered')} />
                          <div className="min-w-0">
                            <p className="font-semibold text-primary">Usar direccion registrada</p>
                            <p className="text-sm text-on-surface-variant break-words">{registeredAddress}</p>
                          </div>
                        </label>
                        <label className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${addressMode === 'new' ? 'border-secondary bg-secondary/10' : 'border-outline-variant bg-surface-container-lowest'}`}>
                          <input className="mt-1" name="addressMode" type="radio" value="new" checked={addressMode === 'new'} onChange={() => setAddressMode('new')} />
                          <div className="min-w-0">
                            <p className="font-semibold text-primary">Registrar una nueva direccion</p>
                            <p className="text-sm text-on-surface-variant">Usala solo para este pedido.</p>
                          </div>
                        </label>
                      </div>

                      {addressMode === 'new' && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <label className="min-w-0 md:col-span-2">
                            <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Direccion nueva</span>
                            <input
                              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary"
                              placeholder="Calle, numero, colonia, referencia"
                              type="text"
                              value={newAddress.street}
                              onChange={(event) => setNewAddress((current) => ({ ...current, street: event.target.value }))}
                            />
                          </label>
                          <label className="min-w-0">
                            <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Ciudad</span>
                            <input
                              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary"
                              placeholder="Ciudad"
                              type="text"
                              value={newAddress.city}
                              onChange={(event) => setNewAddress((current) => ({ ...current, city: event.target.value }))}
                            />
                          </label>
                          <label className="min-w-0">
                            <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Codigo postal</span>
                            <input
                              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary"
                              placeholder="00000"
                              type="text"
                              value={newAddress.postalCode}
                              onChange={(event) => setNewAddress((current) => ({ ...current, postalCode: event.target.value }))}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {fulfillment === 'delivery' && (
                    <label className="mt-6 block min-w-0">
                      <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Notas adicionales</span>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        className="min-h-28 w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary"
                        placeholder="Indicaciones de acceso, horario, referencia interna..."
                      />
                    </label>
                  )}
                </section>

                <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low p-5 shadow-md md:p-6">
                  <h4 className="mb-4 text-headline-md font-semibold text-primary">Metodos de pago</h4>
                  <p className="mb-4 text-body-md text-on-surface-variant">Elige una opcion. Debe quedar seleccionada para continuar.</p>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label key={method.id} className={`flex min-w-0 cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${paymentMethod === method.id ? 'border-secondary bg-secondary/10' : 'border-outline-variant bg-surface-container-lowest'}`}>
                        <input className="mt-1 shrink-0" name="paymentMethod" type="radio" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
                        <div className="min-w-0">
                          <p className="font-semibold text-primary">{method.label}</p>
                          <p className="text-sm text-on-surface-variant">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === 'tarjeta' && (
                    <div className="mt-4 rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                      <p className="text-label-md font-bold text-primary">Datos de la tarjeta corporativa</p>
                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        <label className="min-w-0 md:col-span-2">
                          <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Titular de la tarjeta</span>
                          <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="Nombre del titular" type="text" />
                        </label>
                        <label className="min-w-0 md:col-span-2">
                          <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Numero de tarjeta</span>
                          <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="0000 0000 0000 0000" type="text" inputMode="numeric" />
                        </label>
                        <label className="min-w-0">
                          <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Vencimiento</span>
                          <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="MM/AA" type="text" inputMode="numeric" />
                        </label>
                        <label className="min-w-0">
                          <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">CVV</span>
                          <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="123" type="password" inputMode="numeric" />
                        </label>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'transferencia' && (
                    <div className="mt-4 rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                      <p className="text-label-md font-bold text-primary">Datos para transferencia</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Banco</p>
                          <p className="mt-1 text-body-md font-semibold text-primary">{transferInfo.bank}</p>
                        </div>
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Titular</p>
                          <p className="mt-1 text-body-md font-semibold text-primary">{transferInfo.accountHolder}</p>
                        </div>
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Cuenta</p>
                          <p className="mt-1 text-body-md font-semibold text-primary">{transferInfo.accountNumber}</p>
                        </div>
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">RIF</p>
                          <p className="mt-1 text-body-md font-semibold text-primary">{transferInfo.rif}</p>
                        </div>
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Referencia sugerida</p>
                          <p className="mt-1 text-body-md font-semibold text-primary">{transferInfo.reference}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'pagomovil' && (
                    <div className="mt-4 rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                      <p className="text-label-md font-bold text-primary">Datos para Pago Movil</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Banco</p>
                          <p className="mt-1 text-body-md font-semibold text-primary">{paymentMobileInfo.bank}</p>
                        </div>
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Telefono</p>
                          <p className="mt-1 text-body-md font-semibold text-primary">{paymentMobileInfo.phone}</p>
                        </div>
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Cedula / RIF</p>
                          <p className="mt-1 text-body-md font-semibold text-primary">{paymentMobileInfo.idNumber}</p>
                        </div>
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Beneficiario</p>
                          <p className="mt-1 text-body-md font-semibold text-primary">{paymentMobileInfo.beneficiary}</p>
                        </div>
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 sm:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Referencia sugerida</p>
                          <p className="mt-1 text-body-md font-semibold text-primary">{paymentMobileInfo.reference}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                    <div className="flex items-center justify-between gap-3 border-b border-outline-variant pb-3">
                      <span className="text-body-md text-on-surface-variant">Subtotal</span>
                      <span className="text-body-md font-semibold text-primary">$376.30</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-b border-outline-variant py-3">
                      <span className="text-body-md text-on-surface-variant">Impuestos</span>
                      <span className="text-body-md font-semibold text-primary">$60.21</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-3">
                      <span className="text-headline-md font-bold text-primary">Total</span>
                      <span className="text-headline-md font-black text-primary">$436.51</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button className="w-full rounded-xl border border-outline-variant px-4 py-3 text-body-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container-lowest" type="button" onClick={handleClose}>
                      Cancelar
                    </button>
                    <button className="w-full rounded-xl bg-primary px-4 py-3 text-body-md font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={!canConfirmPayment} onClick={startTrackingFlow}>
                      {isResolvingDestination ? 'Validando direccion...' : 'Confirmar pago'}
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-on-surface-variant">Antes de confirmar, selecciona un metodo de pago y completa los campos obligatorios.</p>
                </section>
              </motion.form>
            ) : null}

            {flowStage === 'payment-confirmed' ? (
              <motion.div
                key="payment-confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-outline-variant bg-surface-container-low p-8 text-center shadow-md"
              >
                <motion.div
                  className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20 text-secondary"
                  initial={{ scale: 0.3, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                >
                  <CheckCircle2 className="h-10 w-10" />
                </motion.div>
                <h4 className="text-headline-lg font-bold text-primary">Pago recibido</h4>
                <p className="mt-2 text-body-md text-on-surface-variant">Estamos verificando facturacion y asignando repartidor. En segundos veras el tracking en vivo.</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm text-on-surface-variant">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Sincronizando estado del pedido...
                </div>
              </motion.div>
            ) : null}

            {inTracking ? (
              <motion.section
                key="tracking-view"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32 }}
                className="grid gap-5"
              >
                <div className="grid gap-5 lg:grid-cols-[1.35fr_0.9fr] lg:items-stretch">
                  <article className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low shadow-md">
                    <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 py-3 md:px-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">Mapa de seguimiento</p>
                        <p className="text-sm text-on-surface-variant">Ruta: {originPoint.label} &rarr; {destination.label}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <p className="text-xs text-on-surface-variant">Direccion encontrada: <span className="font-semibold text-primary">{matchedAddress || destination.label}</span></p>
                          <button type="button" onClick={() => setManualPlacementMode((current) => !current)} className="rounded-md border border-outline-variant bg-surface-container-low px-2 py-1 text-xs font-semibold text-primary hover:bg-secondary/10">
                            Reubicar en mapa
                          </button>
                        </div>
                        {manualPlacementMode ? <p className="mt-1 text-xs text-on-surface-variant">Haz click en el mapa para mover el pin y ajustar la ubicacion exacta.</p> : null}
                      </div>
                      <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">{flowStage === 'delivered' ? 'Entregado' : 'En transito'}</span>
                    </div>

                    <div className="h-[380px] w-full md:h-[470px]">
                      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} className="h-full w-full" preferCanvas>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapClickHandler onMapClick={(latlng) => {
                          if (manualPlacementMode) {
                            handleMapClick(latlng);
                          }
                        }} />
                        <Polyline positions={routePath} pathOptions={{ color: '#0f6ecf', weight: 6, opacity: 0.85 }} />
                        <Marker position={[originPoint.lat, originPoint.lng]} icon={pointAIcon} />
                        <Marker position={[destination.lat, destination.lng]} icon={pointBIcon} />
                        <Marker position={riderPosition} icon={riderIcon} />
                      </MapContainer>
                    </div>
                  </article>

                  <section className="rounded-2xl border border-outline-variant bg-surface-container-low p-5 shadow-sm">
                    <h5 className="text-base font-bold text-primary">Estado del Delivery</h5>
                    <p className="mt-1 text-sm text-on-surface-variant">Simulacion secuencial inspirada en seguimiento en tiempo real.</p>

                    <ol className="mt-5 space-y-4">
                      {trackingSteps.map((step, index) => {
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
                                {isDone ? <Check className="h-4 w-4" /> : isCurrent ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Circle className="h-3 w-3" />}
                              </motion.span>
                              {index < trackingSteps.length - 1 ? <span className={`mt-1 h-8 w-px ${isFuture ? 'bg-outline-variant' : 'bg-secondary/45'}`} /> : null}
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
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">Repartidor Asignado</p>
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=140&q=80"
                      alt="Carlos Rodriguez"
                      className="h-14 w-14 rounded-full border border-outline-variant object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-primary">Carlos Rodriguez</p>
                      <p className="text-xs text-on-surface-variant">Bera Socialista Azul - Placa: AC9G24K</p>
                      <p className="mt-1 text-xs font-semibold text-primary">⭐ 4.9 (240 viajes)</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-secondary/10">
                      <Phone className="h-4 w-4" />
                      Llamar
                    </button>
                    <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-secondary/10">
                      <MessageCircle className="h-4 w-4" />
                      Enviar Mensaje
                    </button>
                  </div>
                </section>
              </motion.section>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {showArrivalBanner ? (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-x-4 top-4 z-20 rounded-3xl border border-emerald-300/60 bg-emerald-50 p-4 shadow-lg md:inset-x-8"
              >
                <ConfettiLayer />
                <div className="relative z-10 flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold text-emerald-800">El repartidor ha llegado</p>
                    <p className="mt-1 text-sm text-emerald-700">Tu pedido esta en la puerta. Gracias por comprar con Novaxclean.</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleGoToCatalog}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                      >
                        Quiero hacer otro pedido
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowArrivalBanner(false)}
                        className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        No, gracias
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
