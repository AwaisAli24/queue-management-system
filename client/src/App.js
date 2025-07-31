import React, { useState } from 'react';
import JoinQueue from './components/JoinQueue';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('join');

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
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
      </header>

      <main className="container">
        {currentView === 'join' ? <JoinQueue /> : <AdminPanel />}
      </main>
    </div>
  );
}

export default App; 