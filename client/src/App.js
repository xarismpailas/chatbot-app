import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import Logo from './components/Logo';

// Placeholder Home component
const Home = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full">
      <div className="flex justify-center mb-6">
        <Logo size="lg" withText={true} />
      </div>
      
      <h1 className="text-3xl font-bold text-primary-600 mb-6 text-center">Welcome to Chatbot SaaS Platform</h1>
      <p className="text-gray-600 mb-6 text-center">
        A comprehensive platform for creating, training, and managing custom chatbots with specific knowledge bases.
      </p>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-lg text-primary-700">Getting Started</h2>
          <p className="text-gray-600">Register or log in to start using the platform.</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-lg text-primary-700">Custom Knowledge Bases</h2>
          <p className="text-gray-600">Upload documents and train your chatbot on specific information.</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-lg text-primary-700">Analytics</h2>
          <p className="text-gray-600">Track usage and performance of your chatbots.</p>
        </div>
      </div>
      <div className="mt-8 flex justify-center space-x-4">
        <a href="/login" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-md">
          Login
        </a>
        <a href="/register" className="bg-white border border-primary-600 text-primary-600 hover:bg-gray-50 font-medium py-2 px-6 rounded-md">
          Register
        </a>
      </div>
    </div>
  </div>
);

// Main App component
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App; 