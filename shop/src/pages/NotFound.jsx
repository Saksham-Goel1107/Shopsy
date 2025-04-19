import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button 
          className="back-home-button"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
      
      <style jsx="true">{`
        .not-found-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 85vh;
          padding: 2rem;
          background-color: #f8f9fa;
          font-family: 'Segoe UI', Arial, sans-serif;
        }
        
        .not-found-content {
          text-align: center;
          max-width: 550px;
          padding: 3.5rem;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
          border: 1px solid #eaeaea;
        }
        
        .not-found-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: linear-gradient(90deg, #3a36db, #5553db, #7b79e2);
        }
        
        .error-code {
          font-size: 7.5rem;
          font-weight: 800;
          color: #3a36db;
          margin: 0;
          line-height: 1;
          letter-spacing: -2px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .error-title {
          font-size: 2.25rem;
          color: #333;
          margin-top: 0.75rem;
          margin-bottom: 1.25rem;
          font-weight: 600;
        }
        
        .error-message {
          color: #555;
          font-size: 1.2rem;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }
        
        .back-home-button {
          background: linear-gradient(90deg, #3a36db, #5553db);
          color: white;
          border: none;
          padding: 0.875rem 1.75rem;
          font-size: 1.1rem;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 8px rgba(58, 54, 219, 0.25);
        }
        
        .back-home-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(58, 54, 219, 0.35);
        }
        
        .back-home-button:active {
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .error-code {
            font-size: 6rem;
          }
          
          .error-title {
            font-size: 1.75rem;
          }
          
          .not-found-content {
            padding: 2.5rem;
            margin: 0 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .error-code {
            font-size: 5rem;
          }
          
          .error-title {
            font-size: 1.5rem;
          }
          
          .error-message {
            font-size: 1rem;
          }
          
          .not-found-content {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default NotFound;
