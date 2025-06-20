import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthComponent from './assessment/AuthComponent';
import AssessmentApp from './assessment/AssessmentApp';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsLoggedIn(true);
    // Store in localStorage for session persistence
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
    // No explicit navigate here; the routes will handle redirecting to /login
    // or the Navigate component in the /dashboard/* route will redirect.
  };

  // Check for existing session on component mount (initial load)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsLoggedIn(true);
      } catch (error) {
        // If storedUser is not valid JSON, clear localStorage
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // isLoggedIn will remain false (its initial state)
      }
    }
    // If no storedUser or storedToken, isLoggedIn remains false
  }, []);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace /> 
              ) : (
                <AuthComponent isRegister={false} onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthComponent isRegister={true} onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              isLoggedIn ? (
                <AssessmentApp user={user} token={token} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;