import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WaitTimePrediction = ({ queueLength }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/api/predict', {
        queueLength: queueLength
      });
      
      setPrediction(response.data.data);
    } catch (err) {
      setError('Failed to get wait time prediction');
      console.error('Error fetching prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch prediction when queue length changes
  useEffect(() => {
    if (queueLength > 0) {
      fetchPrediction();
    } else {
      setPrediction(null);
    }
  }, [queueLength]);

  if (queueLength === 0) {
    return (
      <div className="card">
        <h3>Wait Time Prediction</h3>
        <div className="wait-time-display">
          <div className="wait-time-value">0</div>
          <div className="wait-time-label">No wait time - Queue is empty</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="prediction-header">
        <h3>Wait Time Prediction</h3>
        <button 
          className="btn btn-success"
          onClick={fetchPrediction}
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Refresh Prediction'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {prediction && (
        <div className="prediction-content">
          <div className="wait-time-display">
            <div className="wait-time-value">
              {prediction.predictedWaitTimeMinutes}
            </div>
            <div className="wait-time-label">Estimated Wait Time (minutes)</div>
          </div>

          <div className="prediction-details">
            <div className="detail-row">
              <span className="detail-label">Current Queue Length:</span>
              <span className="detail-value">{prediction.currentQueueLength}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Service Type:</span>
              <span className="detail-value">{prediction.serviceType}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time of Day:</span>
              <span className="detail-value">
                {new Date(prediction.timeOfDay).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {prediction.factors && (
            <div className="factors-section">
              <h4>Calculation Factors</h4>
              <div className="factors-grid">
                <div className="factor-item">
                  <span className="factor-label">Base Time per Person:</span>
                  <span className="factor-value">{prediction.factors.baseTimePerPerson} minutes</span>
                </div>
                <div className="factor-item">
                  <span className="factor-label">Time Multiplier:</span>
                  <span className="factor-value">{prediction.factors.timeMultiplier}x</span>
                </div>
                <div className="factor-item">
                  <span className="factor-label">Service Multiplier:</span>
                  <span className="factor-value">{prediction.factors.serviceMultiplier}x</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WaitTimePrediction; 