import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { HistoryItem } from '../../types';

const HistoryPanel: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await apiService.getHistory();
      setHistory(response.history);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'snipe': return 'fas fa-crosshairs';
      case 'debug': return 'fas fa-bug';
      case 'review': return 'fas fa-code';
      case 'explain': return 'fas fa-lightbulb';
      default: return 'fas fa-question';
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2>
          <i className="fas fa-history"></i>
          Query History
        </h2>
        <button className="btn btn-secondary" onClick={loadHistory}>
          <i className="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          <p>Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: 'var(--bg-primary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <i className="fas fa-inbox" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No history yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Your debugging queries will appear here once you start using StackSniper.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((item) => (
            <div key={item._id} style={{
              background: 'var(--bg-primary)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className={getFeatureIcon(item.feature)} style={{ color: 'var(--primary-color)' }}></i>
                  <span style={{ 
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {item.feature}
                  </span>
                  <span style={{ 
                    background: item.source === 'ai' ? 'var(--success-color)' : 'var(--primary-color)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {item.source}
                  </span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {formatDate(item.timestamp)}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Query:</strong>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  marginTop: '0.5rem',
                  background: 'var(--bg-secondary)',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}>
                  {item.query}
                </p>
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Response:</strong>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  marginTop: '0.5rem',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5'
                }}>
                  {item.response.length > 200 ? item.response.substring(0, 200) + '...' : item.response}
                </p>
              </div>

              {item.metadata.responseTime && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Response time: {item.metadata.responseTime}ms
                  </span>
                  {item.metadata.isFavorite && (
                    <i className="fas fa-star" style={{ color: 'var(--warning-color)' }}></i>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
