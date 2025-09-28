import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AuthLayout from './components/layouts/AuthLayout'
import DashboardLayout from './components/layouts/DashboardLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import EmailVerify from './pages/auth/EmailVerify'
import CreatePassword from './pages/auth/CreatePassword'
import Dashboard from './pages/Dashboard'
import WellnessPlan from './pages/WellnessPlan'
import ProgressTracking from './pages/ProgressTracking'
import HealthProfile from './pages/HealthProfile'
import HealthChat from './pages/HealthChat'
import HealthDisclaimer from './pages/HealthDisclaimer'
import Signout from './pages/auth/Signout'

function App() {
  const { isAuth, isPasswordUpdated, healthDisclaimerAccepted } = useSelector(state => state.auth)

  const ProtectedRoute = ({ children }) => {
    if (!isAuth) {
      return <Navigate to="/login" replace />
    }
    if (!isPasswordUpdated) {
      return <Navigate to="/create-password" replace />
    }
    if (!healthDisclaimerAccepted) {
      return <Navigate to="/health-disclaimer" replace />
    }
    return children
  }

  const AuthRoute = ({ children }) => {
    if (isAuth && isPasswordUpdated && healthDisclaimerAccepted) {
      return <Navigate to="/dashboard" replace />
    }
    return children
  }

  return (
    <div className="min-h-screen bg-wellness-background">
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={
          <AuthRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </AuthRoute>
        } />
        <Route path="/register" element={
          <AuthRoute>
            <AuthLayout>
              <Register />
            </AuthLayout>
          </AuthRoute>
        } />
        <Route path="/email-verify/:token" element={
          <AuthLayout>
            <EmailVerify />
          </AuthLayout>
        } />
        <Route path="/create-password" element={
          <AuthLayout>
            <CreatePassword />
          </AuthLayout>
        } />
        <Route path="/health-disclaimer" element={
          <AuthLayout>
            <HealthDisclaimer />
          </AuthLayout>
        } />
        <Route path="/signout" element={<Signout />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/wellness-plan/:id?" element={
          <ProtectedRoute>
            <DashboardLayout>
              <WellnessPlan />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/progress" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProgressTracking />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/health-profile" element={
          <ProtectedRoute>
            <DashboardLayout>
              <HealthProfile />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/chat/:planId?" element={
          <ProtectedRoute>
            <DashboardLayout>
              <HealthChat />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App