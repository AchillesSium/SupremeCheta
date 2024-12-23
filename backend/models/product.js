const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      default: '',
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // Assuming discount is in percentage
    },
    stock_quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    // SEO fields
    meta_title: { 
      type: String, 
      trim: true,
      default: function() {
        return this.name;
      }
    },
    meta_description: { 
      type: String,
      default: function() {
        return this.description;
      }
    },
    meta_keywords: [{ 
      type: String, 
      trim: true 
    }],
    
    // Variant support
    variants: [{
      size: String,
      color: String,
      sku: { 
        type: String, 
        unique: true 
      },
      price: {
        type: Number,
        min: 0,
        required: true
      },
      stock_quantity: {
        type: Number,
        min: 0,
        required: true
      },
      images: [String],
      is_active: {
        type: Boolean,
        default: true
      }
    }],
    
    // Main product images
    images: [{
      url: {
        type: String,
        required: true
      },
      alt: String,
      is_primary: {
        type: Boolean,
        default: false
      }
    }],
    
    // Shipping info
    weight: { 
      type: Number, 
      min: 0 
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    
    // Rating
    average_rating: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5 
    },
    review_count: { 
      type: Number, 
      default: 0 
    },

    // Additional fields
    tags: [String],
    features: [String],
    warranty_info: String,
    return_policy: String,
    is_featured: {
      type: Boolean,
      default: false
    },
    is_bestseller: {
      type: Boolean,
      default: false
    },
    view_count: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category_id: 1, brand_id: 1 });
productSchema.index({ is_active: 1 });
productSchema.index({ 'variants.sku': 1 });

// Virtual for discounted price
productSchema.virtual('discounted_price').get(function() {
  if (!this.discount) return this.price;
  return this.price - (this.price * (this.discount / 100));
});

// Methods
productSchema.methods.updateAverageRating = async function() {
  const Review = mongoose.model('Review');
  const result = await Review.aggregate([
    { $match: { product_id: this._id } },
    { 
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    this.average_rating = result[0].averageRating;
    this.review_count = result[0].count;
    await this.save();
  }
  return this.average_rating;
};

productSchema.methods.incrementViewCount = async function() {
  this.view_count += 1;
  return this.save();
};

productSchema.methods.checkStock = function(quantity, variantSku = null) {
  if (variantSku) {
    const variant = this.variants.find(v => v.sku === variantSku);
    return variant ? variant.stock_quantity >= quantity : false;
  }
  return this.stock_quantity >= quantity;
};

// Statics
productSchema.statics.findByCategory = function(categoryId) {
  return this.find({ category_id: categoryId, is_active: true });
};

productSchema.statics.findByBrand = function(brandId) {
  return this.find({ brand_id: brandId, is_active: true });
};

productSchema.statics.findBestsellers = function() {
  return this.find({ is_bestseller: true, is_active: true });
};

// Middleware
productSchema.pre('save', function(next) {
  if (!this.meta_title) {
    this.meta_title = this.name;
  }
  if (!this.meta_description) {
    this.meta_description = this.description;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
