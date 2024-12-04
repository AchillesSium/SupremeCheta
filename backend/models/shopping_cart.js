const mongoose = require('mongoose');

const shoppingCartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User collection
      ref: 'User', // Assumes there is a User model
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
  },
  {
    timestamps: true, 
  }
);

const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);

module.exports = ShoppingCart;
