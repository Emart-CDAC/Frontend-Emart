import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [uploadFile, setUploadFile] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!user || (user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN' && user.type !== 'ADMIN')) {
            navigate('/');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('emart_token');
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, ordersRes] = await Promise.all([
                axios.get('http://localhost:8080/api/admin/dashboard/stats', { headers }),
                axios.get('http://localhost:8080/api/admin/dashboard/orders?page=0&size=10', { headers })
            ]);

            setStats(statsRes.data);
            setOrders(ordersRes.data.content || ordersRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setUploadFile(e.target.files[0]);
        setUploadResult(null);
    };

    const handleCsvUpload = async () => {
        if (!uploadFile) {
            alert('Please select a file');
            return;
        }

        setUploading(true);
        setUploadResult(null);

        try {
            const token = localStorage.getItem('emart_token');
            const formData = new FormData();
            formData.append('file', uploadFile); // 🔑 MUST be "file"

            const response = await axios.post(
                'http://localhost:8080/api/admin/products/upload-csv',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Backend returns STRING
            setUploadResult(response.data);
            setUploadFile(null);

        } catch (error) {
            console.error('Upload error:', error);
            const errMsg = error.response?.data?.message || 
                           (typeof error.response?.data === 'string' ? error.response.data : null) ||
                           error.message ||
                           'Upload failed';
            
            setUploadResult(errMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('emart_token');
            const headers = { Authorization: `Bearer ${token}` };

            // Backend: @PutMapping("/orders/{orderId}/status") with @RequestParam OrderStatus status
            await axios.put(
                `http://localhost:8080/api/admin/dashboard/orders/${orderId}/status`,
                null,
                {
                    params: { status: newStatus },
                    headers
                }
            );

            // Refresh dashboard data to show the updated status
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <button 
                        onClick={() => navigate('/admin/system-health')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center"
                    >
                       System Health
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded shadow">
                        <div className="text-gray-500 text-sm">Total Orders</div>
                        <div className="text-3xl font-bold">{stats?.totalOrders || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <div className="text-gray-500 text-sm">Total Revenue</div>
                        <div className="text-3xl font-bold">₹{stats?.totalRevenue?.toFixed(2) || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <div className="text-gray-500 text-sm">Total Users</div>
                        <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded shadow">
                        <div className="text-gray-500 text-sm">Pending Orders</div>
                        <div className="text-3xl font-bold text-orange-600">{stats?.pendingOrders || 0}</div>
                    </div>
                </div>

                {/* CSV Upload */}
                <div className="bg-white p-6 rounded shadow mb-8">
                    <h2 className="text-xl font-bold mb-4">Upload Products (CSV)</h2>

                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block w-full mb-4"
                    />

                    <button
                        onClick={handleCsvUpload}
                        disabled={!uploadFile || uploading}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {uploading ? 'Uploading...' : 'Upload Products'}
                    </button>

                    {uploadResult && (
                        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
                            <p className="font-semibold">{uploadResult}</p>
                        </div>
                    )}

                    <div className="mt-4 text-sm text-gray-600">
                        <p className="font-semibold">CSV Format:</p>
                        <p>
                            ParentCategory, ChildCategory, Brand, ProductName,
                            ImageURL, NormalPrice, EcardPrice,
                            Stock, Description, StoreId
                        </p>
                    </div>
                </div>

                {/* Orders */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Recent Orders</h2>

                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Order ID</th>
                                <th className="px-4 py-2 text-left">Customer</th>
                                <th className="px-4 py-2 text-left">Total</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map(order => (
                                    <tr key={order.orderId} className="border-t">
                                        <td className="px-4 py-2">#{order.orderId}</td>
                                        <td className="px-4 py-2">{order.customer?.fullName || 'N/A'}</td>
                                        <td className="px-4 py-2">₹{order.totalAmount}</td>
                                        <td className="px-4 py-2">
                                            <select
                                                value={order.status || order.orderStatus}
                                                onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="packed">Packed</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-2">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
