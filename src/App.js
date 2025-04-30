import React, { useState, useEffect, useCallback } from 'react';
import { TodoApp } from './components/TodoApp';
import AuthComponent from './components/AuthComponent';
import './App.css';

// Define global configuration for both components
const CONFIG = {
  // Todo App Configuration
  appTitle: "Todo App",
  emptyMessage: "No tasks yet. Add one now!",
  placeholders: {
    newTask: "Add a new task...",
    editTask: "Edit task..."
  },
  clock: {
    enabled: true,
    format: {
      showDate: true,
      showTime: true
    }
  },
  // Auth Component Configuration
  auth: {
    loginTitle: "Welcome to Todo App",
    registerTitle: "Create an Account",
    minPasswordLength: 6,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChar: true
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Check previous login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedInUser = localStorage.getItem('todoAppCurrentUser');
      if (loggedInUser) {
        setIsLoggedIn(true);
        setCurrentUser(loggedInUser);
      }
      setIsLoading(false); // Set loading to false once check is complete
    };
    
    // Short timeout to prevent flash of login screen on refresh
    setTimeout(checkLoginStatus, 100);
  }, []);

  // Handle successful login
  const handleLogin = useCallback((username) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
    localStorage.setItem('todoAppCurrentUser', username);
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser('');
    localStorage.removeItem('todoAppCurrentUser');
  }, []);

  // Show loading spinner while checking login status
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {!isLoggedIn ? (
        <AuthComponent onLogin={handleLogin} config={CONFIG.auth} />
      ) : (
        <div className="app-wrapper">
          <div className="user-header">
            <p>Welcome, <span className="username">{currentUser}</span>!</p>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
          <TodoApp username={currentUser} config={CONFIG} />
        </div>
      )}
    </div>
  );
}

// Add loading spinner CSS to App.css
// .loading-container {
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
//   height: 100vh;
// }
// 
// .loading-spinner {
//   border: 4px solid rgba(0, 0, 0, 0.1);
//   border-radius: 50%;
//   border-top: 4px solid #3498db;
//   width: 40px;
//   height: 40px;
//   animation: spin 1s linear infinite;
//   margin-bottom: 20px;
// }
// 
// @keyframes spin {
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// }

export default App;