// routes/faq.js
const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const authMiddleware = require('../middleware/auth');

router.get('/', faqController.getAllFaqs);
router.get('/:id', faqController.getFaqById);
router.post('/', authMiddleware, faqController.createFaq);
router.patch('/:id', authMiddleware, faqController.updateFaq);
router.delete('/:id', authMiddleware, faqController.deleteFaq);

module.exports = router;