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
import Dashboard from './pages/Admin/Dashboard';
import Orders from './pages/Orders';
import EmartCard from './pages/EmartCard';
import OrderSuccess from './pages/OrderSuccess';// ✅ ADD THIS



export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'catalog', element: <Catalog /> },
      { path: 'category/:id', element: <Catalog /> },
      { path: 'product/:id', element: <ProductDetails /> },
      { path: 'cart', element: <Cart /> },
      { path: 'checkout', element: <Checkout /> },

      // ✅ ADD THIS LINE
      { path: 'order-success',  element: <OrderSuccess />
},

      { path: 'orders', element: <Orders /> },
      { path: 'invoice/:id', element: <Invoice /> },
      { path: 'emart-card', element: <EmartCard /> },
      { path: 'admin/dashboard', element: <Dashboard /> },
      { path: 'admin/upload', element: <ExcelUpload /> },
      

    ],
  },
]);
