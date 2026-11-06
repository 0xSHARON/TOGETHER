import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import OverviewPage from './pages/OverviewPage';
import ServersPage from './pages/ServersPage';
import PlayerPage from './pages/PlayerPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import CommandsPage from './pages/CommandsPage';
import OwnerPage from './pages/OwnerPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Standalone Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated / Dashboard Layout Pages */}
          <Route element={<DashboardLayout />}>
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/servers" element={<ServersPage />} />
            <Route path="/player" element={<PlayerPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/commands" element={<CommandsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/owner" element={<OwnerPage />} />

            {/* Legacy & Deprecated Route Redirects */}
            <Route path="/cards" element={<Navigate to="/profile" replace />} />
            <Route path="/autoplay-247" element={<Navigate to="/settings" replace />} />
            <Route path="/xp" element={<Navigate to="/leaderboard" replace />} />
            <Route path="/queue" element={<Navigate to="/player" replace />} />
          </Route>

          {/* Custom 404 Error Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
