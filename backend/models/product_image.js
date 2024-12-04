const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema(
  {
    attribute_name: {
      type: String,
      required: true,
      trim: true,
    },
    attribute_value: {
      type: String,
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
      ref: 'Product', // Assumes there is a Product model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const ProductImage = mongoose.model('ProductImage', productImageSchema);

module.exports = ProductImage;
