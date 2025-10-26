// backend/controllers/productController.js
const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const ProductMedia = require('../models/product_media');

// Build a public URL for a stored file
function toPublicUrl(req, absPath) {
  // Serve /uploads statically from /backend (see server.js snippet below)
  const relative = absPath.split(path.join(process.cwd(), 'backend'))[1];
  const base = `${req.protocol}://${req.get('host')}`;
  return base + relative.replace(/\\/g, '/');
}

/* ========= PRODUCTS ========= */

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const body = req.body;

    // Normalize arrays
    const categories = Array.isArray(body.categories) ? body.categories : body.categories ? [body.categories] : [];
    const specifications = body.specifications ? JSON.parse(body.specifications) : []; // Expect JSON from client
    const tags = Array.isArray(body.tags) ? body.tags : body.tags ? [body.tags] : [];

    const product = await Product.create({
      name: body.name,
      description: body.description,
      price: body.price,
      categories,
      brand: body.brand || undefined,
      vendor: body.vendor || req.user?._id, // fallback if you store vendor in auth
      inventory: {
        quantity: body.quantity ?? 0,
        sku: body.sku,
      },
      specifications,
      tags,
      status: body.status || 'draft',
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/products
// supports: page, limit, q (text search), status, vendor, brand, category, minPrice, maxPrice, sort
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      q,
      status,
      vendor,
      brand,
      category,
      minPrice,
      maxPrice,
      sort = '-createdAt',
    } = req.query;

    const filter = {};
    if (q) filter.$text = { $search: q };
    if (status) filter.status = status;
    if (vendor) filter.vendor = vendor;
    if (brand) filter.brand = brand;
    if (category) filter.categories = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .populate(['categories', 'brand', 'vendor', 'tags'])
        .populate({ path: 'media', options: { sort: { sortOrder: 1, createdAt: 1 } } }),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate(['categories', 'brand', 'vendor', 'tags'])
      .populate('imagesMedia')
      .populate('videosMedia');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const body = req.body;
    const update = {
      name: body.name,
      description: body.description,
      price: body.price,
      brand: body.brand,
      status: body.status,
    };

    if (body.categories) update.categories = Array.isArray(body.categories) ? body.categories : [body.categories];
    if (body.tags) update.tags = Array.isArray(body.tags) ? body.tags : [body.tags];
    if (body.quantity != null) update['inventory.quantity'] = body.quantity;
    if (body.sku) update['inventory.sku'] = body.sku;
    if (body.specifications) update.specifications = JSON.parse(body.specifications);

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate(['categories', 'brand', 'vendor', 'tags']);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Product not found' });

    // Delete media files on disk as well
    const medias = await ProductMedia.find({ product_id: doc._id });
    for (const m of medias) {
      if (m.url?.startsWith('http')) continue; // remote CDN
      const filePath = path.join(process.cwd(), 'backend', m.url.replace(/^.*\/uploads\//, 'uploads/'));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch { /* ignore */ }
      }
    }
    await ProductMedia.deleteMany({ product_id: doc._id });

    await doc.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ========= MEDIA ========= */

// POST /api/products/:id/media (images/videos/mixed)
exports.uploadMedia = async (req, res) => {
  try {
    const productId = req.params.id;

    // Gather files from fields: images[], videos[], media[]
    const files = [
      ...(req.files?.images || []),
      ...(req.files?.videos || []),
      ...(req.files?.media || []),
    ];

    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const isPrimaryImageIdx = req.body.primaryImageIndex != null ? Number(req.body.primaryImageIndex) : null;
    const isPrimaryVideoIdx = req.body.primaryVideoIndex != null ? Number(req.body.primaryVideoIndex) : null;

    const docs = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const kind = f.mimetype.startsWith('image/') ? 'image' : 'video';
      const mediaDoc = {
        product_id: productId,
        kind,
        url: toPublicUrl(req, f.path),
        mimeType: f.mimetype,
        title: f.originalname,
        sortOrder: Number(req.body.sortOrder ?? 0),
        isPrimary: (kind === 'image' && i === isPrimaryImageIdx) || (kind === 'video' && i === isPrimaryVideoIdx),
        // alt, provider, providerId, thumbnailUrl, durationSec can be passed in req.body if needed
        alt: req.body.alt || undefined,
        provider: req.body.provider || (kind === 'video' ? 'self' : undefined),
        providerId: req.body.providerId || undefined,
        thumbnailUrl: req.body.thumbnailUrl || undefined,
        durationSec: req.body.durationSec ? Number(req.body.durationSec) : undefined,
      };
      docs.push(mediaDoc);
    }

    // Create and enforce one-primary-per-kind in schema pre-save (already coded)
    const created = await ProductMedia.insertMany(docs);

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PATCH /api/products/:id/media/:mediaId/primary?kind=image|video
exports.setPrimaryMedia = async (req, res) => {
  try {
    const { id, mediaId } = req.params;
    const { kind } = req.query; // image | video
    if (!['image', 'video'].includes(kind)) {
      return res.status(400).json({ success: false, message: 'kind must be image or video' });
    }

    await ProductMedia.updateMany({ product_id: id, kind }, { $set: { isPrimary: false } });
    const updated = await ProductMedia.findOneAndUpdate(
      { _id: mediaId, product_id: id, kind },
      { $set: { isPrimary: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Media not found' });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id/media/:mediaId
exports.deleteMedia = async (req, res) => {
  try {
    const { id, mediaId } = req.params;
    const media = await ProductMedia.findOne({ _id: mediaId, product_id: id });
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

    // Remove local file if local
    if (media.url && !/^https?:\/\//.test(media.url)) {
      const filePath = path.join(process.cwd(), 'backend', media.url.replace(/^.*\/uploads\//, 'uploads/'));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch { /* ignore */ }
      }
    }

    await media.deleteOne();
    res.json({ success: true, message: 'Media deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
