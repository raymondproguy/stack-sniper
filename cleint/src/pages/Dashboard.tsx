import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { HistoryItem } from '../types';
import DebugPanel from '../components/Dashboard/DebugPanel';
import HistoryPanel from '../components/History/HistoryPanel';
import AdminPanel from '../components/Admin/AdminPanel';
import '../styles/main.css';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'debug' | 'history' | 'admin'>('debug');
  const [user, setUser] = useState<any>(null);
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      loadRecentHistory();
    }
  }, []);

  const loadRecentHistory = async () => {
    try {
      const history = await apiService.getHistory(1, 5);
      setRecentHistory(history.history);
    } catch (error) {
      console.error('Failed to load recent history:', error);
    }
  };

  const handleHistoryUpdate = () => {
    loadRecentHistory();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🚀 StackSniper</h1>
          <div className="user-info">
            <span>Welcome, {user?.displayName || user?.email}</span>
            {user?.isAdmin && <span className="admin-badge">Admin</span>}
          </div>
        </div>
        
        <nav className="dashboard-nav">
          <button 
            className={`nav-btn ${activeTab === 'debug' ? 'active' : ''}`}
            onClick={() => setActiveTab('debug')}
          >
            <i className="fas fa-bug"></i>
            Debug
          </button>
          <button 
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fas fa-history"></i>
            History
          </button>
          {user?.isAdmin && (
            <button 
              className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <i className="fas fa-cog"></i>
              Admin
            </button>
          )}
        </nav>
      </header>

      <main className="dashboard-main">
        {activeTab === 'debug' && (
          <DebugPanel onHistoryUpdate={handleHistoryUpdate} />
        )}
        
        {activeTab === 'history' && (
          <HistoryPanel />
        )}
        
        {activeTab === 'admin' && user?.isAdmin && (
          <AdminPanel />
        )}
      </main>

      {recentHistory.length > 0 && (
        <footer className="dashboard-footer" style={{
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-color)',
          padding: '1rem 1.5rem'
        }}>
          <div className="quick-stats" style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <span>
              <i className="fas fa-clock"></i>
              Last activity: {new Date(recentHistory[0].timestamp).toLocaleTimeString()}
            </span>
            <span>
              <i className="fas fa-database"></i>
              Total queries: {recentHistory.length}
            </span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Dashboard;
