import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../AssessmentForm.css';

const AssessmentForm = ({ user, isEdit = false, setLoading, setError }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    chapter_id: '',
    notes: '',
    details: []
  });
  
  const [chapters, setChapters] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchChapters();
    fetchParameters();
    
    if (isEdit && id) {
      fetchAssessmentDetails();
    }
  }, [isEdit, id]);

  const fetchChapters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/assessments/data/chapters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }
      
      const data = await response.json();
      setChapters(data.data || []);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchParameters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/assessments/data/parameters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch parameters');
      }
      
      const data = await response.json();
      setParameters(data.data || []);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchAssessmentDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/assessments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assessment details');
      }
      
      const data = await response.json();
      
      // Map the retrieved data to our form structure
      const details = [];
      
      // Process each parameter and its sub-aspects
      data.data.parameters.forEach(parameter => {
        parameter.aspects.forEach(aspect => {
          aspect.sub_aspects.forEach(subAspect => {
            details.push({
              detail_id: subAspect.detail_id,
              sub_aspect_id: subAspect.sub_aspect_id,
              error_count: subAspect.error_count
            });
          });
        });
      });
      
      setFormData({
        chapter_id: data.data.header.chapter_id.toString(),
        notes: data.data.header.notes || '',
        details
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleErrorCountChange = (subAspectId, value) => {
    // Validate that the value is a non-negative integer
    const errorCount = parseInt(value, 10);
    if (isNaN(errorCount) || errorCount < 0) {
      return;
    }
    
    setFormData(prev => {
      const updatedDetails = [...prev.details];
      const existingDetailIndex = updatedDetails.findIndex(
        detail => detail.sub_aspect_id === subAspectId || detail.sub_aspect_id.toString() === subAspectId.toString()
      );
      
      if (existingDetailIndex >= 0) {
        // Update existing detail
        updatedDetails[existingDetailIndex] = {
          ...updatedDetails[existingDetailIndex],
          error_count: errorCount
        };
      } else {
        // Add new detail
        updatedDetails.push({
          sub_aspect_id: subAspectId,
          error_count: errorCount
        });
      }
      
      return {
        ...prev,
        details: updatedDetails
      };
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.chapter_id) {
      errors.chapter_id = 'Please select a chapter';
    }
    
    // Ensure all sub-aspects have been evaluated
    const evaluatedSubAspectIds = new Set(formData.details.map(detail => 
      detail.sub_aspect_id.toString()
    ));
    
    let allSubAspectsEvaluated = true;
    let missingSubAspect = null;
    
    // Check if all sub-aspects have been evaluated
    parameters.forEach(parameter => {
      parameter.aspects.forEach(aspect => {
        aspect.sub_aspects.forEach(subAspect => {
          if (!evaluatedSubAspectIds.has(subAspect.id.toString())) {
            allSubAspectsEvaluated = false;
            missingSubAspect = {
              parameter: parameter.name,
              aspect: aspect.name,
              subAspect: subAspect.name
            };
          }
        });
      });
    });
    
    if (!allSubAspectsEvaluated) {
      errors.details = `Not all sub-aspects have been evaluated. Missing: ${missingSubAspect.parameter} > ${missingSubAspect.aspect} > ${missingSubAspect.subAspect}`;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const url = isEdit 
        ? `http://localhost:3000/api/assessments/${id}`
        : 'http://localhost:3000/api/assessments';
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chapter_id: parseInt(formData.chapter_id, 10),
          notes: formData.notes,
          details: formData.details
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save assessment');
      }
      
      const data = await response.json();
      
      // Redirect to the assessment detail page
      navigate(isEdit 
        ? `/dashboard/assessments/${id}`
        : `/dashboard/assessments/${data.data.id}`
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getErrorCount = (subAspectId) => {
    const detail = formData.details.find(
      d => d.sub_aspect_id === subAspectId || d.sub_aspect_id.toString() === subAspectId.toString()
    );
    return detail ? detail.error_count : 0;
  };

  return (
    <div className="assessment-form-container">
      <div className="form-header">
        <h2>{isEdit ? 'Edit Assessment' : 'Create New Assessment'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="assessment-form">
        <div className="form-section">
          <h3>Assessment Information</h3>
          
          <div className="form-group">
            <label htmlFor="chapter_id">Chapter:</label>
            <select
              id="chapter_id"
              name="chapter_id"
              value={formData.chapter_id}
              onChange={handleChange}
              className={formErrors.chapter_id ? 'error' : ''}
              disabled={isEdit} // Can't change chapter in edit mode
            >
              <option value="">Select a Chapter</option>
              {chapters.map(chapter => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.name} (Weight: {chapter.weight})
                </option>
              ))}
            </select>
            {formErrors.chapter_id && (
              <span className="error-message">{formErrors.chapter_id}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Notes:</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Enter assessment notes (optional)"
            ></textarea>
          </div>
        </div>
        
        {formErrors.details && (
          <div className="error-banner">
            {formErrors.details}
          </div>
        )}
        
        <div className="form-section parameters-section">
          <h3>Assessment Parameters</h3>
          
          {parameters.map((parameter, paramIndex) => (
            <div key={paramIndex} className="parameter-container">
              <h4 className="parameter-title">{parameter.name}</h4>
              
              {parameter.aspects.map((aspect, aspectIndex) => (
                <div key={aspectIndex} className="aspect-container">
                  <h5 className="aspect-title">{aspect.name}</h5>
                  
                  <div className="sub-aspects-grid">
                    {aspect.sub_aspects.map((subAspect, subAspectIndex) => (
                      <div key={subAspectIndex} className="sub-aspect-item">
                        <div className="sub-aspect-name">{subAspect.name}</div>
                        <div className="error-count-input">
                          <label htmlFor={`error-${subAspect.id}`}>Errors:</label>
                          <input
                            id={`error-${subAspect.id}`}
                            type="number"
                            min="0"
                            value={getErrorCount(subAspect.id)}
                            onChange={(e) => handleErrorCountChange(subAspect.id, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/dashboard/assessments')}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {isEdit ? 'Update Assessment' : 'Create Assessment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;