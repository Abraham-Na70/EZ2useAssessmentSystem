import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import '../AssessmentApp.css';

// Import assessment components
import AssessmentList from './AssessmentList';
import AssessmentDetail from './AssessmentDetails';
import AssessmentForm from './AssessmentForm';
import AspectManagement from './AspectManagement';
import SubAspectManagement from './SubAspectManagement';
import ParameterManagement from './ParameterManagement';
import ChapterForm from './ChapterForm';

const AssessmentApp = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      navigate('/dashboard/assessments');
    }
  }, [location.pathname, navigate]);

  return (
    <div className="dashboard-container">
      {/* === HEADER MODIFIED === */}
      <header className="dashboard-header">
        <h1>Assessment System</h1>
      </header>

      <main className="dashboard-content">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError('')}>Dismiss</button>
          </div>
        )}

        <Routes>
          <Route path="assessments" element={
            <AssessmentList 
              user={user} 
              onLogout={onLogout} // Pass onLogout down to AssessmentList
              setLoading={setLoading} 
              setError={setError}
            />
          } />
          <Route path="assessments/new" element={
            <AssessmentForm 
              user={user} 
              setLoading={setLoading} 
              setError={setError} 
            />
          } />
          <Route path="assessments/:id" element={
            <AssessmentDetail 
              user={user} 
              setLoading={setLoading} 
              setError={setError} 
            />
          } />
          <Route path="assessments/:id/edit" element={
            <AssessmentForm 
              user={user} 
              isEdit={true} 
              setLoading={setLoading} 
              setError={setError} 
            />
          } />
          <Route path="parameters" element={
            <ParameterManagement
              user={user}
              setLoading={setLoading}
              setError={setError}
            />
          } />
          <Route path="aspects" element={
            <AspectManagement
              user={user}
              setLoading={setLoading}
              setError={setError}
            />
          } />
          <Route path="subaspects" element={
            <SubAspectManagement
              user={user}
              setLoading={setLoading}
              setError={setError}
            />
          } />
          <Route path="chapters/new" element={
            <ChapterForm
              setLoading={setLoading}
              setError={setError}
            />
          } />
          </Routes>
          
      </main>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Assessment System</p>
      </footer>
    </div>
  );
};

export default AssessmentApp;