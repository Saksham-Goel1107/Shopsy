import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import recaptchaRouter from "./api/verify-recaptcha.js";
import stripeRouter from "./api/stripe.js";

dotenv.config();


const allowedOrigins = [
  'http://localhost:5173', 
  'https://shopify-tau-seven.vercel.app'  
];


const app = express();


app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    console.log("Request from origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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

app.get("/", (req, res) => {
  res.json({ status: "API is running" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
