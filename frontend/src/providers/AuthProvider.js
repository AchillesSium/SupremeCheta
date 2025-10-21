import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as loginApi, register as registerApi } from '../utils/api';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRegistered, setIsRegistered] = useState(null);

    const clearAuth = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
        setLoading(false);
        setIsRegistered(null);
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');
                if (token && userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                clearAuth();
            }
        };
        
        initAuth();
    }, []);

    const checkEmail = async (email) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.post('/api/auth/check-email', { email });
            setIsRegistered(response.data.exists);
            return response.data.exists;
        } catch (error) {
            console.error('Email check error:', error);
            setError(error.response?.data?.message || 'Failed to check email');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await loginApi(credentials);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            setIsRegistered(true);
            return data;
        } catch (error) {
            clearAuth();
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await registerApi(userData);
            clearAuth();
            setIsRegistered(true);
            return data;
        } catch (error) {
            clearAuth();
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        clearAuth();
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                loading, 
                error, 
                login, 
                register, 
                logout,
                clearAuth,
                checkEmail,
                isRegistered
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;