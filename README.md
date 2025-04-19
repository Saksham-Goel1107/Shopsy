# Shopsy - React E-commerce Website

## 🚀 Live Demo

### Currently Shutdown Due To High Cost of Running

## Overview

Shop is a modern, responsive e-commerce website built with React. The application provides a seamless shopping experience with features like user authentication, product browsing, cart management, secure checkout functionality, and push notifications.

## 🔒 Security Features

### Server Security
- **Helmet.js Protection**
  - Sets secure HTTP headers
  - Content Security Policy implementation
  - XSS protection
  - Prevention of clickjacking
  - MIME sniffing prevention
  - Customized security directives

- **HTTP Parameter Pollution (HPP) Protection**
  - Prevents parameter pollution attacks
  - Protects against manipulated query parameters

### User Authentication & Verification
- **Two-Factor Authentication (2FA)**
  - Email OTP verification (5-digit code)
  - SMS OTP verification (5-digit code)
  - 24-hour OTP validity period
  - OTP resend functionality with cooldown timer

### Password Security
- **Have I Been Pwned Integration**
  - Checks passwords against known data breaches
  - K-anonymity implementation for privacy protection
  - Prevents use of compromised passwords
  - Shows breach count to users

- **Password Strength Evaluation (zxcvbn)**
  - Advanced password strength scoring
  - Requires minimum strength score of 3/4
  - Pattern recognition to prevent weak passwords
  - Real-time feedback on password quality

- **Strong Password Requirements**
  - Minimum 8 characters
  - Must include uppercase and lowercase letters
  - Must include numbers
  - Must include special characters
  
- **Password Protection**
  - Bcrypt hashing for passwords
  - Show/hide password toggle in forms
  - Password strength validation

### Email Security
- **Disposable Email Prevention**
  - Blocks registration from known disposable email domains
  - Regular updates to disposable email domain database
  - Custom validation patterns
  
- **Email Templates**
  - Branded verification emails
  - Welcome emails after verification
  - Password reset confirmation emails
  - Password change notification emails

### Additional Security Measures
- **reCAPTCHA Integration**
  - Required for registration
  - Required for login attempts
  - Required for password reset

- **JWT Authentication**
  - Token-based session management
  - 7-day token expiration
  - Secure token storage
  
- **Rate Limiting**
  - Redis-based storage for distributed rate limiting
  - Prevents brute force attacks
  - Configurable limits for sensitive endpoints

### Phone Number Verification
- **SMS Integration**
  - International phone number support with libphonenumber-js validation
  - Enhanced disposable number detection
  - Country code validation and standardization
  - Phone number format validation
  - Real-time SMS delivery
  - Multi-layer validation:
    - Local pattern matching
    - Known disposable number database
    - Abstract API verification
    - Carrier validation
  - Blocks VoIP and virtual numbers
  - Caches validation results for better performance
  - Regular updates to disposable number database

## 🚀 Features

- **User Authentication** - Secure login and registration system with token-based authentication and reCAPTCHA verification
- **Two-Factor Authentication** - OTP verification via both email and SMS
- **Disposable Email Prevention** - Block registration with temporary/disposable email addresses
- **Email Verification** - OTP-based email verification for new accounts
- **SMS Verification** - Phone number verification using SMS OTP
- **Password Security** - Strong password requirements with special character validation
- **Password Recovery** - Secure password reset functionality with email verification
- **Product Catalog** - Browse products with category filtering and search functionality
- **Product Details** - View detailed information about each product
- **Shopping Cart** - Add, remove, and update quantities of products
- **Payment Processing** - Secure checkout with Stripe payment integration
- **Order Management** - Track orders and view order history with status updates
- **Push Notifications** - Firebase Cloud Messaging for order status updates
- **Address Management** - Save and update delivery addresses with geocoding support
- **Location Services** - Automatic address detection using browser geolocation
- **Responsive Design** - Optimized for both desktop and mobile devices
- **Category Filtering** - Filter products by categories
- **Search Functionality** - Search products by name
- **Sort Products** - Sort products by price (high to low or low to high)
- **Interactive UI** - User-friendly interface with intuitive navigation

## 🛠️ Technologies Used

