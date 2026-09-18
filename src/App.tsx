import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth/Auth';
import Dashboard from './pages/Dashboard/Dashboard';
import Intro from './pages/Intro/Intro';
import { AudioRuntime } from './components/AudioRuntime';
import './GamePolish.css';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const AuthenticatedDestination = () => {
  const { introRequired } = useAuth();
  return <Navigate to={introRequired ? "/intro" : "/dashboard"} replace />;
};

const IntroRoute = () => {
  const { introRequired } = useAuth();
  return introRequired ? <Intro /> : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  const { user, introRequired } = useAuth();
  return (
    <Routes>
      <Route path="/auth" element={user ? <AuthenticatedDestination /> : <Auth />} />
      <Route path="/intro" element={<PrivateRoute><IntroRoute /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute>{introRequired ? <Navigate to="/intro" replace /> : <Dashboard key={user?.id} />}</PrivateRoute>} />
      <Route path="/" element={user ? <AuthenticatedDestination /> : <Navigate to="/auth" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AudioRuntime />
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
