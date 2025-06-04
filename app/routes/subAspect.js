// app/routes/subAspect.js
const express = require('express');
const router = express.Router();
const subAspectController = require('../controllers/subAspectController');

// GET semua sub-aspek
router.get('/', subAspectController.getAllSubAspects);

// POST tambah sub-aspek
router.post('/', subAspectController.createSubAspect);

// GET berdasarkan aspect_id
router.get('/aspect/:aspectId', subAspectController.getSubAspectsByAspectId);

module.exports = router;
