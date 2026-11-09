import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';

// Code-split all non-landing routes to keep initial bundle ultra-lightweight (<60KB)
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const ServersPage = lazy(() => import('./pages/ServersPage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CommandsPage = lazy(() => import('./pages/CommandsPage'));
const OwnerPage = lazy(() => import('./pages/OwnerPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lightweight accessible fallback loader
const RouteLoader = () => (
  <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6" role="status" aria-label="Loading page content">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Loading...</span>
    </div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Public Standalone Landing Page & Policies */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/docs" element={<Navigate to="/faq" replace />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
