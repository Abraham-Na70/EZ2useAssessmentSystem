// app/controllers/chapterController.js
const db = require('../config/db');

const chapterController = {
  createChapter: async (req, res) => {
    const { project_name, no, chapter_name, weight } = req.body;

    if (!project_name || !no || !chapter_name || typeof weight === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Project name, chapter number, chapter name, and weight are required.'
      });
    }
    if (isNaN(parseFloat(weight))) {
        return res.status(400).json({ success: false, message: 'Weight must be a valid number.' });
    }

    try {
      const result = await db.query(
        'INSERT INTO chapter (project_name, no, chapter_name, weight) VALUES ($1, $2, $3, $4) RETURNING *',
        [project_name, no, chapter_name, parseFloat(weight)]
      );
      res.status(201).json({
        success: true,
        message: 'Chapter created successfully',
        data: result.rows[0]
      });
    } catch (err) {
      console.error('Error creating chapter:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to create chapter',
        error: err.message
      });
    }
  },

  getAllChapters: async (req, res) => {
    try {
      // Explicitly list columns and add more comprehensive ordering
      const result = await db.query(
        'SELECT chapter_id, project_name, no, chapter_name, weight FROM chapter ORDER BY project_name, no, chapter_id'
      );
      res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (err) {
      console.error('Error getting chapters:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to get chapters',
        error: err.message
      });
    }
  },

  getChapterById: async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid chapter ID format.' });
    }
    try {
      const result = await db.query('SELECT * FROM chapter WHERE chapter_id = $1', [parseInt(id, 10)]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Chapter not found' });
      }
      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error(`Error getting chapter by ID ${id}:`, err);
      res.status(500).json({
        success: false,
        message: 'Failed to get chapter',
        error: err.message
      });
    }
  },

  updateChapter: async (req, res) => {
    const { id } = req.params;
    const { project_name, no, chapter_name, weight } = req.body;

    if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid chapter ID format.' });
    }
    if (!project_name || !no || !chapter_name || typeof weight === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Project name, chapter number, chapter name, and weight are required.'
      });
    }
    if (isNaN(parseFloat(weight))) {
        return res.status(400).json({ success: false, message: 'Weight must be a valid number.' });
    }

    try {
      const result = await db.query(
        'UPDATE chapter SET project_name = $1, no = $2, chapter_name = $3, weight = $4 WHERE chapter_id = $5 RETURNING *',
        [project_name, no, chapter_name, parseFloat(weight), parseInt(id, 10)]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Chapter not found for update' });
      }
      res.status(200).json({
        success: true,
        message: 'Chapter updated successfully',
        data: result.rows[0]
      });
    } catch (err) {
      console.error(`Error updating chapter ${id}:`, err);
      res.status(500).json({
        success: false,
        message: 'Failed to update chapter',
        error: err.message
      });
    }
  },

  deleteChapter: async (req, res) => {
    const { id } = req.params;
    if (isNaN(parseInt(id, 10))) {
        return res.status(400).json({ success: false, message: 'Invalid chapter ID format.' });
    }
    try {
      // Attempt to delete. If it's referenced by ASSESSMENT table and ON DELETE RESTRICT is active (default),
      // the database will throw an error.
      const result = await db.query('DELETE FROM chapter WHERE chapter_id = $1 RETURNING *', [parseInt(id, 10)]);
      if (result.rowCount === 0) { // Use rowCount for DELETE
        return res.status(404).json({ success: false, message: 'Chapter not found for deletion' });
      }
      res.status(200).json({ success: true, message: 'Chapter deleted successfully', data: result.rows[0] });
      // Some prefer res.status(204).send(); for successful DELETE with no content to return.
    } catch (err) {
      console.error(`Error deleting chapter ${id}:`, err);
      // Check for foreign key violation error (PostgreSQL error code 23503)
      if (err.code === '23503') {
        return res.status(409).json({ // 409 Conflict
          success: false,
          message: 'Cannot delete chapter. It is currently referenced by one or more assessments.',
          error: err.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to delete chapter',
        error: err.message
      });
    }
  }
};

module.exports = chapterController;