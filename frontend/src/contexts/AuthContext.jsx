import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await api.get('/user');
          setUser(response.data.data);
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    // Await CSRF cookie first (Sanctum requirement)
    await api.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
      baseURL: '', // Override baseURL since this isn't an /api route
    });

    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data.data;
    
    // Store token and user
    localStorage.setItem('auth_token', token);
    setUser(user);
    
    return user;
  };

  const register = async (data) => {
    await api.get('http://127.0.0.1:8000/sanctum/csrf-cookie', { baseURL: '' });
    
    const response = await api.post('/auth/register', data);
    const { user, token } = response.data.data;
    
    localStorage.setItem('auth_token', token);
    setUser(user);
    
    return user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      // Let the protected routes or axios interceptor redirect
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
