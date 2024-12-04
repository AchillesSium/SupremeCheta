const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Order collection
      ref: 'Order', // Assumes there is an Order model
      required: true,
    },
    carrier: {
      type: String,
      required: true,
    },
    tracking_number: {
      type: String,
      required: true,
      unique: true,
    },
    estimated_shipping_date_start: {
      type: Date,
      required: true,
    },
    estimated_shipping_date_end: {
      type: Date,
      required: true,
    },
    shipping_date: {
      type: Date,
      default: null, // Optional, can be filled later
    },
    delivery_date: {
      type: Date,
      default: null, // Optional, can be filled later
    },
    shipping_status: {
      type: String,
      enum: ['pending', 'shipped', 'in_transit', 'delivered', 'cancelled'], // Example statuses
      default: 'pending',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Shipping = mongoose.model('Shipping', shippingSchema);

module.exports = Shipping;
