const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Order collection
      ref: 'Order', // Assumes there is an Order model
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Product collection
      ref: 'Product', // Assumes there is a Product model
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // Quantity must be at least 1
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0, // Price must be a non-negative value
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0, // Subtotal must be a non-negative value
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
