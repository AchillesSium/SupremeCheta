const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: String,
    alt: String
  }],
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    sku: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock'
    }
  },
  specifications: [{
    name: String,
    value: String
  }],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ 
  name: 'text', 
  description: 'text',
  'specifications.value': 'text'
});

// Pre-save middleware to update inventory status
productSchema.pre('save', function(next) {
  if (this.inventory.quantity <= 0) {
    this.inventory.status = 'out_of_stock';
  } else if (this.inventory.quantity <= 10) {
    this.inventory.status = 'low_stock';
  } else {
    this.inventory.status = 'in_stock';
  }
  next();
});

// Method to check if product is available
productSchema.methods.isAvailable = function() {
  return this.inventory.quantity > 0 && this.status === 'published';
};

// Static method to find products by category
productSchema.statics.findByCategory = function(categoryId) {
  return this.find({ category: categoryId }).populate('category vendor');
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
