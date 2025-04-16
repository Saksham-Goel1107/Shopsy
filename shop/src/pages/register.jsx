import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';
import {jwtDecode} from "jwt-decode"

function Register() {
  const [username, setUsername] = useState('');
  const [UserEmail, setUserEmail] = useState('')
  const [password, setPassword] = useState('');
  const [Confirmpassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return 
  const decoded = jwtDecode(token);
    
    if( token && decoded?.isVerified===true){
        navigate('/products')
    }
    else if( token && decoded?.isVerified===false){
        navigate('/otp')
    }
  }, [])
  

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
        return;
      }
    if(password!==Confirmpassword){
      setError('Password and Confirm Password should be same');
      recaptchaRef.current?.reset();
setCaptchaValue(null);
      return
    }
    const res=await fetch(`${import.meta.env.VITE_API_BASE_URL}/register`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: UserEmail,
          password
        }),
    })
    const resData = await res.json();
    if(!resData.success){
        setError(resData.message);
        setLoading(false);
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
        return;
    }
    localStorage.setItem("token", resData.token);
    navigate("/otp", { state: { email: UserEmail } });
    } catch (error) {
      console.error('Registration error:', error);
      recaptchaRef.current?.reset();
      setCaptchaValue(null);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
            Register to Shop
          </h2>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

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
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={UserEmail}
                onChange={(e) => setUserEmail(e.target.value)}
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
            </div>
            <div>
              <label htmlFor="confirmpassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmpassword"
                  name="confirmpassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={Confirmpassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                </button>
              </div>
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
                disabled={loading || !captchaValue}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
         
          <div>Already have an account? <Link className='text-blue-500 font-semibold' to='/login'>Login</Link> </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;