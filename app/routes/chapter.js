// app/routes/chapter.js
const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const authVerifier = require('../middlewares/authVerifier'); // Assuming you want to protect these routes

// GET all chapters
router.get('/', authVerifier.verifyToken, chapterController.getAllChapters);

// POST a new chapter
router.post('/', authVerifier.verifyToken, chapterController.createChapter); // Assuming createChapter requires auth

// GET a specific chapter by ID
router.get('/:id', authVerifier.verifyToken, chapterController.getChapterById);

// PUT (update) a specific chapter by ID
router.put('/:id', authVerifier.verifyToken, chapterController.updateChapter);

// DELETE a specific chapter by ID
router.delete('/:id', authVerifier.verifyToken, 
    // authVerifier.isAdmin, // only admins can delete chapters
    chapterController.deleteChapter
);

module.exports = router;