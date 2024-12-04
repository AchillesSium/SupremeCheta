const mongoose = require('mongoose');

const productTagSchema = new mongoose.Schema(
  {
    tag_name: {
      type: String,
      required: true,
      trim: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Product collection
      ref: 'Product', // Assumes there is a Product model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const ProductTag = mongoose.model('ProductTag', productTagSchema);

module.exports = ProductTag;