- **Frontend:**
  - **React** - Frontend library for building the user interface
  - **React Router** - For navigation and routing
  - **Tailwind CSS** - For styling and responsive design
  - **FontAwesome** - For icons and visual elements
  - **React Google reCAPTCHA** - For user verification during registration and password reset
  - **Firebase** - For push notifications via Firebase Cloud Messaging
  - **JWT Decode** - For handling JSON Web Tokens

- **Backend:**
  - **Express** - Node.js web application framework for the backend
  - **MongoDB** - NoSQL database for storing user and order information
  - **Mongoose** - MongoDB object modeling for Node.js
  - **Stripe** - For secure payment processing
  - **Cors** - For handling cross-origin requests
  - **Firebase Admin** - For sending server-side notifications
  - **JWT** - For secure authentication
  - **Bcrypt** - For password hashing
  - **Nodemailer** - For sending emails

- **APIs:**
  - **Google reCAPTCHA API** - For security verification
  - **Stripe API** - For payment processing
  - **Firebase Cloud Messaging API** - For push notifications

- **Storage:**
  - **MongoDB** - For persisting user data, orders, and addresses
  - **LocalStorage** - For persisting cart and authentication state

## 📋 Prerequisites

- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later)
- MongoDB database
- Stripe account for payment processing
- Google reCAPTCHA keys
- Firebase project with Cloud Messaging enabled
- Email service for sending verification emails
- SMS service provider account for phone verification

## 🔧 Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Saksham-Goel1107/Shop.git
   cd shop
   ```

2. Install Shop dependencies
   ```bash
   npm install
   ```

3. Set up Shop environment variables
   Create a .env file in the shop directory with:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_REACT_APP_SITE_KEY=your_recaptcha_site_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   VITE_FIREBASE_VAPID_KEY=your_firebase_vapid_key
   ```

4. Install backend dependencies
   ```bash
   cd ../Backend
   npm install
   ```

5. Set up backend environment variables
   Create a .env file in the Backend directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   SITE_SECRET_KEY=your_recaptcha_secret_key
   PORT=5000
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_password
   EMAIL_SERVICE=your_email_service
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ABSTRACT_PHONE_API_KEY=your_abstract_phone_api_key
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   REDIS_PASSWORD=your_redis_password
   ```

6. Start the backend server
   ```bash
   node index
   ```

7. In a new terminal, start the frontend development server
   ```bash
   cd ../shop
   npm run dev
   ```

8. Open your browser and navigate to `http://localhost:5173`

## 🔑 Usage

### Registration and Login
- Register with your email, username, and password
- Verify your account using the OTP sent to your email
- Log in with your username and password
- Reset your password if forgotten

### Product Browsing
- Browse all products on the home page
- Filter products by categories
- Search for products using the search bar
- Sort products by price (high to low or low to high)
- Click on a product to view details

### Shopping Cart
- Add products to your cart
- Update quantities directly from product pages or cart
- Remove items from cart
- Proceed to checkout with Stripe payment

### Order Management
- View your order history
- Track your order status (pending, processing, completed, cancelled)
- Receive notifications on order status changes

### Notifications
- Enable browser notifications to receive order confirmations
- Notifications are sent automatically after successful checkout

## 📁 Project Structure

```
project/
├── shop/                   # Frontend
│   ├── public/
│   │   ├── firebase-messaging-sw.js
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   ├── icon.png
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   └── header.jsx
│   │   ├── pages/
│   │   │   ├── cart.jsx
│   │   │   ├── forgotemail.jsx
│   │   │   ├── login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── register.jsx
│   │   │   ├── otp.jsx
│   │   │   ├── resetpassword.jsx
│   │   │   ├── productDetails.jsx
│   │   │   ├── productListing.jsx
│   │   │   ├── success.jsx
│   │   │   ├── orders.jsx
│   │   │   └── orderDetail.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── firebase.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── eslint.config.js
│   ├── vite.config.js
│   └── vercel.json
├── Backend/                # Backend
│   ├── api/
│   │   ├── forgot-otp.js
│   │   ├── googleauth.js
│   │   ├── login.js
│   │   ├── notification.js
│   │   ├── orders.js
│   │   ├── otp.js
│   │   ├── register.js
│   │   ├── reset-password.js
│   │   ├── stripe.js
│   │   ├── user.js
│   │   └── verify-recaptcha.js
│   ├── data/
│   │   ├──  disposable-domains.txt
|   |   └──disposableNumbers.json
│   ├── middlewares/
│   │   ├── email.config.js
│   │   ├── email.js
│   │   ├── emailTemplate.js
│   │   └── SmsOtp.js
│   ├── models/
│   │   ├── orders.js
│   │   └── user.js
│   ├── utils/
│   │   ├──  emailValidator.js
│   │   ├──  passwordCheck.js
│   │   └── phoneNumberValidator.js
│   ├── index.js
│   └── package.json
├── LICENSE
└── README.md
```

