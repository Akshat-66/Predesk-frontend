import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CreateProfile from './pages/CreateProfile';
import Edit from './pages/Edit';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/create" element={<CreateProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit" element={<Edit />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
