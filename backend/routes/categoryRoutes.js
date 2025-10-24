const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { uploadCategory } = require('../middleware/upload');

// Category Routes
router.post('/', uploadCategory.single('image'), categoryController.createCategory); // Create a new category
router.get('/', categoryController.getAllCategories); // Get all categories
router.get('/:id', categoryController.getCategoryById); // Get a specific category by ID
router.put('/:id', uploadCategory.single('image'), categoryController.updateCategory); // Update a category
router.delete('/:id', categoryController.deleteCategory); // Delete a category
router.get('/:id/subcategories', categoryController.getSubcategories); // Get subcategories of a category

module.exports = router;
