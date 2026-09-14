const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String }
  },
  orderItems: { type: Array, required: true }, // Saves the cart items
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'Pending' }, // Will change to 'Paid' after PayHere
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);