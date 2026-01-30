import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);

    // Java backend
    const [productOffers, setProductOffers] = useState([]);

    // .NET backend analytics
    const [analyticsData, setAnalyticsData] = useState([]);
    const [analyticsError, setAnalyticsError] = useState(null);

    const [loading, setLoading] = useState(true);
    const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);

    // CSV Upload
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

            const [statsRes, productOffersRes, analyticsRes] = await Promise.all([
                axios.get('http://localhost:8080/api/admin/dashboard/stats', { headers }),
                axios.get('http://localhost:8080/api/admin/analytics/product-offers-inventory', { headers }),
                axios.get('http://localhost:8080/api/admin/analytics/dotnet-products', { headers })
            ]);

            setStats(statsRes.data);
            setProductOffers(productOffersRes.data);
            setAnalyticsData(analyticsRes.data);

        } catch (error) {
            console.error(error);
            setAnalyticsError('Could not load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setUploadFile(e.target.files[0]);
        setUploadResult(null);
    };

    const handleCsvUpload = async () => {
        if (!uploadFile) return alert('Please select a file');

        setUploading(true);
        try {
            const token = localStorage.getItem('emart_token');
            const formData = new FormData();
            formData.append('file', uploadFile);

            const res = await axios.post(
                'http://localhost:8080/api/admin/products/upload-csv',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUploadResult(res.data);
            setUploadFile(null);
        } catch (err) {
            setUploadResult(err.response?.data || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">

                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Stat title="Total Orders" value={stats?.totalOrders} />
                    <Stat title="Revenue" value={`₹${stats?.totalRevenue?.toFixed(2)}`} />
                    <Stat title="Users" value={stats?.totalUsers} />
                    <Stat title="Pending Orders" value={stats?.pendingOrders} highlight />
                </div>

                {/* Java Analytics */}
                <Section title="Product Offers & Inventory">
                    <Table
                        data={productOffers}
                        columns={['productName', 'discountOffer', 'quantity']}
                    />
                </Section>

                {/* CSV Upload */}
                <Section title="Upload Products (CSV)">
                    <input type="file" accept=".csv" onChange={handleFileChange} />
                    <button
                        disabled={!uploadFile || uploading}
                        onClick={handleCsvUpload}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    {uploadResult && <p className="mt-4 text-green-700">{uploadResult}</p>}
                </Section>

                {/* .NET Analytics */}
                <Section title="Product Inventory & Discounts">
                    <label className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            checked={showDiscountedOnly}
                            onChange={(e) => setShowDiscountedOnly(e.target.checked)}
                        />
                        <span className="ml-2">Show only discounted products</span>
                    </label>

                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th>Product</th>
                                <th>Discount</th>
                                <th>Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analyticsData
                                .filter(i => !showDiscountedOnly || i.discount_Offer !== 'No discount available')
                                .map((i, idx) => (
                                    <tr key={idx}>
                                        <td>{i.product_Name}</td>
                                        <td className="text-green-600">{i.discount_Offer}</td>
                                        <td>{i.quantity}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>

                    {analyticsError && <p className="text-red-600 mt-4">{analyticsError}</p>}
                </Section>
            </div>
        </div>
    );
};

const Stat = ({ title, value, highlight }) => (
    <div className="bg-white p-6 rounded shadow">
        <div className="text-gray-500">{title}</div>
        <div className={`text-3xl font-bold ${highlight ? 'text-orange-600' : ''}`}>
            {value || 0}
        </div>
    </div>
);

const Section = ({ title, children }) => (
    <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
    </div>
);

export default Dashboard;