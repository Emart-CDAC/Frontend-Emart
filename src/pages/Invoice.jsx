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

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const { data } = await getOrderByIdAPI(id);
                console.log("📄 Order loaded:", data);
                setOrder(data);
            } catch (err) {
                console.error("Failed to load order:", err);
                setError("Order not found or failed to load.");
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            fetchOrder();
        }
    }, [id]);

    // Refresh user epoints after viewing invoice
    useEffect(() => {
        if (user?.id) {
            refreshUser(user.id);
        }
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading Invoice...</p>
        </div>
    );
    
    if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
    if (!order) return <div className="text-center py-20">Invoice not found</div>;

    // Get order items from DTO
    const orderItems = order.items || [];
    
    // Format address (using flattened DTO fields)
    const formatAddress = () => {
        if (order.deliveryType === 'HOME_DELIVERY' && order.addressId) {
            return `${order.addressLine || ''}, ${order.city || ''}, ${order.state || ''} - ${order.pincode || ''}`;
        }
        if (order.deliveryType === 'STORE' && order.storeId) {
            return `Store Pickup: ${order.storeName || ''}, ${order.storeCity || ''}`;
        }
        return 'N/A';
    };

    const isPaid = order.paymentStatus === 'PAID';

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Success Header */}
            <div className="text-center mb-8 print:hidden">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
                <p className="text-gray-500">Invoice #{order.orderId} has been generated.</p>
                <div className="mt-6 flex justify-center space-x-4">
                    <Button onClick={handlePrint} variant="outline">
                        <Printer className="w-4 h-4 mr-2" /> Print Invoice
                    </Button>
                    <Link to="/">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </div>

            {/* Invoice Paper */}
            <div className="bg-white p-8 md:p-12 shadow-lg border border-gray-100 rounded-xl print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-600 mb-2">e-MART</h2>
                        <p className="text-sm text-gray-500">Invoice #{order.orderId}</p>
                        <p className="text-sm text-gray-500">
                            Date: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                            Payment: <span className="capitalize">{order.paymentMethod || 'N/A'}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            Delivery: <span className="capitalize">{order.deliveryType?.replace('_', ' ') || 'N/A'}</span>
                        </p>
                        <p className={`text-sm font-bold mt-2 uppercase ${isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                            {order.paymentStatus || 'PENDING'}
                        </p>
                    </div>
                    <div className="text-right max-w-xs">
                        <h3 className="font-bold text-gray-900">Bill To:</h3>
                        <p className="text-sm text-gray-600">{order.customerName || 'Customer'}</p>
                        <p className="text-sm text-gray-600">{order.customerEmail || ''}</p>
                        <h3 className="font-bold text-gray-900 mt-4">Delivery Address:</h3>
                        <p className="text-sm text-gray-600">{formatAddress()}</p>
                    </div>
                </div>

                {/* Order Items - Show cart items if available */}
                <div className="mb-8">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Package className="w-5 h-5 mr-2" /> Order Items
                    </h3>
                    {orderItems.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
                                    <th className="py-2">Item</th>
                                    <th className="py-2 text-right">Qty</th>
                                    <th className="py-2 text-right">Price</th>
                                    <th className="py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orderItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-4">
                                            <div className="font-medium text-gray-900">{item.productName || item.product?.name || 'Product'}</div>
                                        </td>
                                        <td className="py-4 text-right">{item.quantity || 1}</td>
                                        <td className="py-4 text-right">₹{item.price || 0}</td>
                                        <td className="py-4 text-right">₹{item.discountedPrice || (item.price * item.quantity) || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 text-sm">Order details saved. Items not available in view.</p>
                    )}
                </div>

                {/* Totals */}
                <div className="flex justify-end border-t border-gray-200 pt-4">
                    <div className="w-64 space-y-2">
                        {order.epointsUsed > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>E-Points Used</span>
                                <span>-₹{order.epointsUsed}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-2 mt-2">
                            <span>Total Paid</span>
                            <span>₹{order.totalAmount || 0}</span>
                        </div>
                        {order.epointsEarned > 0 && (
                            <div className="text-xs text-blue-600 text-center mt-2 bg-blue-50 py-2 rounded">
                                🎉 E-Points Earned: {order.epointsEarned}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-xs text-gray-400">
                    <p>Thank you for shopping with us!</p>
                    <p>e-MART | support@emart.com</p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
