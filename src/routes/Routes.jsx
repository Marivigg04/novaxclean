import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import LandingPage from '../components/landing/LandingPage';
import CatalogPage from '../components/catalog/CatalogPage';
import CartPage from '../components/cart/CartPage';
import AuthPage from '../components/AuthPage';
import Dashboard from '../features/admin/dashboard/page/Dashboard';
import Inventory from '@/features/admin/inventory/page/Inventory';
import Settings from '@/features/admin/settings/page/Settings';

function LandingRoute() {
	const navigate = useNavigate();

	return (
		<LandingPage
			onExploreCatalog={() => navigate('/catalogo')}
			onOpenCart={() => navigate('/carrito')}
			onOpenAuth={() => navigate('/auth')}
		/>
	);
}

function CatalogRoute() {
	const navigate = useNavigate();

	return (
		<CatalogPage
			onBackToLanding={() => navigate('/')}
			onOpenCart={() => navigate('/carrito')}
			onOpenAuth={() => navigate('/auth')}
		/>
	);
}

function CartRoute() {
	const navigate = useNavigate();

	return (
		<CartPage
			onBackToLanding={() => navigate('/')}
			onBackToCatalog={() => navigate('/catalogo')}
			onOpenCart={() => navigate('/carrito')}
			onOpenAuth={() => navigate('/auth')}
		/>
	);
}

function AuthRoute() {
	const navigate = useNavigate();

	return (
		<AuthPage
			onBackToLanding={() => navigate('/')}
			onAuthSuccess={() => navigate('/admin')}
		/>
	);
}

function PrivateRoute() {
	const isAdmin = typeof window !== 'undefined' && window.localStorage?.getItem('isAdmin') === 'true';
	return isAdmin ? <Outlet /> : <Navigate to="/auth" replace />;
}

function AppRoutes() {
	return (
		<Routes>
			{/* Rutas publicas */}
			<Route path="/" element={<LandingRoute />} />
			<Route path="/catalogo" element={<CatalogRoute />} />
			<Route path="/carrito" element={<CartRoute />} />
			<Route path="/auth" element={<AuthRoute />} />

			{/* Rutas privadas */}
			<Route element={<PrivateRoute />}>
				<Route path="/admin" element={<Dashboard />} />
				<Route path="/admin/inventory" element={<Inventory />} />
				<Route path="/admin/settings" element={<Settings />} />
				<Route path="/dashboard" element={<Dashboard />} />
			</Route>

			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default AppRoutes;
