// src/assessment/ChapterForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { createChapter } from '../services/apiService'; // If you create an apiService

const DUMMY_API_BASE_URL = 'http://localhost:3000/api'; // Or your actual base URL

const ChapterForm = ({ setError, setLoading }) => {
  const navigate = useNavigate();
  const [chapterData, setChapterData] = useState({
    project_name: '',
    no: '',
    chapter_name: '',
    weight: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChapterData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!chapterData.project_name.trim()) errors.project_name = 'Project name is required.';
    if (!chapterData.no.trim()) errors.no = 'Chapter number is required.';
    if (!chapterData.chapter_name.trim()) errors.chapter_name = 'Chapter name is required.';
    if (chapterData.weight === '') errors.weight = 'Weight is required.';
    else if (isNaN(parseFloat(chapterData.weight)) || parseFloat(chapterData.weight) <= 0) {
      errors.weight = 'Weight must be a positive number.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      // await createChapter(chapterData); // If using apiService
      const response = await fetch(`${DUMMY_API_BASE_URL}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...chapterData,
          weight: parseFloat(chapterData.weight)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create chapter');
      }

      // const result = await response.json();
      // console.log('Chapter created:', result.data);
      alert('Chapter created successfully!');
      // Optionally navigate away or clear form
      navigate('/dashboard/assessments'); // Or to a chapter list page
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="chapter-form-container" style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Create New Chapter</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="project_name">Project Name:</label>
          <input type="text" id="project_name" name="project_name" value={chapterData.project_name} onChange={handleChange} />
          {formErrors.project_name && <p style={{ color: 'red' }}>{formErrors.project_name}</p>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="no">Chapter Number (e.g., 001, CH01):</label>
          <input type="text" id="no" name="no" value={chapterData.no} onChange={handleChange} />
          {formErrors.no && <p style={{ color: 'red' }}>{formErrors.no}</p>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="chapter_name">Chapter Name:</label>
          <input type="text" id="chapter_name" name="chapter_name" value={chapterData.chapter_name} onChange={handleChange} />
          {formErrors.chapter_name && <p style={{ color: 'red' }}>{formErrors.chapter_name}</p>}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="weight">Weight:</label>
          <input type="number" id="weight" name="weight" value={chapterData.weight} onChange={handleChange} step="0.01" min="0" />
          {formErrors.weight && <p style={{ color: 'red' }}>{formErrors.weight}</p>}
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Chapter'}
        </button>
        <button type="button" onClick={() => navigate(-1)} style={{ marginLeft: '10px' }}> {/* Go back */}
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ChapterForm;