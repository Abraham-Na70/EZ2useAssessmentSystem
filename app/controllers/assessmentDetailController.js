// app/controllers/assessmentDetailController.js
const db = require('../config/db');

const assessmentDetailController = {
  addAssessmentDetail: async (req, res) => {
    const { assessment_id, sub_aspect_id, error_count } = req.body;
    try {
      const result = await db.query(
        `INSERT INTO assessment_detail (assessment_id, sub_aspect_id, error_count)
         VALUES ($1, $2, $3) RETURNING *`,
        [assessment_id, sub_aspect_id, error_count || 0]
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error adding assessment detail', error: err.message });
    }
  },

  getDetailsByAssessmentId: async (req, res) => {
    const assessmentId = req.params.assessmentId;
    try {
      const result = await db.query(
        `SELECT ad.*, sa.sub_aspect_name
         FROM assessment_detail ad
         JOIN sub_aspect sa ON ad.sub_aspect_id = sa.sub_aspect_id
         WHERE ad.assessment_id = $1`,
        [assessmentId]
      );
      res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching details', error: err.message });
    }
  },

  getAllDetails: async (req, res) => {
    const assessmentId = req.params.assessmentId;
    try {
      const result = await db.query(`SELECT * FROM assessment_detail ORDER BY assessment_id = $1`, [assessmentId]);
      res.status(200).json({
        success: true,
        data: result.rows
      });
      
    } catch (err) {
      // res.status(500).json({ success: false, message: 'Error fetching details', error: err.message });
      console.error('Error getting chapters:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to get chapters',
        error: err.message
      });
    }
  }

};

module.exports = assessmentDetailController;
