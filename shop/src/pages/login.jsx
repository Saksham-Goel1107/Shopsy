import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [Googleloading, setGoogleloading] = useState(false);
  const [error, setError] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
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
          return;
        }
        
        const data = await res.json();
        
        if (data.valid) {
          if (data.decoded?.isVerified) {
            navigate('/products');
          } else {
            navigate('/otp');
          }
        }
      } catch (err) {
        console.error('Token validation error:', err);
        localStorage.removeItem('token');
      }
    }
    
    verifyUserToken();
  }, [navigate]);


  const handleGoogleSignIn = async () => {
    try {
      setGoogleloading(true);
      setError('');

      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;
      const googleUser = {
        email: user.email,
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/google-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser),
      });

      const resData = await res.json();
      if(!resData.success && resData?.message === 'User Not Found') {
        setError(resData.message);
        setTimeout(() => navigate('/register'), 1000);
        return;
      }
      if (!resData.success) {
        if(resData?.message === 'User Not Verified') {
          setError(resData.message);
          localStorage.setItem("token", resData.token);
          window.dispatchEvent(new Event('auth-change'));
          setTimeout(() => navigate('/otp'), 1000);
          return;
        }
        setError(resData.message);
        setGoogleloading(false);
        return;
      }

      localStorage.setItem("token", resData.token);
      window.dispatchEvent(new Event('auth-change'));
      navigate("/products");

    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleloading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!captchaValue) {
      setError('Please complete the reCAPTCHA verification');
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
        setLoading(false);
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const resData = await res.json()
      if (!resData.success) {
        setError(resData.message);
        setLoading(false);
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
        return;
      }
      localStorage.setItem("token", resData.token);
      window.dispatchEvent(new Event('auth-change'));
      navigate('/products')
    } catch (error) {
      console.error('Login error:', error);
      recaptchaRef.current?.reset();
      setCaptchaValue(null);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
            Login to Shop
          </h2>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || Googleloading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faGoogle} className="mr-2 text-red-500" />
              {Googleloading ? 'Processing...' : 'Sign in with Google'}
            </button>
          </div>
          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => {
                  const value = e.target.value;
                  const filteredValue = value.replace(/[^\w]/g, ''); 
                  setUsername(filteredValue);
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                </button>
              </div>
              <p className='text-gray-400 text-xs text-center cursor-default'>Maximum of 5 Attempts or the Account will be Blocked for 24 hrs </p>
            </div>


            <div className="flex justify-center">

              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_REACT_APP_SITE_KEY}
                onChange={(value) => {
                  setCaptchaValue(value);
                }}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !captchaValue || Googleloading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link className='text-blue-500 text-md font-bold' to='/forgot'>Forgot Your Password?</Link>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500">
            <div>Don't have an account? <Link className='text-blue-500 font-semibold' to='/register'>Register</Link> </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;