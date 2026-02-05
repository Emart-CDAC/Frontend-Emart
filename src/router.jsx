import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded page components for code-splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Invoice = lazy(() => import('./pages/Invoice'));
const ExcelUpload = lazy(() => import('./pages/Admin/ExcelUpload'));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));
const SystemHealth = lazy(() => import('./pages/Admin/SystemHealth'));
const Orders = lazy(() => import('./pages/Orders'));
const EmartCard = lazy(() => import('./pages/EmartCard'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Wrapper to apply Suspense to lazy components
const LazyPage = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <LazyPage><Home /></LazyPage> },
      { path: 'login', element: <LazyPage><Login /></LazyPage> },
      { path: 'register', element: <LazyPage><Register /></LazyPage> },
      { path: 'catalog', element: <LazyPage><Catalog /></LazyPage> },
      { path: 'category/:id', element: <LazyPage><Catalog /></LazyPage> },
      { path: 'product/:id', element: <LazyPage><ProductDetails /></LazyPage> },
      
      // Protected routes - require authentication
      { path: 'cart', element: <ProtectedRoute><LazyPage><Cart /></LazyPage></ProtectedRoute> },
      { path: 'checkout', element: <ProtectedRoute><LazyPage><Checkout /></LazyPage></ProtectedRoute> },
      { path: 'order-success', element: <ProtectedRoute><LazyPage><OrderSuccess /></LazyPage></ProtectedRoute> },
      { path: 'orders', element: <ProtectedRoute><LazyPage><Orders /></LazyPage></ProtectedRoute> },
      { path: 'invoice/:id', element: <ProtectedRoute><LazyPage><Invoice /></LazyPage></ProtectedRoute> },
      { path: 'emart-card', element: <ProtectedRoute><LazyPage><EmartCard /></LazyPage></ProtectedRoute> },
      
      // Admin routes - require admin role
      { path: 'admin/dashboard', element: <ProtectedRoute adminOnly><LazyPage><Dashboard /></LazyPage></ProtectedRoute> },
      { path: 'admin/upload', element: <ProtectedRoute adminOnly><LazyPage><ExcelUpload /></LazyPage></ProtectedRoute> },
      { path: 'admin/system-health', element: <ProtectedRoute adminOnly><LazyPage><SystemHealth /></LazyPage></ProtectedRoute> },
    ],
  },
]);
