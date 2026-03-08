const mongoose = require('mongoose');

const productTagSchema = new mongoose.Schema(
  {
    tag_name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    product_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }
    ],
  },
  {
    timestamps: true,
  }
);

productTagSchema.index({ tag_name: 1 }, { unique: true });

const ProductTag = mongoose.model('ProductTag', productTagSchema);

module.exports = ProductTag;