## 🌐 API Reference

### Backend API
Custom backend API endpoints:

### Authentication
- `POST /api/register`
  - Register new user with email and phone verification
  - Handles duplicate username/email/phone validation
  - Triggers OTP generation and delivery

- `POST /api/login`
  - User authentication with reCAPTCHA
  - Returns JWT token on success
  - Handles verification status checks

- `POST /api/otp/verify`
  - Validates both email and SMS OTP
  - Updates user verification status
  - Issues new JWT token after verification

### Password Management
- `POST /api/forgot-otp`
  - Initiates password reset process
  - Generates and sends reset OTP
  - Handles user existence validation

- `POST /api/resetpassword`
  - Validates reset OTP
  - Enforces password requirements
  - Updates password with new hash

### User Management
- `GET /api/user/address`
  - Retrieves user's saved addresses
  - Handles geolocation data

- `POST /api/user/address`
  - Saves new delivery address
  - Validates address components
  - Updates existing addresses

### Verification
- `POST /api/otp/resend`
  - Regenerates OTP for both email and phone
  - Handles cooldown period
  - Updates verification deadline

- `POST /api/verify-recaptcha`
  - Validates reCAPTCHA tokens
  - Prevents automated submissions

### Orders:
  - `GET /api/orders` - Get user's orders
  - `GET /api/orders/:id` - Get specific order details
  - `POST /api/orders` - Create a new order

### Payments:
  - `POST /api/stripe/payment` - Create Stripe payment sessions
  - `POST /api/stripe/webhook` - Handle Stripe webhook events

### Notifications:
  - `POST /api/send-notification` - Send Firebase Cloud Messaging notifications

## 📸 Screenshots

![alt text](Projectimages/image-1.png)
![alt text](Projectimages/Phoneotpimage.jpg)
![alt text](Projectimages/Emailotpimage.jpg)
![alt text](Projectimages/image-2.png)
![alt text](Projectimages/image-5.png)
![alt text](Projectimages/image-7.png)
![alt text](Projectimages/image-8.png)
![alt text](Projectimages/image3.png)
![alt text](Projectimages/image4.png)
![alt text](Projectimages/image-10.png)
![alt text](Projectimages/image-11.png)
![alt text](Projectimages/image-12.png)
![alt text](Projectimages/image-13.png)
![alt text](Projectimages/image-14.png)
![alt text](Projectimages/image-15.png)
![alt text](Projectimages/image-16.png)
![alt text](Projectimages/image-17.png)

## 🚀 Future Enhancements

- Product reviews and ratings
- Wishlist feature 
- Admin dashboard for product management
- Enhanced notification preferences
- Social media login options 
- Advanced product filtering and sorting
- Email notifications for order updates
- Multiple payment methods support
- Multiple addresses per user
- Product recommendations
- Real-time order tracking
- Mobile app version

## 👥 Contributors

- Saksham Goel - [GitHub](https://github.com/Saksham-Goel1107/)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [FontAwesome](https://fontawesome.com/) for the icons
- [React](https://reactjs.org/) and [React Router](https://reactrouter.com/) for the frontend framework
- [Stripe](https://stripe.com/) for the payment processing solution
- [Google reCAPTCHA](https://www.google.com/recaptcha/) for security verification
- [Firebase](https://firebase.google.com/) for push notification functionality
- [MongoDB](https://www.mongodb.com/) for database solutions

---

*Made with ❤️ by [Saksham Goel](https://github.com/Saksham-Goel1107)*