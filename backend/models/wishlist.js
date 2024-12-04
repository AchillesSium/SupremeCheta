const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true, // `added_at` is explicitly defined
  }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
