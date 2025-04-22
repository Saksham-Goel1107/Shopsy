import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxOpen,
  faClockRotateLeft,
  faCircleCheck,
  faCircleXmark,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view your orders');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" />;
      case 'pending':
        return <FontAwesomeIcon icon={faSpinner} className="text-yellow-500" />;
      case 'processing':
        return <FontAwesomeIcon icon={faSpinner} className="text-blue-500 fa-spin" />;
      case 'cancelled':
        return <FontAwesomeIcon icon={faCircleXmark} className="text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faSpinner} className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-blue-500 text-4xl fa-spin mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <Link 
          to="/login" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          Login to view orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <FontAwesomeIcon icon={faClockRotateLeft} className="text-blue-500 mr-2" />
        Order History
      </h2>

      <button 
        onClick={fetchOrders}
        className="mb-4 bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200"
      >
        <FontAwesomeIcon icon={faSpinner} className="mr-2" />
        Refresh Orders
      </button>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-md">
          <div className="mb-6 text-blue-600 opacity-80">
            <FontAwesomeIcon icon={faBoxOpen} className="text-8xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-8 text-center">
            You haven't placed any orders yet. Start shopping to see your orders here!
          </p>
          <Link 
            to="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-all duration-300"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800">Order #{order._id.substring(0, 8)}</span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(order.status)}
                  <span className={`text-sm font-medium capitalize ${
                    order.status === 'completed' ? 'text-green-600' :
                    order.status === 'pending' ? 'text-yellow-600' :
                    order.status === 'processing' ? 'text-blue-600' :
                    order.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-2">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-10 h-10 object-contain rounded mr-3" 
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm font-medium text-blue-600 ml-2 whitespace-nowrap">
                            ${item.price?.toFixed(2) || '0.00'} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {order.items?.length > 3 && (
                    <p className="text-sm text-gray-500 italic">
                      + {order.items.length - 3} more {order.items.length - 3 === 1 ? 'item' : 'items'}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      Total: <span className="text-blue-600">${order.totalAmount?.toFixed(2) || '0.00'}</span>
                    </p>
                  </div>
                  <Link 
                    to={`/orders/${order._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;