import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react'
import { signup } from '@/services/user/client'
import { registerSchema } from '@/utils/validation'
import PasswordStrengthIndicator from './PasswordStrengthIndicator'

const Register = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await signup({
        ...data
      })
      
      if (response.success) {
        setSuccess(true)
      } else {
        setError(response.message || 'Registration failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-wellness-success" />
          <h2 className="text-2xl font-bold text-wellness-text mt-4">Check Your Email</h2>
          <p className="text-sm text-slate-600 mt-2">
            We've sent a verification link to your email address. 
            Please check your inbox and click the link to activate your account.
          </p>
        </div>

        <Alert className="bg-wellness-success/10 border-wellness-success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Account created successfully! Please verify your email to continue.
          </AlertDescription>
        </Alert>

        <div className="text-center">
          <Link to="/login" className="text-wellness-primary hover:underline font-medium">
            Return to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-wellness-text">Create Account</h2>
        <p className="text-sm text-slate-600 mt-1">Start your wellness journey today</p>
      </div>

      {error && (
        <Alert className="border-wellness-danger">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="First name"
              {...register('firstName')}
              className={errors.firstName ? 'border-wellness-danger' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-wellness-danger">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Last name"
              {...register('lastName')}
              className={errors.lastName ? 'border-wellness-danger' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-wellness-danger">{errors.lastName.message}</p>
            )}
          </div>
        </div>

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
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              {...register('password')}
              className={errors.password ? 'border-wellness-danger pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && <PasswordStrengthIndicator password={password} />}
          {errors.password && (
            <p className="text-sm text-wellness-danger">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-wellness-danger pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-wellness-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

     

        <Button 
          type="submit" 
          className="w-full bg-wellness-primary hover:bg-wellness-primary/90" 
          disabled={loading }
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-wellness-primary hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register