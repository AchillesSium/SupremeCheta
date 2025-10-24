// controllers/brandController.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Brand = require('../models/brand');

const toAbsolute = (req, relPath) =>
  relPath ? `${req.protocol}://${req.get('host')}/${relPath.replace(/^\//, '')}` : null;

// Safely delete a file by its relative path under CWD
function tryUnlink(relativePath) {
  try {
    if (!relativePath) return;
    const abs = path.join(process.cwd(), relativePath.replace(/^\//, ''));
    if (fs.existsSync(abs)) fs.unlink(abs, () => {});
  } catch (_) {
    // ignore
  }
}

// --- ID normalization helpers ----------------------------------------------

const toObjectId = (v) => {
  if (!v) return null;
  // Accept raw ObjectId, string "xxxx", or stringified JSON from some clients
  // Reject "new ObjectId('...')" wrappers by extracting the inner token
  if (typeof v === 'string') {
    const trimmed = v.trim();

    // Handle "new ObjectId('...')" or "ObjectId('...')" patterns gracefully
    const match = trimmed.match(/ObjectId\(['"]?([0-9a-fA-F]{24})['"]?\)/);
    if (match && match[1]) return new mongoose.Types.ObjectId(match[1]);

    // Raw 24-hex id
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      return new mongoose.Types.ObjectId(trimmed);
    }
    return null;
  }
  // If already an ObjectId-like
  try {
    return mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : null;
  } catch {
    return null;
  }
};

// For CREATE: undefined/null -> []
const normalizeIdsForCreate = (val) => {
  if (val == null) return [];
  const arr = Array.isArray(val) ? val : [val];
  return arr.map(toObjectId).filter(Boolean);
};

// For UPDATE: undefined -> undefined (keep as-is), null -> [], else normalize array
const normalizeIdsForUpdate = (val) => {
  if (val === undefined) return undefined;
  if (val == null) return [];
  const arr = Array.isArray(val) ? val : [val];
  return arr.map(toObjectId).filter(Boolean);
};

// ---------------------------------------------------------------------------

/**
 * POST /api/brands
 * Body: multipart/form-data (name, description?, categories[] (repeated), products[] (repeated), logo:file)
 */
exports.createBrand = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    // Save logo as a relative path like "uploads/brands/<filename>"
    const logo = req.file ? path.posix.join('uploads', 'brands', req.file.filename) : null;

    const products = normalizeIdsForCreate(req.body.products);
    const categories = normalizeIdsForCreate(req.body.categories);

    const brand = new Brand({
      name: name.trim(),
      description: description ?? '',
      logo, // if your schema requires logo, ensure a file is provided on the client
      products,
      categories,
    });

    await brand.save();

    const payload = brand.toObject();
    payload.logoUrl = toAbsolute(req, brand.logo);

    return res
      .status(201)
      .json({ success: true, message: 'Brand created', brand: payload });
  } catch (error) {
    // Best-effort cleanup if something failed after upload
    if (req.file) {
      const rel = path.posix.join('uploads', 'brands', req.file.filename);
      tryUnlink(rel);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/brands?page=&limit=&search=
exports.getAllBrands = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const search = (req.query.search || '').trim();
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

    const [brands, total] = await Promise.all([
      Brand.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Brand.countDocuments(filter),
    ]);

    const data = brands.map((b) => ({ ...b, logoUrl: toAbsolute(req, b.logo) }));

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      brands: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/brands/:id
exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid brand id.' });
    }

    const brand = await Brand.findById(id)
      .populate('products')     // adjust fields if needed
      .populate('categories')   // adjust fields if needed
      .lean();

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    const obj = { ...brand, logoUrl: toAbsolute(req, brand.logo) };
    return res.status(200).json({ success: true, brand: obj });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to fetch brand.' });
  }
};

/**
 * PUT /api/brands/:id
 * multipart/form-data allowed to replace logo
 */
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid brand id' });
    }

    const existing = await Brand.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    // If a new logo is provided, delete the old file (best effort)
    let logo = existing.logo;
    if (req.file) {
      const newRelPath = path.posix.join('uploads', 'brands', req.file.filename);
      if (logo) tryUnlink(logo); // remove old
      logo = newRelPath;
    }

    if (typeof req.body.name === 'string') existing.name = req.body.name.trim();
    if (typeof req.body.description === 'string') existing.description = req.body.description;

    const products = normalizeIdsForUpdate(req.body.products);
    const categories = normalizeIdsForUpdate(req.body.categories);

    if (products !== undefined) existing.products = products;
    if (categories !== undefined) existing.categories = categories;

    existing.logo = logo;

    const updated = await existing.save();

    const payload = updated.toObject();
    payload.logoUrl = toAbsolute(req, updated.logo);

    return res
      .status(200)
      .json({ success: true, message: 'Brand updated', brand: payload });
  } catch (error) {
    // If upload happened but save failed, clean up the new file
    if (req.file) {
      const rel = path.posix.join('uploads', 'brands', req.file.filename);
      tryUnlink(rel);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/brands/:id/products
exports.getBrandProducts = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid brand id.' });
    }

    const brand = await Brand.findById(id).populate('products');
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found.' });
    }

    return res.status(200).json({ success: true, products: brand.products || [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to fetch products for brand.' });
  }
};

/**
 * DELETE /api/brands/:id
 * Also removes the logo file best-effort
 */
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid brand id' });
    }

    const deleted = await Brand.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    // remove logo if present
    tryUnlink(deleted.logo);

    return res.status(200).json({ success: true, message: 'Brand deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
