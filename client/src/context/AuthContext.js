import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        withCredentials: true
      });
      setUser(response.data.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      }, {
        withCredentials: true
      });
      
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const register = async (username, password, role) => {
    try {
      const response = await axios.post('/api/auth/register', {
        username,
        password,
        role
      }, {
        withCredentials: true
      });
      
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const setTokenFromGoogle = async (token) => {
    try {
      const response = await axios.get('/api/auth/me', {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get user info from Google token'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const initiateGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setTokenFromGoogle,
    initiateGoogleLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 