import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setTokenState] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const setUser = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUserState(userData);
    } else {
      localStorage.removeItem('user');
      setUserState(null);
    }
  };

  const login = (userData, userToken) => {
    if (userToken) {
      localStorage.setItem('token', userToken);
      setTokenState(userToken);
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUserState(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        login,
        logout,
        isAuthenticated: Boolean(user || token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
