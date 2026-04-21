import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LogWorkout from './pages/LogWorkout';
import History from './pages/History';
import LogFoodPage from './pages/LogFood';
import FoodHistoryPage from './pages/FoodHistoryPage';
import Feed from './pages/Feed';
import UserProfile from './pages/UserProfile';
import NotificationsPage from './pages/NotificationsPage';
import PostPage from './pages/PostPage';
import ChatPage from './pages/ChatPage';
import AICoach from './pages/AICoach';
import Onboarding from './components/Onboarding';
import { logout } from './api';
import toast, { Toaster } from 'react-hot-toast';
import './index.css';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const onboarding = params.get('onboarding');

    if (userId) {
      setIsLoggedIn(true);
      if (onboarding === 'true') setIsOnboarding(true);
      setLoading(false);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    fetch('/api/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.isLoggedIn) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => setIsLoggedIn(false))
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggedIn(false);
    }
  };

  const handleOnboardingComplete = () => {
    setIsOnboarding(false);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onRegisterSuccess={handleLogin} />} />

          {/* Protected Routes */}
          <Route path="/" element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />

          <Route
            path="/profile"
            element={
              isLoggedIn
                ? isOnboarding
                  ? <Onboarding onComplete={handleOnboardingComplete} />
                  : <Profile onLogout={handleLogout} />
                : <Navigate to="/login" />
            }
          />

          <Route path="/feed" element={isLoggedIn ? <Feed onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={isLoggedIn ? <NotificationsPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/chat" element={isLoggedIn ? <ChatPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/ai-coach" element={isLoggedIn ? <AICoach onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/post/:id" element={isLoggedIn ? <PostPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/user/:id" element={isLoggedIn ? <UserProfile onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/log-workout" element={isLoggedIn ? <LogWorkout onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/log-food" element={isLoggedIn ? <LogFoodPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/food-history" element={isLoggedIn ? <FoodHistoryPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/history" element={isLoggedIn ? <History onLogout={handleLogout} /> : <Navigate to="/login" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
}