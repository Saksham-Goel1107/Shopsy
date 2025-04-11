import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductListing from './pages/productListing';
import ProductDetail from './pages/productDetails';
import Cart from './pages/cart';
import Login from './pages/login';
import Header from './components/header';
import Success from "./pages/success"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

 
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
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
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={isAuthenticated ? <Cart /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </>
  );
}

export default App;