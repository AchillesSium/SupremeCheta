// src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const makeStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), 'uploads', subdir);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '');
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/jpg',
    'image/svg+xml',
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only images are allowed (jpeg, png, webp, gif, svg).'));
};

// Create named uploaders for each area
const uploadCategory = multer({
  storage: makeStorage('categories'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadBrand = multer({
  storage: makeStorage('brands'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { uploadCategory, uploadBrand };
