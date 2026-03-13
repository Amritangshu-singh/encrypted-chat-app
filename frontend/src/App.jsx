import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Chat from './pages/Chat';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    if (token && userData) {
      try {
        setIsAuthenticated(true);
        setCurrentUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleSetAuthenticated = (value) => setIsAuthenticated(value);
  const handleSetCurrentUser = (user) => setCurrentUser(user);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Chat
                user={currentUser}
                setIsAuthenticated={handleSetAuthenticated}
              />
            ) : (
              <Navigate to="/register" replace />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Register
                setIsAuthenticated={handleSetAuthenticated}
                setCurrentUser={handleSetCurrentUser}
              />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
