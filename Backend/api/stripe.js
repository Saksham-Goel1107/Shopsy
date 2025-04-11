import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error("Error: STRIPE_SECRET_KEY is not defined in the .env file.");
  console.warn("Using test mode for Stripe. Add your key for production use.");
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

router.get('/', (req, res) => {
  res.json({ status: "Stripe API is running" });
});

router.post('/payment', async (req, res) => {
  try {
    const { amount, items } = req.body;
    
    const productName = items.length === 1 
      ? items[0].name 
      : `Cart with ${items.length} items`;
    
    const product = await stripe.products.create({
      name: productName,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), 
      currency: 'usd', 
    });

    
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: 'https://shopify-tau-seven.vercel.app/success',
      cancel_url: 'https://shopify-tau-seven.vercel.app/cart',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;