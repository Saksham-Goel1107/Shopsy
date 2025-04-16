import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { jwtDecode } from 'jwt-decode';
import ForgotEmail from "./pages/forgotemail"
import ResetPassword from "./pages/resetpassword"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return 
    const decoded = jwtDecode(token);
    return token && decoded?.isVerified;
  });
  
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

  useEffect(() => {
    requestPermission();
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = jwtDecode(token);
          setIsAuthenticated(user?.isVerified);
        } catch (error) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <>
      {isAuthenticated && <Header />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <ProductListing /> : <Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/register" element={isAuthenticated ? <ProductListing /> : <Register />} />
        <Route path="/forgot" element={isAuthenticated ? <ProductListing /> : <ForgotEmail />} />
        <Route path="/resetpassword" element={isAuthenticated ? <ProductListing /> : <ResetPassword />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={isAuthenticated ? <Cart /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/success" element={<Success />} />
        <Route path="/orders" element={isAuthenticated ? <Orders /> : <Login />} />
        <Route path="/orders/:orderId" element={isAuthenticated ? <OrderDetail /> : <Login />} />
      </Routes>
    </>
  );
}

export default App;