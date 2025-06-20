import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../AssessmentForm.css';

// This is a placeholder for your actual API service.
const DUMMY_API_BASE_URL = 'http://localhost:3000/api';
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
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An API error occurred');
  }
  return response.json();
};

const AssessmentForm = ({ user, isEdit = false, setLoading, setError }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT (from your original component) ---
  const [formData, setFormData] = useState({
    chapter_id: '',
    assessor_name: user?.username || '',
    assessment_date: new Date().toISOString().split('T')[0],
    notes: '',
    details: [],
  });
  const [chapters, setChapters] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DATA FETCHING (from your original component, with useCallback for optimization) ---
  const fetchChaptersCallback = useCallback(async () => {
    try {
      const data = await fetchApi(`${DUMMY_API_BASE_URL}/chapters`);
      setChapters(data.data || []);
    } catch (error) {
      setError(`Failed to fetch chapters: ${error.message}`);
    }
  }, [setError]);

  const fetchParametersCallback = useCallback(async () => {
    try {
      const data = await fetchApi(`${DUMMY_API_BASE_URL}/parameters`);
      setParameters(data.data || []);
    } catch (error) {
      setError(`Failed to fetch assessment parameters: ${error.message}`);
    }
  }, [setError]);
  
  const fetchAssessmentDetailsCallback = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchApi(`${DUMMY_API_BASE_URL}/assessments/${id}`);
      const assessmentData = data.data;
      const loadedDetails = [];

      // This explicit loop structure is robust and avoids linter errors.
      if (assessmentData.parameters && Array.isArray(assessmentData.parameters)) {
        assessmentData.parameters.forEach(p => {
          if (p.aspects && Array.isArray(p.aspects)) {
            p.aspects.forEach(a => {
              if (a.sub_aspects && Array.isArray(a.sub_aspects)) {
                a.sub_aspects.forEach(sa => {
                  loadedDetails.push({ 
                    sub_aspect_id: sa.sub_aspect_id, 
                    error_count: sa.error_count 
                  });
                });
              }
            });
          }
        });
      }

      setFormData({
        chapter_id: assessmentData.header.chapter_id?.toString() || '',
        assessor_name: assessmentData.header.assessor_name || (user?.username || ''),
        assessment_date: new Date(assessmentData.header.assessment_date).toISOString().split('T')[0],
        notes: assessmentData.header.notes || '',
        details: loadedDetails,
      });
    } catch (error) {
      setError(`Failed to fetch assessment details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [id, setLoading, setError, user]);

  useEffect(() => {
    fetchChaptersCallback();
    fetchParametersCallback();
    if (isEdit && id) {
      fetchAssessmentDetailsCallback();
    }
  }, [isEdit, id, fetchChaptersCallback, fetchParametersCallback, fetchAssessmentDetailsCallback]);

  // Effect to initialize error counts to 0 for a NEW form
  useEffect(() => {
    if (!isEdit && parameters.length > 0) {
      const initialDetails = [];
      // *** FIXED: Replaced ?.forEach with explicit if-checks to prevent linter error ***
      parameters.forEach(param => {
        if (param.aspects && Array.isArray(param.aspects)) {
          param.aspects.forEach(aspect => {
            if (aspect.sub_aspects && Array.isArray(aspect.sub_aspects)) {
              aspect.sub_aspects.forEach(subAspect => {
                if (subAspect && typeof subAspect.id !== 'undefined') {
                  initialDetails.push({ sub_aspect_id: subAspect.id, error_count: 0 });
                }
              });
            }
          });
        }
      });
      setFormData(prev => ({ ...prev, details: initialDetails }));
    }
  }, [parameters, isEdit]);


  // --- FORM HANDLERS (from your original component) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleErrorCountChange = (subAspectId, value) => {
    const errorCount = parseInt(value, 10);
    if (value === '' || (!isNaN(errorCount) && errorCount >= 0)) {
      setFormData(prev => ({
        ...prev,
        details: prev.details.map(detail =>
          detail.sub_aspect_id.toString() === subAspectId.toString()
            ? { ...detail, error_count: value === '' ? '' : errorCount }
            : detail
        ),
      }));
    }
  };

  const getErrorCount = (subAspectId) => {
    const detail = formData.details.find(d => d.sub_aspect_id.toString() === subAspectId.toString());
    return detail != null ? detail.error_count : '';
  };

  // --- FORM VALIDATION & SUBMISSION (from your original component) ---
  const validateForm = () => {
    const errors = {};
    if (!formData.chapter_id) errors.chapter_id = 'Please select a chapter';
    if (!formData.assessor_name.trim()) errors.assessor_name = 'Assessor name is required';
    if (!formData.assessment_date) errors.assessment_date = 'Assessment date is required';
    
    const hasInvalidDetail = formData.details.some(detail => detail.error_count === '' || isNaN(parseInt(detail.error_count, 10)) || parseInt(detail.error_count, 10) < 0);
    if (hasInvalidDetail) {
      errors.details = 'Please provide a valid error count (0 or more) for all sub-aspects.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setLoading(true);

    const payload = {
      ...formData,
      chapter_id: parseInt(formData.chapter_id, 10),
      details: formData.details.map(detail => ({
        ...detail,
        error_count: detail.error_count === '' ? 0 : parseInt(detail.error_count, 10),
      })),
    };

    try {
      const url = isEdit ? `${DUMMY_API_BASE_URL}/assessments/${id}` : `${DUMMY_API_BASE_URL}/assessments`;
      const method = isEdit ? 'PUT' : 'POST';
      const data = await fetchApi(url, { method, body: JSON.stringify(payload) });
      const newOrUpdatedId = isEdit ? id : data.data.id;
      navigate(`/dashboard/assessments/${newOrUpdatedId}`);
    } catch (error) {
      setError(`Failed to save assessment: ${error.message}`);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="assessment-form-container">
      <div className="form-header">
        <h2>{isEdit ? 'Edit Assessment' : 'Create New Assessment'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="assessment-form">
        <div className="form-section info-section">
          <h3>Assessment Information</h3>
          <div className="info-grid">
            <div className="form-group">
              <label htmlFor="chapter_id">Chapter</label>
              <select id="chapter_id" name="chapter_id" value={formData.chapter_id} onChange={handleChange} className={formErrors.chapter_id ? 'input-error' : ''} disabled={isEdit}>
                <option value="">Select a Chapter</option>
                {chapters.map(chapter => (
                  <option key={chapter.chapter_id} value={chapter.chapter_id}>{chapter.chapter_name}</option>
                ))}
              </select>
              {formErrors.chapter_id && <span className="error-message">{formErrors.chapter_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="assessor_name">Assessor Name</label>
              <input type="text" id="assessor_name" name="assessor_name" value={formData.assessor_name} onChange={handleChange} className={formErrors.assessor_name ? 'input-error' : ''} />
              {formErrors.assessor_name && <span className="error-message">{formErrors.assessor_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="assessment_date">Assessment Date</label>
              <input type="date" id="assessment_date" name="assessment_date" value={formData.assessment_date} onChange={handleChange} className={formErrors.assessment_date ? 'input-error' : ''} />
              {formErrors.assessment_date && <span className="error-message">{formErrors.assessment_date}</span>}
            </div>

            <div className="form-group form-group-span-2">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Enter optional notes..."></textarea>
            </div>
          </div>
        </div>

        {formErrors.details && <div className="error-banner form-error-banner">{formErrors.details}</div>}

        <div className="form-section parameters-section">
          <h3>Assessment Parameters</h3>
          <div className="parameters-grid-container">
            {parameters.length > 0 ? (
              parameters.map(param => (
                <div key={param.id} className="parameter-column">
                  <div className="param-header">{param.name}</div>
                  <div className="sub-header">
                    <div className="sub-header-name">Sub-Aspect</div>
                    <div className="sub-header-error">Jumlah Kesalahan</div>
                  </div>
                  <div className="aspects-wrapper">
                    {param.aspects?.map(aspect => (
                      <div key={aspect.id} className="aspect-group">
                        <div className="aspect-group-name">{aspect.name}</div>
                        {aspect.sub_aspects?.map(subAspect => (
                          <div key={subAspect.id} className="sub-aspect-row">
                            <div className="sub-aspect-name">{subAspect.name}</div>
                            <div className="error-input-wrapper">
                              <input
                                type="number"
                                min="0"
                                id={`error-${subAspect.id}`}
                                value={getErrorCount(subAspect.id)}
                                onChange={(e) => handleErrorCountChange(subAspect.id, e.target.value)}
                                className={formErrors.details && (String(getErrorCount(subAspect.id)) === '') ? 'input-error' : ''}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : <p>Loading assessment structure...</p>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/dashboard/assessments')} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="submit-btn" disabled={isSubmitting || (parameters.length === 0 && !isEdit)}>{isSubmitting ? 'Saving...' : (isEdit ? 'Update Assessment' : 'Create Assessment')}</button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;