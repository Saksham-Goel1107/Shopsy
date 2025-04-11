import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faStore, faClock } from '@fortawesome/free-solid-svg-icons';

function Success() {
  const [countdown, setCountdown] = useState(4);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('storage'));
    
    const redirectTimer = setTimeout(() => {
      navigate('/products');
    }, 4000);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => {
      clearTimeout(redirectTimer);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md max-w-lg w-full text-center">
        <FontAwesomeIcon 
          icon={faCheckCircle} 
          className="text-6xl text-green-500 mb-6" 
        />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been processed successfully.
        </p>
        
        <div className="flex items-center justify-center mb-6 bg-blue-50 p-3 rounded-lg">
          <FontAwesomeIcon icon={faClock} className="text-blue-500 mr-2" />
          <span className="text-blue-700">
            Redirecting to products in <span className="font-bold text-lg">{countdown}</span> seconds...
          </span>
        </div>
        
        <Link 
          to="/products" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-all duration-300"
        >
          <FontAwesomeIcon icon={faStore} className="mr-2" />
          Go to Products Now
        </Link>
      </div>
    </div>
  );
}

export default Success;