import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrashCan, 
  faCartShopping, 
  faFaceSadTear,
  faStore,
  faMapMarkerAlt,
  faEdit,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

function Cart() {
  const [cart, setCart] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [showAddressConfirmation, setShowAddressConfirmation] = useState(false);
  const [savedAddressExists, setSavedAddressExists] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    houseNumber: '',
    street: '',
    city: '',
    postalCode: '',
    country: ''
  });

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);
    fetchSavedAddress();
  }, []);
  
  const fetchSavedAddress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/address`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        console.log("Authentication failed when fetching address");
        localStorage.removeItem('token');
        return;
      }
      
      const data = await response.json();
      
      
      if (data.success && data.address) {
        setDeliveryAddress(data.address);
        setSavedAddressExists(true);
        
        const formattedAddress = [
          data.address.houseNumber,
          data.address.street,
          data.address.city,
          data.address.postalCode,
          data.address.country
        ].filter(Boolean).join(', ');
        
        setLocationData({
          address: formattedAddress,
          addressComponents: data.address,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error fetching saved address:", error);
    }
  };

  const saveAddressToDatabase = async (addressData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address: addressData
        })
      });
      
      if (response.status === 401) {
        console.log("Authentication failed when saving address");
        return;
      }
      
      const data = await response.json();
     
      
      if (data.success) {
        setSavedAddressExists(true);
      }
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleRemoveFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateQuantity = (productId, delta) => {
    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const getHumanReadableLocation = async (position) => {
    const { latitude, longitude } = position.coords;
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const formattedAddress = {
          houseNumber: address.house_number || '',
          street: address.road || address.street || '',
          city: address.city || address.town || address.village || address.suburb || '',
          postalCode: address.postcode || '',
          country: address.country || ''
        };
        
        setDeliveryAddress(formattedAddress);
        
        const humanReadableAddress = [
          formattedAddress.houseNumber,
          formattedAddress.street,
          formattedAddress.city,
          formattedAddress.postalCode,
          formattedAddress.country
        ].filter(Boolean).join(', ');
        
        const locationDataObj = {
          coordinates: { latitude, longitude },
          address: humanReadableAddress,
          addressComponents: formattedAddress,
          raw: data,
          timestamp: new Date().toISOString()
        };
        
        setLocationData(locationDataObj);
        setLocationStatus('success');
        setShowAddressConfirmation(true);
        return locationDataObj;
      } else {
        setLocationStatus('incomplete');
        setShowAddressConfirmation(true);
        return { coordinates: { latitude, longitude } };
      }
    } catch (error) {
      setLocationStatus('incomplete');
      setShowAddressConfirmation(true);
      return { coordinates: { latitude, longitude } };
    }
  };
  
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocationStatus('unsupported');
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }
      
      setLocationStatus('requesting');
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const locationDataObj = await getHumanReadableLocation(position);
            resolve(locationDataObj);
          } catch (error) {
            setLocationStatus('error');
            reject(error);
          }
        },
        (error) => {
          setLocationStatus('denied');
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };
  
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const updatedLocationData = {
      ...locationData,
      address: [
        deliveryAddress.houseNumber,
        deliveryAddress.street,
        deliveryAddress.city,
        deliveryAddress.postalCode,
        deliveryAddress.country
      ].filter(Boolean).join(', '),
      addressComponents: deliveryAddress
    };
    
    setLocationData(updatedLocationData);
    setShowAddressConfirmation(false);
    
    saveAddressToDatabase(deliveryAddress);
    proceedWithCheckout(updatedLocationData);
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to proceed with checkout');
      return;
    }
    
    if (savedAddressExists && locationData) {
      proceedWithCheckout(locationData);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await getLocation();
    } catch (error) {
      if (error.code === 1) {
        setError('Location permission is required for checkout. Please enable location and try again.');
      } else if (locationStatus === 'unsupported') {
        setError('Your browser does not support geolocation. Please use a modern browser.');
      } else {
        setError('Failed to complete checkout. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleEditAddress = () => {
    setShowAddressConfirmation(true);
  };

const proceedWithCheckout = async (locationData) => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stripe/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: totalPrice,
        items: cart.map(item => ({
          id: item.id,
          name: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image 
        })),
        deliveryAddress: locationData.addressComponents
      })
    });
    
    const data = await response.json();
    
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError('Error creating checkout session');
    }
  } catch (error) {
    setError('Failed to complete checkout. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {showConfirmation && (
        <div className="fixed top-20 right-4 bg-green-500 text-white p-4 rounded shadow-lg">
          Order placed successfully!
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
      
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-md">
          <div className="mb-6 text-blue-600 opacity-80">
            <FontAwesomeIcon icon={faCartShopping} className="text-8xl" />
          </div>
          <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={faFaceSadTear} className="text-yellow-500 text-2xl mr-2" />
            <h3 className="text-xl font-semibold text-gray-700">Your cart is empty</h3>
          </div>
          <p className="text-gray-500 mb-8 text-center">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link 
            to="/" 
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faStore} className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cart.map((product) => (
              <div key={product.id} className="border-b p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start mb-4 sm:mb-0 sm:max-w-[60%]">
                  <img src={product.image} alt={product.title} className="w-16 h-16 object-contain mr-4 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <h4 className="text-lg font-semibold mb-1 truncate" title={product.title}>
                      {product.title}
                    </h4>
                    <p className="text-blue-600 font-medium">${product.price.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 self-end sm:self-center">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => handleUpdateQuantity(product.id, -1)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3">{product.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(product.id, 1)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveFromCart(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer"
                  >
                   <FontAwesomeIcon icon={faTrashCan} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</h3>
            
            {savedAddressExists && (
              <div className="mt-4 border border-gray-200 rounded-md p-3 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1 flex items-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-blue-500" />
                      Delivery Address
                    </h4>
                    <p className="text-sm text-gray-600">
                      {[
                        deliveryAddress.houseNumber,
                        deliveryAddress.street,
                        deliveryAddress.city,
                        deliveryAddress.postalCode,
                        deliveryAddress.country
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <button 
                    onClick={handleEditAddress} 
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-2 text-red-500">{error}</div>
            )}
            
            {!savedAddressExists && (
              <p className="text-sm text-gray-500 mt-2 mb-1 flex items-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                Location access required for delivery
              </p>
            )}
            
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 cursor-pointer font-semibold disabled:opacity-50"
            >
              {loading ? (locationStatus === 'requesting' ? 'Requesting Location...' : 'Processing...') : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}
      
      {showAddressConfirmation && (
        <div className="fixed inset-0 bg-opacity-10 z-40 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {savedAddressExists ? 'Update Delivery Address' : 'Confirm Delivery Address'}
            </h3>
            <form onSubmit={handleAddressSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">House/Apt Number</label>
                  <input
                    type="text"
                    value={deliveryAddress.houseNumber}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, houseNumber: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g. 123, Apt 4B"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street</label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g. Street name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g. Delhi"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    value={deliveryAddress.postalCode}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, postalCode: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g. 10001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    value={deliveryAddress.country}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, country: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g. United States"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddressConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  {savedAddressExists ? 'Update & Checkout' : 'Confirm & Checkout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;