// app/controllers/aspectController.js
const db = require('../config/db');

const aspectController = {
  getAllAspects: async (req, res) => {
    try {
      const result = await db.query(`
        SELECT a.*, ap.parameter_name
        FROM aspect a
        JOIN assessment_parameter ap ON a.parameter_id = ap.parameter_id
        ORDER BY a.aspect_id
      `);
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching aspects', error: err.message });
    }
  },

  createAspect: async (req, res) => {
    const { parameter_id, aspect_name } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO aspect (parameter_id, aspect_name) VALUES ($1, $2) RETURNING *',
        [parameter_id, aspect_name]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error creating aspect', error: err.message });
    }
  },

  getAspectsByParameterId: async (req, res) => {
    const { parameterId } = req.params;
    try {
      const result = await db.query(
        'SELECT * FROM aspect WHERE parameter_id = $1',
        [parameterId]
      );
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching aspects by parameter', error: err.message });
    }
  }
};

module.exports = aspectController;