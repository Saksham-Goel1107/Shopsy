import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import recaptchaRouter from "./api/verify-recaptcha.js";
import stripeRouter from "./api/stripe.js";
import notification from "./api/notification.js";
import userRouter from "./api/user.js";
import ordersRouter from "./api/orders.js";
import registerRouter from "./api/register.js"
import loginRouter from "./api/login.js"
import otpRouter from "./api/otp.js"
import forgotemailRouter from "./api/forgot-otp.js"
import resetPasswordRouter from "./api/reset-password.js"

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000 
})
.then(() => {
  console.log('Connected to MongoDB successfully');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

const allowedOrigins = [
  'http://localhost:5173', 
  'https://shopify-tau-seven.vercel.app',
];

const app = express();

app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), (req, res) => {
  req.rawBody = req.body;
  stripeRouter.post('/webhook', req, res);
});

app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use("/api/verify-recaptcha", recaptchaRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/user", userRouter);
app.use("/api/send-notification", notification);
app.use("/api/orders", ordersRouter);
app.use("/api/register", registerRouter);
app.use("/api/login", loginRouter);
app.use("/api/otp", otpRouter);
app.use("/api/forgotemail", forgotemailRouter);
app.use("/api/resetpassword", resetPasswordRouter);

app.get("/", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: "API is running", 
    database: dbStatus,
    endpoints: [
      '/api/user/address',
      '/api/stripe/payment',
      '/api/verify-recaptcha',
      '/api/send-notification',
      '/api/register',
      '/api/orders',
      '/api/login',
      '/api/otp',
      '/api/forgotemail',
      "/api/resetpassword",
    ]
  });
});

app.get("/api/status", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ database: dbStatus });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});