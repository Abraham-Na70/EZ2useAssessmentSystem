// app/controllers/scoreCategoryController.js
const db = require('../config/db');

const scoreCategoryController = {
  getAllCategories: async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM score_category ORDER BY min_score DESC');
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching score categories', error: err.message });
    }
  },

  createCategory: async (req, res) => {
    const { min_score, max_score, category_name } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO score_category (min_score, max_score, category_name) VALUES ($1, $2, $3) RETURNING *',
        [min_score, max_score, category_name]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error creating score category', error: err.message });
    }
  }
};

module.exports = scoreCategoryController;
