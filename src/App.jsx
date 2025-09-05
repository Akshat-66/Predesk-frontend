import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import CreateProfile from './components/CreateProfile';
import Edit from './components/Edit';


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
