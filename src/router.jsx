
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Invoice from './pages/Invoice';
import ExcelUpload from './pages/Admin/ExcelUpload';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
            { path: 'catalog', element: <Catalog /> },
            { path: 'category/:id', element: <Catalog /> }, // Keep for backward compat or redirect?
            { path: 'product/:id', element: <ProductDetails /> },
            { path: 'cart', element: <Cart /> },
            { path: 'checkout', element: <Checkout /> },
            { path: 'invoice/:id', element: <Invoice /> },
            { path: 'admin/upload', element: <ExcelUpload /> },
        ]
    }
]);
