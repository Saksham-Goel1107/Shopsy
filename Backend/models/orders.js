import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  price: Number,
  quantity: Number,
  image: String
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  items: [orderItemSchema],
  totalAmount: Number,
  deliveryAddress: {
    houseNumber: String,
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentId: String,
  stripeSessionId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;