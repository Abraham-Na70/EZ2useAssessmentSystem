// src/assessment/SubAspectManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../SubAspectManagement.css'; // We will create this CSS file next

// Centralized fetch utility - ensure this matches the one in AssessmentForm.js
const fetchApi = async (url, options = {}) => {
  const token = localStorage.getItem('token');
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

const SubAspectManagement = ({ user, setLoading, setError }) => {
  const navigate = useNavigate();
  const [parameters, setParameters] = useState([]); // Full structure to get aspects
  const [aspectsForDropdown, setAspectsForDropdown] = useState([]); // Flattened list for the dropdown
  const [editingSubAspect, setEditingSubAspect] = useState(null); // { id, name, aspect_id } when editing
  const [newSubAspectName, setNewSubAspectName] = useState('');
  const [newSubAspectParentAspectId, setNewSubAspectParentAspectId] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Client-side role check (Assessor or Admin)
  const isAuthorized = user && (user.role === 'admin' || user.role === 'assessor');

  // Redirect if not authorized
  useEffect(() => {
    if (!isAuthorized) {
      setError('Access denied. Only assessors or administrators can manage sub-aspects.');
      navigate('/dashboard'); // Or navigate to a forbidden page/login
    }
  }, [isAuthorized, navigate, setError]);

  const fetchParametersAndSubAspects = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchApi(`${DUMMY_API_BASE_URL}/parameters`);
      setParameters(data.data || []);

      // Flatten parameters and aspects to create a list suitable for the parent aspect dropdown
      const flattenedAspects = [];
      data.data.forEach(param => {
        if (param.aspects) {
          param.aspects.forEach(aspect => {
            flattenedAspects.push({
              id: aspect.id,
              name: `${param.name} > ${aspect.name}`, // Display hierarchical path
              parameter_id: param.id // Keep parameter_id for context
            });
          });
        }
      });
      setAspectsForDropdown(flattenedAspects);

    } catch (err) {
      setError(`Failed to fetch assessment structure for sub-aspects: ${err.message}`);
      console.error('Error fetching assessment structure for SubAspectManagement:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, setLoading, setError]);

  useEffect(() => {
    fetchParametersAndSubAspects();
  }, [fetchParametersAndSubAspects]);

  const validateForm = () => {
    const errors = {};
    if (!newSubAspectName.trim()) {
      errors.name = 'Sub-Aspect name is required.';
    }
    if (!newSubAspectParentAspectId) {
      errors.parentAspect = 'Parent aspect is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubAspect = async (e) => {
    e.preventDefault();
    if (!isAuthorized) return;
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const payload = {
        aspect_id: parseInt(newSubAspectParentAspectId, 10),
        sub_aspect_name: newSubAspectName.trim(),
      };
      await fetchApi(`${DUMMY_API_BASE_URL}/parameters/subaspects`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setError('Sub-Aspect created successfully!');
      setNewSubAspectName('');
      setNewSubAspectParentAspectId('');
      setFormErrors({});
      fetchParametersAndSubAspects(); // Re-fetch to update the list
    } catch (err) {
      setError(`Error creating sub-aspect: ${err.message}`);
      console.error('Error creating sub-aspect:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (subAspect) => {
    setEditingSubAspect({
      id: subAspect.id,
      name: subAspect.name,
      aspect_id: subAspect.aspect_id.toString(), // Convert to string for select value
    });
    setNewSubAspectName(subAspect.name); // Pre-fill the form for editing
    setNewSubAspectParentAspectId(subAspect.aspect_id.toString());
    setFormErrors({}); // Clear any previous form errors
  };

  const handleUpdateSubAspect = async (e) => {
    e.preventDefault();
    if (!isAuthorized || !editingSubAspect) return;
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const payload = {
        aspect_id: parseInt(newSubAspectParentAspectId, 10),
        sub_aspect_name: newSubAspectName.trim(),
      };
      await fetchApi(`${DUMMY_API_BASE_URL}/parameters/subaspects/${editingSubAspect.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setError('Sub-Aspect updated successfully!');
      setEditingSubAspect(null); // Exit edit mode
      setNewSubAspectName('');
      setNewSubAspectParentAspectId('');
      setFormErrors({});
      fetchParametersAndSubAspects(); // Re-fetch to update the list
    } catch (err) {
      setError(`Error updating sub-aspect: ${err.message}`);
      console.error('Error updating sub-aspect:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubAspect = async (subAspectId) => {
    if (!isAuthorized || !window.confirm('Are you sure you want to delete this sub-aspect? This cannot be undone if it\'s associated with historical assessments.')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      await fetchApi(`${DUMMY_API_BASE_URL}/parameters/subaspects/${subAspectId}`, {
        method: 'DELETE',
      });
      setError('Sub-Aspect deleted successfully!');
      fetchParametersAndSubAspects(); // Re-fetch to update the list
    } catch (err) {
      setError(`Error deleting sub-aspect: ${err.message}`);
      console.error('Error deleting sub-aspect:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSubAspect(null);
    setNewSubAspectName('');
    setNewSubAspectParentAspectId('');
    setFormErrors({});
  };

  if (!isAuthorized) {
    return <div className="sub-aspect-management-container"><h3>Access Denied</h3><p>You do not have permission to view this page.</p></div>;
  }

  return (
    <div className="sub-aspect-management-container">
      <div className="sub-aspect-management-header">
        <h2>Sub-Aspect Management</h2>
        <p>Manage the granular sub-aspects used in assessments.</p>
      </div>

      <div className="sub-aspect-form-section">
        <h3>{editingSubAspect ? 'Edit Sub-Aspect' : 'Create New Sub-Aspect'}</h3>
        <form onSubmit={editingSubAspect ? handleUpdateSubAspect : handleCreateSubAspect} className="sub-aspect-form">
          <div className="form-group">
            <label htmlFor="subAspectName">Sub-Aspect Name:</label>
            <input
              type="text"
              id="subAspectName"
              value={newSubAspectName}
              onChange={(e) => {
                setNewSubAspectName(e.target.value);
                if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
              }}
              className={formErrors.name ? 'input-error' : ''}
              placeholder="e.g., Pemahaman Konsep Dasar"
              required
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="parentAspect">Parent Aspect:</label>
            <select
              id="parentAspect"
              value={newSubAspectParentAspectId}
              onChange={(e) => {
                setNewSubAspectParentAspectId(e.target.value);
                if (formErrors.parentAspect) setFormErrors(prev => ({ ...prev, parentAspect: '' }));
              }}
              className={formErrors.parentAspect ? 'input-error' : ''}
              required
            >
              <option value="">Select a Parent Aspect</option>
              {aspectsForDropdown.map((aspect) => (
                <option key={aspect.id} value={aspect.id}>
                  {aspect.name}
                </option>
              ))}
            </select>
            {formErrors.parentAspect && <span className="error-message">{formErrors.parentAspect}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingSubAspect ? 'Update Sub-Aspect' : 'Create Sub-Aspect'}
            </button>
            {editingSubAspect && (
              <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="sub-aspect-list-section">
        <h3>Existing Sub-Aspects</h3>
        {parameters.length === 0 ? (
          <p>Loading assessment structure...</p>
        ) : (
          <ul className="sub-aspect-list-container">
            {parameters.map(parameter => (
              <li key={parameter.id} className="parameter-item">
                <h4 className="parameter-name">Parameter: {parameter.name}</h4>
                {parameter.aspects && parameter.aspects.length > 0 ? (
                  <ul className="aspects-list-nested">
                    {parameter.aspects.map(aspect => (
                      <li key={aspect.id} className="aspect-item-nested">
                        <h5 className="aspect-name">Aspect: {aspect.name}</h5>
                        {aspect.sub_aspects && aspect.sub_aspects.length > 0 ? (
                          <ul className="sub-aspect-list-inner">
                            {aspect.sub_aspects.map(subAspect => (
                              <li key={subAspect.id} className="sub-aspect-item">
                                <span className="sub-aspect-name">{subAspect.name}</span>
                                <div className="sub-aspect-actions">
                                  <button onClick={() => handleEditClick(subAspect)} className="edit-btn">Edit</button>
                                  <button onClick={() => handleDeleteSubAspect(subAspect.id)} className="delete-btn">Delete</button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="no-sub-aspects-message">No sub-aspects defined for this aspect.</p>
                        )}
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

export default SubAspectManagement;