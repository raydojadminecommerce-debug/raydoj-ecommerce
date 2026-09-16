const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clerkUserId: { type: String },
  customer: { type: Object, required: true },
  orderItems: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  
  // 🔥 THIS LINE IS MANDATORY! Without it, MongoDB deletes the ID!
  orderNumber: { type: Number }, 
  
  status: { type: String, default: 'Processing' },
  isDone: { type: Boolean, default: false },
  paymentStatus: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);