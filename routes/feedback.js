// routes/contact.js (continued)
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, contactController.getAllContacts);
router.get('/:id', authMiddleware, contactController.getContactById);
router.post('/', contactController.createContact);
router.patch('/:id/status', authMiddleware, contactController.updateContactStatus);
router.delete('/:id', authMiddleware, contactController.deleteContact);

module.exports = router;