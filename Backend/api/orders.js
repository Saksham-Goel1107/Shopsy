import express from "express";
import Order from "../models/orders.js";

const router = express.Router();

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    const token = authHeader.split(" ")[1];
    req.userId = token;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

router.get('/', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

router.get('/:orderId', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.userId
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
});

export default router;