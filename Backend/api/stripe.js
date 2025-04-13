import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Order from "../models/orders.js";

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
    const { amount, items, deliveryAddress } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!amount || !items || items.length === 0) {
      return res.status(400).json({ 
        error: "Invalid request - missing amount or items"
      });
    }
    
    console.log("Processing payment:", {
      userId: token,
      items: items.length,
      amount: amount
    });
    
    
    const orderId = new mongoose.Types.ObjectId();
    
    try {
      const newOrder = new Order({
        _id: orderId,
        userId: token,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null
        })),
        totalAmount: amount,
        deliveryAddress,
        status: 'pending', 
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newOrder.save();
      console.log("Order created with ID:", orderId);
    } catch (orderError) {
      console.error("Error saving order:", orderError);
 
    }
    
    const productName = items.length === 1 
      ? items[0].name 
      : `Cart with ${items.length} items`;
    
    const product = await stripe.products.create({
      name: productName,
      metadata: {
        orderId: orderId.toString(),
        userId: token
      }
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), 
      currency: 'usd'
    });

    const successUrl = process.env.NODE_ENV === 'production' 
      ? `https://shopify-tau-seven.vercel.app/success?order_id=${orderId}`
      : `http://localhost:5173/success?order_id=${orderId}`;
      
    const cancelUrl = process.env.NODE_ENV === 'production'
      ? 'https://shopify-tau-seven.vercel.app/cart'
      : 'http://localhost:5173/cart';
    
    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price: price.id,
        quantity: 1
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: orderId.toString(),
        userId: token
      },
      payment_intent_data: {
        metadata: {
          orderId: orderId.toString(),
          userId: token
        }
      }
    });

    try {
      await Order.findByIdAndUpdate(orderId, {
        stripeSessionId: session.id
      });
    } catch (updateError) {
      console.error("Error updating order with session ID:", updateError);
    }

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

const handleWebhook = async (req, res) => {
  let event;
  
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (endpointSecret && sig) {
      const payload = req.rawBody || req.body;
      
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        endpointSecret
      );
    } else {
      event = req.body;
    }
    
    console.log(`Webhook received: ${event.type}`);
    
 
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { orderId } = session.metadata || {};
        
        if (orderId) {
          console.log(`Setting order ${orderId} to pending status after payment`);
          await Order.findByIdAndUpdate(
            orderId,
            {
              status: 'pending', 
              paymentId: session.payment_intent,
              updatedAt: new Date()
            }
          );
        }
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { orderId } = paymentIntent.metadata || {};
        
        if (orderId) {
          console.log(`Marking order ${orderId} as completed from payment_intent.succeeded`);
          await Order.findByIdAndUpdate(
            orderId,
            {
              status: 'completed',
              paymentId: paymentIntent.id,
              updatedAt: new Date()
            }
          );
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const { orderId } = paymentIntent.metadata || {};
        
        if (orderId) {
          console.log(`Marking order ${orderId} as cancelled`);
          await Order.findByIdAndUpdate(
            orderId,
            {
              status: 'cancelled',
              updatedAt: new Date()
            }
          );
        }
        break;
      }
    }
    
    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

router.post('/webhook', handleWebhook);

router.get('/orders', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const orders = await Order.find({ userId: token })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});

router.get('/orders/:orderId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { orderId } = req.params;
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const order = await Order.findOne({
      _id: orderId,
      userId: token
    });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to retrieve order details" });
  }
});

export default router;