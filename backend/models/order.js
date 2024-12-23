/**
 * Order Model
 * Represents a customer order in the e-commerce system
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true // Add index for faster queries
    },
    
    order_date: {
      type: Date,
      default: Date.now,
      required: true
    },
    
    total_amount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
      validate: {
        validator: Number.isFinite,
        message: 'Total amount must be a valid number'
      }
    },
    
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Payment information is required']
    },
    
    shipping_address: {
      type: String,
      required: [true, 'Shipping address is required'],
      trim: true
    },
    
    order_status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: '{VALUE} is not a valid order status'
      },
      default: 'pending',
      required: true
    },
    
    tracking_number: {
      type: String,
      trim: true,
      sparse: true // Only index if field exists
    },
    
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
orderSchema.index({ order_date: -1 }); // Descending index on order_date
orderSchema.index({ order_status: 1 }); // Index on status for filtering

// Virtual field for order age
orderSchema.virtual('order_age').get(function() {
  return Math.floor((Date.now() - this.order_date) / (1000 * 60 * 60 * 24)); // Age in days
});

// Methods
orderSchema.methods = {
  /**
   * Calculate delivery estimate based on status and location
   * @returns {Date} Estimated delivery date
   */
  calculateDeliveryEstimate: function() {
    const estimates = {
      'pending': 7,
      'processing': 5,
      'shipped': 3
    };
    const daysToAdd = estimates[this.order_status] || 0;
    const estimate = new Date(this.order_date);
    estimate.setDate(estimate.getDate() + daysToAdd);
    return estimate;
  },

  /**
   * Check if order can be cancelled
   * @returns {Boolean}
   */
  canBeCancelled: function() {
    return ['pending', 'processing'].includes(this.order_status);
  }
};

// Static methods
orderSchema.statics = {
  /**
   * Find orders by status
   * @param {String} status - Order status to filter by
   * @returns {Promise<Array>} List of orders
   */
  findByStatus: function(status) {
    return this.find({ order_status: status }).sort({ order_date: -1 });
  },

  /**
   * Get recent orders
   * @param {Number} days - Number of days to look back
   * @returns {Promise<Array>} List of recent orders
   */
  getRecentOrders: function(days = 7) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
    return this.find({
      order_date: { $gte: dateLimit }
    }).sort({ order_date: -1 });
  }
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
