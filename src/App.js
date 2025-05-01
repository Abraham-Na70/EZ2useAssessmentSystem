import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Fix: AuthComponent and AssessmentApp are in the assessment directory
import AuthComponent from './assessment/AuthComponent';
import AssessmentApp from './assessment/AssessmentApp';
function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(null);
  
  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsLoggedIn(true);
    // Store in localStorage if you want persistence
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };
  
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };
  
  // Check for existing session on component mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []);
  
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={
            isLoggedIn ? 
            <Navigate to="/dashboard" /> : 
            <AuthComponent isRegister={false} onLogin={handleLogin} />
          } />
          <Route path="/register" element={
            isLoggedIn ? 
            <Navigate to="/dashboard" /> : 
            <AuthComponent isRegister={true} onLogin={handleLogin} />
          } />
          <Route path="/dashboard/*" element={
            isLoggedIn ? 
            <AssessmentApp user={user} token={token} onLogout={handleLogout} /> : 
            <Navigate to="/login" />
          } />
          <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;