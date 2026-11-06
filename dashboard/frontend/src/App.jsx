import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import ServersPage from './pages/ServersPage';
import PlayerPage from './pages/PlayerPage';
import LeaderboardPage from './pages/LeaderboardPage';
import Autoplay247Page from './pages/Autoplay247Page';
import ProfilePage from './pages/ProfilePage';
import CommandsPage from './pages/CommandsPage';
import OwnerPage from './pages/OwnerPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/servers" element={<ServersPage />} />
            <Route path="/player" element={<PlayerPage />} />
            <Route path="/queue" element={<PlayerPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/xp" element={<LeaderboardPage />} />
            <Route path="/autoplay-247" element={<Autoplay247Page />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cards" element={<Navigate to="/profile" replace />} />
            <Route path="/commands" element={<CommandsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/owner" element={<OwnerPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
