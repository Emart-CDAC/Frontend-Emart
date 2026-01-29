import axios from 'axios';

const ACTUATOR_URL = 'http://localhost:8080/actuator';

const getHeaders = () => {
    const token = localStorage.getItem('emart_token');
    return { Authorization: `Bearer ${token}` };
};

export const getSystemHealth = async () => {
    return axios.get(`${ACTUATOR_URL}/health`, { headers: getHeaders() });
};

export const getSystemInfo = async () => {
    return axios.get(`${ACTUATOR_URL}/info`, { headers: getHeaders() });
};

export const getSystemMetrics = async () => {
    return axios.get(`${ACTUATOR_URL}/metrics`, { headers: getHeaders() });
};

export const getMetricDetails = async (metricName) => {
    return axios.get(`${ACTUATOR_URL}/metrics/${metricName}`, { headers: getHeaders() });
};

export const getSystemEnv = async () => {
    return axios.get(`${ACTUATOR_URL}/env`, { headers: getHeaders() });
};

export const getSystemBeans = async () => {
    return axios.get(`${ACTUATOR_URL}/beans`, { headers: getHeaders() });
};

export const getSystemMappings = async () => {
    return axios.get(`${ACTUATOR_URL}/mappings`, { headers: getHeaders() });
};

// Helper to fetch key metrics in one go
export const getKeyMetrics = async () => {
    try {
        const [health, uptime, memory, disk] = await Promise.all([
            getSystemHealth(),
            getMetricDetails('process.uptime'),
            getMetricDetails('jvm.memory.used'),
            getMetricDetails('disk.free')
        ]);

        return {
            status: health.data.status,
            uptime: uptime.data.measurements[0].value,
            memoryUsed: memory.data.measurements[0].value,
            diskFree: disk.data.measurements[0].value
        };
    } catch (error) {
        console.error("Error fetching key metrics:", error);
        return null;
    }
};
