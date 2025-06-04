// app/routes/result.js
const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

// GET final result with weighted score
router.get('/:assessmentId', resultController.getFinalScore);

module.exports = router;
