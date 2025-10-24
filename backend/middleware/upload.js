// src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const CATEGORY_DIR = path.join(process.cwd(), 'uploads', 'categories');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(CATEGORY_DIR, { recursive: true });
    cb(null, CATEGORY_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only images are allowed (jpeg, png, webp, gif, svg).'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB
module.exports = { upload };
