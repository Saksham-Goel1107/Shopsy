import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ProductListing() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);

    fetch('https://fakestoreapi.com/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });

    fetch('https://fakestoreapi.com/products/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data));
      
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const handleStorageChange = () => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
  };

  const getProductQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
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
    }
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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setLoading(true);
    
    const url = category 
      ? `https://fakestoreapi.com/products/category/${category}` 
      : 'https://fakestoreapi.com/products';
      
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  };

  const handleSortChange = (option) => {
    setSortOption(option);
  };

  
  const filteredProducts = searchTerm
    ? products.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

 
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price-high-low') {
      return b.price - a.price;
    } else if (sortOption === 'price-low-high') {
      return a.price - b.price;
    }
    return 0;
  });

  
  const displayProducts = sortOption ? sortedProducts : filteredProducts;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Products</h2>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded cursor-pointer  ${
              selectedCategory === '' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded cursor-pointer ${
                selectedCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
            
            <div className="mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="font-medium mb-2 sm:mb-0">Sort by:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSortChange('')}
              className={`px-3 py-1 rounded text-sm sm:text-base cursor-pointer ${
                sortOption === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Default
            </button>
            <button
              onClick={() => handleSortChange('price-high-low')}
              className={`px-3 py-1 rounded text-sm sm:text-base cursor-pointer ${
                sortOption === 'price-high-low'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Price: High to Low
            </button>
            <button
              onClick={() => handleSortChange('price-low-high')}
              className={`px-3 py-1 rounded text-sm sm:text-base cursor-pointer ${
                sortOption === 'price-low-high'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Price: Low to High
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <Link to={`/products/${product.id}`} className="block p-4 flex-grow">
                <div className="h-48 flex items-center justify-center">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-800 line-clamp-2">{product.title}</h3>
                <p className="mt-2 text-blue-600 font-bold">${product.price.toFixed(2)}</p>
              </Link>
              
              <div className="p-4 pt-0 mt-auto">
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
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer hover:scale-105"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && displayProducts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No products found.</p>
        </div>
      )}
    </div>
  );
}

export default ProductListing;