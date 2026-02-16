import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    }, []);

    const loadUser = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.get(`${API_URL}/auth/me`);
            setUser(res.data.data);
        } catch (err) {
            console.error('Failed to load user:', err);
            logout();
        } finally {
            setLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const register = async (userData) => {
        const res = await axios.post(`${API_URL}/auth/register`, userData);
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
        return newUser;
    };

    const login = async (credentials) => {
        const res = await axios.post(`${API_URL}/auth/login`, credentials);
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
        return newUser;
    };

    const value = {
        user,
        loading,
        token,
        register,
        login,
        logout,
        isAdmin: user?.role === 'admin'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
