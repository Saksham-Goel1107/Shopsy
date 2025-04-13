import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faSignOutAlt, 
  faExclamationTriangle, 
  faCheck, 
  faTimes,
  faStore,
  faBars
} from '@fortawesome/free-solid-svg-icons';

function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.body.style.overflow = '';
    }
  }, []);

  const handleStorageChange = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  };

  const handleLogout = () => {
    document.body.style.overflow = 'hidden';
    setShowLogoutModal(true);
    setMobileMenuOpen(false);
  };

  const confirmLogout = () => {
    document.body.style.overflow = '';
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    setShowLogoutModal(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    document.body.style.overflow = '';
    setShowLogoutModal(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-blue-600 text-white p-4 relative">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center">
          <FontAwesomeIcon icon={faStore} className="mr-2" />
          Shop
        </Link>
        
        <button className="md:hidden text-white" onClick={toggleMobileMenu}>
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
        
        <nav className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative top-full left-0 right-0 md:top-auto bg-blue-600 md:bg-transparent p-4 md:p-0 flex-col md:flex-row gap-4 md:gap-6 shadow-lg md:shadow-none z-30 ${mobileMenuOpen ? 'mt-0' : ''}`}>
          <Link to="/" 
            className="hover:text-blue-200 font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link to="/cart" 
            className="hover:text-blue-200 flex items-center font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FontAwesomeIcon icon={faShoppingCart} className="mr-1" />
            Cart 
            <span className="ml-1 bg-white text-blue-600 rounded-full px-2 text-sm font-bold">
              {cartCount}
            </span>
          </Link>
          <Link to="/orders" 
            className="hover:text-blue-200 font-semibold"
            onClick={() => setMobileMenuOpen(false)}
          >
            Orders
          </Link>
          <button
            onClick={handleLogout}
            className="hover:text-blue-200 font-semibold flex items-center cursor-pointer text-left"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
            Logout
          </button>
        </nav>
      </div>

      {showLogoutModal && (
        <div 
          className="fixed inset-0 bg-opacity-10 z-40 flex items-center justify-center backdrop-blur-sm"
          onClick={cancelLogout}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 z-50 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-3xl sm:text-4xl" />
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to log out? Your cart items will remain saved.</p>
              
              <div className="flex justify-center space-x-3 sm:space-x-4">
                <button
                  onClick={cancelLogout}
                  className="px-4 sm:px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none transition-colors duration-300 flex items-center"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none transition-colors duration-300 flex items-center"
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;