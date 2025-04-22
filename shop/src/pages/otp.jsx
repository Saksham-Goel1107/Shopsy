import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import ReCAPTCHA from 'react-google-recaptcha';

function OTP() {
  const [otpValues, setOtpValues] = useState({
    email: ['', '', '', '', ''],
    phone: ['', '', '', '', '']
  });
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const [captchaValue, setCaptchaValue] = useState(null);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/register");
      return;
    }
    
    async function verifyUserToken() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/verify-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          localStorage.removeItem('token');
          navigate("/register");
          return;
        }
        
        const data = await res.json();
        
        if (data.valid) {
          if (data.decoded?.isVerified === true) {
            navigate('/products');
            return;
          }
          
          setUserEmail(data.decoded?.email);
          setUserPhone(data.decoded?.phoneNumber);
        } else {
          navigate("/register");
        }
      } catch (err) {
        console.error('Token validation error:', err);
        localStorage.removeItem('token');
        navigate("/register");
      }
    }
    
    verifyUserToken();
    
    const countdown = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [navigate]);

  const confirmBack = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/register');
        return;
      }
      
      const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/verify-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!verifyRes.ok) {
        navigate('/register');
        return;
      }
      
      const verifyData = await verifyRes.json();
      const email = verifyData.decoded?.email;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/otp/cancel-registration`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/register');
      } else {
        setError(data.message || 'Failed to cancel registration');
      }
    } catch (error) {
      console.error('Cancel registration error:', error);
      setError('Failed to cancel registration. Please try again.');
    } finally {
      document.body.style.overflow = '';
      setShowLogoutModal(false);
    }
  };

  const cancelBack = () => {
    document.body.style.overflow = '';
    setShowLogoutModal(false);
  };

  const handleBack = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/register');
      return;
    }
    document.body.style.overflow = 'hidden';
    setShowLogoutModal(true);
  };

  const handleChange = (element, type, index) => {
    if (isNaN(element.value)) return false;

    setOtpValues(prev => ({
      ...prev,
      [type]: prev[type].map((d, idx) => (idx === index ? element.value : d))
    }));

    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, type, index) => {
    if (e.key === 'Backspace') {
      if (!otpValues[type][index] && index > 0) {
        const prevInput = e.target.previousSibling;
        if (prevInput) {
          prevInput.focus();
        }
      }
      setOtpValues(prev => ({
        ...prev,
        [type]: prev[type].map((d, idx) => (idx === index ? '' : d))
      }));
    }
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailOtp = otpValues.email.join('');
    const phoneOtp = otpValues.phone.join('');

    if (emailOtp.length !== 5 || phoneOtp.length !== 5) {
      setError('Please enter all digits for both email and phone OTP');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found');
      navigate('/register');
      return;
    }

    let email;
    try {
      const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/verify-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!verifyRes.ok) {
        setError('Invalid authentication token');
        navigate('/register');
        return;
      }
      
      const verifyData = await verifyRes.json();
      email = verifyData.decoded?.email;
      
      if (!email) {
        setError('User email not found');
        return;
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setError('Authentication failed');
      return;
    }

    setLoading(true);
    try {
      const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/verify-recaptcha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaValue }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        setError('reCAPTCHA verification failed. Please try again.');
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
        setLoading(false);
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOtp,
          phoneOtp,
          email
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setCaptchaValue(null);
        recaptchaRef.current?.reset();
        setLoading(false);
        return;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        setTimeout(() => {
          window.dispatchEvent(new Event('auth-change'));
          navigate('/products');
        }, 100);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Verification failed. Please try again.');
      setCaptchaValue(null);
      recaptchaRef.current?.reset();
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer !== 0) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found');
      navigate('/register');
      return;
    }
    
    let email;
    try {
      const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/verify-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!verifyRes.ok) {
        setError('Invalid authentication token');
        navigate('/register');
        return;
      }
      
      const verifyData = await verifyRes.json();
      email = verifyData.decoded?.email;
      
      if (!email) {
        setError('User email not found');
        return;
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setError('Authentication failed');
      return;
    }
    
    try {
      setIsResending(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/otp/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setTimer(60);
        setError('');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
            Enter Verification Code
          </h2>

          <p className="text-center text-gray-600 mb-6">
            We have sent verification codes to:<br />
            <span className="font-medium">Email: {userEmail}</span><br />
            <span className="font-medium">Phone: {userPhone}</span>
          </p>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Email OTP
              </label>
              <div className="flex justify-center gap-2">
                {otpValues.email.map((digit, index) => (
                  <input
                    key={`email-${index}`}
                    id={`emailOtp-${index}`}
                    name="emailOtp"
                    type="text"
                    maxLength="1"
                    inputMode='numeric'
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => handleChange(e.target, 'email', index)}
                    onKeyDown={(e) => handleKeyDown(e, 'email', index)}
                    onFocus={(e) => e.target.select()}
                    className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    aria-label={`Email OTP digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Phone OTP
              </label>
              <div className="flex justify-center gap-2">
                {otpValues.phone.map((digit, index) => (
                  <input
                    key={`phone-${index}`}
                    id={`phoneOtp-${index}`}
                    name="phoneOtp"
                    type="text"
                    maxLength="1"
                    inputMode='numeric'
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => handleChange(e.target, 'phone', index)}
                    onKeyDown={(e) => handleKeyDown(e, 'phone', index)}
                    onFocus={(e) => e.target.select()}
                    className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    aria-label={`Phone OTP digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_REACT_APP_SITE_KEY}
                onChange={(value) => setCaptchaValue(value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !captchaValue}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            <p className='text-gray-400 text-xs text-center cursor-default'>Maximum of 5 Attempts or the Account will be Blocked for 24 hrs </p>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResendOTP}
              disabled={timer > 0 || isResending}
              className={`text-sm font-medium cursor-pointer disabled:cursor-not-allowed ${
                timer > 0 || isResending
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              {isResending ? 'Resending...' : timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
            </button>
          </div>
          
          {showLogoutModal && (
            <div
              className="fixed inset-0 bg-opacity-10 z-40 flex items-center justify-center backdrop-blur-sm"
              onClick={cancelBack}
            >
              <div
                className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 z-50 transform transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="bg-yellow-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-3xl sm:text-4xl" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Cancel Registration</h3>
                  <p className="text-gray-600 mb-6">Are you sure you want to cancel your registration? This action cannot be undone.</p>

                  <div className="flex justify-center space-x-3 sm:space-x-4">
                    <button
                      onClick={cancelBack}
                      className="px-4 sm:px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none transition-colors duration-300 flex items-center cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-2" />
                      Keep Registration
                    </button>
                    <button
                      onClick={confirmBack}
                      className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none transition-colors duration-300 flex items-center cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      Cancel Registration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <button
              onClick={handleBack}
              className="hover:text-blue-800 text-sm font-medium text-blue-500 cursor-pointer"
            >
              ← Back to Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OTP;