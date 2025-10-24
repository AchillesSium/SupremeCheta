// routes/brandRoutes.js
const express = require('express');
const { uploadBrand } = require('../middleware/upload');
const {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    getBrandProducts,
    deleteBrand,
} = require('../controllers/brandController');

const router = express.Router();

router.get('/', getAllBrands);
router.post('/', uploadBrand.single('logo'), createBrand);
router.get('/:id', getBrandById);
router.put('/:id', uploadBrand.single('logo'), updateBrand);
router.get('/:id/products', getBrandProducts);
router.delete('/:id', deleteBrand);

module.exports = router;
