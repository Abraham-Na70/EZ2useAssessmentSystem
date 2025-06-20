import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../AssessmentDetails.css';

const AssessmentDetail = ({ user, setLoading, setError }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);

  const fetchAssessmentDetails = useCallback(async () => {
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
      setAssessment(data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [id, setLoading, setError]); // useCallback dependencies

  useEffect(() => {
    fetchAssessmentDetails();
  }, [fetchAssessmentDetails]); // useEffect now correctly depends on the memoized function

  const handleDeleteAssessment = async () => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/assessments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete assessment');
      }
      
      navigate('/dashboard/assessments');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'LANJUT':
        return 'status-pass';
      case 'ULANG':
        return 'status-fail';
      default:
        return 'status-pending';
    }
  };

  if (!assessment) {
    return <div className="loading-message">Loading assessment details...</div>;
  }

  return (
    <div className="assessment-detail-container">
      <div className="detail-header">
        <div className="header-left">
          <h2>Assessment Detail</h2>
          <div className="assessment-meta">
            <span className="meta-item">ID: {assessment.header.id}</span>
            <span className="meta-item">Date: {formatDate(assessment.header.assessment_date)}</span>
            <span className="meta-item">Chapter: {assessment.header.chapter_name}</span>
            <span className="meta-item">Assessor: {assessment.header.assessor_name}</span>
          </div>
        </div>
        <div className="header-right">
          <Link to={`/dashboard/assessments/${id}/edit`} className="edit-btn">
            Edit Assessment
          </Link>
          <button onClick={handleDeleteAssessment} className="delete-btn">
            Delete Assessment
          </button>
          <Link to="/dashboard/assessments" className="back-btn">
            Back to List
          </Link>
        </div>
      </div>

      <div className="assessment-summary">
        <div className="summary-card">
          <h3>Score</h3>
          <div className="score-value">{assessment.header.total_score}</div>
        </div>
        <div className="summary-card">
          <h3>Predicate</h3>
          <div className="predicate-value">{assessment.header.predicate}</div>
        </div>
        <div className="summary-card">
          <h3>Status</h3>
          <div className={`status-value ${getStatusClass(assessment.header.status)}`}>
            {assessment.header.status}
          </div>
        </div>
      </div>

      {assessment.header.notes && (
        <div className="assessment-notes">
          <h3>Notes</h3>
          <p>{assessment.header.notes}</p>
        </div>
      )}

      <div className="assessment-details">
        <h3>Assessment Details</h3>
        
        {/* === JSX CORRECTED HERE === */}
        {assessment.parameters.map((parameter) => (
          <div key={parameter.parameter_id} className="parameter-section"> {/* Use parameter.parameter_id */}
            <div className="parameter-header">
              <h4>{parameter.parameter_name}</h4> {/* Use parameter.parameter_name */}
              <span className="error-count">Total Errors: {parameter.total_errors}</span>
            </div>
            <div className="aspects-container">
              {parameter.aspects.map((aspect) => (
                <div key={aspect.aspect_id} className="aspect-section"> {/* Use aspect.aspect_id */}
                  <h5>{aspect.aspect_name}</h5> {/* Use aspect.aspect_name */}
                  <table className="sub-aspects-table">
                    <tbody>
                      {aspect.sub_aspects.map((subAspect) => (
                        <tr key={subAspect.sub_aspect_id}>
                          <td>{subAspect.sub_aspect_name}</td> {/* Use subAspect.sub_aspect_name */}
                          <td className="error-value">{subAspect.error_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentDetail;