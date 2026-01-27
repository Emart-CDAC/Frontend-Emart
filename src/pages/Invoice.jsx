import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, CheckCircle, Loader2, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrderByIdAPI } from '../services/api';
import Button from '../components/Button';

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
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Loading Invoice...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">{error}</div>;
  }

  if (!order) {
    return <div className="text-center py-20">Invoice not found</div>;
  }

  const orderItems = order.items || [];
  const isPaid = order.paymentStatus === 'PAID';

  const formatAddress = () => {
    if (order.deliveryType === 'HOME_DELIVERY') {
      return `${order.addressLine || ''}, ${order.city || ''}, ${order.state || ''} - ${order.pincode || ''}`;
    }
    if (order.deliveryType === 'STORE') {
      return `Store Pickup: ${order.storeName || ''}, ${order.storeCity || ''}`;
    }
    return 'N/A';
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Success Header */}
      <div className="text-center mb-8 print:hidden">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="text-gray-500">Invoice #{order.orderId} has been generated.</p>

        <div className="mt-6 flex justify-center space-x-4">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>

      {/* Invoice */}
      <div className="bg-white p-8 shadow-lg border rounded-xl print:shadow-none print:border-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-600">e-MART</h2>
            <p className="text-sm text-gray-500">Invoice #{order.orderId}</p>
            <p className="text-sm text-gray-500">
              Date:{' '}
              {order.orderDate
                ? new Date(order.orderDate).toLocaleDateString()
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              Payment: {order.paymentMethod}
            </p>
            <p className="text-sm text-gray-500">
              Delivery: {order.deliveryType?.replace('_', ' ')}
            </p>
            <p
              className={`mt-2 font-bold ${
                isPaid ? 'text-green-600' : 'text-orange-500'
              }`}
            >
              {order.paymentStatus}
            </p>
          </div>

          <div className="text-right max-w-xs">
            <h3 className="font-bold">Bill To</h3>
            <p className="text-sm">{order.customerName}</p>
            <p className="text-sm">{order.customerEmail}</p>

            <h3 className="font-bold mt-4">Delivery Address</h3>
            <p className="text-sm">{formatAddress()}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-8">
          <h3 className="font-bold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Items
          </h3>

          {orderItems.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th>Item</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3">{item.productName}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">₹{item.price}</td>
                    <td className="py-3 text-right">
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">
              Order items not available.
            </p>
          )}
        </div>

        {/* Totals */}
        <div className="flex justify-end border-t pt-4">
          <div className="w-64 space-y-2">
            {order.epointsUsed > 0 && (
              <div className="flex justify-between text-green-600 text-sm">
                <span>E-Points Used</span>
                <span>-₹{order.epointsUsed}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>Total Paid</span>
              <span>₹{order.totalAmount}</span>
            </div>
            {order.epointsEarned > 0 && (
              <div className="text-xs text-blue-600 text-center bg-blue-50 py-2 rounded">
                🎉 E-Points Earned: {order.epointsEarned}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-gray-400">
          <p>Thank you for shopping with e-MART</p>
          <p>support@emart.com</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
