import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserCard from './UserCard';
import WaitTimePrediction from './WaitTimePrediction';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const [queueResponse, statsResponse] = await Promise.all([
        axios.get('/api/queue'),
        axios.get('/api/queue/stats')
      ]);
      
      setUsers(queueResponse.data.data);
      setStats(statsResponse.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch queue data. Please try again.');
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (userId) => {
    try {
      await axios.delete(`/api/queue/${userId}`);
      fetchQueue();
    } catch (err) {
      setError('Failed to remove user from queue');
      console.error('Error removing user:', err);
    }
  };

  useEffect(() => {
    fetchQueue();
    
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const formatWaitTime = (waitTimeMs) => {
    const minutes = Math.floor(waitTimeMs / (1000 * 60));
    const seconds = Math.floor((waitTimeMs % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Queue Data...</h2>
        <p>Please wait while we fetch the latest queue information.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="card">
        <div className="header-section">
          <h2>Queue Management</h2>
          <button 
            className="btn btn-primary"
            onClick={fetchQueue}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Queue'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total in Queue</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {stats.averageWaitTime ? formatWaitTime(stats.averageWaitTime) : '0m 0s'}
              </div>
              <div className="stat-label">Average Wait Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {stats.serviceTypeStats?.length || 0}
              </div>
              <div className="stat-label">Service Types</div>
            </div>
          </div>
        )}

        {stats?.serviceTypeStats && stats.serviceTypeStats.length > 0 && (
          <div className="card">
            <h3>Service Type Breakdown</h3>
            <div className="service-breakdown">
              {stats.serviceTypeStats.map(service => (
                <div key={service._id} className="service-stat">
                  <span className="service-name">{service._id}</span>
                  <span className="service-count">{service.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <WaitTimePrediction queueLength={users.length} />

        <div className="queue-section">
          <h3>Current Queue ({users.length} people)</h3>
          
          {users.length === 0 ? (
            <div className="empty-queue">
              <p>No one is currently in the queue.</p>
            </div>
          ) : (
            <div className="queue-list">
              {users.map((user, index) => (
                <UserCard
                  key={user._id}
                  user={user}
                  position={index + 1}
                  onRemove={removeUser}
                  formatTime={formatTime}
                  formatWaitTime={formatWaitTime}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 