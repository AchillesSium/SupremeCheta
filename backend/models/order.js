const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User collection
      ref: 'User', // Assumes there is a User model
      required: true,
    },
    order_date: {
      type: Date,
      default: Date.now, // Defaults to the current date
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0, // Total amount must be non-negative
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Payment collection
      ref: 'Payment', // Assumes there is a Payment model
      required: true,
    },
    shipping_address: {
      type: String,
      required: true,
    },
    order_status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], // Example statuses
      default: 'pending',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
