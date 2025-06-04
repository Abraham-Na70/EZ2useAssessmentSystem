// app/routes/aspect.js
const express = require('express');
const router = express.Router();
const aspectController = require('../controllers/aspectController');

// GET semua aspek
router.get('/', aspectController.getAllAspects);

// POST tambah aspek
router.post('/', aspectController.createAspect);

// GET aspek berdasarkan parameter_id
router.get('/parameter/:parameterId', aspectController.getAspectsByParameterId);

module.exports = router;
