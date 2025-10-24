const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String, // Assuming the logo is a URL or file path
      default: null,
      required: true
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Product collection
        ref: 'Product', // Assumes there is a Product model
      }
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Array of references to Category documents
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
