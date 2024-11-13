// routes/gallery.js
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/gallery/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.get('/', galleryController.getAllGalleryItems);
router.get('/:id', galleryController.getGalleryItemById);
router.post('/', authMiddleware, upload.single('image'), galleryController.createGalleryItem);
router.patch('/:id', authMiddleware, upload.single('image'), galleryController.updateGalleryItem);
router.delete('/:id', authMiddleware, galleryController.deleteGalleryItem);

module.exports = router;