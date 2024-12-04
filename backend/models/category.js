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
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
