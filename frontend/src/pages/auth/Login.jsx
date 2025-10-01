import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle } from 'lucide-react'
import { signin } from '@/services/user/client'
import { setupAuthentication } from '@/store/slices/auth.slice'
import { loginSchema } from '@/utils/validation'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    try {
      const response = await signin(data)
      
      if (response.success) {
        // Store token
        localStorage.setItem('accessToken', response.tokens.accessToken)
        
        // Update Redux state
        dispatch(setupAuthentication({
          isAuth: true,
          ...response.data,
        }))

        // Redirect based on user state
        if (!response.data.isPasswordUpdated) {
          navigate('/create-password')
        } else if (!response.data.healthDisclaimerAccepted) {
          navigate('/health-disclaimer')
        } else {
          navigate('/dashboard')
        }
      } else {
        setError(response.message || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-wellness-text">Welcome Back</h2>
        <p className="text-sm text-slate-600 mt-1">Sign in to your wellness account</p>
      </div>

      {error && (
        <Alert className="border-wellness-danger">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className={errors.email ? 'border-wellness-danger' : ''}
          />
          {errors.email && (
            <p className="text-sm text-wellness-danger">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register('password')}
            className={errors.password ? 'border-wellness-danger' : ''}
          />
          {errors.password && (
            <p className="text-sm text-wellness-danger">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full bg-wellness-primary hover:bg-wellness-primary/90" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-wellness-primary hover:underline font-medium">
            Create Account
          </Link>
        </p>
      </div>

      
    </div>
  )
}

export default Login