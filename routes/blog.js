// routes/blog.js
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: 'uploads/blogs/',
    filename: function (req, file, cb) {
        cb(null, 'blog-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { files: 5 },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
}).array('images', 5);

router.get('/related', blogController.getRelatedBlogs);

router.get('/slug/:slug', blogController.getBlogBySlug);
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);
router.post('/', authMiddleware, upload, blogController.createBlog);
router.patch('/:id', authMiddleware, upload, blogController.updateBlog);
router.delete('/:id', authMiddleware, blogController.deleteBlog);


module.exports = router;