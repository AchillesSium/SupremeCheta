// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inventory: {
      quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      sku: {
        type: String,
        required: true,
        unique: true, // creates a unique index; also set below for clarity
      },
      status: {
        type: String,
        enum: ['in_stock', 'low_stock', 'out_of_stock'],
        default: 'in_stock',
      },
    },

    specifications: [
      {
        name: String,
        value: String,
      },
    ],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductTag',
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

/* =========================
   Indexes
   ========================= */
// Text search over core fields
productSchema.index({
  name: 'text',
  description: 'text',
  'specifications.value': 'text',
});

// Useful: unique index on nested SKU (ensures at DB level)
productSchema.index({ 'inventory.sku': 1 }, { unique: true });

// Optional: speed up common queries
productSchema.index({ vendor: 1, status: 1, price: 1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ categories: 1 });

/* =========================
   Virtuals for media
   (work with ProductMedia model)
   ========================= */
productSchema.virtual('media', {
  ref: 'ProductMedia',
  localField: '_id',
  foreignField: 'product_id',
  justOne: false,
});

productSchema.virtual('imagesMedia', {
  ref: 'ProductMedia',
  localField: '_id',
  foreignField: 'product_id',
  justOne: false,
  options: { match: { kind: 'image' }, sort: { sortOrder: 1, createdAt: 1 } },
});

productSchema.virtual('videosMedia', {
  ref: 'ProductMedia',
  localField: '_id',
  foreignField: 'product_id',
  justOne: false,
  options: { match: { kind: 'video' }, sort: { sortOrder: 1, createdAt: 1 } },
});

/* =========================
   Hooks
   ========================= */
// Auto-set inventory status
productSchema.pre('save', function (next) {
  if (this.inventory.quantity <= 0) {
    this.inventory.status = 'out_of_stock';
  } else if (this.inventory.quantity <= 10) {
    this.inventory.status = 'low_stock';
  } else {
    this.inventory.status = 'in_stock';
  }
  next();
});

// Optional: cascade delete media when the product is removed via document.remove()
productSchema.pre('remove', async function () {
  try {
    await this.model('ProductMedia').deleteMany({ product: this._id });
  } catch (err) {
    // swallow or log
  }
});

// Optional: also handle findOneAndDelete / findByIdAndDelete paths
productSchema.pre('findOneAndDelete', async function () {
  const doc = await this.model.findOne(this.getFilter()).select('_id');
  if (doc) {
    await this.model('ProductMedia').deleteMany({ product: doc._id });
  }
});

/* =========================
   Instance methods
   ========================= */
productSchema.methods.isAvailable = function () {
  return this.inventory.quantity > 0 && this.status === 'published';
};

productSchema.methods.getPrimaryImage = async function () {
  const doc = await this.model('ProductMedia')
    .findOne({ product: this._id, kind: 'image', isPrimary: true })
    .lean();
  return doc;
};

productSchema.methods.getPrimaryVideo = async function () {
  const doc = await this.model('ProductMedia')
    .findOne({ product: this._id, kind: 'video', isPrimary: true })
    .lean();
  return doc;
};

/* =========================
   Statics
   ========================= */
productSchema.statics.findByCategory = function (categoryId) {
  return this.find({ categories: categoryId }).populate([
    'categories',
    'vendor',
    'brand',
    'tags',
  ]);
};

/* =========================
   Model
   ========================= */
const Product = mongoose.model('Product', productSchema);

module.exports = Product;