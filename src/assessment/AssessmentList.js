import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../AssessmentList.css';

const AssessmentList = ({ user, setLoading, setError }) => {
  const [assessments, setAssessments] = useState([]);
  const [filters, setFilters] = useState({
    chapter_id: '',
    status: '',
    start_date: '',
    end_date: ''
  });
  const [chapters, setChapters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchChapters();
    fetchAssessments();
  }, []);

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

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.chapter_id) queryParams.append('chapter_id', filters.chapter_id);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      
      const url = `http://localhost:3000/api/assessments?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assessments');
      }
      
      const data = await response.json();
      setAssessments(data.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when applying filters
    fetchAssessments();
  };

  const handleClearFilters = () => {
    setFilters({
      chapter_id: '',
      status: '',
      start_date: '',
      end_date: ''
    });
    setCurrentPage(1);
  };

  const deleteAssessment = async (id) => {
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
      
      // Remove deleted assessment from state
      setAssessments(prev => prev.filter(assessment => assessment.id !== id));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = assessments.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="assessment-list-container">
      <div className="list-header">
        <h2>Assessments</h2>
        <Link to="/dashboard/assessments/new" className="new-assessment-btn">
          Create New Assessment
        </Link>
      </div>

      <div className="filters-section">
        <form onSubmit={handleFilterSubmit} className="filters-form">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="chapter_id">Chapter:</label>
              <select 
                id="chapter_id" 
                name="chapter_id" 
                value={filters.chapter_id}
                onChange={handleFilterChange}
              >
                <option value="">All Chapters</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="status">Status:</label>
              <select 
                id="status" 
                name="status" 
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="LANJUT">Lanjut</option>
                <option value="ULANG">Ulang</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="start_date">From:</label>
              <input 
                type="date" 
                id="start_date" 
                name="start_date" 
                value={filters.start_date}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="end_date">To:</label>
              <input 
                type="date" 
                id="end_date" 
                name="end_date" 
                value={filters.end_date}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-buttons">
              <button type="submit" className="apply-filters-btn">Apply Filters</button>
              <button type="button" onClick={handleClearFilters} className="clear-filters-btn">Clear</button>
            </div>
          </div>
        </form>
      </div>

      {assessments.length === 0 ? (
        <div className="no-assessments">
          <p>No assessments found. Create your first assessment by clicking the button above.</p>
        </div>
      ) : (
        <>
          <div className="assessment-table-container">
            <table className="assessment-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Chapter</th>
                  <th>Assessor</th>
                  <th>Score</th>
                  <th>Predicate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(assessment => (
                  <tr key={assessment.id}>
                    <td>{assessment.id}</td>
                    <td>{formatDate(assessment.assessment_date)}</td>
                    <td>{assessment.chapter_name}</td>
                    <td>{assessment.assessor_name}</td>
                    <td>{assessment.total_score !== null ? assessment.total_score : 'N/A'}</td>
                    <td>{assessment.predicate || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(assessment.status)}`}>
                        {assessment.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Link to={`/dashboard/assessments/${assessment.id}`} className="action-btn view-btn">
                        View
                      </Link>
                      <Link to={`/dashboard/assessments/${assessment.id}/edit`} className="action-btn edit-btn">
                        Edit
                      </Link>
                      <button 
                        onClick={() => deleteAssessment(assessment.id)} 
                        className="action-btn delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {assessments.length > itemsPerPage && (
            <div className="pagination">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.ceil(assessments.length / itemsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === Math.ceil(assessments.length / itemsPerPage)}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssessmentList;