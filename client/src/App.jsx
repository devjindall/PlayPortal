import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RootLayout from './layouts/RootLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GamesPage from './pages/GamesPage';
import GameDetailsPage from './pages/GameDetailsPage';
import GamePlayPage from './pages/GamePlayPage';
import LeaderboardPage from './pages/LeaderboardPage';
import MultiplayerLobbyPage from './pages/MultiplayerLobbyPage';
import MultiplayerRoomPage from './pages/MultiplayerRoomPage';

// Authenticated User Pages
import ProfilePage from './pages/ProfilePage';
import PlayerHistoryPage from './pages/PlayerHistoryPage';

// Developer Pages
import DeveloperDashboardPage from './pages/DeveloperDashboardPage';
import UploadGamePage from './pages/UploadGamePage';

// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSubmissionsPage from './pages/AdminSubmissionsPage';
import AdminGamesPage from './pages/AdminGamesPage';
import AdminUsersPage from './pages/AdminUsersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            {/* Public Discovery Routes */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="games/:id" element={<GameDetailsPage />} />
            <Route path="games/:id/play" element={<GamePlayPage />} />
            <Route path="games/:id/leaderboard" element={<LeaderboardPage />} />

            {/* Multiplayer Routes */}
            <Route path="multiplayer" element={<MultiplayerLobbyPage />} />
            <Route path="multiplayer/room/:roomId" element={<MultiplayerRoomPage />} />

            {/* Authenticated Player Profile Routes */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile/history"
              element={
                <ProtectedRoute>
                  <PlayerHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* Developer Portal Routes (DEVELOPER / ADMIN) */}
            <Route
              path="developer"
              element={
                <ProtectedRoute allowedRoles={['DEVELOPER', 'ADMIN']}>
                  <DeveloperDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="developer/games"
              element={
                <ProtectedRoute allowedRoles={['DEVELOPER', 'ADMIN']}>
                  <DeveloperDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="developer/games/upload"
              element={
                <ProtectedRoute allowedRoles={['DEVELOPER', 'ADMIN']}>
                  <UploadGamePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Panel Routes (ADMIN) */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/submissions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminSubmissionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/games"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminGamesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
