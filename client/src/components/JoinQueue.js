import React, { useState } from 'react';
import axios from 'axios';

const JoinQueue = () => {
  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'consultation'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const serviceTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'payment', label: 'Payment' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'support', label: 'Support' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter your name' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/queue', formData);
      
      setMessage({ 
        type: 'success', 
        text: `Successfully joined queue! Your position will be shown in the admin panel.` 
      });
      
      setFormData({
        name: '',
        serviceType: 'consultation'
      });
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to join queue. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-queue">
      <div className="card">
        <h2>Join the Queue</h2>
        <p className="form-description">
          Enter your details below to join the queue. We'll notify you when it's your turn.
        </p>

        {message.text && (
          <div className={message.type}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Service Type</label>
            <div className="radio-group">
              {serviceTypes.map(service => (
                <label key={service.value} className="radio-option">
                  <input
                    type="radio"
                    name="serviceType"
                    value={service.value}
                    checked={formData.serviceType === service.value}
                    onChange={handleInputChange}
                  />
                  {service.label}
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Joining Queue...' : 'Join Queue'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Service Information</h3>
        <div className="service-info">
          <p><strong>Consultation:</strong> General advice and guidance</p>
          <p><strong>Payment:</strong> Bill payments and financial transactions</p>
          <p><strong>Documentation:</strong> Document processing and verification</p>
          <p><strong>Support:</strong> Technical support and troubleshooting</p>
          <p><strong>Other:</strong> Miscellaneous services</p>
        </div>
      </div>
    </div>
  );
};

export default JoinQueue; 