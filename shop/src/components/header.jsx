import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { 
  faShoppingCart, 
  faSignOutAlt, 
  faExclamationTriangle, 
  faCheck, 
  faTimes,
  faStore,
  faBars,
  faPhone,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';

function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
        
        <nav ref={menuRef} className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative top-full left-0 right-0 md:top-auto bg-blue-600 md:bg-transparent p-4 md:p-0 flex-col md:flex-row gap-4 md:gap-6 shadow-lg md:shadow-none z-30 ${mobileMenuOpen ? 'mt-0' : ''}`}>
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
          <button
            onClick={() => setShowContactModal(true)}
            className="hover:text-blue-200 font-semibold flex items-center cursor-pointer text-left"
          >
            <FontAwesomeIcon icon={faPhone} className="mr-1" />
            Contact Us
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
                  className="px-4 sm:px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none transition-colors duration-300 flex items-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none transition-colors duration-300 flex items-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div 
          className="fixed inset-0 bg-opacity-10 z-40 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setShowContactModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 z-50 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mb-4">
                <img src="/icon.png" alt="Logo" className="w-20 h-20 mx-auto" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Us</h3>
              
              <div className="flex flex-col space-y-3">
                <a
                  href="mailto:sakshamgoel1107@gmail.com"
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-900 transition-colors duration-300"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Email Us
                </a>
                
                <a
                  href="https://github.com/Saksham-Goel1107"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors duration-300"
                >
                  <FontAwesomeIcon icon={faGithub} className="mr-2" />
                  GitHub
                </a>

                <a
                  href="tel:+918882534712"
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300"
                >
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  Call Us
                </a>
                
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 transition-colors duration-300 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Close
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