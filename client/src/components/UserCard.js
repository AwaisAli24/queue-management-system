import React, { useState } from 'react';

const UserCard = ({ user, position, onRemove, formatTime, formatWaitTime }) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (window.confirm(`Are you sure you want to remove ${user.name} from the queue?`)) {
      setRemoving(true);
      await onRemove(user._id);
      setRemoving(false);
    }
  };

  const getServiceTypeColor = (serviceType) => {
    const colors = {
      consultation: '#007bff',
      payment: '#28a745',
      documentation: '#ffc107',
      support: '#17a2b8',
      other: '#6c757d'
    };
    return colors[serviceType] || '#6c757d';
  };

  return (
    <div className="user-card">
      <div className="user-info">
        <div className="user-header">
          <span className="position-badge">#{position}</span>
          <span className="user-name">{user.name}</span>
          <span 
            className="service-badge"
            style={{ backgroundColor: getServiceTypeColor(user.serviceType) }}
          >
            {user.serviceType}
          </span>
        </div>
        
        <div className="user-details">
          <div className="detail-item">
            <strong>Joined:</strong> {formatTime(user.joinTime)}
          </div>
          <div className="detail-item">
            <strong>Wait Time:</strong> {formatWaitTime(user.waitTime)}
          </div>
        </div>
      </div>

      <div className="user-actions">
        <button
          className="btn btn-danger"
          onClick={handleRemove}
          disabled={removing}
        >
          {removing ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  );
};

export default UserCard; 