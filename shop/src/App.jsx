import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProductListing from './pages/productListing';
import ProductDetail from './pages/productDetails';
import Cart from './pages/cart';
import Login from './pages/login';
import Header from './components/header';
import Success from "./pages/success"
import { getToken } from 'firebase/messaging'
import { messaging } from './firebase'
import Orders from './pages/orders';
import OrderDetail from './pages/orderDetail';
import Register from './pages/register';
import Otp from './pages/otp';
import ForgotEmail from "./pages/forgotemail"
import ResetPassword from "./pages/resetpassword"
import NotFound from './pages/NotFound';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  async function requestPermission() {
    const permission = Notification.permission;

    if (permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    } else if (permission === 'granted') {
      try {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });

        if (token) {
          localStorage.setItem('fcmToken', token);
        }
      } catch (error) {
        console.error("Error getting Firebase token:", error);
      }
    }
  }

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/verify-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        console.error(`Token verification failed with status: ${res.status}`);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      const data = await res.json();

      if (!data.valid) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } else {
        const user = data.decoded?.isVerified;
        setIsAuthenticated(user);
        if (token && !user) {
          navigate('/otp');
        }
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestPermission();
    verifyToken();
    
    const handleAuthChange = () => {
      verifyToken();
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [navigate]);

  if (isLoading) {
    return <div className="container mx-auto p-6 text-center">Loading...</div>;
  }

  return (
    <>
      {isAuthenticated && <Header />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <ProductListing /> : <Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/register" element={isAuthenticated ? <ProductListing /> : <Register />} />
        <Route path="/forgot" element={isAuthenticated ? <ProductListing /> : <ForgotEmail />} />
        <Route path="/resetpassword" element={isAuthenticated ? <ProductListing /> : <ResetPassword />} />
        <Route path="/products" element={isAuthenticated ? <ProductListing /> : <Navigate to="/login" />} />
        <Route path="/products/:id" element={isAuthenticated ? <ProductDetail /> : <Navigate to="/login" />} />
        <Route path="/cart" element={isAuthenticated ? <Cart /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/success" element={isAuthenticated ? <Success /> : <Navigate to="/login" />} />
        <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" />} />
        <Route path="/orders/:orderId" element={isAuthenticated ? <OrderDetail /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;