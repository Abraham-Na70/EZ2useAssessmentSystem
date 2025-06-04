// File: app/controllers/parameterController.js
const db = require('../config/db');

const parameterController = {
  // --- Existing Parameter Functions ---
  getAllParameters: async (req, res) => {
    try {
      const parametersResult = await db.query(
        'SELECT parameter_id AS id, parameter_name AS name FROM assessment_parameter ORDER BY parameter_id'
      );
      const aspectsResult = await db.query(
        'SELECT aspect_id AS id, parameter_id, aspect_name AS name FROM aspect ORDER BY parameter_id, aspect_id' // Order by parameter_id as well
      );
      const subAspectsResult = await db.query(
        'SELECT sub_aspect_id AS id, aspect_id, sub_aspect_name AS name FROM sub_aspect ORDER BY aspect_id, sub_aspect_id' // Order by aspect_id as well
      );

      const parameters = parametersResult.rows;
      const aspects = aspectsResult.rows;
      const subAspects = subAspectsResult.rows;

      const aspectsMap = {};
      aspects.forEach(aspect => {
        aspectsMap[aspect.id] = { ...aspect, sub_aspects: [] };
      });

      subAspects.forEach(subAspect => {
        if (aspectsMap[subAspect.aspect_id]) {
          aspectsMap[subAspect.aspect_id].sub_aspects.push({
            id: subAspect.id,
            name: subAspect.name
          });
        }
      });

      const structuredParameters = parameters.map(parameter => {
        const parameterAspects = Object.values(aspectsMap).filter(
          aspect => aspect.parameter_id === parameter.id
        );
        return { ...parameter, aspects: parameterAspects };
      });

      res.status(200).json({ success: true, data: structuredParameters });
    } catch (err) {
      console.error('Error fetching assessment structure:', err);
      res.status(500).json({
        success: false,
        message: 'Error fetching assessment parameters structure',
        error: err.message
      });
    }
  },

  createParameter: async (req, res) => {
    const { parameter_name } = req.body;
    if (!parameter_name) {
        return res.status(400).json({ success: false, message: 'Parameter name is required.' });
    }
    try {
      const result = await db.query(
        'INSERT INTO assessment_parameter (parameter_name) VALUES ($1) RETURNING parameter_id, parameter_name',
        [parameter_name]
      );
      const newParam = result.rows[0];
      res.status(201).json({
        success: true,
        data: {
          id: newParam.parameter_id,
          name: newParam.parameter_name
        }
      });
    } catch (err) {
      console.error('Error creating parameter:', err);
      if (err.code === '23505') { // Unique violation
        return res.status(409).json({ success: false, message: 'Parameter name already exists.', error: err.message });
      }
      res.status(500).json({ success: false, message: 'Error creating parameter', error: err.message });
    }
  },

  // --- NEW: Update Parameter Function (Admin only) ---
  updateParameter: async (req, res) => {
    const { parameterId } = req.params; // Get ID from URL params
    const { parameter_name } = req.body; // New name from request body

    if (!parameter_name) {
      return res.status(400).json({ success: false, message: 'Parameter name is required for update.' });
    }

    try {
      const result = await db.query(
        'UPDATE assessment_parameter SET parameter_name = $1 WHERE parameter_id = $2 RETURNING parameter_id, parameter_name',
        [parameter_name, parameterId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Parameter not found for update.' });
      }
      const updatedParam = result.rows[0];
      res.status(200).json({
        success: true,
        data: {
          id: updatedParam.parameter_id,
          name: updatedParam.parameter_name
        }
      });
    } catch (err) {
      console.error(`Error updating parameter ${parameterId}:`, err);
      if (err.code === '23505') { // Unique violation
        return res.status(409).json({ success: false, message: 'Parameter name already exists.', error: err.message });
      }
      res.status(500).json({ success: false, message: 'Error updating parameter', error: err.message });
    }
  },

  // --- NEW: Delete Parameter Function (Admin only) ---
  deleteParameter: async (req, res) => {
    const { parameterId } = req.params; // Get ID from URL params
    const client = await db.connect(); // Use a transaction for safety
    try {
      await client.query('BEGIN');

      // Check if the parameter has any associated aspects
      const aspectsCheck = await client.query('SELECT 1 FROM aspect WHERE parameter_id = $1 LIMIT 1', [parameterId]);
      if (aspectsCheck.rowCount > 0) {
        await client.query('ROLLBACK'); // Rollback the transaction
        client.release();
        return res.status(400).json({ success: false, message: 'Cannot delete parameter. It has associated aspects. Please delete all child aspects first.' });
      }

      // If no aspects, proceed with deletion
      const result = await client.query('DELETE FROM assessment_parameter WHERE parameter_id = $1 RETURNING parameter_id', [parameterId]);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK'); // Rollback if not found
        client.release();
        return res.status(404).json({ success: false, message: 'Parameter not found for deletion.' });
      }

      await client.query('COMMIT'); // Commit the transaction
      res.status(200).json({ success: true, message: 'Parameter deleted successfully.', data: { id: result.rows[0].parameter_id } });
    } catch (err) {
      await client.query('ROLLBACK'); // Ensure rollback on any error
      console.error(`Error deleting parameter ${parameterId}:`, err);
      res.status(500).json({ success: false, message: 'Error deleting parameter', error: err.message });
    } finally {
      if (client) client.release(); // Always release the client
    }
  },

  // --- Existing Aspect CRUD Functions (Admin only) ---
  createAspect: async (req, res) => {
    const { parameter_id, aspect_name } = req.body;
    if (!parameter_id || !aspect_name) {
      return res.status(400).json({ success: false, message: 'Parameter ID and Aspect Name are required.' });
    }
    try {
      // Check if parameter_id exists
      const paramExists = await db.query('SELECT 1 FROM assessment_parameter WHERE parameter_id = $1', [parameter_id]);
      if (paramExists.rowCount === 0) {
          return res.status(404).json({ success: false, message: 'Parent parameter not found.' });
      }

      const result = await db.query(
        'INSERT INTO aspect (parameter_id, aspect_name) VALUES ($1, $2) RETURNING aspect_id, parameter_id, aspect_name',
        [parameter_id, aspect_name]
      );
      const newAspect = result.rows[0];
      res.status(201).json({
        success: true,
        data: {
            id: newAspect.aspect_id,
            parameter_id: newAspect.parameter_id,
            name: newAspect.aspect_name
        }
      });
    } catch (err) {
      console.error('Error creating aspect:', err);
      // Add unique constraint check if you add one for aspect_name within a parameter_id
      res.status(500).json({ success: false, message: 'Error creating aspect', error: err.message });
    }
  },

  updateAspect: async (req, res) => {
    const { aspectId } = req.params;
    const { aspect_name, parameter_id } = req.body; // Allow changing parent parameter if needed

    if (!aspect_name) {
      return res.status(400).json({ success: false, message: 'Aspect name is required.' });
    }
    if (parameter_id) { // If parameter_id is being updated, check if it exists
        const paramExists = await db.query('SELECT 1 FROM assessment_parameter WHERE parameter_id = $1', [parameter_id]);
        if (paramExists.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'New parent parameter not found.' });
        }
    }

    try {
      const currentAspect = await db.query('SELECT parameter_id FROM aspect WHERE aspect_id = $1', [aspectId]);
      if (currentAspect.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Aspect not found.' });
      }

      const finalParameterId = parameter_id || currentAspect.rows[0].parameter_id;

      const result = await db.query(
        'UPDATE aspect SET aspect_name = $1, parameter_id = $2 WHERE aspect_id = $3 RETURNING aspect_id, parameter_id, aspect_name',
        [aspect_name, finalParameterId, aspectId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Aspect not found (concurrent update/delete?).' });
      }
      const updatedAspect = result.rows[0];
      res.status(200).json({
        success: true,
        data: {
            id: updatedAspect.aspect_id,
            parameter_id: updatedAspect.parameter_id,
            name: updatedAspect.aspect_name
        }
      });
    } catch (err) {
      console.error(`Error updating aspect ${aspectId}:`, err);
      res.status(500).json({ success: false, message: 'Error updating aspect', error: err.message });
    }
  },

  deleteAspect: async (req, res) => {
    const { aspectId } = req.params;
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      // Check if aspect has sub_aspects
      const subAspectCheck = await client.query('SELECT 1 FROM sub_aspect WHERE aspect_id = $1 LIMIT 1', [aspectId]);
      if (subAspectCheck.rowCount > 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json({ success: false, message: 'Cannot delete aspect. It has associated sub-aspects. Delete them first.' });
      }

      const result = await client.query('DELETE FROM aspect WHERE aspect_id = $1 RETURNING aspect_id', [aspectId]);
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(404).json({ success: false, message: 'Aspect not found.' });
      }
      await client.query('COMMIT');
      res.status(200).json({ success: true, message: 'Aspect deleted successfully.', data: { id: result.rows[0].aspect_id } });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Error deleting aspect ${aspectId}:`, err);
      res.status(500).json({ success: false, message: 'Error deleting aspect', error: err.message });
    } finally {
      if (client) client.release();
    }
  },

  // --- Existing Sub-Aspect CRUD Functions (Admin & Assessor) ---
  createSubAspect: async (req, res) => {
    const { aspect_id, sub_aspect_name } = req.body;
    if (!aspect_id || !sub_aspect_name) {
      return res.status(400).json({ success: false, message: 'Aspect ID and Sub-Aspect Name are required.' });
    }
    try {
      // Check if aspect_id exists
      const aspectExists = await db.query('SELECT 1 FROM aspect WHERE aspect_id = $1', [aspect_id]);
      if (aspectExists.rowCount === 0) {
          return res.status(404).json({ success: false, message: 'Parent aspect not found.' });
      }

      const result = await db.query(
        'INSERT INTO sub_aspect (aspect_id, sub_aspect_name) VALUES ($1, $2) RETURNING sub_aspect_id, aspect_id, sub_aspect_name',
        [aspect_id, sub_aspect_name]
      );
      const newSubAspect = result.rows[0];
      res.status(201).json({
        success: true,
        data: {
            id: newSubAspect.sub_aspect_id,
            aspect_id: newSubAspect.aspect_id,
            name: newSubAspect.sub_aspect_name
        }
      });
    } catch (err) {
      console.error('Error creating sub-aspect:', err);
      res.status(500).json({ success: false, message: 'Error creating sub-aspect', error: err.message });
    }
  },

  updateSubAspect: async (req, res) => {
    const { subAspectId } = req.params;
    const { sub_aspect_name, aspect_id } = req.body; // Allow changing parent aspect if needed

    if (!sub_aspect_name) {
      return res.status(400).json({ success: false, message: 'Sub-aspect name is required.' });
    }
    if (aspect_id) { // If aspect_id is being updated, check if it exists
        const aspectExists = await db.query('SELECT 1 FROM aspect WHERE aspect_id = $1', [aspect_id]);
        if (aspectExists.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'New parent aspect not found.' });
        }
    }

    try {
      const currentSubAspect = await db.query('SELECT aspect_id FROM sub_aspect WHERE sub_aspect_id = $1', [subAspectId]);
      if (currentSubAspect.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Sub-aspect not found.' });
      }
      const finalAspectId = aspect_id || currentSubAspect.rows[0].aspect_id;

      const result = await db.query(
        'UPDATE sub_aspect SET sub_aspect_name = $1, aspect_id = $2 WHERE sub_aspect_id = $3 RETURNING sub_aspect_id, aspect_id, sub_aspect_name',
        [sub_aspect_name, finalAspectId, subAspectId]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Sub-aspect not found (concurrent update/delete?).' });
      }
      const updatedSubAspect = result.rows[0];
      res.status(200).json({
        success: true,
        data: {
            id: updatedSubAspect.sub_aspect_id,
            aspect_id: updatedSubAspect.aspect_id,
            name: updatedSubAspect.sub_aspect_name
        }
      });
    } catch (err) {
      console.error(`Error updating sub-aspect ${subAspectId}:`, err);
      res.status(500).json({ success: false, message: 'Error updating sub-aspect', error: err.message });
    }
  },

  deleteSubAspect: async (req, res) => {
    const { subAspectId } = req.params;
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      // Check if sub_aspect is used in assessment_detail
      const detailCheck = await client.query('SELECT 1 FROM assessment_detail WHERE sub_aspect_id = $1 LIMIT 1', [subAspectId]);
      if (detailCheck.rowCount > 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json({ success: false, message: 'Cannot delete sub-aspect. It is used in existing assessments.' });
      }

      const result = await client.query('DELETE FROM sub_aspect WHERE sub_aspect_id = $1 RETURNING sub_aspect_id', [subAspectId]);
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(404).json({ success: false, message: 'Sub-aspect not found.' });
      }
      await client.query('COMMIT');
      res.status(200).json({ success: true, message: 'Sub-aspect deleted successfully.', data: { id: result.rows[0].sub_aspect_id } });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Error deleting sub-aspect ${subAspectId}:`, err);
      res.status(500).json({ success: false, message: 'Error deleting sub-aspect', error: err.message });
    } finally {
      if(client) client.release();
    }
  }
};

module.exports = parameterController;