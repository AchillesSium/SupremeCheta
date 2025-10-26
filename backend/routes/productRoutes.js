// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');
const { uploadProductMixed } = require('../middleware/upload');
const { auth, restrictTo } = require('../middleware/auth');

// CRUD
router.post('/', auth, restrictTo('admin', 'vendor'), productCtrl.createProduct);
router.get('/', productCtrl.getProducts);
router.get('/:id', productCtrl.getProductById);
router.put('/:id', auth, restrictTo('admin', 'vendor'), productCtrl.updateProduct);
router.delete('/:id', auth, restrictTo('admin'), productCtrl.deleteProduct);

// Media
router.post('/:id/media', auth, restrictTo('admin', 'vendor'), uploadProductMixed, productCtrl.uploadMedia);
router.patch('/:id/media/:mediaId/primary', auth, restrictTo('admin', 'vendor'), productCtrl.setPrimaryMedia);
router.delete('/:id/media/:mediaId', auth, restrictTo('admin', 'vendor'), productCtrl.deleteMedia);

module.exports = router;