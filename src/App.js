import React, { useState, useEffect } from 'react';
import { TodoApp } from './components/TodoApp';
import AuthComponent from './components/AuthComponent';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  
  // check prev login
  useEffect(() => {
    const loggedInUser = localStorage.getItem('todoAppCurrentUser');
    if (loggedInUser) {
      setIsLoggedIn(true);
      setCurrentUser(loggedInUser);
    }
  }, []);

  // success login
  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
    localStorage.setItem('todoAppCurrentUser', username);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    localStorage.removeItem('todoAppCurrentUser');
  };

  return (
    <div className="App">
      {!isLoggedIn && <AuthComponent onLogin={handleLogin} />}
      
      {isLoggedIn && (
        <div className="app-wrapper">
          <div className="user-header">
            <p>Welcome, <span className="username">{currentUser}</span>!</p>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
          <TodoApp username={currentUser} />
        </div>
      )}
    </div>
  );
}

export default App;