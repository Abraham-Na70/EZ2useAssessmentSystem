// src/assessment/ParameterManagement.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../ParameterManagement.css'; // We will create this CSS file next

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

const ParameterManagement = ({ user, setLoading, setError }) => {
  const navigate = useNavigate();
  const [parameters, setParameters] = useState([]);
  const [newParameterName, setNewParameterName] = useState('');
  const [editingParameter, setEditingParameter] = useState(null); // { id, name } when editing
  const [formErrors, setFormErrors] = useState({});

  // Client-side role check
  const isAdmin = user && user.role === 'admin';

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      setError('Access denied. Only administrators can manage parameters.');
      navigate('/dashboard'); // Or navigate to a forbidden page/login
    }
  }, [isAdmin, navigate, setError]);

  const fetchParameters = useCallback(async () => {
    if (!isAdmin) return; // Only fetch if admin
    setLoading(true);
    setError('');
    try {
      // Use the existing getAllParameters endpoint for listing
      const data = await fetchApi(`${DUMMY_API_BASE_URL}/parameters`);
      setParameters(data.data || []);
    } catch (err) {
      setError(`Failed to fetch parameters: ${err.message}`);
      console.error('Error fetching parameters for ParameterManagement:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, setLoading, setError]);

  useEffect(() => {
    fetchParameters();
  }, [fetchParameters]);

  const validateForm = () => {
    const errors = {};
    if (!newParameterName.trim()) {
      errors.name = 'Parameter name is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateParameter = async (e) => {
    e.preventDefault();
    if (!isAdmin) return; // Double check authorization
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const payload = {
        parameter_name: newParameterName.trim(),
      };
      await fetchApi(`${DUMMY_API_BASE_URL}/parameters`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setError('Parameter created successfully!');
      setNewParameterName('');
      setFormErrors({});
      fetchParameters(); // Re-fetch to update the list
    } catch (err) {
      setError(`Error creating parameter: ${err.message}`);
      console.error('Error creating parameter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (param) => {
    setEditingParameter({ id: param.id, name: param.name });
    setNewParameterName(param.name); // Pre-fill the form for editing
    setFormErrors({}); // Clear any previous form errors
  };

  const handleUpdateParameter = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editingParameter) return;
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const payload = {
        parameter_name: newParameterName.trim(),
      };
      await fetchApi(`${DUMMY_API_BASE_URL}/parameters/${editingParameter.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setError('Parameter updated successfully!');
      setEditingParameter(null); // Exit edit mode
      setNewParameterName('');
      setFormErrors({});
      fetchParameters(); // Re-fetch to update the list
    } catch (err) {
      setError(`Error updating parameter: ${err.message}`);
      console.error('Error updating parameter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParameter = async (parameterId) => {
    if (!isAdmin || !window.confirm('Are you sure you want to delete this parameter? This will also delete ALL its associated aspects and sub-aspects! This action is IRREVERSIBLE if not handled carefully in the backend logic.')) {
      // NOTE: Your backend is already preventing deletion if aspects exist, which is good.
      // The frontend confirmation can be more generic or more specific.
      return;
    }

    setLoading(true);
    setError('');
    try {
      await fetchApi(`${DUMMY_API_BASE_URL}/parameters/${parameterId}`, {
        method: 'DELETE',
      });
      setError('Parameter deleted successfully!');
      fetchParameters(); // Re-fetch to update the list
    } catch (err) {
      setError(`Error deleting parameter: ${err.message}`);
      console.error('Error deleting parameter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingParameter(null);
    setNewParameterName('');
    setFormErrors({});
  };

  if (!isAdmin) {
    return <div className="parameter-management-container"><h3>Access Denied</h3><p>You do not have permission to view this page.</p></div>;
  }

  return (
    <div className="parameter-management-container">
      <div className="parameter-management-header">
        <h2>Parameter Management</h2>
        <p>Manage the top-level assessment parameters.</p>
      </div>

      <div className="parameter-form-section">
        <h3>{editingParameter ? 'Edit Parameter' : 'Create New Parameter'}</h3>
        <form onSubmit={editingParameter ? handleUpdateParameter : handleCreateParameter} className="parameter-form">
          <div className="form-group">
            <label htmlFor="parameterName">Parameter Name:</label>
            <input
              type="text"
              id="parameterName"
              value={newParameterName}
              onChange={(e) => {
                setNewParameterName(e.target.value);
                if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
              }}
              className={formErrors.name ? 'input-error' : ''}
              placeholder="e.g., Keterampilan Teknis"
              required
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingParameter ? 'Update Parameter' : 'Create Parameter'}
            </button>
            {editingParameter && (
              <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="parameter-list-section">
        <h3>Existing Parameters</h3>
        {parameters.length === 0 ? (
          <p>No parameters found.</p>
        ) : (
          <ul className="parameter-list">
            {parameters.map((param) => (
              <li key={param.id} className="parameter-item">
                <span className="parameter-name">{param.name}</span>
                <div className="parameter-actions">
                  <button onClick={() => handleEditClick(param)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDeleteParameter(param.id)} className="delete-btn">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ParameterManagement;