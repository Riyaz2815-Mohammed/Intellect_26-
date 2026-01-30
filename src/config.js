// API Configuration
// Dyamically determines the API URL based on environment
// 1. VITE_API_URL environment variable (set in .env or CI/CD)
// 2. Window hostname (for local network testing)

const getApiUrl = () => {
    // 1. Priority: Environment Variable (Vercel/Production)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // 2. Fallback: Local Development
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
        return `http://${hostname}:3001/api`;
    }

    // 3. Fallback for deployed frontend without env var (Fail/Default)
    // This prevents the weird ":3001" logic on Vercel
    console.error("CRITICAL: VITE_API_URL is missing. Please check Vercel settings.");
    return 'https://intellect-26-codecrypt.onrender.com/api'; // Hardcoded Safety Net
};

export const API_BASE_URL = getApiUrl();
