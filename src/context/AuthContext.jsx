import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// ── Base API Configuration ──────────────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Set token in headers if it exists
const token = localStorage.getItem('fleetflow_token');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── On mount: restore session from localStorage ─────────
    useEffect(() => {
        const token = localStorage.getItem('fleetflow_token');
        const savedUser = localStorage.getItem('fleetflow_user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                // Corrupted data – clear it
                localStorage.removeItem('fleetflow_token');
                localStorage.removeItem('fleetflow_user');
            }
        }
        setLoading(false);
    }, []);

    // ── Login ───────────────────────────────────────────────
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, user: userData } = response.data.data;

            localStorage.setItem('fleetflow_token', access_token);
            localStorage.setItem('fleetflow_user', JSON.stringify(userData));

            // Set default header for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            setUser(userData);
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Invalid credentials';
            return { success: false, error: message };
        }
    };

    // ── Register ────────────────────────────────────────────
    const register = async (email, password, name, role = 'Manager') => {
        try {
            const response = await api.post('/auth/register', { email, password, name, role });
            const { access_token, user: userData } = response.data.data;

            localStorage.setItem('fleetflow_token', access_token);
            localStorage.setItem('fleetflow_user', JSON.stringify(userData));

            // Set default header for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            setUser(userData);
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'Registration failed';
            return { success: false, error: message };
        }
    };

    // ── Logout ──────────────────────────────────────────────
    const logout = () => {
        setUser(null);
        localStorage.removeItem('fleetflow_token');
        localStorage.removeItem('fleetflow_user');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, api }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
