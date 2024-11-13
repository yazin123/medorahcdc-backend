// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const contactController = require('../controllers/contactDetailController');

// GET all contacts
router.get('/', contactController.getContacts);
router.get('/whatsapp', contactController.getWhatsapp);

// POST new contact
router.post('/',authMiddleware, contactController.addContact);

// PUT update contact
router.put('/:id', authMiddleware,contactController.updateContact);

// DELETE contact
router.delete('/:id',authMiddleware, contactController.deleteContact);

module.exports = router;