// controllers/categoryController.js
const fs = require('fs');
const path = require('path');
const Category = require('../models/category');

const toAbsolute = (req, relPath) =>
  relPath ? `${req.protocol}://${req.get('host')}/${relPath.replace(/^\//, '')}` : null;

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;

    // If a file was uploaded, store a relative URL like "uploads/categories/filename.ext"
    const image = req.file ? path.posix.join('uploads', 'categories', req.file.filename) : null;

    const category = new Category({
      name,
      description,
      parentCategory,
      image,
    });

    await category.save();

    if (parentCategory) {
      await Category.findByIdAndUpdate(parentCategory, {
        $push: { subcategories: category._id },
      });
    }

    const payload = category.toObject();
    payload.imageUrl = toAbsolute(req, category.image);

    res.status(201).json({ success: true, message: 'Category created', category: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('subcategories', 'name');

    const data = categories.map((c) => {
      const obj = c.toObject();
      obj.imageUrl = toAbsolute(req, c.image);
      return obj;
    });

    res.status(200).json({ success: true, categories: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('subcategories', 'name');
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const obj = category.toObject();
    obj.imageUrl = toAbsolute(req, category.image);
    res.status(200).json({ success: true, category: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a category (optionally replace the image)
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;

    const existing = await Category.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // If a new image is provided, delete the old file (best effort)
    let image = existing.image;
    if (req.file) {
      const newRelPath = path.posix.join('uploads', 'categories', req.file.filename);
      if (image) {
        const localPath = path.join(process.cwd(), image);
        fs.existsSync(localPath) && fs.unlink(localPath, () => {});
      }
      image = newRelPath;
    }

    existing.name = name ?? existing.name;
    existing.description = description ?? existing.description;
    existing.parentCategory = parentCategory ?? existing.parentCategory;
    existing.image = image;

    const updatedCategory = await existing.save();

    const payload = updatedCategory.toObject();
    payload.imageUrl = toAbsolute(req, updatedCategory.image);

    res.status(200).json({ success: true, message: 'Category updated', category: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- helper: delete a file safely ---
function tryUnlink(relativePath) {
  try {
    const abs = path.join(process.cwd(), relativePath);
    if (fs.existsSync(abs)) fs.unlink(abs, () => {});
  } catch (_) {
    // silently ignore errors
  }
}

// helper: gather a full subtree (root + all descendants)
async function gatherSubtreeIds(rootId, session = null) {
  const ids = [];
  const stack = [rootId];

  while (stack.length) {
    const currentId = stack.pop();
    ids.push(currentId);

    const kids = await Category.find({ parentCategory: currentId }, '_id', { session });
    for (const k of kids) stack.push(k._id.toString());
  }
  return ids; // order: root first, then descendants
}

// Delete a category + all its descendants
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  // optional transaction (works if MongoDB is a replica set)
  let session = null;
  try {
    // 1) Load the root category
    const root = await Category.findById(id);
    if (!root) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // 2) If it has a parent that will remain, pull root from its parent's subcategories
    if (root.parentCategory) {
      await Category.findByIdAndUpdate(root.parentCategory, {
        $pull: { subcategories: root._id },
      });
    }

    // 3) Gather the whole subtree (root + descendants)
    const allIds = await gatherSubtreeIds(root._id);
    // delete leaves first (reverse the list)
    const deleteOrder = allIds.slice().reverse();

    // 4) Delete images for every node (best effort)
    const nodes = await Category.find({ _id: { $in: allIds } }, 'image');
    const byId = new Map(nodes.map((n) => [n._id.toString(), n]));
    for (const cid of allIds) {
      const node = byId.get(cid.toString());
      if (node?.image) tryUnlink(node.image);
    }

    // 5) Delete all nodes in leaf-first order
    await Category.deleteMany({ _id: { $in: deleteOrder } });

    return res.status(200).json({
      success: true,
      message: 'Category and its subcategories deleted',
      deletedCount: deleteOrder.length,
      deletedIds: deleteOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (session) await session.endSession();
  }
};

// Get subcategories
exports.getSubcategories = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('subcategories', 'name image');
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const subcategories = category.subcategories.map((s) => {
      const obj = s.toObject();
      obj.imageUrl = toAbsolute(req, s.image);
      return obj;
    });

    res.status(200).json({ success: true, subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
