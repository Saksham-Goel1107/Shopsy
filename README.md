# Shopsy - React E-commerce Website

## 🚀 Live Demo

[![Live Site](https://img.shields.io/badge/Live%20Demo-Online-green)](https://shopify-tau-seven.vercel.app)

## Overview

Shop is a modern, responsive e-commerce website built with React. The application provides a seamless shopping experience with features like user authentication, product browsing, cart management, secure checkout functionality, and push notifications.

## 🚀 Features

- **User Authentication** - Secure login and registration system with token-based authentication and reCAPTCHA verification
- **Email Verification** - OTP-based email verification for new accounts
- **Password Recovery** - Secure password reset functionality with email verification
- **Product Catalog** - Browse products with category filtering and search functionality
- **Product Details** - View detailed information about each product
- **Shopping Cart** - Add, remove, and update quantities of products
- **Payment Processing** - Secure checkout with Stripe payment integration
- **Order Management** - Track orders and view order history with status updates
- **Push Notifications** - Order confirmations using Firebase Cloud Messaging
- **Address Management** - Save and update delivery addresses
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

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MongoDB database
- Stripe account for payment processing
- Google reCAPTCHA keys
- Firebase project with Cloud Messaging enabled
- Email service for sending verification emails

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
│   │   ├── icon.png
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   └── header.jsx
│   │   ├── pages/
│   │   │   ├── cart.jsx
│   │   │   ├── login.jsx
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
│   ├── vite.config.js
│   └── vercel.json
├── Backend/                # Backend
│   ├── api/
│   │   ├── forgot-otp.js
│   │   ├── login.js
│   │   ├── notification.js
│   │   ├── orders.js
│   │   ├── otp.js
│   │   ├── register.js
│   │   ├── reset-password.js
│   │   ├── stripe.js
│   │   ├── user.js
│   │   └── verify-recaptcha.js
│   ├── middlewares/
│   │   ├── email.config.js
│   │   ├── email.js
│   │   └── emailTemplate.js
│   ├── models/
│   │   ├── orders.js
│   │   └── user.js
│   ├── index.js
│   └── package.json
├── LICENSE
└── README.md
```

## 🌐 API Reference

### Backend API
Custom backend API endpoints:

- **Authentication:**
  - `POST /api/register` - Register a new user
  - `POST /api/login` - User authentication
  - `POST /api/otp/verify` - Verify email with OTP
  - `POST /api/otp/resend` - Resend OTP for verification
  - `POST /api/forgotemail` - Send OTP for password reset
  - `POST /api/resetpassword` - Reset password with OTP

- **User:**
  - `GET /api/user/address` - Get user's saved address
  - `POST /api/user/address` - Save user's delivery address

- **Orders:**
  - `GET /api/orders` - Get user's orders
  - `GET /api/orders/:id` - Get specific order details
  - `POST /api/orders` - Create a new order

- **Payments:**
  - `POST /api/stripe/payment` - Create Stripe payment sessions
  - `POST /api/stripe/webhook` - Handle Stripe webhook events

- **Notifications:**
  - `POST /api/send-notification` - Send Firebase Cloud Messaging notifications

- **Security:**
  - `POST /api/verify-recaptcha` - Verify Google reCAPTCHA tokens

## 📸 Screenshots

![alt text](image-3.png)
![alt text](image-5.png)
![alt text](image-7.png)
![alt text](image-8.png)
![alt text](image-9.png)
![alt text](image-10.png)
![alt text](image-11.png)
![alt text](image-12.png)
![alt text](image-13.png)
![alt text](image-14.png)
![alt text](image-15.png)
![alt text](image-16.png)

## 🚀 Future Enhancements

- Product reviews and ratings
- Wishlist feature
- Admin dashboard for product management
- Enhanced notification preferences
- Social media login options
- Advanced product filtering and sorting

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