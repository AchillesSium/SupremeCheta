const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1, // Minimum rating value
      max: 5, // Maximum rating value
    },
    review_text: {
      type: String,
      default: '', // Optional review text
    },
  },
  {
    timestamps: true, 
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
