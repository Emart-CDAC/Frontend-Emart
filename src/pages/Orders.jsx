
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/orderService';
import { Package, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (user?.id) {
                try {
                    setLoading(true);
                    const response = await getUserOrders(user.id);
                    // Sort orders by date descending
                    const sortedOrders = response.data.sort((a, b) =>
                        new Date(b.orderDate) - new Date(a.orderDate)
                    );
                    setOrders(sortedOrders);
                } catch (err) {
                    console.error("Error fetching orders:", err);
                    setError("Failed to load your orders history.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchOrders();
    }, [user]);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
            case 'confirmed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
            case 'shipped': return <Truck className="w-5 h-5 text-indigo-500" />;
            case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    if (loading) return <div className="text-center py-20">Loading your orders...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <Package className="w-8 h-8 mr-3 text-blue-600" />
                My Orders
            </h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
                    <p className="text-gray-500 mb-8">You haven't placed any orders yet. Start shopping to see your history!</p>
                    <a href="/catalog" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors">
                        Browse Catalog
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <motion.div
                            key={order.orderId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                                        <p className="text-lg font-bold text-gray-900">#EMT-{order.orderId}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {new Date(order.orderDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                                            <p className="text-lg font-bold text-blue-600">${order.totalAmount}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                                    <div className="flex items-center">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusBadgeClass(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span className="text-sm font-bold capitalize">{order.status || 'Processing'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {order.paymentStatus || 'UNPAID'}
                                        </span>
                                        <a
                                            href={`/invoice/${order.orderId}`}
                                            className="text-sm font-bold text-blue-600 hover:text-blue-500"
                                        >
                                            View Details
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
