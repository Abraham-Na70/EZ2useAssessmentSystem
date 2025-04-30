import React, { useState, useEffect } from 'react';
import '../App.css';

const AuthComponent = ({ onLogin }) => {
  // States
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Load users
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('todoAppUsers')) || [];
    setUsers(savedUsers);
  }, []);

  // Register
  const handleRegister = (e) => {
    e.preventDefault();
    
    // Validation
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    
    // Check Uname
    if (users.some(user => user.username === username)) {
      setError('Username exists');
      return;
    }
    
    // Create new user
    const newUser = { username, password };
    const updatedUsers = [...users, newUser];
    
    // Save to local
    localStorage.setItem('todoAppUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    // Clear form & regis success
    setUsername('');
    setPassword('');
    setError('Registration successful!');
    
    // Switch to login
    setTimeout(() => {
      setError('');
      setIsLogin(true);
    }, 1500);
  };

  // Login
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Validation
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    
    // Find user
    const user = users.find(user => user.username === username && user.password === password);
    
    if (user) {
      // Success
      setError('');
      onLogin(user.username); 
    } else {
      setError('Invalid credentials');
    }
  };

  // User select
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUsername(user.username);
  };

  // Delete user
  const handleDeleteUser = (e, usernameToDelete) => {
    e.stopPropagation(); // Prevent triggering user selection
    
    // Filter out the user to delete
    const updatedUsers = users.filter(user => user.username !== usernameToDelete);
    
    // Save to localStorage
    localStorage.setItem('todoAppUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  // Verify password
  const handleVerifyUser = (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    
    if (selectedUser.password === password) {
      setError('');
      onLogin(selectedUser.username);
    } else {
      setError('Invalid password');
    }
  };

  // Toggle login/register
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setPassword('');
    setSelectedUser(null);
  };

  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="auth-form">
      <h2>Create Account</h2>
      <div className="form-group">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="auth-input"
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="auth-input"
        />
      </div>
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" className="auth-button">Register</button>
      <p className="auth-toggle">
        Already have an account? <span onClick={toggleAuthMode}>Login</span>
      </p>
    </form>
  );

  const renderLoginForm = () => {
    if (selectedUser) {
      return (
        <form onSubmit={handleVerifyUser} className="auth-form">
          <h2>Enter Password</h2>
          <p className="selected-user">for {selectedUser.username}</p>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="auth-input"
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-button">Login</button>
          <button 
            type="button" 
            className="auth-button secondary"
            onClick={() => setSelectedUser(null)}
          >
            Back
          </button>
        </form>
      );
    }

    return (
      <div className="auth-form">
        <h2>Login</h2>
        
        {users.length > 0 ? (
          <>
            <div className="user-list">
              {users.map((user, index) => (
                <div key={index} className="user-button-container">
                  <button
                    className="user-button"
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.username}
                    <span 
                      className="user-delete-text"
                      onClick={(e) => handleDeleteUser(e, user.username)}
                      title="Delete user"
                    >
                      ✕
                    </span>
                  </button>
                </div>
              ))}
            </div>
            <p className="or-divider">or</p>
          </>
        ) : null}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="auth-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="auth-input"
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-button">Login</button>
        </form>
        
        <p className="auth-toggle">
          Need an account? <span onClick={toggleAuthMode}>Register</span>
        </p>
      </div>
    );
  };

  return (
    <div className="auth-overlay">
      <div className="auth-container">
        {isLogin ? renderLoginForm() : renderRegisterForm()}
      </div>
    </div>
  );
};

export default AuthComponent;