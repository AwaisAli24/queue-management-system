import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import JoinQueue from './components/JoinQueue';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
import AuthSuccess from './components/AuthSuccess';
import './App.css';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('join');
  const [authView, setAuthView] = useState('login');
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading...</h2>
        <p>Please wait while we check your authentication status.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <header className="app-header">
          <div className="container">
            <h1>Queue Management System</h1>
            <p className="header-subtitle">Admin Authentication</p>
          </div>
        </header>

        <main className="container">
          {authView === 'login' ? (
            <Login onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <Register onSwitchToLogin={() => setAuthView('login')} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1>Queue Management System</h1>
              <nav className="nav-tabs">
                <button 
                  className={`nav-tab ${currentView === 'join' ? 'active' : ''}`}
                  onClick={() => setCurrentView('join')}
                >
                  Join Queue
                </button>
                <button 
                  className={`nav-tab ${currentView === 'admin' ? 'active' : ''}`}
                  onClick={() => setCurrentView('admin')}
                >
                  Admin Panel
                </button>
              </nav>
            </div>
            <div className="header-right">
              <div className="user-info">
                <span className="username">Welcome, {user.name || user.username}</span>
                <span className="role-badge">{user.role}</span>
              </div>
              <button 
                className="btn btn-danger"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        {currentView === 'join' ? <JoinQueue /> : <AdminPanel />}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/" element={<AppContent />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App; 