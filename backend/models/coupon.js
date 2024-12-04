const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discount_amount: {
      type: Number,
      required: true,
      min: 0, // Discount must be a non-negative value
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    usage_limit: {
      type: Number,
      default: null, // Null means no usage limit
      min: 1, // If specified, the limit must be at least 1
    },
    is_active: {
      type: Boolean,
      default: true, // Indicates whether the coupon is active
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
