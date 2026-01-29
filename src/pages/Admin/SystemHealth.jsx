import React, { useState, useEffect } from 'react';
import { 
    Activity, Server, Database, Clock, 
    List, Box, Cpu, HardDrive, Layers 
} from 'lucide-react';
import { 
    getSystemHealth, getSystemMetrics, getSystemEnv, 
    getSystemBeans, getSystemMappings, getKeyMetrics, getMetricDetails
} from '../../services/actuatorService';
import { useNavigate } from 'react-router-dom';

const SystemHealth = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [keyMetrics, setKeyMetrics] = useState(null);
    const [allMetrics, setAllMetrics] = useState([]);
    const [beans, setBeans] = useState(null);
    const [env, setEnv] = useState(null);
    const [mappings, setMappings] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const metrics = await getKeyMetrics();
            setKeyMetrics(metrics);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailedData = async (tab) => {
        if (tab === 'metrics' && allMetrics.length === 0) {
            const res = await getSystemMetrics();
            setAllMetrics(res.data.names);
        } else if (tab === 'beans' && !beans) {
            const res = await getSystemBeans();
            setBeans(res.data.contexts.application.beans);
        } else if (tab === 'env' && !env) {
            const res = await getSystemEnv();
            setEnv(res.data);
        } else if (tab === 'mappings' && !mappings) {
            const res = await getSystemMappings();
            setMappings(res.data.contexts.application.mappings.dispatcherServlets.dispatcherServlet);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        fetchDetailedData(tab);
    };

    const formatBytes = (bytes) => {
        if (!bytes && bytes !== 0) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    };

    const formatUptime = (seconds) => {
        if (!seconds) return 'N/A';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    };

    if (loading) return <div className="p-10 text-center">Loading System Health...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-blue-600" />
                        System Health Dashboard
                    </h1>
                    <button onClick={() => navigate('/admin/dashboard')} className="text-blue-600 hover:underline">
                        Back to Dashboard
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mb-6 bg-white p-2 rounded-lg shadow-sm overflow-x-auto">
                    {[
                        { id: 'overview', icon: Activity, label: 'Overview' },
                        { id: 'metrics', icon: Server, label: 'Metrics' },
                        { id: 'env', icon: Database, label: 'Environment' },
                        { id: 'beans', icon: Box, label: 'Beans' },
                        { id: 'mappings', icon: Layers, label: 'Mappings' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap
                                ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
                    
                    {/* OVERVIEW */}
                    {activeTab === 'overview' && keyMetrics && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatusCard 
                                title="System Status" 
                                value={keyMetrics.status} 
                                icon={Activity} 
                                color={keyMetrics.status === 'UP' ? 'green' : 'red'} 
                            />
                            <StatusCard 
                                title="Uptime" 
                                value={formatUptime(keyMetrics.uptime)} 
                                icon={Clock} 
                                color="blue" 
                            />
                            <StatusCard 
                                title="Memory Used" 
                                value={formatBytes(keyMetrics.memoryUsed)} 
                                icon={Cpu} 
                                color="purple" 
                            />
                            <StatusCard 
                                title="Disk Free" 
                                value={formatBytes(keyMetrics.diskFree)} 
                                icon={HardDrive} 
                                color="amber" 
                            />
                        </div>
                    )}

                    {/* METRICS */}
                    {activeTab === 'metrics' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Available Metrics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {allMetrics.map(m => (
                                    <div key={m} className="p-2 bg-gray-50 rounded text-sm text-gray-700 font-mono border hover:bg-gray-100">
                                        {m}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* BEANS */}
                    {activeTab === 'beans' && beans && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Spring Beans ({Object.keys(beans).length})</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-2 text-left">Bean Name</th>
                                            <th className="p-2 text-left">Scope</th>
                                            <th className="p-2 text-left">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(beans).slice(0, 50).map(([name, detail]) => (
                                            <tr key={name} className="border-t hover:bg-gray-50">
                                                <td className="p-2 font-medium text-blue-600">{name}</td>
                                                <td className="p-2">{detail.scope}</td>
                                                <td className="p-2 text-gray-500 truncate max-w-xs">{detail.type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="text-xs text-gray-400 mt-2">* Showing first 50 beans</p>
                            </div>
                        </div>
                    )}

                    {/* ENV */}
                    {activeTab === 'env' && env && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Active Profiles: {env.activeProfiles.join(', ')}</h2>
                            <div className="space-y-4">
                                {env.propertySources.map((source, idx) => (
                                    <div key={idx} className="border rounded-lg p-4">
                                        <h3 className="font-bold text-gray-800 mb-2 border-b pb-1">{source.name}</h3>
                                        <div className="space-y-1">
                                            {source.properties && Object.entries(source.properties).map(([key, val]) => (
                                                <div key={key} className="flex flex-col sm:flex-row sm:justify-between text-sm py-1 border-b border-dashed last:border-0">
                                                    <span className="font-medium text-gray-600 mr-4">{key}</span>
                                                    <span className="text-gray-900 font-mono break-all">{JSON.stringify(val.value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MAPPINGS */}
                    {activeTab === 'mappings' && mappings && (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Dispatcher Servlet Mappings</h2>
                            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto">
                                {mappings.map((map, idx) => (
                                    <div key={idx} className="mb-2 border-b border-gray-700 pb-2">
                                        <div className="font-bold text-yellow-400">{map.handler}</div>
                                        <div>{map.details?.requestMappingConditions?.methods?.join(', ') || 'ALL'} {map.details?.requestMappingConditions?.patterns?.join(', ')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatusCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        green: 'bg-green-100 text-green-700',
        red: 'bg-red-100 text-red-700',
        blue: 'bg-blue-100 text-blue-700',
        purple: 'bg-purple-100 text-purple-700',
        amber: 'bg-amber-100 text-amber-700'
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-4 rounded-2xl mr-4 ${colorClasses[color] || 'bg-gray-100'}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );
};

export default SystemHealth;
