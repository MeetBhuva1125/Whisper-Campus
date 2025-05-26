// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AnonymousProvider } from './context/AnonymousContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AnonymousProvider>
          <div className="app">
            <Navbar />
            <main className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create-post" element={<CreatePost />} />
              </Routes>
            </main>
          </div>
        </AnonymousProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;