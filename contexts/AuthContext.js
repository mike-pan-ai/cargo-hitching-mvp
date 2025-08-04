// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import API_BASE_URL from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check if user is logged in when app loads
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    clearAuthData();
  } finally {
    setLoading(false);
  }
};

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens based on remember me preference
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (rememberMe && data.rememberToken) {
          localStorage.setItem('rememberToken', data.rememberToken);
          // Set longer expiration in localStorage
          const expirationTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 days
          localStorage.setItem('rememberExpiration', expirationTime.toString());
        }

        setUser(data.user);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberExpiration');
  };

  // Enhanced fetch function that automatically includes auth headers
  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token') || localStorage.getItem('rememberToken');

    if (!token) {
      logout();
      return;
    }

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: authHeaders,
      });

      // If token is expired, try to refresh or logout
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry the request with new token
          const newToken = localStorage.getItem('token');
          return await fetch(url, {
            ...options,
            headers: {
              ...authHeaders,
              'Authorization': `Bearer ${newToken}`,
            },
          });
        } else {
          logout();
          return;
        }
      }

      return response;
    } catch (error) {
      console.error('Authenticated fetch error:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    const rememberToken = localStorage.getItem('rememberToken');
    const expirationTime = localStorage.getItem('rememberExpiration');

    if (!rememberToken || !expirationTime) {
      return false;
    }

    // Check if remember token is still valid
    if (new Date().getTime() > parseInt(expirationTime)) {
      clearAuthData();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rememberToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    authenticatedFetch,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};