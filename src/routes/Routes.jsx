import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import LandingPage from '../components/landing/LandingPage';
import CatalogPage from '../components/catalog/CatalogPage';
import CartPage from '../components/cart/CartPage';
import AuthPage from '../components/AuthPage';
import Dashboard from '../features/admin/dashboard/page/Dashboard';
import Inventory from '@/features/admin/inventory/page/Inventory';
import Materials from '@/features/admin/materials/page/Materials';
import Settings from '@/features/admin/settings/page/Settings';
import Profile from '@/features/user/profile/page/Profile';

function LandingRoute({ initialSection }) {
	const navigate = useNavigate();

	return (
		<LandingPage
			initialSection={initialSection}
			onExploreCatalog={() => navigate('/catalogo')}
			onOpenCart={() => navigate('/carrito')}
			onOpenAuth={() => navigate('/auth')}
		/>
	);
}

function HomeRoute() {
	return <LandingRoute />;
}

function InfoRoute() {
	return <LandingRoute initialSection="informacion" />;
}

function CompanyRoute() {
	return <LandingRoute initialSection="empresa" />;
}

function ContactRoute() {
	return <LandingRoute initialSection="contacto" />;
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
			onAuthSuccess={(role) => navigate(role === 'Admin' ? '/admin' : '/perfil')}
		/>
	);
}

function PrivateRoute() {
	const isAdmin = typeof window !== 'undefined' && window.localStorage?.getItem('isAdmin') === 'true';
	return isAdmin ? <Outlet /> : <Navigate to="/auth" replace />;
}

function UserRoute() {
	const hasUser = typeof window !== 'undefined' && !!window.localStorage?.getItem('user');
	return hasUser ? <Outlet /> : <Navigate to="/auth" replace />;
}

function AppRoutes() {
	return (
		<Routes>
			{/* Rutas publicas */}
			<Route path="/" element={<HomeRoute />} />
			<Route path="/informacion" element={<InfoRoute />} />
			<Route path="/empresa" element={<CompanyRoute />} />
			<Route path="/contacto" element={<ContactRoute />} />
			<Route path="/catalogo" element={<CatalogRoute />} />
			<Route path="/carrito" element={<CartRoute />} />
			<Route path="/auth" element={<AuthRoute />} />

			{/* Rutas privadas */}
			<Route element={<PrivateRoute />}>
				<Route path="/admin" element={<Dashboard />} />
				<Route path="/admin/inventory" element={<Inventory />} />
				<Route path="/admin/raw-materials" element={<Materials />} />
				<Route path="/admin/settings" element={<Settings />} />
				<Route path="/dashboard" element={<Dashboard />} />
			</Route>

			<Route element={<UserRoute />}>
				<Route path="/perfil" element={<Profile />} />
			</Route>

			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default AppRoutes;
