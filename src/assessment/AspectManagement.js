// src/assessment/AspectManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../AspectManagement.css'; // We will create this CSS file next

// Centralized fetch utility - ensure this matches the one in AssessmentForm.js
const fetchApi = async (url, options = {}) => {
  const token = localStorage.getItem('token'); // Assuming token is stored
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(response.statusText || 'An API error occurred');
    }
    throw new Error(errorData?.message || response.statusText || 'An API error occurred');
  }
  return response.json();
};

const DUMMY_API_BASE_URL = 'http://localhost:3000/api'; // Ensure this matches your backend URL

const AspectManagement = ({ user, setLoading, setError }) => {
  const navigate = useNavigate();
  const [parameters, setParameters] = useState([]); // To display the full structure, including aspects
  const [editingAspect, setEditingAspect] = useState(null); // { id, name, parameter_id } when editing
  const [newAspectName, setNewAspectName] = useState('');
  const [newAspectParameterId, setNewAspectParameterId] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Client-side role check
  const isAdmin = user && user.role === 'admin';

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      setError('Access denied. Only administrators can manage aspects.');
      navigate('/dashboard'); // Or navigate to a forbidden page/login
    }
  }, [isAdmin, navigate, setError]);

  const fetchParametersAndAspects = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError('');
    try {
      // Fetch the full parameter/aspect/sub-aspect structure
      const data = await fetchApi(`${DUMMY_API_BASE_URL}/parameters`);
      setParameters(data.data || []);
    } catch (err) {
      setError(`Failed to fetch assessment structure: ${err.message}`);
      console.error('Error fetching assessment structure for AspectManagement:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, setLoading, setError]);

  useEffect(() => {
    fetchParametersAndAspects();
  }, [fetchParametersAndAspects]);

  const validateForm = () => {
    const errors = {};
    if (!newAspectName.trim()) {
      errors.name = 'Aspect name is required.';
    }
    if (!newAspectParameterId) {
      errors.parameter = 'Parent parameter is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAspect = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // Double check authorization
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const payload = {
        parameter_id: parseInt(newAspectParameterId, 10),
        aspect_name: newAspectName.trim(),
      };
      await fetchApi(`${DUMMY_API_BASE_URL}/parameters/aspects`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setError('Aspect created successfully!'); // Use setError for success messages too
      setNewAspectName('');
      setNewAspectParameterId('');
      setFormErrors({});
      fetchParametersAndAspects(); // Re-fetch to update the list
    } catch (err) {
      setError(`Error creating aspect: ${err.message}`);
      console.error('Error creating aspect:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (aspect) => {
    setEditingAspect({
      id: aspect.id,
      name: aspect.name,
      parameter_id: aspect.parameter_id.toString(), // Convert to string for select value
    });
    setNewAspectName(aspect.name); // Pre-fill the form for editing
    setNewAspectParameterId(aspect.parameter_id.toString());
    setFormErrors({}); // Clear any previous form errors
  };

  const handleUpdateAspect = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editingAspect) return;
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const payload = {
        parameter_id: parseInt(newAspectParameterId, 10),
        aspect_name: newAspectName.trim(),
      };
      await fetchApi(`${DUMMY_API_BASE_URL}/parameters/aspects/${editingAspect.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setError('Aspect updated successfully!');
      setEditingAspect(null); // Exit edit mode
      setNewAspectName('');
      setNewAspectParameterId('');
      setFormErrors({});
      fetchParametersAndAspects(); // Re-fetch to update the list
    } catch (err) {
      setError(`Error updating aspect: ${err.message}`);
      console.error('Error updating aspect:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAspect = async (aspectId) => {
    if (!isAdmin || !window.confirm('Are you sure you want to delete this aspect? This will also delete its sub-aspects!')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      await fetchApi(`${DUMMY_API_BASE_URL}/parameters/aspects/${aspectId}`, {
        method: 'DELETE',
      });
      setError('Aspect deleted successfully!');
      fetchParametersAndAspects(); // Re-fetch to update the list
    } catch (err) {
      setError(`Error deleting aspect: ${err.message}`);
      console.error('Error deleting aspect:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAspect(null);
    setNewAspectName('');
    setNewAspectParameterId('');
    setFormErrors({});
  };

  if (!isAdmin) {
    return <div className="aspect-management-container"><h3>Access Denied</h3><p>You do not have permission to view this page.</p></div>;
  }

  return (
    <div className="aspect-management-container">
      <div className="aspect-management-header">
        <h2>Aspect Management</h2>
        <p>Manage the aspects within your assessment parameters.</p>
      </div>

      <div className="aspect-form-section">
        <h3>{editingAspect ? 'Edit Aspect' : 'Create New Aspect'}</h3>
        <form onSubmit={editingAspect ? handleUpdateAspect : handleCreateAspect} className="aspect-form">
          <div className="form-group">
            <label htmlFor="aspectName">Aspect Name:</label>
            <input
              type="text"
              id="aspectName"
              value={newAspectName}
              onChange={(e) => {
                setNewAspectName(e.target.value);
                if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
              }}
              className={formErrors.name ? 'input-error' : ''}
              placeholder="e.g., Penguasaan Materi"
              required
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="parentParameter">Parent Parameter:</label>
            <select
              id="parentParameter"
              value={newAspectParameterId}
              onChange={(e) => {
                setNewAspectParameterId(e.target.value);
                if (formErrors.parameter) setFormErrors(prev => ({ ...prev, parameter: '' }));
              }}
              className={formErrors.parameter ? 'input-error' : ''}
              required
            >
              <option value="">Select a Parameter</option>
              {parameters.map((param) => (
                <option key={param.id} value={param.id}>
                  {param.name}
                </option>
              ))}
            </select>
            {formErrors.parameter && <span className="error-message">{formErrors.parameter}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingAspect ? 'Update Aspect' : 'Create Aspect'}
            </button>
            {editingAspect && (
              <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="aspect-list-section">
        <h3>Existing Aspects</h3>
        {parameters.length === 0 ? (
          <p>No parameters or aspects found. Please add a parameter first.</p>
        ) : (
          <ul className="aspect-list">
            {parameters.map(parameter => (
              <li key={parameter.id} className="parameter-item">
                <h4 className="parameter-name">Parameter: {parameter.name}</h4>
                {parameter.aspects && parameter.aspects.length > 0 ? (
                  <ul className="sub-aspect-list">
                    {parameter.aspects.map(aspect => (
                      <li key={aspect.id} className="aspect-item">
                        <span className="aspect-name">{aspect.name}</span>
                        <div className="aspect-actions">
                          <button onClick={() => handleEditClick(aspect)} className="edit-btn">Edit</button>
                          <button onClick={() => handleDeleteAspect(aspect.id)} className="delete-btn">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-aspects-message">No aspects defined for this parameter.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AspectManagement;