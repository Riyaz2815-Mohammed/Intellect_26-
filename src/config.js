// API Configuration
// Dyamically determines the API URL based on environment
// 1. VITE_API_URL environment variable (set in .env or CI/CD)
// 2. Window hostname (for local network testing)

const getApiUrl = () => {
    // If explicitly set in environment (e.g. Production build)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Default to localhost/network for dev
    // If running on a device (e.g. 192.168.1.5:5173), we assume backend is on same IP :3001
    const hostname = window.location.hostname;
    return `http://${hostname}:3001/api`;
};

export const API_BASE_URL = getApiUrl();
