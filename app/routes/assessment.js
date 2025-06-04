// app/routes/assessment.js
const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const authVerifier = require('../middlewares/authVerifier'); // This is your object of middleware functions

// GET all assessments (e.g., /api/assessments)
router.get(
    '/',
    authVerifier.verifyToken, // Use the specific verifyToken middleware function
    assessmentController.getAllAssessments
);

// POST a new assessment (e.g., /api/assessments)
router.post(
    '/',
    authVerifier.verifyToken, // Use the specific verifyToken middleware function
    // If needed, you can add role checks here, e.g.: authVerifier.isAssessor,
    assessmentController.createAssessment
);

// GET a specific assessment by ID (e.g., /api/assessments/:id)
router.get(
    '/:id',
    authVerifier.verifyToken, // Use the specific verifyToken middleware function
    assessmentController.getAssessmentById
);

// PUT (update) a specific assessment by ID (e.g., /api/assessments/:id)
router.put(
    '/:id',
    authVerifier.verifyToken, // Use the specific verifyToken middleware function
    // If needed, add role checks: authVerifier.isAssessor,
    assessmentController.updateAssessment
);

// DELETE a specific assessment by ID (e.g., /api/assessments/:id)
router.delete(
    '/:id',
    authVerifier.verifyToken, // Use the specific verifyToken middleware function
    // If needed, add role checks: authVerifier.isAdmin,
    assessmentController.deleteAssessment
);

// PUT to specifically calculate/recalculate score & update status for an assessment
// (e.g., /api/assessments/:id/calculate)
router.put(
    '/:id/calculate',
    authVerifier.verifyToken, // Use the specific verifyToken middleware function
    assessmentController.calculateAssessmentScore
);

module.exports = router;