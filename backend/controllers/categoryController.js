const Category = require('../models/category'); // Adjust path based on your project structure

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, attribute_id, parentCategory } = req.body;

    // Create a new category
    const category = new Category({
      name,
      description,
      attribute_id,
      parentCategory,
    });

    await category.save();

    // If it's a subcategory, add it to the parent's subcategories array
    if (parentCategory) {
      await Category.findByIdAndUpdate(parentCategory, {
        $push: { subcategories: category._id },
      });
    }

    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('subcategories', 'name');
    res.status(200).json({ success: true, categories });
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
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, attribute_id, parentCategory } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, attribute_id, parentCategory },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, message: 'Category updated', category: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Remove this category from its parent's subcategories array if it's a subcategory
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(category.parentCategory, {
        $pull: { subcategories: category._id },
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all subcategories of a category
exports.getSubcategories = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('subcategories', 'name');
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, subcategories: category.subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
