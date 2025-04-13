import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faStore, faClock, faReceipt, faBell } from '@fortawesome/free-solid-svg-icons';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';

function Success() {
  const [countdown, setCountdown] = useState(8);
  const [orderNumber, setOrderNumber] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    
    if (orderId) {
      setOrderNumber(orderId.substring(0, 8));
      
      
      const checkOrderStatus = async () => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log("Order details:", data.order);
            }
          }
        } catch (error) {
          console.error("Failed to check order status:", error);
        }
      };
      
      checkOrderStatus();
    } else {
     
      const randomOrderId = Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(`ORD-${randomOrderId}`);
    }

    
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('storage'));
    
    const checkPermissionAndSendNotification = async () => {
      const permission = Notification.permission;
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        try {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
          });
          
          if (token) {
            sendLocalNotification(orderNumber || orderId?.substring(0, 8) || 'Unknown');
            sendCloudNotification(orderNumber || orderId?.substring(0, 8) || 'Unknown', token);
            setNotificationSent(true);
          }
        } catch (error) {
          console.error("Error getting Firebase token:", error);
        }
      } else if (permission === 'default') {
        try {
          const newPermission = await Notification.requestPermission();
          setNotificationPermission(newPermission);
          
          if (newPermission === 'granted') {
            const token = await getToken(messaging, {
              vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            });
            
            if (token) {
              sendLocalNotification(orderNumber || orderId?.substring(0, 8) || 'Unknown');
              sendCloudNotification(orderNumber || orderId?.substring(0, 8) || 'Unknown', token); 
              setNotificationSent(true);
            }
          }
        } catch (error) {
          console.error("Error requesting permission:", error);
        }
      }
    };
    
    checkPermissionAndSendNotification();
    
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
    });
    
    const redirectTimer = setTimeout(() => {
      navigate('/products');
    }, 8000);
    
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
      unsubscribe();
    };
  }, [navigate, orderId, orderNumber]);
  
  const sendLocalNotification = (orderNum) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('Order Confirmed! 🛍️', {
          body: `Your order #${orderNum} has been successfully processed. Thank you for shopping with us!`,
          icon: '/icon.png', 
          badge: '/icon.png',
          timestamp: Date.now(),
          requireInteraction: true
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
          if (orderId) {
            navigate(`/orders/${orderId}`);
          }
        };
      } catch (error) {
        console.error("Error creating notification:", error);
      }
    }
  };
  
  const sendCloudNotification = async (orderNum, token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          title: 'Order Confirmed! 🛍️',
          body: `Your order #${orderNum} has been successfully processed. Thank you for shopping with us!`,
          icon: '/icon.png'
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error("Error sending notification via server:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md max-w-lg w-full text-center">
        <FontAwesomeIcon 
          icon={faCheckCircle} 
          className="text-6xl text-green-500 mb-6" 
        />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border-l-4 border-green-500">
          <div className="flex items-center justify-center mb-2">
            <FontAwesomeIcon icon={faReceipt} className="text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
          </div>
          <p className="text-gray-700 font-medium">Order #: <span className="text-blue-600">{orderNumber}</span></p>
          <p className="text-gray-600 mt-2">
            Thank you for your purchase. Your order has been processed successfully.
          </p>
          
          {orderId && (
            <div className="mt-2">
              <Link 
                to={`/orders/${orderId}`}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View Order Details
              </Link>
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-center">
            <FontAwesomeIcon 
              icon={faBell} 
              className={`mr-2 ${notificationSent ? 'text-green-500' : 'text-gray-400'}`} 
            />
            <span className={`text-sm ${notificationSent ? 'text-green-600' : 'text-gray-500'}`}>
              {notificationSent 
                ? 'Order notification sent!' 
                : notificationPermission === 'denied' 
                  ? 'Notifications are disabled' 
                  : 'Enable notifications for order updates'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-center mb-6 bg-blue-50 p-3 rounded-lg">
          <FontAwesomeIcon icon={faClock} className="text-blue-500 mr-2" />
          <span className="text-blue-700">
            Redirecting to products in <span className="font-bold text-lg">{countdown}</span> seconds...
          </span>
        </div>
        
        <div className="flex space-x-4 justify-center">
          <Link 
            to="/products" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-all duration-300"
          >
            <FontAwesomeIcon icon={faStore} className="mr-2" />
            Continue Shopping
          </Link>
          
          <Link 
            to="/orders" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-all duration-300"
          >
            <FontAwesomeIcon icon={faReceipt} className="mr-2" />
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Success;