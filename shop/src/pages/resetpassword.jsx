import React, {useEffect ,useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['','','','','']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    if (!email) {
      navigate('/forgot', { 
        replace: true,
        state: { message: 'Please enter your email to reset password' } 
      });
    }
    const countdown = setInterval(() => {
    setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);
  if (!email) {
    return null; 
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp(prev => prev.map((d, idx) => (idx === index ? element.value : d)));

    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const prevInput = e.target.previousSibling;
        if (prevInput) {
          prevInput.focus();
        }
      }
      setOtp(prev => prev.map((d, idx) => (idx === index ? '' : d)));
    }
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!captchaValue) {
      setError('Please complete the reCAPTCHA.');
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

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
        setLoading(false);
        return;
      }

      const otpValue = otp.join('');
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resetpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to reset password.');
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
      } else {
        setSuccess('Password reset successful! You can now log in.');
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      recaptchaRef.current?.reset();
      setCaptchaValue(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer !== 0) return;
 
    try {
      setIsResending(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resetpassword/resend`, {
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
            Reset Password
          </h2>
          <p className="text-center text-gray-600 mb-6">
            We have sent verification codes to:<br />
            <span className="font-medium">{email}</span>
          </p>
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                OTP
              </label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={`otp-${index}`}
                    id={`otp-${index}`}
                    name="otp"
                    type="text"
                    maxLength="1"
                    inputMode='numeric'
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed"
                    aria-label={`OTP digit ${index + 1}`}
                    disabled={loading}
                    required
                  />
                ))}
              </div>
              <p className='text-gray-400 text-xs text-center cursor-default'>Maximum of 5 Attempts or the Account will be Blocked for 24 hrs </p>
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={toggleConfirmPasswordVisibility}
                  tabIndex={-1}
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                </button>
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
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
          <div className="flex justify-center mt-4">
            <Link
              to="/login"
              className="inline-block px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors duration-150"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;