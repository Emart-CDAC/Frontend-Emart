import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, CheckCircle, Loader2, Package, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getOrderByIdAPI } from '../services/api';
import Button from '../components/Button';
import CheckoutSteps from '../components/CheckoutSteps';

const Invoice = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order by ID
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await getOrderByIdAPI(id);
        console.log('📄 Order loaded:', data);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError('Order not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  // Refresh user e-points once (after order)
  useEffect(() => {
    if (user?.id) {
      refreshUser(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Generating your invoice...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="max-w-2xl mx-auto py-20 px-4 text-center">
             <div className="bg-red-50 p-8 rounded-2xl border border-red-100">
                <p className="text-red-600 font-bold text-lg mb-2">Something went wrong</p>
                <p className="text-gray-600 mb-6">{error}</p>
                <Link to="/">
                    <Button variant="outline">Return Home</Button>
                </Link>
             </div>
        </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-500">Invoice details not found.</div>;
  }

  const orderItems = order.items || [];
  const isPaid = order.paymentStatus === 'PAID';

  const formatAddress = () => {
    if (order.deliveryType === 'HOME_DELIVERY') {
      return (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <span>{order.addressLine || ''}, {order.city || ''}, {order.state || ''} - {order.pincode || ''}</span>
          </div>
      );
    }
    if (order.deliveryType === 'STORE') {
      return (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <span>Store Pickup: {order.storeName || ''}, {order.storeCity || ''}</span>
          </div>
      );
    }
    return 'N/A';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Progress Bar - Step 3 Done */}
      <div className="print:hidden mb-12">
        <CheckoutSteps currentStep={3} />
      </div>

      {/* Success Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 print:hidden"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto">
            Thank you for shopping with us. Your order <span className="font-semibold text-gray-900">#{order.orderId}</span> has been placed successfully.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gray-900">Continue Shopping</Button>
          </Link>
        </div>
      </motion.div>

      {/* Invoice */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white p-8 md:p-12 shadow-xl shadow-gray-100/50 border border-gray-100 rounded-3xl print:shadow-none print:border-none print:p-0 overflow-hidden relative"
      >
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 border-b border-gray-100 pb-8">
          <div className="space-y-1 mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">e-MART</h2>
            </div>
            
            <p className="text-gray-500 font-medium">Invoice #{order.orderId}</p>
            <p className="text-gray-500 text-sm">
              Placed on: <span className="text-gray-900">{order.orderDate ? new Date(order.orderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
            </p>
            
            <div className="flex gap-4 mt-4">
                 <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Payment: {order.paymentMethod}
                 </div>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${isPaid ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                    {order.paymentStatus}
                 </div>
            </div>
          </div>

          <div className="text-left md:text-right w-full md:w-auto space-y-6">
            <div>
                 <h3 className="font-bold text-gray-900 mb-2">Billed To</h3>
                <p className="text-gray-600">{order.customerName}</p>
                <div className="flex items-center md:justify-end gap-2 text-gray-500 text-sm mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    {order.customerEmail}
                </div>
            </div>

            <div>
                 <h3 className="font-bold text-gray-900 mb-2">Shipped To</h3>
                 <div className="text-gray-600 text-sm max-w-[200px] md:ml-auto">
                    {formatAddress()}
                 </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-8">
          <h3 className="font-bold mb-6 flex items-center text-gray-800">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Order Details
          </h3>

          {orderItems.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100 text-left text-gray-400 uppercase tracking-wider text-xs">
                    <th className="pb-3 font-semibold pl-2">Item</th>
                    <th className="pb-3 font-semibold text-right">Qty</th>
                    <th className="pb-3 font-semibold text-right">Price</th>
                    <th className="pb-3 font-semibold text-right pr-2">Total</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {orderItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pl-2 font-medium">
                            {item.productName}
                            <span className="block text-xs text-gray-400 font-normal mt-0.5">ID: {item.productId}</span>
                        </td>
                        <td className="py-4 text-right align-top">{item.quantity}</td>
                        <td className="py-4 text-right align-top">₹{item.price?.toLocaleString()}</td>
                        <td className="py-4 text-right align-top font-bold text-gray-900 pr-2">
                        ₹{(item.price * item.quantity).toLocaleString()}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic py-4">
              Order items details unavailable.
            </p>
          )}
        </div>

        {/* Totals */}
        <div className="flex flex-col md:flex-row justify-end border-t border-gray-100 pt-8">
          <div className="w-full md:w-80 space-y-3">
            {order.epointsUsed > 0 && (
              <div className="flex justify-between text-green-600 text-sm font-medium bg-green-50/50 p-2 rounded-lg">
                <span>E-Points Used</span>
                <span>- ₹{order.epointsUsed}</span>
              </div>
            )}
            
            <div className="flex justify-between items-end pt-2">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-3xl font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</span>
            </div>

            {order.epointsEarned > 0 && (
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-3 rounded-xl flex items-center justify-center gap-2 text-sm text-blue-700 font-medium">
                <span>🎉 You earned <b>{order.epointsEarned}</b> E-Points on this order!</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center border-t border-gray-100 pt-8">
            <p className="text-sm font-bold text-gray-900 mb-1">Thank you for shopping with e-MART</p>
            <p className="text-xs text-gray-400">Need help? Contact us at support@emart.com</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Invoice;
