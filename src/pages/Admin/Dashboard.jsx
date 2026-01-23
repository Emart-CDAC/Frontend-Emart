import { Link } from 'react-router-dom';
import { Package, Users, DollarSign, Upload, TrendingUp, ShoppingBag, ArrowRight } from 'lucide-react';
import Button from '../../components/Button';

const Dashboard = () => {
    // Mock Statistics
    const stats = [
        { label: 'Total Revenue', value: '$24,500', change: '+12%', icon: DollarSign, color: 'bg-green-100 text-green-600' },
        { label: 'Active Users', value: '1,234', change: '+5%', icon: Users, color: 'bg-blue-100 text-blue-600' },
        { label: 'Total Orders', value: '456', change: '+8%', icon: ShoppingBag, color: 'bg-purple-100 text-purple-600' },
        { label: 'Products', value: '89', change: '+2', icon: Package, color: 'bg-orange-100 text-orange-600' },
    ];

    const recentOrders = [
        { id: '#ORD-7829', user: 'Alice Smith', date: 'Oct 24, 2023', total: '$120.50', status: 'Completed' },
        { id: '#ORD-7830', user: 'Bob Johnson', date: 'Oct 24, 2023', total: '$85.00', status: 'Processing' },
        { id: '#ORD-7831', user: 'Charlie Brown', date: 'Oct 23, 2023', total: '$210.20', status: 'Completed' },
        { id: '#ORD-7832', user: 'Diana Prince', date: 'Oct 23, 2023', total: '$50.00', status: 'Pending' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500">Overview of store performance</p>
                </div>
                <div className="flex space-x-4">
                    <Link to="/admin/upload">
                        <Button className="flex items-center">
                            <Upload className="w-4 h-4 mr-2" /> Upload Products
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-green-500 text-sm font-medium flex items-center bg-green-50 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3 mr-1" /> {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                        <Link to="#" className="text-blue-600 text-sm hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Order ID</th>
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Total</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.user}</td>
                                        <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{order.total}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / Notifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">System Status</h2>
                    <div className="space-y-6">
                        <div className="flex items-start">
                            <div className="w-2 h-2 mt-2 rounded-full bg-green-500 mr-3"></div>
                            <div>
                                <p className="font-medium text-gray-900">Server Online</p>
                                <p className="text-sm text-gray-500">Systems running normally</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500 mr-3"></div>
                            <div>
                                <p className="font-medium text-gray-900">Low Stock Alert</p>
                                <p className="text-sm text-gray-500">5 products are running low</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 mr-3"></div>
                            <div>
                                <p className="font-medium text-gray-900">New User Registration</p>
                                <p className="text-sm text-gray-500">+12 users in last hour</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Links</h3>
                        <div className="space-y-2">
                            <Link to="#" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700">
                                <span>Manage Users</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link to="#" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700">
                                <span>Sales Reports</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
