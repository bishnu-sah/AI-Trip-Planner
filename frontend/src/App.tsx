import { Route, Routes, Link, Navigate } from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';
import CreateTripPage from './pages/CreateTripPage';
import TripDetailsPage from './pages/TripDetailsPage';
import EditTripPage from './pages/EditTripPage';
import HelpPage from './pages/HelpPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import { useFeatures } from './context/FeatureToggleContext';
import { useAuth } from './context/AuthContext';
import PlaceSearchPage from './pages/PlaceSearchPage';
import ExportPage from './pages/ExportPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const { features } = useFeatures();
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      {user && (
        <header>
          <div>
            <strong>🗺️ AI Trip Planner</strong>
          </div>
          <nav>
            <Link to="/">Dashboard</Link>
            {features.trips && <Link to="/create">Create Trip</Link>}
            {features.placeSearch && <Link to="/places">Places</Link>}
            {features.pdfExport && <Link to="/export">Export</Link>}
            <Link to="/help">Help</Link>
            <Link to="/profile">Profile</Link>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>
              👋 Welcome, {user.username}!
            </span>
            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
              }}
            >
              Logout
            </button>
          </div>
        </header>
      )}

      <Routes>
        <Route
          path="/home"
          element={user ? <Navigate to="/" replace /> : <LandingPage />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route
          path="/"
          element={
            user ? (
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />
        {features.trips && (
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateTripPage />
              </ProtectedRoute>
            }
          />
        )}
        {features.trips && (
          <Route
            path="/trips/:id"
            element={
              <ProtectedRoute>
                <TripDetailsPage />
              </ProtectedRoute>
            }
          />
        )}
        {features.trips && (
          <Route
            path="/trips/:id/edit"
            element={
              <ProtectedRoute>
                <EditTripPage />
              </ProtectedRoute>
            }
          />
        )}
        {features.placeSearch && (
          <Route
            path="/places"
            element={
              <ProtectedRoute>
                <PlaceSearchPage />
              </ProtectedRoute>
            }
          />
        )}
        {features.pdfExport && (
          <Route
            path="/export"
            element={
              <ProtectedRoute>
                <ExportPage />
              </ProtectedRoute>
            }
          />
        )}
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <HelpPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;

