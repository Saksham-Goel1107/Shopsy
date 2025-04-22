import React, { useState,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';

function ForgotEmail() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const [captchaValue, setCaptchaValue] = useState(null);

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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/forgotemail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) {
        if(data.message === 'No Such User Exists') {
          setTimeout(()=>navigate("/register"),1000)
        }
        setError(data.message || 'Failed to send reset link.');
        setLoading(false);
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
        return;
      }
      navigate('/resetpassword', { state: { email } });
    } catch (err) {
      setError('Something went wrong. Please try again.');
      recaptchaRef.current?.reset();
      setCaptchaValue(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
            Forgot Password
          </h2>
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) =>{const value = e.target.value;
                  const cleanedValue = value.replace(/[^a-zA-Z0-9@._+-]/g, '');
                  setEmail(cleanedValue);}}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed"
                disabled={loading}
              />
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
            <div className="flex justify-center mt-4">
              <Link
                to="/login"
                className="inline-block px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors duration-150"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotEmail;