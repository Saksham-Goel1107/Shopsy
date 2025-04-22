import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faLocationDot,
  faReceipt,
  faSpinner,
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view your order details');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

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

  const getStatusDetails = (status) => {
    switch(status) {
      case 'completed':
        return {
          icon: faCircleCheck,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          message: 'This order has been delivered to your address.'
        };
      case 'pending':
        return {
          icon: faSpinner,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          message: 'Your order has been placed and is awaiting processing.'
        };
      case 'processing':
        return {
          icon: faSpinner,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          message: 'Your order is out for delivery and will arrive soon.'
        };
      case 'cancelled':
        return {
          icon: faCircleXmark,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          message: 'This order has been cancelled.'
        };
      default:
        return {
          icon: faTriangleExclamation,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          message: 'Order status is unknown.'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-blue-500 text-4xl fa-spin mb-4" />
          <p className="text-gray-600">Loading order details...</p>
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
          to="/orders" 
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Not Found: </strong>
          <span className="block sm:inline">Order not found</span>
        </div>
        <Link 
          to="/orders" 
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusDetails = getStatusDetails(order.status);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link 
          to="/orders" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Orders
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div>
              <h2 className="text-xl font-bold">Order #{order._id.substring(0, 8)}</h2>
              <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className={`${statusDetails.bgColor} ${statusDetails.textColor} px-3 py-1 rounded-full flex items-center text-sm font-medium mt-2 sm:mt-0`}>
              <FontAwesomeIcon icon={statusDetails.icon} className={`${statusDetails.color} mr-1`} />
              <span className="capitalize">{order.status}</span>
            </div>
          </div>

          <div className={`mt-3 p-3 ${statusDetails.bgColor} ${statusDetails.textColor} rounded-md text-sm`}>
            <p>{statusDetails.message}</p>
            {order.status === 'pending' && (
              <button 
                onClick={fetchOrderDetails}
                className="mt-2 inline-flex items-center text-sm font-medium bg-white px-2 py-1 rounded shadow-sm hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faSpinner} className="mr-1" />
                Refresh Status
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-3 flex items-center">
            <FontAwesomeIcon icon={faReceipt} className="mr-2 text-blue-500" />
            Order Items
          </h3>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex border-b pb-3 last:border-b-0 last:pb-0">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 object-contain rounded mr-4" 
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {order.deliveryAddress && (
            <div className="mt-6 pt-4 border-t">
              <h3 className="font-bold text-lg mb-3 flex items-center">
                <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-blue-500" />
                Shipping Address
              </h3>
              
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="mb-1">
                  {order.deliveryAddress.houseNumber} {order.deliveryAddress.street}
                </p>
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
                </p>
                <p>{order.deliveryAddress.country}</p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Subtotal:</p>
                <p>Shipping:</p>
                <p className="font-bold text-black mt-2">Total:</p>
              </div>
              <div className="text-right">
                <p>${order.totalAmount.toFixed(2)}</p>
                <p>Free</p>
                <p className="font-bold text-blue-600 mt-2">${order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;