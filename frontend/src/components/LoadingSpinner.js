import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = "Loading..." }) => {
  // Define spinner size based on the prop
  let spinnerSize;
  switch (size) {
    case 'small':
      spinnerSize = '30px';
      break;
    case 'large':
      spinnerSize = '60px';
      break;
    case 'medium':
    default:
      spinnerSize = '40px';
  }

  return (
    <div className="loading-container">
      <div className="spinner-wrapper">
        <div className="spinner" style={{ width: spinnerSize, height: spinnerSize }}></div>
        {message && <p className="loading-message">{message}</p>}
      </div>

      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          width: 100%;
        }
        
        .spinner-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .spinner {
          border: 4px solid rgba(3, 37, 65, 0.1);
          border-radius: 50%;
          border-top: 4px solid var(--accent);
          animation: spin 1s linear infinite;
        }
        
        .loading-message {
          margin-top: 1rem;
          color: var(--text-light);
          font-weight: 500;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
