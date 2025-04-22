import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Authentication from '../components/Authentication';
import { getCurrentUser } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    // If user is already logged in, redirect to preferences
    if (user) {
      navigate('/preferences');
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    setUser(getCurrentUser());
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Welcome to Movie Recommender</h1>
        <p className="login-description">
          Sign in or create an account to save your movie preferences and get personalized recommendations.
        </p>
        <Authentication onAuthSuccess={handleAuthSuccess} />
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #032541 0%, #01b4e4 100%);
        }
        
        .login-container {
          max-width: 500px;
          width: 100%;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 2.5rem;
        }
        
        h1 {
          color: var(--primary);
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .login-description {
          color: var(--text-light);
          margin-bottom: 2rem;
          text-align: center;
          line-height: 1.5;
        }
        
        @media (max-width: 576px) {
          .login-container {
            padding: 1.5rem;
          }
          
          h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;