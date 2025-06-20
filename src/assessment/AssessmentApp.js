import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import '../AssessmentApp.css';


// Import assessment components
import AssessmentList from './AssessmentList'; // Fixed: remove 'assessment/' folder prefix
import AssessmentDetail from './AssessmentDetails'; // Fixed: proper filename with 's'
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
    // If we're at the root dashboard path, redirect to the assessment list
    if (location.pathname === '/dashboard') {
      navigate('/dashboard/assessments');
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <h1>Assessment System</h1>
        </div>
        <nav className="dashboard-nav">
          <Link to="/dashboard/assessments" className="nav-link">Assessments</Link>
          <Link to="/dashboard/assessments/new" className="nav-link">New Assessment</Link>
          <Link to="/dashboard/chapters/new" className="nav-link">Add Chapter</Link>
            {user?.role === 'admin' && (
              <> 
          <Link to="/dashboard/parameters" className="nav-Link">Manage Parameters</Link> 
          <Link to="/dashboard/aspects" className="nav-link">Manage Aspects</Link>
              </>
            )}
            {(user?.role === 'admin' || user?.role === 'assessor') && ( // conditional rendering, Sub-aspect for admin & assessor
          <Link to="/dashboard/subaspects" className="nav-link">Manage Sub-Aspects</Link>
            )}
        </nav>
        <div className="user-section">
          <span className="user-greeting">
            Hello, {user?.username || 'User'} ({user?.role || 'user'})
          </span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
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
              user={user} //component role check
              setLoading={setLoading}
              setError={setError}
            />
          } />
          <Route path="aspects" element={
            <AspectManagement
              user={user} // comporole check
              setLoading={setLoading}
              setError={setError}
            />
          } />
          <Route path="subaspects" element={
            <SubAspectManagement
              user={user} // compo role check
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