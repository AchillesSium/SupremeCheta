const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
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
    attribute_id: {
      type: mongoose.Schema.Types.ObjectId, // Assuming attributes are stored in another collection
      ref: 'ProductImage', // Reference to the ProductImage or related collection
      default: null,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId, // Reference to another category (self-referencing)
      ref: 'Category',
      default: null, // Null means it's a main category
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Reference to the same Category model
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
