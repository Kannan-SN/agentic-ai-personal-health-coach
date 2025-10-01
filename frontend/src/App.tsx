import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { userInfo } from './services/user/client'
import { setupAuthentication } from './store/slices/auth.slice'
import AuthLayout from './components/Layout/AuthLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import EmailVerify from './pages/auth/EmailVerify'
import CreatePassword from './pages/auth/CreatePassword'
import HealthDisclaimer from './pages/HealthDisclaimer'
import DashboardLayout from './components/Layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import WellnessPlan from './pages/WellnessPlan'
import ProgressTracking from './pages/ProgressTracking'
import HealthProfile from './pages/HealthProfile'
import Signout from './pages/auth/Signout'
import ErrorBoundary from './components/common/ErrorBoundary'
import HealthChat from './pages/HealthChat'

function App() {
  const location = useLocation()
  const dispatch = useDispatch()
  const { 
    isAuth, 
    isPasswordUpdated, 
    healthDisclaimerAccepted,
    firstName 
  } = useSelector(state => state.auth)

  // Auto-fetch user info on app load if token exists
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token && isAuth && !firstName) {
      fetchUserInfo()
    }
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await userInfo()
      if (response.success) {
        dispatch(setupAuthentication({
          ...response.data,
          isAuth: true
        }))
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      // Don't logout on error - token might still be valid
    }
  }

  // Protected route wrapper
  const ProtectedRoute = ({ children, requireHealthDisclaimer = true }) => {
    if (!isAuth) {
      return <Navigate to="/login" replace state={{ from: location }} />
    }
    
    if (!isPasswordUpdated) {
      return <Navigate to="/create-password" replace />
    }
    
    if (requireHealthDisclaimer && !healthDisclaimerAccepted) {
      return <Navigate to="/health-disclaimer" replace />
    }
    
    return children
  }

  // Auth route wrapper - redirect if already authenticated
  const AuthRoute = ({ children }) => {
    if (isAuth && isPasswordUpdated && healthDisclaimerAccepted) {
      return <Navigate to="/dashboard" replace />
    }
    return children
  }

  // Partial auth route - for users who are logged in but haven't completed setup
  const PartialAuthRoute = ({ children, requireAuth = true }) => {
    if (requireAuth && !isAuth) {
      return <Navigate to="/login" replace />
    }
    
    if (isAuth && isPasswordUpdated && healthDisclaimerAccepted) {
      return <Navigate to="/dashboard" replace />
    }
    
    return children
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-wellness-background">
        <Routes>
          {/* Public Auth Routes */}
          <Route 
            path="/login" 
            element={
              <AuthRoute>
                <AuthLayout>
                  <Login />
                </AuthLayout>
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <AuthRoute>
                <AuthLayout>
                  <Register />
                </AuthLayout>
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/email-verify/:token" 
            element={
              <AuthLayout>
                <EmailVerify />
              </AuthLayout>
            } 
          />
        
          <Route 
            path="/health-disclaimer" 
            element={
              <PartialAuthRoute>
                <AuthLayout>
                  <HealthDisclaimer />
                </AuthLayout>
              </PartialAuthRoute>
            } 
          />

          {/* Signout Route */}
          <Route path="/signout" element={<Signout />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/wellness-plan/:id?" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <WellnessPlan />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/progress" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProgressTracking />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/health-profile" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <HealthProfile />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/chat/:planId?" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <HealthChat />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* Default redirects */}
          <Route 
            path="/" 
            element={
              isAuth ? (
                isPasswordUpdated ? (
                  healthDisclaimerAccepted ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/health-disclaimer" replace />
                  )
                ) : (
                  <Navigate to="/create-password" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App