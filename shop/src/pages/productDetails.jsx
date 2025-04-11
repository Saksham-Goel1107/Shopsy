import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);

    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product details:", err);
        setLoading(false);
      });

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [id, navigate]);

  const handleStorageChange = () => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  };

  const getProductQuantity = (productId) => {
    const item = cart.find(item => item.id === parseInt(productId));
    return item ? item.quantity : 0;
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const updatedCart = [...cart];
    const existingProductIndex = updatedCart.findIndex((item) => item.id === product.id);

    if (existingProductIndex !== -1) {
      updatedCart[existingProductIndex].quantity += 1;
    } else {
      updatedCart.push({ ...product, quantity: 1 });
    }

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
    
  };

  const handleUpdateQuantity = (product, delta) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const updatedCart = [...cart];
    const existingProductIndex = updatedCart.findIndex((item) => item.id === product.id);

    if (existingProductIndex !== -1) {
      const newQuantity = updatedCart[existingProductIndex].quantity + delta;
      
      if (newQuantity <= 0) {
        updatedCart.splice(existingProductIndex, 1);
      } else {
        updatedCart[existingProductIndex].quantity = newQuantity;
      }

      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('storage'));
    }
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (!product) return <div className="text-center p-10">Product not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        <div className="md:flex">
          <div className="md:w-1/2 flex justify-center items-start">
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-64 h-64 object-contain"
            />
          </div>
          
          <div className="md:w-1/2 mt-4 md:mt-0 md:ml-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h2>
            <p className="text-blue-600 text-xl font-bold mb-4">${product.price.toFixed(2)}</p>
            <div className="mb-4">
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                {product.category}
              </span>
            </div>
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            <div className="mt-6">
              {getProductQuantity(product.id) > 0 ? (
                <div className="flex items-center justify-between border rounded">
                  <button
                    onClick={() => handleUpdateQuantity(product, -1)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{getProductQuantity(product.id)}</span>
                  <button
                    onClick={() => handleUpdateQuantity(product, 1)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;