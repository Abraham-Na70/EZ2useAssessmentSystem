// app/controllers/subAspectController.js
const db = require('../config/db');

const subAspectController = {
  getAllSubAspects: async (req, res) => {
    try {
      const result = await db.query(`
        SELECT sa.*, a.aspect_name
        FROM sub_aspect sa
        JOIN aspect a ON sa.aspect_id = a.aspect_id
        ORDER BY sa.sub_aspect_id
      `);
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching sub-aspects', error: err.message });
    }
  },

  createSubAspect: async (req, res) => {
    const { aspect_id, sub_aspect_name } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO sub_aspect (aspect_id, sub_aspect_name) VALUES ($1, $2) RETURNING *',
        [aspect_id, sub_aspect_name]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error creating sub-aspect', error: err.message });
    }
  },

  getSubAspectsByAspectId: async (req, res) => {
    const { aspectId } = req.params;
    try {
      const result = await db.query(
        'SELECT * FROM sub_aspect WHERE aspect_id = $1',
        [aspectId]
      );
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching sub-aspects by aspect', error: err.message });
    }
  }
};

module.exports = subAspectController;
