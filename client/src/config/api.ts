// Base API URL (should match your server's address)
export const API_URL = 'http://localhost:3000/api';

// Default axios configuration for API requests
export const axiosConfig = {
    withCredentials: true, // Important for passing cookies (session)
    headers: {
        'Content-Type': 'application/json'
    }
};