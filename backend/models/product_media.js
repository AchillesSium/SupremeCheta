const mongoose = require('mongoose');

const productMediaSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // reference stays the same
      required: true,
      index: true,
    },

    // image | video
    kind: {
      type: String,
      enum: ['image', 'video'],
      required: true,
      index: true,
    },

    // Common media fields
    url: {
      type: String,
      required: true, // e.g. image URL or video file/YouTube/Vimeo URL
      trim: true,
    },
    title: { type: String, trim: true },
    alt: { type: String, trim: true },
    mimeType: { type: String, trim: true },

    // Display/ordering
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },

    // Optional attributes
    attributes: [
      {
        name: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],

    // Image-specific
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },

    // Video-specific
    provider: {
      type: String,
      enum: ['self', 'youtube', 'vimeo', 'other'],
      default: 'self',
    },
    providerId: { type: String, trim: true },
    thumbnailUrl: { type: String, trim: true },
    durationSec: { type: Number, min: 0 },
  },
  { timestamps: true }
);

// Index
productMediaSchema.index({ product_id: 1, kind: 1, sortOrder: 1 });

// Ensure only one primary per product/kind
productMediaSchema.pre('save', async function () {
  if (!this.isPrimary) return;

  await this.constructor.updateMany(
    { product_id: this.product_id, kind: this.kind, _id: { $ne: this._id } },
    { $set: { isPrimary: false } }
  );
});

const ProductMedia = mongoose.model('ProductMedia', productMediaSchema);

module.exports = ProductMedia;
