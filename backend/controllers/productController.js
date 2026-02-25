// backend/controllers/productController.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/product');
const ProductMedia = require('../models/product_media');
const ProductTag = require('../models/product_tag');

// Build a public URL for a stored file
function toPublicUrl(req, filePath) {
  const base = `${req.protocol}://${req.get('host')}`;
  let rel;

  if (!filePath) {
    throw new Error('Upload error: filePath is missing (multer did not provide f.path)');
  }

  if (path.isAbsolute(filePath)) {
    const backendRoot = path.join(process.cwd(), 'backend');
    rel = '/' + path.relative(backendRoot, filePath);
  } else {
    rel = filePath.startsWith('/') ? filePath : '/' + filePath;
  }

  rel = rel.replace(/\\/g, '/');
  if (!rel.startsWith('/uploads/')) {
    const idx = rel.indexOf('/uploads/');
    if (idx !== -1) rel = rel.slice(idx);
  }

  return base + rel;
}

/* ===================== helpers ===================== */

function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

// Accept array/object OR JSON string.
// If it's "[object Object]" or invalid JSON, return fallback.
function parseMaybeJson(value, fallback = []) {
  if (value == null) return fallback;

  // already parsed (application/json)
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;

  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return fallback;

    // common multipart mistake
    if (s === '[object Object]') return fallback;

    try {
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

// normalize id strings (optional safety)
function normalizeId(v) {
  if (!v) return undefined;
  if (typeof v === 'string') return v.trim() || undefined;
  if (typeof v === 'object') return v._id || v.id || undefined;
  return undefined;
}

// accept ids or populated docs and return ids as strings
function normalizeIds(arr) {
  return asArray(arr)
    .map((x) => normalizeId(x))
    .filter(Boolean);
}

/* ========= PRODUCTS ========= */

// POST /api/products
// Supports both application/json and multipart/form-data
exports.createProduct = async (req, res) => {
  try {
    const body = req.body || {};

    const categories = normalizeIds(body.categories);
    const tags = normalizeIds(body.tags);

    // specs can arrive as:
    // - array/object in JSON
    // - stringified JSON in multipart
    const specificationsRaw = parseMaybeJson(body.specifications, []);
    const specifications = asArray(specificationsRaw)
      .map((s) => ({
        name: (s?.name ?? '').toString(),
        value: (s?.value ?? '').toString(),
      }))
      .filter((s) => s.name.trim() && s.value.trim());

    const product = await Product.create({
      name: body.name,
      description: body.description,
      price: body.price,
      categories,
      brand: normalizeId(body.brand) || undefined,
      vendor: normalizeId(body.vendor) || undefined, // auth removed → rely on body.vendor if you want
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
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

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
// Supports both application/json and multipart/form-data
exports.updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const body = req.body || {};
    const update = {};

    if (body.name !== undefined) update.name = body.name;
    if (body.description !== undefined) update.description = body.description;
    if (body.price !== undefined) update.price = body.price;
    if (body.brand !== undefined) update.brand = normalizeId(body.brand) || undefined;
    if (body.vendor !== undefined) update.vendor = normalizeId(body.vendor) || undefined;
    if (body.status !== undefined) update.status = body.status;

    // categories + tags may arrive as single string OR repeated fields OR array
    if (body.categories !== undefined) update.categories = normalizeIds(body.categories);
    if (body.tags !== undefined) update.tags = normalizeIds(body.tags);

    if (body.quantity != null) update['inventory.quantity'] = body.quantity;
    if (body.sku !== undefined) update['inventory.sku'] = body.sku;

    if (body.specifications !== undefined) {
      const specsRaw = parseMaybeJson(body.specifications, []);
      update.specifications = asArray(specsRaw)
        .map((s) => ({
          name: (s?.name ?? '').toString(),
          value: (s?.value ?? '').toString(),
        }))
        .filter((s) => s.name.trim() && s.value.trim());
    }

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true }).populate(
      ['categories', 'brand', 'vendor', 'tags']
    );

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Product not found' });

    // Delete media files on disk as well
    const medias = await ProductMedia.find({ product_id: doc._id });
    for (const m of medias) {
      if (m.url?.startsWith('http')) continue; // remote CDN
      const filePath = path.join(process.cwd(), 'backend', m.url.replace(/^.*\/uploads\//, 'uploads/'));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          /* ignore */
        }
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

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    // Gather files from fields: images[], videos[], media[]
    const files = [
      ...(req.files?.images || []),
      ...(req.files?.videos || []),
      ...(req.files?.media || []),
    ];

    if (!files.length) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const isPrimaryImageIdx =
      req.body.primaryImageIndex != null ? Number(req.body.primaryImageIndex) : null;
    const isPrimaryVideoIdx =
      req.body.primaryVideoIndex != null ? Number(req.body.primaryVideoIndex) : null;

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
        isPrimary:
          (kind === 'image' && i === isPrimaryImageIdx) ||
          (kind === 'video' && i === isPrimaryVideoIdx),
        // optional metadata
        alt: req.body.alt || undefined,
        provider: req.body.provider || (kind === 'video' ? 'self' : undefined),
        providerId: req.body.providerId || undefined,
        thumbnailUrl: req.body.thumbnailUrl || undefined,
        durationSec: req.body.durationSec ? Number(req.body.durationSec) : undefined,
      };

      docs.push(mediaDoc);
    }

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

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(mediaId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

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

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(mediaId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const media = await ProductMedia.findOne({ _id: mediaId, product_id: id });
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });

    // Remove local file if local (in case you ever store relative)
    if (media.url && !/^https?:\/\//.test(media.url)) {
      const filePath = path.join(process.cwd(), 'backend', media.url.replace(/^.*\/uploads\//, 'uploads/'));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          /* ignore */
        }
      }
    }

    await media.deleteOne();
    res.json({ success: true, message: 'Media deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ========= TAGS ========= */

exports.createOrGetProductTag = async (req, res) => {
  try {
    const tagName = (req.body?.tag_name || '').toString().trim().toLowerCase();
    const productId = req.body?.product_id ? String(req.body.product_id).trim() : null;

    if (!tagName) {
      return res.status(400).json({ success: false, message: 'tag_name is required' });
    }

    // product_id is OPTIONAL in POST
    if (productId && !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product_id' });
    }

    // Create if not exists (unique tag_name)
    // If productId exists, add it to product_ids (no duplicates)
    const update = productId ? { $addToSet: { product_ids: productId } } : {};
    const tag = await ProductTag.findOneAndUpdate(
      { tag_name: tagName },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Determine if created or existing (basic heuristic)
    // If you want exact "created" flag, you can use rawResult option.
    return res.status(200).json({ success: true, data: tag });
  } catch (err) {
    // Duplicate key (unique tag_name) edge-case race
    if (err?.code === 11000) {
      const tagName = (req.body?.tag_name || '').toString().trim().toLowerCase();
      const tag = await ProductTag.findOne({ tag_name: tagName });
      return res.status(200).json({ success: true, data: tag });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id/tags?scope=product|global|all
// - product (default): only tags linked to this product_id
// - global: only tags with product_id = null
// - all: both
exports.getProductTags = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const scope = (req.query.scope || 'product').toString().toLowerCase();

    const query = {};
    if (scope === 'global') {
      query.product_id = null;
    } else if (scope === 'all') {
      query.$or = [{ product_id: productId }, { product_id: null }];
    } else {
      // default "product"
      query.product_id = productId;
    }

    const tags = await ProductTag.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      results: tags.length,
      data: tags,
      scope,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

/// GET /api/products/tags
// Returns ALL tags (global + product-specific). No query params.
exports.getAllProductTags = async (req, res) => {
  try {
    const tags = await ProductTag.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      results: tags.length,
      data: tags,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/products/tags/:tagId
// Body: { product_id: "..." }
// product_id is REQUIRED
exports.attachProductToTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    const productId = req.body?.product_id
      ? String(req.body.product_id).trim()
      : '';

    // Validate tag id
    if (!mongoose.isValidObjectId(tagId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tag id',
      });
    }

    // product_id REQUIRED
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'product_id is required',
      });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product_id',
      });
    }

    // Check product exists
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update tag → add product to product_ids
    const updatedTag = await ProductTag.findByIdAndUpdate(
      tagId,
      { $addToSet: { product_ids: productId } },
      { new: true }
    );

    if (!updatedTag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found',
      });
    }

    // Optional but recommended:
    // Also attach tag to product.tags field
    await Product.findByIdAndUpdate(
      productId,
      { $addToSet: { tags: tagId } }
    );

    return res.status(200).json({
      success: true,
      data: updatedTag,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE /api/products/tags/:tagId/product/:productId
exports.detachProductFromTag = async (req, res) => {
  try {
    const { tagId, productId } = req.params;

    // Validate ids
    if (!mongoose.isValidObjectId(tagId)) {
      return res.status(400).json({ success: false, message: 'Invalid tag id' });
    }
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    // Optional: check existence (nice errors)
    const [tagExists, productExists] = await Promise.all([
      ProductTag.exists({ _id: tagId }),
      Product.exists({ _id: productId }),
    ]);

    if (!tagExists) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }
    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 1) Remove product from tag.product_ids
    const updatedTag = await ProductTag.findByIdAndUpdate(
      tagId,
      { $pull: { product_ids: productId } },
      { new: true }
    );

    // 2) Remove tag from product.tags (recommended since you also add it on attach)
    await Product.findByIdAndUpdate(
      productId,
      { $pull: { tags: tagId } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedTag,
      message: 'Product detached from tag',
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};