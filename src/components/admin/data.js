export const sidebarLinks = [
  { label: 'Dashboard', icon: 'dashboard', active: true },
  { label: 'Inventario', icon: 'inventory_2' },
  { label: 'Pedidos', icon: 'shopping_bag' },
  { label: 'Clientes', icon: 'group' },
  { label: 'Reportes', icon: 'analytics' },
];

export const stats = [
  {
    label: 'Ingresos Totales',
    value: '$45,280.00',
    trend: '8.5%',
    trendIcon: 'trending_up',
    icon: 'payments',
    iconClass: 'bg-primary/10 text-primary',
  },
  {
    label: 'Pedidos Pendientes',
    value: '124',
    trend: '14%',
    trendIcon: 'trending_up',
    icon: 'package_2',
    iconClass: 'bg-secondary/10 text-secondary',
  },
  {
    label: 'Bajo Stock',
    value: '18 Ítems',
    trend: '2%',
    trendIcon: 'trending_down',
    icon: 'inventory',
    iconClass: 'bg-primary-container/10 text-primary-container',
    trendClass: 'text-error',
  },
  {
    label: 'Tasa de Satisfacción',
    value: '98.2%',
    trend: '5%',
    trendIcon: 'trending_up',
    icon: 'verified_user',
    iconClass: 'bg-secondary-container/20 text-on-secondary-container',
  },
];

export const salesBars = [
  { label: 'Desinfectantes', height: '60%', accent: 'h-[40%]' },
  { label: 'Jabones', height: '80%', accent: 'h-[20%]' },
  { label: 'Papel', height: '45%', accent: 'h-[50%]' },
  { label: 'Limpieza Ind.', height: '70%', accent: 'h-[15%]' },
  { label: 'Equipamiento', height: '55%', accent: 'h-[30%]' },
];

export const shippingRows = [
  { order: '#NV-8921', destination: 'Madrid, España', status: 'En Tránsito', statusClass: 'bg-secondary-container/20 text-on-secondary-container', eta: 'Mañana, 14:00', dotClass: 'bg-secondary animate-pulse' },
  { order: '#NV-8919', destination: 'Barcelona, España', status: 'Preparando', statusClass: 'bg-tertiary-container/20 text-on-tertiary-container', eta: '18 Mayo', dotClass: 'bg-tertiary' },
  { order: '#NV-8915', destination: 'Valencia, España', status: 'Entregado', statusClass: 'bg-green-100 text-green-700', eta: 'Hoy, 09:30', dotClass: 'bg-green-500' },
];

export const inventoryMetrics = [
  { label: 'Capacidad Almacén', value: '85%', barWidth: '85%', barClass: 'bg-secondary-container' },
  { label: 'Rotación de Stock', value: '6.2x/mes', barWidth: '62%', barClass: 'bg-on-primary' },
];

export const inventorySummary = [
  { label: 'Total SKUs', value: '1,248' },
  { label: 'Valor Stock', value: '€12.4M' },
];

export const routeSummary = {
  routes: '12',
  updated: 'Sincronizado hace 2 min',
};

export const bentoProducts = [
  {
    name: 'Pulverizador Ergonómico Pro',
    subtitle: 'Compatible con concentrados',
    price: '$8.50',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDggHlEKI9-BAayU1IMtm4itoyS8PkdZy58CXdhpwhZpYUs8D4fye14Dag42sn-5ZF1176u2sgE2UzoXiYtC2om9xsn3Pf7xKfUiS7ASFbiZNagl5drU2fbnjfFZ3W5Y4GfXC1XVZLFDL3RMt4_DOAoE6BThi4_c9gOEc8pnzNtK6dSbGZt2HmQO-ZgmVpKpQjAI3JBO5QAAHVhyAAGMPN-KyYgbH45nWjAl_oE7SXU1i9BRlN-swa35AqgJVPugC7VjPscdA4v9CM',
  },
  {
    name: 'Pack Guantes Nitrilo (100u)',
    subtitle: 'Resistencia industrial azul',
    price: '$12.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDggHlEKI9-BAayU1IMtm4itoyS8PkdZy58CXdhpwhZpYUs8D4fye14Dag42sn-5ZF1176u2sgE2UzoXiYtC2om9xsn3Pf7xKfUiS7ASFbiZNagl5drU2fbnjfFZ3W5Y4GfXC1XVZLFDL3RMt4_DOAoE6BThi4_c9gOEc8pnzNtK6dSbGZt2HmQO-ZgmVpKpQjAI3JBO5QAAHVhyAAGMPN-KyYgbH45nWjAl_oE7SXU1i9BRlN-swa35AqgJVPugC7VjPscdA4v9CM',
  },
];

export const footerLinks = [
  { label: 'Privacidad', href: '#' },
  { label: 'Términos', href: '#' },
  { label: 'Contacto', href: '#' },
  { label: 'Soporte', href: '#' },
];
