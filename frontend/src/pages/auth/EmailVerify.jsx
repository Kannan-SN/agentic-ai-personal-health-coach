import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { verifyEmail } from '@/services/user/client'
import { setupAuthentication } from '@/store/slices/auth.slice'

const EmailVerify = () => {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No verification token provided')
        setLoading(false)
        return
      }

      try {
        const response = await verifyEmail(token)
        
        if (response.success) {
          setSuccess(true)
          
          // Store token and user data
          localStorage.setItem('accessToken', response.tokens.accessToken)
          dispatch(setupAuthentication({
            isAuth: true,
            mode: 'pending',
            ...response.data
          }))

          // Auto-redirect after 3 seconds
          setTimeout(() => {
            navigate('/create-password')
          }, 3000)
        } else {
          setError(response.message || 'Email verification failed')
        }
      } catch (err) {
        setError('An unexpected error occurred during verification')
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [token, dispatch, navigate])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-wellness-primary" />
          <h2 className="text-2xl font-bold text-wellness-text mt-4">Verifying Email</h2>
          <p className="text-sm text-slate-600 mt-2">
            Please wait while we verify your email address...
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-wellness-success" />
          <h2 className="text-2xl font-bold text-wellness-text mt-4">Email Verified!</h2>
          <p className="text-sm text-slate-600 mt-2">
            Your email has been successfully verified. You'll be redirected to create your password.
          </p>
        </div>

        <Alert className="bg-wellness-success/10 border-wellness-success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Email verification successful! Redirecting to password creation...
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <Button onClick={() => navigate('/create-password')} className="bg-wellness-primary">
            Continue to Password Creation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-wellness-danger" />
        <h2 className="text-2xl font-bold text-wellness-text mt-4">Verification Failed</h2>
        <p className="text-sm text-slate-600 mt-2">
          We couldn't verify your email address.
        </p>
      </div>

      <Alert className="border-wellness-danger">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>

      <div className="text-center space-y-2">
        <p className="text-sm text-slate-600">
          The verification link may have expired or is invalid.
        </p>
        <Link to="/login" className="text-wellness-primary hover:underline font-medium">
          Return to Login
        </Link>
      </div>
    </div>
  )
}

export default EmailVerify