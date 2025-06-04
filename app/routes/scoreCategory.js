// app/routes/scoreCategory.js
const express = require('express');
const router = express.Router();
const scoreCategoryController = require('../controllers/scoreCategoryController');

// GET semua kategori skor
router.get('/', scoreCategoryController.getAllCategories);

// POST tambah kategori skor baru
router.post('/', scoreCategoryController.createCategory);

module.exports = router;
