import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Canvas from './components/Canvas'; // Import your Canvas component
import Login from './components/Login';   // Import your Login component
import Signup from './components/Signup'; // Import your Signup component
import { AuthProvider } from './context/AuthProvider'; // Assuming you have an AuthProvider

const App = () => {
  return (
    <AuthProvider> {/* Wrap with AuthProvider for authentication */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/canvas" element={<Canvas />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
