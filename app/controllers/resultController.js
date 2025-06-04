// app/controllers/resultController.js
const db = require('../config/db');

const resultController = {
  getFinalScore: async (req, res) => {
    const { assessmentId } = req.params;
    try {
      const result = await db.query(`
        SELECT 
          a.assessment_id,
          a.assessor_name,
          SUM(a.total_score * c.weight) / SUM(c.weight) AS final_score,
          CASE 
            WHEN SUM(a.total_score * c.weight) / SUM(c.weight) >= 86 THEN 'Istimewa'
            WHEN SUM(a.total_score * c.weight) / SUM(c.weight) >= 78 THEN 'Sangat Baik'
            WHEN SUM(a.total_score * c.weight) / SUM(c.weight) >= 65 THEN 'Baik'
            ELSE 'Cukup'
          END AS final_predicate
        FROM assessment a
        JOIN chapter c ON a.chapter_id = c.chapter_id
        WHERE a.assessment_id = $1
        GROUP BY a.assessment_id, a.assessor_name
      `, [assessmentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
      }

      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error calculating final score', error: err.message });
    }
  }
};

module.exports = resultController;
