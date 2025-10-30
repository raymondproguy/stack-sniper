import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { AdminStats } from '../../types';

const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const adminStats = await apiService.getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2>
          <i className="fas fa-cog"></i>
          Admin Dashboard
        </h2>
        <button className="btn btn-secondary" onClick={loadAdminStats}>
          <i className="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'var(--bg-primary)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
            {stats.totalUsers}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Users</div>
        </div>

        <div style={{
          background: 'var(--bg-primary)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
            {stats.activeToday}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Today</div>
        </div>

        <div style={{
          background: 'var(--bg-primary)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
            {stats.totalHistoryEntries}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Queries</div>
        </div>

        <div style={{
          background: 'var(--bg-primary)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
            {stats.successRate}%
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Success Rate</div>
        </div>
      </div>

      {/* System Status */}
      <div style={{
        background: 'var(--bg-primary)',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        borderLeft: `4px solid ${stats.system.status === 'healthy' ? 'var(--success-color)' : 'var(--warning-color)'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--text-primary)' }}>System Status</h3>
          <span style={{ 
            background: stats.system.status === 'healthy' ? 'var(--success-color)' : 'var(--warning-color)',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            {stats.system.status === 'healthy' ? '✅ Healthy' : '⚠️ Issues'}
          </span>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          <p><strong>Uptime:</strong> {stats.system.uptime}</p>
          <p><strong>Last Error:</strong> {stats.system.lastError}</p>
          <p><strong>Avg Response:</strong> {stats.averageResponseTime.toFixed(1)}s</p>
        </div>
      </div>

      {/* Feature Usage */}
      <div style={{
        background: 'var(--bg-primary)',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Feature Usage</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats.featureUsage.map((feature, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: 'var(--bg-secondary)',
              borderRadius: '4px'
            }}>
              <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                {feature.feature}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {feature.count} ({feature.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Errors */}
      <div style={{
        background: 'var(--bg-primary)',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Common Errors</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats.popularErrors.slice(0, 5).map((error, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: 'var(--bg-secondary)',
              borderRadius: '4px'
            }}>
              <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                {error.errorType}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {error.count} ({error.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
