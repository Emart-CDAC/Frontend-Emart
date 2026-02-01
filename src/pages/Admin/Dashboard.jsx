import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [analyticsError, setAnalyticsError] = useState(null);
    const [orders, setOrders] = useState([]); 
    const [loading, setLoading] = useState(true);

    const [showDiscountedOnly, setShowDiscountedOnly] = useState(false); // Filter state
    const [productOffers, setProductOffers] = useState([]); // Added to prevent crash

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

            const [statsRes, ordersRes, analyticsRes] = await Promise.all([
                axios.get('http://localhost:8080/api/admin/dashboard/stats', { headers }),
                axios.get('http://localhost:8080/api/admin/dashboard/orders?page=0&size=10', { headers }),
                axios.get('http://localhost:8080/api/admin/analytics/product-offers-inventory', { headers })
            ]);

            setStats(statsRes.data);
            
            // Orders
            setOrders(ordersRes.data.content || ordersRes.data);

            // Analytics
            setAnalyticsData(analyticsRes.data);
            
            // Product Offers - mapping analytics data to this state as well if needed, 
            // but noting field names might mismatch if backend sends product_Name vs productName.
            setProductOffers(analyticsRes.data); 

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            const msg = error.response?.data?.message || error.message || 'Unknown error';
            setAnalyticsError(`Error loading analytics: ${msg}`);
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
            formData.append('file', uploadFile);

            const response = await axios.post(
                'http://localhost:8080/api/admin/products/upload-csv',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

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

                {/* Product Analytics from .NET Backend (The working one) */}
                <div className="bg-white p-6 rounded shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Product Inventory & Discounts </h2>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="discountFilter"
                                checked={showDiscountedOnly}
                                onChange={(e) => setShowDiscountedOnly(e.target.checked)}
                                className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                            />
                            <label htmlFor="discountFilter" className="ml-2 text-sm font-medium text-gray-900 select-none cursor-pointer">
                                Show only discounted products
                            </label>
                        </div>
                    </div>

                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Product Name</th>
                                <th className="px-4 py-2 text-left">Discount Offer</th>
                                <th className="px-4 py-2 text-left">Available Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analyticsData.length > 0 ? (
                                analyticsData
                                    .filter(item => !showDiscountedOnly || item.discount_Offer !== "No discount available")
                                    .map((item, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="px-4 py-2 font-medium text-gray-900">{item.product_Name}</td>
                                        <td className="px-4 py-2 text-green-600 font-bold">{item.discount_Offer}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${item.quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-8 text-gray-500">
                                        {analyticsError ? (
                                            <span className="text-red-500">Error loading analytics: {analyticsError}</span>
                                        ) : (
                                            "Loading analytics data..."
                                        )}
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