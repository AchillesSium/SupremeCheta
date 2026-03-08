// src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ========= common helpers ========= */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const makeStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), 'uploads', subdir);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '');
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

/* ========= filters ========= */
// Images only (used by category/brand)
const imageOnlyMimes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/jpg',
  'image/svg+xml',
]);
const fileFilterImages = (req, file, cb) => {
  if (imageOnlyMimes.has(file.mimetype)) return cb(null, true);
  cb(new Error('Only images are allowed (jpeg, png, webp, gif, svg).'));
};

// Images + videos (used by product media)
const videoMimes = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
]);
const fileFilterMedia = (req, file, cb) => {
  if (imageOnlyMimes.has(file.mimetype) || videoMimes.has(file.mimetype)) return cb(null, true);
  cb(new Error('Only images/videos are allowed.'));
};

/* ========= existing uploaders (unchanged) ========= */
const uploadCategory = multer({
  storage: makeStorage('categories'),
  fileFilter: fileFilterImages,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadBrand = multer({
  storage: makeStorage('brands'),
  fileFilter: fileFilterImages,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ========= product media uploaders ========= */
/**
 * Dynamic storage: route images to /uploads/products/images
 * and videos to /uploads/products/videos automatically.
 */
const storageProductMedia = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = imageOnlyMimes.has(file.mimetype);
    const subdir = isImage ? 'products/images' : 'products/videos';
    const dir = path.join(process.cwd(), 'uploads', subdir);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

// Accept both images and videos in one request
const productMediaMulter = multer({
  storage: storageProductMedia,
  fileFilter: fileFilterMedia,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file (tweak as needed)
    files: 12,
  },
});

// 1) mixed fields: images[], videos[], or media[]
const uploadProductMixed = productMediaMulter.fields([
  { name: 'images', maxCount: 12 },
  { name: 'videos', maxCount: 12 },
  { name: 'media', maxCount: 12 },
]);

// 2) images only
const uploadProductImages = productMediaMulter.array('images', 12);

// 3) videos only
const uploadProductVideos = productMediaMulter.array('videos', 12);

module.exports = {
  uploadCategory,
  uploadBrand,
  uploadProductMixed,
  uploadProductImages,
  uploadProductVideos,
};
