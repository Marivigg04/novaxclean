import { useEffect, useRef, lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { PageTransitionProvider, usePageTransition } from '../context/PageTransitionContext';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../components/landing/LandingPage';

const CatalogPage = lazy(() => import('../components/catalog/CatalogPage'));
const CartPage = lazy(() => import('../components/cart/CartPage'));
const AuthPage = lazy(() => import('../components/AuthPage'));
const ResetPasswordPage = lazy(() => import('../components/auth/ResetPasswordPage'));
const Dashboard = lazy(() => import('../features/admin/dashboard/page/Dashboard'));
const Inventory = lazy(() => import('@/features/admin/inventory/page/Inventory'));
const Materials = lazy(() => import('@/features/admin/materials/page/Materials'));
const Settings = lazy(() => import('@/features/admin/settings/page/Settings'));
const Profile = lazy(() => import('@/features/user/profile/page/Profile'));

const LoadingFallback = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
    <div className="relative flex items-center justify-center">
      <div className="absolute w-16 h-16 rounded-full border-2 border-primary/20 animate-ping" />
      <div className="w-11 h-11 rounded-full border-4 border-surface-container-high border-t-secondary animate-spin" />
    </div>
    <div className="flex flex-col items-center gap-1 mt-5">
      <span className="text-lg font-black tracking-widest text-primary dark:text-primary-fixed">
        NovaxClean
      </span>
      <span className="text-[10px] uppercase tracking-[0.25em] text-outline font-semibold">
        cargando…
      </span>
    </div>
  </div>
);

function LandingRoute({ initialSection }) {
	const { navigateTo } = usePageTransition();

	return (
		<LandingPage
			initialSection={initialSection}
			onExploreCatalog={() => navigateTo('/catalogo')}
			onOpenCart={() => navigateTo('/carrito')}
			onOpenAuth={() => navigateTo('/auth')}
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
	const { navigateTo } = usePageTransition();

	return (
		<CatalogPage
			onBackToLanding={() => navigateTo('/')}
			onOpenCart={() => navigateTo('/carrito')}
			onOpenAuth={() => navigateTo('/auth')}
		/>
	);
}

function CartRoute() {
	const { navigateTo } = usePageTransition();

	return (
		<CartPage
			onBackToLanding={() => navigateTo('/')}
			onBackToCatalog={() => navigateTo('/catalogo')}
			onOpenCart={() => navigateTo('/carrito')}
			onOpenAuth={() => navigateTo('/auth')}
		/>
	);
}

function AuthRoute() {
	const { navigateTo } = usePageTransition();

	return (
		<AuthPage
			onBackToLanding={() => navigateTo('/')}
			onAuthSuccess={(role) => navigateTo(role === 'Admin' ? '/admin' : '/perfil')}
		/>
	);
}

function PrivateRoute() {
	const { isAdmin, isAuthenticated, loading } = useAuth();
	if (loading) return <LoadingFallback />;
	if (!isAuthenticated) return <Navigate to="/auth" replace />;
	return isAdmin ? <Outlet /> : <Navigate to="/auth" replace />;
}

function UserRoute() {
	const { isAuthenticated, loading } = useAuth();
	if (loading) return <LoadingFallback />;
	return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}

function AppRoutesInner() {
	const { pathname } = useLocation();
	const prevPathnameRef = useRef(pathname);

	useEffect(() => {
		const landingPaths = ['/', '/informacion', '/empresa', '/contacto'];
		const wasLanding = landingPaths.includes(prevPathnameRef.current);
		const isLanding = landingPaths.includes(pathname);

		if (!(wasLanding && isLanding)) {
			window.scrollTo(0, 0);
		}

		prevPathnameRef.current = pathname;
	}, [pathname]);

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
			<Route path="/auth/restablecer" element={<ResetPasswordPage />} />

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

function AppRoutes() {
	return (
		<PageTransitionProvider>
			<Suspense fallback={<LoadingFallback />}>
				<AppRoutesInner />
			</Suspense>
		</PageTransitionProvider>
	);
}

export default AppRoutes;
