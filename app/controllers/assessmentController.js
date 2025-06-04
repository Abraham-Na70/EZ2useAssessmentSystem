// app/controllers/assessmentController.js
const db = require('../config/db'); // Your database pool from db.js

const assessmentController = {
  getAllAssessments: async (req, res) => {
    try {
      // Destructure filter parameters from req.query
      const { chapter_id, status, start_date, end_date } = req.query;

      let baseQuery = `
        SELECT a.assessment_id AS id, a.assessment_date, a.assessor_name, a.status, a.notes, 
               a.total_score, a.predicate, c.chapter_id, c.chapter_name, c.project_name
        FROM assessment a
        JOIN chapter c ON a.chapter_id = c.chapter_id
      `;

      const whereClauses = [];
      const queryParams = [];
      let paramIndex = 1;

      if (chapter_id) {
        whereClauses.push(`a.chapter_id = $${paramIndex++}`);
        queryParams.push(chapter_id);
      }
      if (status) {
        whereClauses.push(`a.status = $${paramIndex++}`);
        queryParams.push(status);
      }
      if (start_date) {
        whereClauses.push(`a.assessment_date >= $${paramIndex++}`);
        queryParams.push(start_date);
      }
      if (end_date) {
        // To include the end_date itself, you might want to consider it as the end of that day
        // For simplicity here, we'll use <=. For full day coverage, you might adjust the date on the client or here.
        whereClauses.push(`a.assessment_date <= $${paramIndex++}`);
        queryParams.push(end_date);
      }

      if (whereClauses.length > 0) {
        baseQuery += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      baseQuery += ` ORDER BY a.assessment_date DESC, a.assessment_id DESC;`;

      console.log('Executing query:', baseQuery);
      console.log('With parameters:', queryParams);

      const result = await db.query(baseQuery, queryParams);
      res.status(200).json({ success: true, data: result.rows });

    } catch (err) {
      console.error('Error fetching assessments:', err);
      res.status(500).json({ success: false, message: 'Error fetching assessments', error: err.message });
    }
  },

  createAssessment: async (req, res) => {
    const { chapter_id, assessor_name, assessment_date, notes, details } = req.body;
    console.log('Backend: Received payload for createAssessment:', req.body);

    if (!chapter_id || !assessor_name || !assessment_date) {
      console.error('Backend: Missing required fields (chapter_id, assessor_name, assessment_date)');
      return res.status(400).json({
        success: false,
        message: 'Chapter ID, Assessor Name, and Assessment Date are required.'
      });
    }
    if (!Array.isArray(details)) {
      console.error('Backend: Details must be an array.');
      return res.status(400).json({
        success: false,
        message: 'Assessment details must be an array.'
      });
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      console.log('Backend: Transaction started for createAssessment.');

      const assessmentQuery = `
        INSERT INTO assessment (chapter_id, assessment_date, assessor_name, status, notes)
        VALUES ($1, $2, $3, 'PENDING', $4) RETURNING assessment_id;
      `;
      const assessmentValues = [chapter_id, assessment_date, assessor_name, notes || null];
      const assessmentResult = await client.query(assessmentQuery, assessmentValues);
      const newAssessmentId = assessmentResult.rows[0].assessment_id;
      console.log('Backend: New assessment created with ID:', newAssessmentId);

      if (details.length > 0) {
        for (const detail of details) {
          if (typeof detail.sub_aspect_id === 'undefined' || typeof detail.error_count === 'undefined') {
            console.error('Backend: Invalid detail item:', detail);
            throw new Error('Each detail item must have sub_aspect_id and error_count.');
          }
          const detailQuery = `
            INSERT INTO ASSESSMENT_DETAIL (assessment_id, sub_aspect_id, error_count)
            VALUES ($1, $2, $3);
          `;
          await client.query(detailQuery, [newAssessmentId, detail.sub_aspect_id, detail.error_count]);
        }
        console.log('Backend: All assessment details inserted.');
      } else {
        console.log('Backend: No details provided. Scores will be based on 0 errors.');
      }

      console.log(`Backend: Updating scores directly for assessment_id: ${newAssessmentId}`);
      const updateScoreQuery = `
        UPDATE assessment
        SET
            total_score = (
                SELECT 90 - COALESCE(SUM(error_count), 0)
                FROM assessment_detail
                WHERE assessment_id = $1
            ),
            predicate = (
                SELECT category_name
                FROM score_category sc
                WHERE (90 - (SELECT COALESCE(SUM(error_count), 0) FROM assessment_detail WHERE assessment_id = $1))
                      BETWEEN sc.min_score AND sc.max_score
                LIMIT 1
            ),
            status = (
                CASE
                    WHEN (90 - (SELECT COALESCE(SUM(error_count), 0) FROM assessment_detail WHERE assessment_id = $1)) >= 65
                    THEN 'LANJUT'
                    ELSE 'ULANG'
                END
            )
        WHERE assessment_id = $1;
      `;
      await client.query(updateScoreQuery, [newAssessmentId]);
      console.log('Backend: Assessment scores, predicate, and status updated directly.');

      await client.query('COMMIT');
      console.log('Backend: Transaction committed for createAssessment.');

      res.status(201).json({
        success: true,
        message: 'Assessment created and processed successfully',
        data: { id: newAssessmentId }
      });

    } catch (err) {
      await client.query('ROLLBACK');
      console.error('********************************************************');
      console.error('BACKEND ERROR DURING ASSESSMENT CREATION:', err.message);
      console.error('Stack Trace:', err.stack);
      console.error('Received Payload (for context):', req.body);
      console.error('********************************************************');
      res.status(500).json({
        success: false,
        message: 'Error creating assessment on the server.',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    } finally {
      client.release();
      console.log('Backend: Database client released after createAssessment.');
    }
  },

  updateAssessment: async (req, res) => {
    const assessmentId = parseInt(req.params.id, 10);
    const { chapter_id, assessor_name, assessment_date, notes, details } = req.body;

    console.log(`Backend: Received payload for updateAssessment (ID: ${assessmentId}):`, req.body);

    if (isNaN(assessmentId)) {
        return res.status(400).json({ success: false, message: 'Invalid Assessment ID.' });
    }
    if (!chapter_id || !assessor_name || !assessment_date) {
      console.error('Backend: Missing required fields for update (chapter_id, assessor_name, assessment_date)');
      return res.status(400).json({
        success: false,
        message: 'Chapter ID, Assessor Name, and Assessment Date are required for update.'
      });
    }
    if (!Array.isArray(details)) {
      console.error('Backend: Details must be an array for update.');
      return res.status(400).json({
        success: false,
        message: 'Assessment details must be an array for update.'
      });
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      console.log(`Backend: Transaction started for updateAssessment (ID: ${assessmentId}).`);

      const assessmentUpdateQuery = `
        UPDATE assessment 
        SET chapter_id = $1, assessment_date = $2, assessor_name = $3, notes = $4 
        WHERE assessment_id = $5
        RETURNING assessment_id; 
      `;
      const assessmentUpdateValues = [chapter_id, assessment_date, assessor_name, notes || null, assessmentId];
      const assessmentUpdateResult = await client.query(assessmentUpdateQuery, assessmentUpdateValues);

      if (assessmentUpdateResult.rowCount === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(404).json({ success: false, message: 'Assessment not found for update.' });
      }
      console.log(`Backend: Assessment record (ID: ${assessmentId}) updated.`);

      await client.query('DELETE FROM ASSESSMENT_DETAIL WHERE assessment_id = $1', [assessmentId]);
      console.log(`Backend: Existing details deleted for assessment_id: ${assessmentId}.`);

      if (details.length > 0) {
        for (const detail of details) {
          if (typeof detail.sub_aspect_id === 'undefined' || typeof detail.error_count === 'undefined') {
            console.error('Backend: Invalid detail item during update:', detail);
            throw new Error('Each detail item must have sub_aspect_id and error_count.');
          }
          const detailQuery = `
            INSERT INTO ASSESSMENT_DETAIL (assessment_id, sub_aspect_id, error_count)
            VALUES ($1, $2, $3);
          `;
          await client.query(detailQuery, [assessmentId, detail.sub_aspect_id, detail.error_count]);
        }
        console.log(`Backend: New assessment details inserted for assessment_id: ${assessmentId}.`);
      } else {
        console.log(`Backend: No details provided in update payload for assessment_id: ${assessmentId}. Scores will be based on 0 errors.`);
      }
      
      // In updateAssessment, you had `await client.query(EXECUTE update_assessment(${assessmentId});`);
      // Replacing with direct query similar to createAssessment
      console.log(`Backend: Updating scores directly for assessment_id: ${assessmentId}`);
      const updateScoreQuery = `
        UPDATE assessment
        SET
            total_score = (
                SELECT 90 - COALESCE(SUM(error_count), 0)
                FROM assessment_detail
                WHERE assessment_id = $1
            ),
            predicate = (
                SELECT category_name
                FROM score_category sc
                WHERE (90 - (SELECT COALESCE(SUM(error_count), 0) FROM assessment_detail WHERE assessment_id = $1))
                      BETWEEN sc.min_score AND sc.max_score
                LIMIT 1
            ),
            status = (
                CASE
                    WHEN (90 - (SELECT COALESCE(SUM(error_count), 0) FROM assessment_detail WHERE assessment_id = $1)) >= 65
                    THEN 'LANJUT'
                    ELSE 'ULANG'
                END
            )
        WHERE assessment_id = $1;
      `;
      await client.query(updateScoreQuery, [assessmentId]);
      console.log(`Backend: Assessment scores, predicate, and status updated for assessment_id: ${assessmentId}.`);


      await client.query('COMMIT');
      console.log(`Backend: Transaction committed for updateAssessment (ID: ${assessmentId}).`);

      const updatedDataResult = await client.query(`
          SELECT a.assessment_id AS id, a.assessment_date, a.assessor_name, a.status, a.notes, 
                 a.total_score, a.predicate, c.chapter_id, c.chapter_name, c.project_name
          FROM assessment a
          JOIN chapter c ON a.chapter_id = c.chapter_id
          WHERE a.assessment_id = $1
        `, [assessmentId]);


      res.status(200).json({
        success: true,
        message: 'Assessment updated and processed successfully',
        data: updatedDataResult.rows[0] 
      });

    } catch (err) {
      await client.query('ROLLBACK');
      console.error('********************************************************');
      console.error(`BACKEND ERROR DURING ASSESSMENT UPDATE (ID: ${assessmentId}):`, err.message);
      console.error('Stack Trace:', err.stack);
      console.error('Received Payload (for context):', req.body);
      console.error('********************************************************');
      res.status(500).json({
        success: false,
        message: 'Error updating assessment on the server.',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    } finally {
      client.release();
      console.log(`Backend: Database client released after updateAssessment (ID: ${assessmentId}).`);
    }
  },

  deleteAssessment: async (req, res) => {
    const assessmentId = parseInt(req.params.id, 10);
    console.log(`Backend: Attempting to delete assessment_id: ${assessmentId}`);

    if (isNaN(assessmentId)) {
        return res.status(400).json({ success: false, message: 'Invalid Assessment ID.' });
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      console.log(`Backend: Transaction started for deleteAssessment (ID: ${assessmentId}).`);

      const deleteDetailsResult = await client.query('DELETE FROM ASSESSMENT_DETAIL WHERE assessment_id = $1', [assessmentId]);
      console.log(`Backend: Deleted ${deleteDetailsResult.rowCount} details for assessment_id: ${assessmentId}.`);

      const deleteAssessmentResult = await client.query('DELETE FROM ASSESSMENT WHERE assessment_id = $1 RETURNING *', [assessmentId]);

      if (deleteAssessmentResult.rowCount === 0) {
        await client.query('ROLLBACK'); 
        client.release();
        return res.status(404).json({ success: false, message: 'Assessment not found for deletion.' });
      }
      console.log(`Backend: Assessment record (ID: ${assessmentId}) deleted.`);

      await client.query('COMMIT');
      console.log(`Backend: Transaction committed for deleteAssessment (ID: ${assessmentId}).`);

      res.status(200).json({ success: true, message: 'Assessment deleted successfully' });

    } catch (err) {
      await client.query('ROLLBACK');
      console.error('********************************************************');
      console.error(`BACKEND ERROR DURING ASSESSMENT DELETION (ID: ${assessmentId}):`, err.message);
      console.error('Stack Trace:', err.stack);
      console.error('********************************************************');
      res.status(500).json({
        success: false,
        message: 'Error deleting assessment on the server.',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    } finally {
      client.release();
      console.log(`Backend: Database client released after deleteAssessment (ID: ${assessmentId}).`);
    }
  },

  calculateAssessmentScore: async (req, res) => {
    const assessmentId = parseInt(req.params.id, 10);
    if (isNaN(assessmentId)) {
        return res.status(400).json({ success: false, message: 'Invalid Assessment ID.' });
    }
    console.log(`Backend: Explicitly calculating score for assessment_id: ${assessmentId}`);
    
    const client = await db.connect(); // Use a client for transaction if needed, or direct db.query
    try {
      const checkResult = await client.query('SELECT 1 FROM assessment WHERE assessment_id = $1', [assessmentId]);
      if (checkResult.rowCount === 0) {
          return res.status(404).json({ success: false, message: 'Assessment not found for score calculation.' });
      }

      console.log(`Backend: Updating scores directly for assessment_id: ${assessmentId}`); // Corrected variable name
      const updateScoreQuery = `
        UPDATE assessment
        SET
            total_score = (
                SELECT 90 - COALESCE(SUM(error_count), 0)
                FROM assessment_detail
                WHERE assessment_id = $1
            ),
            predicate = (
                SELECT category_name
                FROM score_category sc
                WHERE (90 - (SELECT COALESCE(SUM(error_count), 0) FROM assessment_detail WHERE assessment_id = $1))
                      BETWEEN sc.min_score AND sc.max_score
                LIMIT 1
            ),
            status = (
                CASE
                    WHEN (90 - (SELECT COALESCE(SUM(error_count), 0) FROM assessment_detail WHERE assessment_id = $1)) >= 65
                    THEN 'LANJUT'
                    ELSE 'ULANG'
                END
            )
        WHERE assessment_id = $1;
      `;
      await client.query(updateScoreQuery, [assessmentId]); // Corrected variable name
      console.log('Backend: Assessment scores, predicate, and status updated directly.');
      
      const updatedAssessment = await client.query('SELECT assessment_id, total_score, predicate, status FROM assessment WHERE assessment_id = $1', [assessmentId]);
      res.status(200).json({
        success: true,
        message: 'Assessment score calculated and updated successfully',
        data: updatedAssessment.rows[0]
      });
    } catch (err) {
      console.error(`Backend: Error calculating score for assessment_id ${assessmentId}:`, err);
      res.status(500).json({ success: false, message: 'Error calculating score', error: err.message });
    } finally {
        if (client) client.release();
    }
  },

  getAssessmentById: async (req, res) => {
    const assessmentId = parseInt(req.params.id, 10);
    if (isNaN(assessmentId)) {
        return res.status(400).json({ success: false, message: 'Invalid Assessment ID.' });
    }
    console.log(`Backend: Fetching assessment by ID: ${assessmentId}`);
    try {
      const assessmentQuery = `
        SELECT a.assessment_id, a.chapter_id, a.assessment_date, a.assessor_name, a.status, a.notes, 
               a.total_score, a.predicate, 
               c.chapter_name, c.project_name, c.no as chapter_no, c.weight as chapter_weight 
        FROM assessment a 
        JOIN chapter c ON a.chapter_id = c.chapter_id 
        WHERE a.assessment_id = $1;
      `;
      const assessmentResult = await db.query(assessmentQuery, [assessmentId]);

      if (assessmentResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
      }
      const assessmentHeader = assessmentResult.rows[0];

      const detailsQuery = `
        SELECT 
            p.parameter_id AS "parameterId", 
            p.parameter_name AS "parameterName",
            a.aspect_id AS "aspectId", 
            a.aspect_name AS "aspectName",
            sa.sub_aspect_id AS "subAspectId", 
            sa.sub_aspect_name AS "subAspectName",
            ad.error_count AS "errorCount",
            ad.detail_id AS "detailId"
        FROM assessment_parameter p
        JOIN aspect a ON p.parameter_id = a.parameter_id
        JOIN sub_aspect sa ON a.aspect_id = sa.aspect_id
        LEFT JOIN assessment_detail ad ON sa.sub_aspect_id = ad.sub_aspect_id AND ad.assessment_id = $1
        ORDER BY p.parameter_id, a.aspect_id, sa.sub_aspect_id;
      `;
      const detailsResult = await db.query(detailsQuery, [assessmentId]);

      const parametersMap = new Map();
      detailsResult.rows.forEach(row => {
        if (!parametersMap.has(row.parameterId)) {
          parametersMap.set(row.parameterId, {
            parameter_id: row.parameterId, // Keep original key for consistency if needed
            parameter_name: row.parameterName,
            total_errors: 0, 
            aspects: new Map()
          });
        }
        const currentParam = parametersMap.get(row.parameterId);

        if (!currentParam.aspects.has(row.aspectId)) {
          currentParam.aspects.set(row.aspectId, {
            aspect_id: row.aspectId, // Keep original key
            aspect_name: row.aspectName,
            sub_aspects: []
          });
        }
        const currentAspect = currentParam.aspects.get(row.aspectId);
        currentAspect.sub_aspects.push({
          sub_aspect_id: row.subAspectId, 
          sub_aspect_name: row.subAspectName, 
          error_count: row.errorCount === null ? 0 : row.errorCount, 
          detail_id: row.detailId 
        });
      });

      const structuredParameters = Array.from(parametersMap.values()).map(param => ({
        ...param,
        aspects: Array.from(param.aspects.values())
      }));
      
      structuredParameters.forEach(param => {
        param.total_errors = param.aspects.reduce((sum, aspect) => {
            return sum + aspect.sub_aspects.reduce((aspectSum, sub) => aspectSum + (sub.error_count || 0), 0);
        }, 0);
      });

      const responseData = {
        header: {
            id: assessmentHeader.assessment_id, // Ensure frontend receives 'id'
            ...assessmentHeader // Spread the rest of header properties
        },
        parameters: structuredParameters
      };

      res.status(200).json({ success: true, data: responseData });

    } catch (err) {
      console.error(`Backend: Error retrieving assessment ${assessmentId}:`, err);
      res.status(500).json({ success: false, message: 'Error retrieving assessment', error: err.message });
    }
  }
};

module.exports = assessmentController;