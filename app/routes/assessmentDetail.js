// app/routes/assessmentDetail.js
const express = require('express');
const router = express.Router();
const assessmentDetailController = require('../controllers/assessmentDetailController');

// POST detail: input error count
router.post('/', assessmentDetailController.addAssessmentDetail);

// GET semua detail by assessment_id
router.get('/:assessmentId', assessmentDetailController.getDetailsByAssessmentId);

router.get('/', assessmentDetailController.getAllDetails);

module.exports = router;
