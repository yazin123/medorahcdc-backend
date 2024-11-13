// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);
router.post('/createAdminforMedorah', adminController.create);



module.exports = router;