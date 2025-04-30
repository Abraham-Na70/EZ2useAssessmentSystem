import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import '../App.css';

// Define the CONFIG object that was missing
const CONFIG = {
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
  }
};

function TodoApp({ username }) {
  const [todos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editId, setEditId] = useState(null);
  const [time, setTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showHistory, setShowHistory] = useState(false);

  const API_URL = 'https://your-backend-api.com/api/todos'; // Replace with your backend API URL

  // Fetch todos and completed tasks from the backend
  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL); // Make an API call to get todos
      setTodos(response.data.todos);
      setCompletedTodos(response.data.completedTodos);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Handle responsive design
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch todos and completed todos when the component mounts
  useEffect(() => {
    fetchTodos(); // Fetch todos and completed tasks when component mounts
  }, []);

  // Update the clock every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId); // Clean up on component unmount
  }, []);

  // Add a new todo
  const addTodo = async (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const newTodo = {
        id: uuidv4(),
        task: inputValue,
        completed: false,
        dateCreated: new Date().toISOString()
      };

      try {
        const response = await axios.post(API_URL, newTodo); // POST the new todo to the API
        setTodos([...todos, response.data]);
        setInputValue('');
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`); // DELETE request to remove the todo from backend
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Toggle completion status of a todo
  const toggleComplete = async (id) => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === id);
      const updatedTodo = { ...todoToUpdate, completed: !todoToUpdate.completed };
      
      await axios.patch(`${API_URL}/${id}`, updatedTodo); // PATCH the todo to update it
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (error) {
      console.error("Error toggling todo completion:", error);
    }
  };

  // Mark todo as completed and move it to completed list
  const completeTask = async (todo) => {
    const completedTask = { ...todo, dateCompleted: new Date().toISOString() };
    
    try {
      await axios.post(`${API_URL}/completed`, completedTask); // POST completed todo to backend
      await deleteTodo(todo.id); // Remove from active todos
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  // Start editing a todo
  const startEditing = (todo) => {
    setEditId(todo.id);
    setEditValue(todo.task);
  };

  // Save the edited todo
  const saveEdit = async (e) => {
    e.preventDefault();
    if (editValue.trim()) {
      const updatedTodo = { id: editId, task: editValue, completed: false };
      try {
        await axios.patch(`${API_URL}/${editId}`, updatedTodo); // PATCH the updated todo
        setTodos(todos.map(todo => todo.id === editId ? updatedTodo : todo));
        setEditId(null);
        setEditValue('');
      } catch (error) {
        console.error("Error saving edited todo:", error);
      }
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setEditValue('');
  };

  // Toggle history modal
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Render time string
  const renderTime = () => {
    if (!CONFIG.clock.enabled) return null;

    let timeString = '';
    if (CONFIG.clock.format.showDate) {
      timeString += time.toLocaleDateString() + ' ';
    }
    if (CONFIG.clock.format.showTime) {
      timeString += time.toLocaleTimeString();
    }

    return (
      <div className="current-time">
        <p>{timeString}</p>
      </div>
    );
  };

  const renderAddTodoForm = () => {
    return (
      <form onSubmit={addTodo} className={`todo-form ${isMobile ? 'mobile-form' : ''}`}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="todo-input"
          placeholder={CONFIG.placeholders.newTask}
        />
        <button type="submit" className="todo-btn add-btn">{isMobile ? '+' : '+Task'}</button>
      </form>
    );
  };

  const renderEditForm = (todo) => {
    return (
      <form onSubmit={saveEdit} className={`todo-form edit-form ${isMobile ? 'mobile-edit-form' : ''}`}>
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="todo-input"
          placeholder={CONFIG.placeholders.editTask}
        />
        <div className="edit-buttons">
          <button type="submit" className="todo-btn save-btn">{isMobile ? '✓' : 'Save'}</button>
          <button type="button" className="todo-btn cancel-btn" onClick={cancelEdit}>{isMobile ? '✕' : 'Cancel'}</button>
        </div>
      </form>
    );
  };

  const renderTodoItem = (todo) => {
    if (editId === todo.id) {
      return renderEditForm(todo);
    }

    return (
      <div className={`todo-item ${isMobile ? 'mobile-todo-item' : ''}`} key={todo.id}>
        <p
          className={`todo-text ${todo.completed ? "completed" : ""}`}
          onClick={() => toggleComplete(todo.id)}
        >
          {todo.task}
        </p>
        <div className="todo-actions vertical">
          <button className="action-btn complete-btn" onClick={() => completeTask(todo)}>
            Complete
          </button>
          <button className="action-btn edit-btn" onClick={() => startEditing(todo)}>
            Edit
          </button>
          <button className="action-btn delete-btn" onClick={() => deleteTodo(todo.id)}>
            Delete
          </button>
        </div>
      </div>
    );
  };

  const renderTodoList = () => {
    if (todos.length === 0) {
      return <p className="empty-message">{CONFIG.emptyMessage}</p>;
    }

    return (
      <div className={`todo-list ${isMobile ? 'mobile-todo-list' : ''}`}>
        {todos.map(todo => (
          <div key={todo.id}>
            {renderTodoItem(todo)}
          </div>
        ))}
      </div>
    );
  };

  const renderHistoryModal = () => {
    if (!showHistory) return null;

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString();
    };

    return (
      <div className="history-overlay">
        <div className="history-container">
          <div className="history-header">
            <h2>Completed Tasks History</h2>
            <button className="history-close-btn" onClick={toggleHistory}>✕</button>
          </div>

          <div className="history-content">
            {completedTodos.length === 0 ? (
              <p className="empty-message">No completed tasks yet!</p>
            ) : (
              <div className="completed-list">
                {completedTodos.map((todo, index) => (
                  <div key={index} className="completed-item">
                    <p className="completed-text">{todo.task}</p>
                    <p className="completed-date">
                      Completed: {formatDate(todo.dateCompleted)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`todo-app ${isMobile ? 'mobile-todo-app' : ''}`}>
      <h1 className={isMobile ? 'mobile-title' : ''}>{CONFIG.appTitle}</h1>
      {renderTime()}
      {renderAddTodoForm()}
      {renderTodoList()}
      <div className="history-button-container">
        <span className="history-text" onClick={toggleHistory}>History</span>
      </div>
      {renderHistoryModal()}
    </div>
  );
}

export { TodoApp };
export default TodoApp;