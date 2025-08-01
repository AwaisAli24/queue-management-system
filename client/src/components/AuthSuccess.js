import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokenFromGoogle } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token) {
      setTokenFromGoogle(token);
      navigate('/');
    } else {
      navigate('/login?error=' + encodeURIComponent('No token received'));
    }
  }, [searchParams, navigate, setTokenFromGoogle]);

  return (
    <div className="loading">
      <h2>Completing Google Login...</h2>
      <p>Please wait while we complete your authentication.</p>
    </div>
  );
};

export default AuthSuccess; 