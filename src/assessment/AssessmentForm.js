import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import '../AssessmentForm.css'; 

const DUMMY_API_BASE_URL = 'http://localhost:3000/api'; 

const fetchApi = async (url, options = {}) => {
  const token = localStorage.getItem('token'); // Assuming token is stored
  const headers = {
    'Content-Type': 'application/json', // Usually needed for POST/PUT
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
      // If response is not JSON, use status text
      throw new Error(errorData?.message || response.statusText || 'An API error occurred');
    }
    throw new Error(errorData?.message || 'An API error occurred');
  }
  return response.json();
};
// End of Mock/Placeholder for API service calls

const AssessmentForm = ({ user, isEdit = false, setLoading, setError }) => {
  const { id } = useParams(); // For edit mode, gets assessment ID from URL
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    chapter_id: '',
    assessor_name: user?.username || '', // Pre-fill with logged-in user's name if available
    assessment_date: new Date().toISOString().split('T')[0], // Defaults to today
    notes: '',
    details: [], // Will be populated with { sub_aspect_id, error_count }
  });

  const [chapters, setChapters] = useState([]); // For chapter selection dropdown
  const [parameters, setParameters] = useState([]); // For rendering parameters, aspects, sub-aspects
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // To disable button during submission

  // --- DATA FETCHING EFFECTS ---

  // Fetch chapters for the dropdown
  const fetchChaptersCallback = useCallback(async () => {
    // setError(''); // Clear previous errors
    try {
      // Replace with call to apiService.fetchChapters() eventually
      const data = await fetchApi(`${DUMMY_API_BASE_URL}/chapters`);
      setChapters(data.data || []);
    } catch (error) {
      setError(`Failed to fetch chapters: ${error.message}`);
      setChapters([]); // Ensure chapters is an array even on error
    }
  }, [setError]); // Added setError to dependency array

  // Fetch parameters (and their nested aspects/sub-aspects) to build the form
  const fetchParametersCallback = useCallback(async () => {
    // setError('');
    try {
      // Replace with call to apiService.fetchAssessmentStructure() eventually
      // This endpoint should return Parameters -> Aspects -> SubAspects
      const data = await fetchApi(`${DUMMY_API_BASE_URL}/parameters`);
      setParameters(data.data || []);
    } catch (error) {
      setError(`Failed to fetch assessment parameters: ${error.message}`);
      setParameters([]); // Ensure parameters is an array even on error
    }
  }, [setError]); // Added setError to dependency array

  // Fetch existing assessment details if in edit mode
  const fetchAssessmentDetailsCallback = useCallback(async () => {
    if (!id) return; // Should not happen if isEdit is true and id is from useParams
    setLoading(true);
    // setError('');
    try {
      // Replace with call to apiService.fetchAssessmentById(id) eventually
      const data = await fetchApi(`${DUMMY_API_BASE_URL}/assessments/${id}`);
      const assessmentData = data.data;

      const loadedDetails = [];
      assessmentData.parameters.forEach(parameter => {
        parameter.aspects.forEach(aspect => {
          aspect.sub_aspects.forEach(subAspect => {
            loadedDetails.push({
              sub_aspect_id: subAspect.sub_aspect_id, // Key for identifying the sub-aspect
              error_count: subAspect.error_count,
            });
          });
        });
      });

      setFormData({
        chapter_id: assessmentData.header.chapter_id?.toString() || '',
        assessor_name: assessmentData.header.assessor_name || (user?.username || ''),
        assessment_date: assessmentData.header.assessment_date ? new Date(assessmentData.header.assessment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: assessmentData.header.notes || '',
        details: loadedDetails,
      });
    } catch (error) {
      setError(`Failed to fetch assessment details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [id, setLoading, setError, user]); // Added user to dependency array

  // Initial data fetching
  useEffect(() => {
    fetchChaptersCallback();
    fetchParametersCallback(); // Fetches the structure for building the form
  }, [fetchChaptersCallback, fetchParametersCallback]);

  // Effect for loading details in edit mode
  useEffect(() => {
    if (isEdit && id) {
      fetchAssessmentDetailsCallback();
    }
  }, [isEdit, id, fetchAssessmentDetailsCallback]);


  // Effect to initialize/reset details when parameters load for a NEW form
  useEffect(() => {
    if (!isEdit && parameters && parameters.length > 0) { // Added check for parameters itself
      const initialDetails = [];
      parameters.forEach(param => {
        // Check if param.aspects exists and is an array before calling forEach
        if (param.aspects && Array.isArray(param.aspects)) {
          param.aspects.forEach(aspect => {
            // Check if aspect.sub_aspects exists and is an array
            if (aspect.sub_aspects && Array.isArray(aspect.sub_aspects)) {
              aspect.sub_aspects.forEach(subAspect => {
                if (subAspect && typeof subAspect.id !== 'undefined') { // Ensure subAspect and subAspect.id exist
                  initialDetails.push({
                    sub_aspect_id: subAspect.id,
                    error_count: 0,
                  });
                }
              });
            }
          });
        }
      });
      // Only update if initialDetails were actually populated,
      // or if you want to ensure details is an empty array if parameters don't have the structure.
      // For safety, and to ensure `details` is always an array:
      setFormData(prev => ({ ...prev, details: initialDetails.length > 0 ? initialDetails : (prev.details || []) }));
    } else if (!isEdit) {
      // If not editing and parameters are not loaded or empty, ensure details is an empty array
      setFormData(prev => ({ ...prev, details: [] }));
    }
  }, [parameters, isEdit]);


  // --- FORM HANDLERS ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`handleChange - name: ${name}, value: ${value}, type: ${typeof value}`); 
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleErrorCountChange = (subAspectId, value) => {
    const errorCount = parseInt(value, 10);
    // Allow empty string to clear the input, but treat as 0 for submission if needed.
    // Or enforce non-negative on blur/submit. For now, allow empty for typing.
    if (value === '' || (!isNaN(errorCount) && errorCount >= 0)) {
      setFormData(prev => {
        const updatedDetails = prev.details.map(detail =>
          detail.sub_aspect_id.toString() === subAspectId.toString()
            ? { ...detail, error_count: value === '' ? '' : errorCount } // Store empty string or number
            : detail
        );
        // If the subAspectId wasn't found, it means initial details weren't populated correctly.
        // This shouldn't happen if the useEffect for parameters works.
        // However, as a fallback or if details are added dynamically beyond initial load:
        if (!updatedDetails.some(d => d.sub_aspect_id.toString() === subAspectId.toString())) {
            updatedDetails.push({ sub_aspect_id: subAspectId, error_count: value === '' ? '' : errorCount });
        }

        return { ...prev, details: updatedDetails };
      });
    }
  };

  const getErrorCount = (subAspectId) => {
    const detail = formData.details.find(
      d => d.sub_aspect_id.toString() === subAspectId.toString()
    );
    return detail ? detail.error_count : ''; // Return empty string if not set, to allow placeholder
  };

  // --- FORM VALIDATION & SUBMISSION ---

  const validateForm = () => {
    console.log('Validating form with formData.chapter_id:', formData.chapter_id);
    const errors = {};
    if (!formData.chapter_id) errors.chapter_id = 'Please select a chapter';
    if (!formData.assessor_name.trim()) errors.assessor_name = 'Assessor name is required';
    if (!formData.assessment_date) errors.assessment_date = 'Assessment date is required';
    // Check if all sub-aspects (that are rendered based on fetched parameters) have a corresponding entry in formData.details
    // and if those entries have valid error_count values (e.g., not an empty string if 0 is the minimum).
    let allSubAspectsEvaluated = true;
    let firstMissingSubAspectForError = null;

    if (parameters.length > 0) { // Only validate details if parameters are loaded
        for (const parameter of parameters) {
            for (const aspect of parameter.aspects || []) {
                for (const subAspect of aspect.sub_aspects || []) {
                    const detail = formData.details.find(d => d.sub_aspect_id.toString() === subAspect.id.toString());
                    if (!detail || detail.error_count === '' || isNaN(parseInt(detail.error_count,10)) || parseInt(detail.error_count,10) < 0) { // Check for empty string or invalid number
                        allSubAspectsEvaluated = false;
                        firstMissingSubAspectForError = `${parameter.name} > ${aspect.name} > ${subAspect.name}`;
                        break; // Found first problematic one
                    }
                }
                if (!allSubAspectsEvaluated) break;
            }
            if (!allSubAspectsEvaluated) break;
        }
    } else if (!isEdit) { // If parameters haven't loaded yet for a new form, it's an issue
        errors.details = "Assessment structure not loaded. Cannot validate sub-aspects.";
        allSubAspectsEvaluated = false; // Prevent submission
    }


    if (!allSubAspectsEvaluated && firstMissingSubAspectForError) {
      errors.details = `Please provide a valid error count (0 or more) for all sub-aspects. Issue around: ${firstMissingSubAspectForError}`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous API errors
    console.group("handleSubmit Debug");
    console.log('formData at start of handleSubmit:', JSON.parse(JSON.stringify(formData))); // Deep copy for logging
    console.log('formData.chapter_id before validation:', formData.chapter_id, typeof formData.chapter_id);
    if (!validateForm()) {
      console.log('Form validation failed. Errors:', formErrors);
      console.groupEnd();
      return;
    }
    console.log('Form validation passed.');

    setIsSubmitting(true);
    setLoading(true);

    // Prepare details, ensuring error_count is a number
    const processedDetails = formData.details.map(detail => ({
        ...detail,
        error_count: detail.error_count === '' ? 0 : parseInt(detail.error_count, 10) // Treat empty as 0 for submission
    }));

    const chapterIdToSubmit = formData.chapter_id ? parseInt(formData.chapter_id, 10) : null;
    console.log('Value of formData.chapter_id before parseInt:', formData.chapter_id);
    console.log('Value of chapterIdToSubmit after parseInt:', chapterIdToSubmit);
      const finalChapterIdForPayload = (isNaN(chapterIdToSubmit) || chapterIdToSubmit === null) ? null : chapterIdToSubmit;

    const payload = {
      chapter_id: parseInt(formData.chapter_id, 10),
      assessor_name: formData.assessor_name,
      assessment_date: formData.assessment_date,
      notes: formData.notes,
      details: processedDetails, // Use processed details
    };
    
    console.log('Final payload being sent:', JSON.parse(JSON.stringify(payload)));
    console.groupEnd();

    try {
      const url = isEdit
        ? `${DUMMY_API_BASE_URL}/assessments/${id}`
        : `${DUMMY_API_BASE_URL}/assessments`;
      const method = isEdit ? 'PUT' : 'POST';

      // Replace with call to apiService.submitAssessment(payload, isEdit, id) eventually
      const data = await fetchApi(url, { method, body: JSON.stringify(payload) });

      // Navigate to the detail page of the created/updated assessment
      const newOrUpdatedId = isEdit ? id : data.data.id; // Backend should return the ID
      navigate(`/dashboard/assessments/${newOrUpdatedId}`);
    } catch (error) {
      setError(`Failed to save assessment: ${error.message}`);
      // console.error("Submission error details:", error); // For more detailed debugging if needed
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  console.log("Current parameters state:", parameters);
  console.log("Current formData.details:", formData.details);
  console.log('AssessmentForm final render state - formData.chapter_id:', formData.chapter_id);
  console.log('Chapters array for dropdown:', JSON.parse(JSON.stringify(chapters)));
  // --- JSX ---
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
              className={formErrors.chapter_id ? 'input-error' : ''} // Use a specific class for input errors
              disabled={isEdit}
            >
              <option value="">Select a Chapter</option>
              {chapters.map(chapter => (
                <option key={chapter.chapter_id} value={chapter.chapter_id}> {/* Use chapter.chapter_id */}
                  {chapter.chapter_name} (Weight: {chapter.weight}) {/* Use chapter.chapter_name */}
                </option>
              ))}
            </select>
            {formErrors.chapter_id && (
              <span className="error-message">{formErrors.chapter_id}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="assessor_name">Assessor Name:</label>
            <input
              type="text"
              id="assessor_name"
              name="assessor_name"
              value={formData.assessor_name}
              onChange={handleChange}
              className={formErrors.assessor_name ? 'input-error' : ''}
              placeholder="Enter assessor name"
            />
            {formErrors.assessor_name && (
              <span className="error-message">{formErrors.assessor_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="assessment_date">Assessment Date:</label>
            <input
              type="date"
              id="assessment_date"
              name="assessment_date"
              value={formData.assessment_date}
              onChange={handleChange}
              className={formErrors.assessment_date ? 'input-error' : ''}
            />
            {formErrors.assessment_date && (
              <span className="error-message">{formErrors.assessment_date}</span>
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
          <div className="error-banner form-error-banner"> {/* Added class for specific styling */}
            {formErrors.details}
          </div>
        )}

        <div className="form-section parameters-section">
          <h3>Assessment Parameters</h3>
          {parameters.length === 0 && !isEdit && <p>Loading assessment structure...</p>}
          {parameters.map((parameter) => ( // Removed paramIndex as key isn't strictly needed here if parameter.id is available
            <div key={parameter.id || parameter.name} className="parameter-container"> {/* Use parameter.id if available */}
              <h4 className="parameter-title">{parameter.name}</h4>
              {parameter.aspects?.map((aspect) => ( // Added optional chaining
                <div key={aspect.id || aspect.name} className="aspect-container"> {/* Use aspect.id if available */}
                  <h5 className="aspect-title">{aspect.name}</h5>
                  <div className="sub-aspects-grid">
                    {aspect.sub_aspects?.map((subAspect) => ( // Added optional chaining
                      <div key={subAspect.id} className="sub-aspect-item"> {/* Use subAspect.id as key */}
                        <div className="sub-aspect-name">{subAspect.name}</div>
                        <div className="error-count-input">
                          <label htmlFor={`error-${subAspect.id}`}>Errors:</label>
                          <input
                            id={`error-${subAspect.id}`}
                            type="number"
                            min="0"
                            value={getErrorCount(subAspect.id)}
                            onChange={(e) => handleErrorCountChange(subAspect.id, e.target.value)}
                            className={
                                (formErrors.details && // Check if general details error exists
                                formData.details.find(d => d.sub_aspect_id.toString() === subAspect.id.toString() && (d.error_count === '' || isNaN(parseInt(d.error_count,10)) || parseInt(d.error_count,10) < 0)))
                                ? 'input-error' : ''
                            }
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
          <button type="button" className="cancel-btn" onClick={() => navigate('/dashboard/assessments')} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isSubmitting || (parameters.length === 0 && !isEdit)}>
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Assessment' : 'Create Assessment')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;