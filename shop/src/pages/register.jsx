import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [UserEmail, setUserEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+91');
  const [UserPhoneNumber, setUserPhoneNumber] = useState('')
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
      if (password !== Confirmpassword) {
        setError('Password and Confirm Password should be same');
        recaptchaRef.current?.reset();
        setCaptchaValue(null);
        return
      }
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: UserEmail,
          password,
          phoneNumber: `${countryCode}${UserPhoneNumber}`
        }),
      })
      const resData = await res.json();
      if (!resData.success) {
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
                onChange={(e) => {
                  const value = e.target.value;
                  const filteredValue = value.replace(/[^\w]/g, ''); 
                  setUsername(filteredValue);
                }}
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
                onChange={(e) =>{const value = e.target.value;
                  const cleanedValue = value.replace(/[^a-zA-Z0-9@._+-]/g, '');
                  setUserEmail(cleanedValue);}}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 flex">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-35 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="+1">+1 (USA, Canada, and others)</option>
                  <option value="+20">+20 (Egypt)</option>
                  <option value="+30">+30 (Greece)</option>
                  <option value="+31">+31 (Netherlands)</option>
                  <option value="+32">+32 (Belgium)</option>
                  <option value="+33">+33 (France)</option>
                  <option value="+34">+34 (Spain)</option>
                  <option value="+36">+36 (Hungary)</option>
                  <option value="+39">+39 (Italy)</option>
                  <option value="+40">+40 (Romania)</option>
                  <option value="+41">+41 (Switzerland)</option>
                  <option value="+44">+44 (United Kingdom)</option>
                  <option value="+45">+45 (Denmark)</option>
                  <option value="+46">+46 (Sweden)</option>
                  <option value="+47">+47 (Norway)</option>
                  <option value="+48">+48 (Poland)</option>
                  <option value="+49">+49 (Germany)</option>
                  <option value="+51">+51 (Peru)</option>
                  <option value="+52">+52 (Mexico)</option>
                  <option value="+53">+53 (Cuba)</option>
                  <option value="+54">+54 (Argentina)</option>
                  <option value="+55">+55 (Brazil)</option>
                  <option value="+56">+56 (Chile)</option>
                  <option value="+57">+57 (Colombia)</option>
                  <option value="+58">+58 (Venezuela)</option>
                  <option value="+60">+60 (Malaysia)</option>
                  <option value="+61">+61 (Australia)</option>
                  <option value="+62">+62 (Indonesia)</option>
                  <option value="+63">+63 (Philippines)</option>
                  <option value="+64">+64 (New Zealand)</option>
                  <option value="+65">+65 (Singapore)</option>
                  <option value="+66">+66 (Thailand)</option>
                  <option value="+81">+81 (Japan)</option>
                  <option value="+82">+82 (South Korea)</option>
                  <option value="+84">+84 (Vietnam)</option>
                  <option value="+86">+86 (China)</option>
                  <option value="+90">+90 (Turkey)</option>
                  <option value="+91">+91 (India)</option>
                  <option value="+92">+92 (Pakistan)</option>
                  <option value="+93">+93 (Afghanistan)</option>
                  <option value="+94">+94 (Sri Lanka)</option>
                  <option value="+95">+95 (Myanmar)</option>
                  <option value="+98">+98 (Iran)</option>
                  <option value="+212">+212 (Morocco)</option>
                  <option value="+213">+213 (Algeria)</option>
                  <option value="+216">+216 (Tunisia)</option>
                  <option value="+218">+218 (Libya)</option>
                  <option value="+220">+220 (Gambia)</option>
                  <option value="+221">+221 (Senegal)</option>
                  <option value="+222">+222 (Mauritania)</option>
                  <option value="+223">+223 (Mali)</option>
                  <option value="+224">+224 (Guinea)</option>
                  <option value="+225">+225 (Ivory Coast)</option>
                  <option value="+226">+226 (Burkina Faso)</option>
                  <option value="+227">+227 (Niger)</option>
                  <option value="+228">+228 (Togo)</option>
                  <option value="+229">+229 (Benin)</option>
                  <option value="+230">+230 (Mauritius)</option>
                  <option value="+231">+231 (Liberia)</option>
                  <option value="+232">+232 (Sierra Leone)</option>
                  <option value="+233">+233 (Ghana)</option>
                  <option value="+234">+234 (Nigeria)</option>
                  <option value="+235">+235 (Chad)</option>
                  <option value="+236">+236 (Central African Republic)</option>
                  <option value="+237">+237 (Cameroon)</option>
                  <option value="+238">+238 (Cape Verde)</option>
                  <option value="+239">+239 (São Tomé and Príncipe)</option>
                  <option value="+240">+240 (Equatorial Guinea)</option>
                  <option value="+241">+241 (Gabon)</option>
                  <option value="+242">+242 (Congo, Republic of the)</option>
                  <option value="+243">+243 (Democratic Republic of the Congo)</option>
                  <option value="+244">+244 (Angola)</option>
                  <option value="+245">+245 (Guinea-Bissau)</option>
                  <option value="+246">+246 (British Indian Ocean Territory)</option>
                  <option value="+247">+247 (Ascension Island)</option>
                  <option value="+248">+248 (Seychelles)</option>
                  <option value="+249">+249 (Sudan)</option>
                  <option value="+250">+250 (Rwanda)</option>
                  <option value="+251">+251 (Ethiopia)</option>
                  <option value="+252">+252 (Somalia)</option>
                  <option value="+253">+253 (Djibouti)</option>
                  <option value="+254">+254 (Kenya)</option>
                  <option value="+255">+255 (Tanzania)</option>
                  <option value="+256">+256 (Uganda)</option>
                  <option value="+257">+257 (Burundi)</option>
                  <option value="+258">+258 (Mozambique)</option>
                  <option value="+260">+260 (Zambia)</option>
                  <option value="+261">+261 (Madagascar)</option>
                  <option value="+262">+262 (Réunion, Mayotte)</option>
                  <option value="+263">+263 (Zimbabwe)</option>
                  <option value="+264">+264 (Namibia)</option>
                  <option value="+265">+265 (Malawi)</option>
                  <option value="+266">+266 (Lesotho)</option>
                  <option value="+267">+267 (Botswana)</option>
                  <option value="+268">+268 (Eswatini)</option>
                  <option value="+269">+269 (Comoros)</option>
                  <option value="+290">+290 (Saint Helena)</option>
                  <option value="+291">+291 (Eritrea)</option>
                  <option value="+292">+292 (South Georgia and the South Sandwich Islands)</option>
                  <option value="+293">+293 (Aruba)</option>
                  <option value="+294">+294 (Sint Eustatius)</option>
                  <option value="+295">+295 (Bonaire)</option>
                  <option value="+296">+296 (Saint Barthelemy)</option>
                  <option value="+297">+297 (Aruba)</option>
                  <option value="+298">+298 (Faroe Islands)</option>
                  <option value="+299">+299 (Greenland)</option>

                </select>
                <input
                  id="phonenumber"
                  name="phonenumber"
                  type="text"
                  required
                  value={UserPhoneNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    const filteredValue = value.replace(/[^0-9]/g, ''); 
                    setUserPhoneNumber(filteredValue);
                  }}
                  minLength={10}
                  maxLength={15}
                  inputMode="numeric"
                  className="flex-1 block w-full px-3 py-2 border border-l-0 border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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