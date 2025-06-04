// File: app/routes/parameter.js
const express = require('express');
const router = express.Router();
const parameterController = require('../controllers/parameterController');
const authVerifier = require('../middlewares/authVerifier'); // Your existing auth middleware

// === PARAMETER ROUTES ===
// GET all parameters with their aspects and sub-aspects (for assessment form structure and management views)
router.get('/', authVerifier.verifyToken, parameterController.getAllParameters); // Protected, any authenticated user can fetch structure

// POST create a new assessment_parameter (Admin only)
router.post(
    '/',
    authVerifier.verifyToken,
    authVerifier.isAdmin, // Only admins can create top-level parameters
    parameterController.createParameter
);

// NEW: PUT update an existing assessment_parameter (Admin only)
router.put(
    '/:parameterId', // Parameter ID from URL
    authVerifier.verifyToken,
    authVerifier.isAdmin,
    parameterController.updateParameter
);

// NEW: DELETE an existing assessment_parameter (Admin only)
router.delete(
    '/:parameterId', // Parameter ID from URL
    authVerifier.verifyToken,
    authVerifier.isAdmin,
    parameterController.deleteParameter
);


// === ASPECT ROUTES (Managed under parameters) ===
// POST create a new aspect under a specific parameter_id (Admin only)
router.post(
    '/aspects',
    authVerifier.verifyToken,
    authVerifier.isAdmin,
    parameterController.createAspect
);

// PUT update an existing aspect (Admin only)
router.put(
    '/aspects/:aspectId',
    authVerifier.verifyToken,
    authVerifier.isAdmin,
    parameterController.updateAspect
);

// DELETE an existing aspect (Admin only)
router.delete(
    '/aspects/:aspectId',
    authVerifier.verifyToken,
    authVerifier.isAdmin,
    parameterController.deleteAspect
);

// === SUB-ASPECT ROUTES (Managed under aspects) ===
// POST create a new sub-aspect under a specific aspect_id (Admin or Assessor)
router.post(
    '/subaspects',
    authVerifier.verifyToken,
    authVerifier.isAssessor, // isAssessor allows both assessors and admins
    parameterController.createSubAspect
);

// PUT update an existing sub-aspect (Admin or Assessor)
router.put(
    '/subaspects/:subAspectId',
    authVerifier.verifyToken,
    authVerifier.isAssessor,
    parameterController.updateSubAspect
);

// DELETE an existing sub-aspect (Admin or Assessor)
router.delete(
    '/subaspects/:subAspectId',
    authVerifier.verifyToken,
    authVerifier.isAssessor,
    parameterController.deleteSubAspect
);

module.exports = router;