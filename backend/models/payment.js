const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User collection
      ref: 'User', // Assumes there is a User model
      required: true,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Order collection
      ref: 'Order', // Assumes there is an Order model
      required: true,
    },
    payment_method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'], // Example payment methods
      required: true,
    },
    transaction_id: {
      type: String, // Transaction reference provided by the payment gateway
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0, // Amount must be non-negative
    },
    payment_status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'], // Example statuses
      default: 'pending',
    },
  },
  {
    timestamps: true, 
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
