import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { createPassword } from '@/services/user/client'
import { setupAuthentication } from '@/store/slices/auth.slice'
import { createPasswordSchema } from '@/utils/validation'

const CreatePassword = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { firstName } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPasswordSchema),
  })

  const password = watch('password')

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || ''
    }
  }

  const passwordStrength = getPasswordStrength(password)

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')

    try {
      const response = await createPassword({ password: data.password })
      
      if (response.success) {
        // Store new token
        localStorage.setItem('accessToken', response.tokens.accessToken)
        
        // Update Redux state
        dispatch(setupAuthentication({
          isAuth: true,
          isPasswordUpdated: true,
          ...response.data,
        }))

        // Redirect to health disclaimer
        navigate('/health-disclaimer')
      } else {
        setError(response.message || 'Password creation failed')
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
        <h2 className="text-2xl font-bold text-wellness-text">Create Your Password</h2>
        <p className="text-sm text-slate-600 mt-1">
          Welcome {firstName}! Please create a secure password for your account.
        </p>
      </div>

      {error && (
        <Alert className="border-wellness-danger">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            {...register('password')}
            className={errors.password ? 'border-wellness-danger' : ''}
          />
          {errors.password && (
            <p className="text-sm text-wellness-danger">{errors.password.message}</p>
          )}
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-600">{passwordStrength.label}</span>
              </div>
              
              <div className="text-xs text-slate-600 space-y-1">
                <p>Password requirements:</p>
                <ul className="space-y-1 ml-4">
                  <li className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                    ✓ At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    ✓ One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    ✓ One lowercase letter
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    ✓ One number
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'border-wellness-danger' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-wellness-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-wellness-primary hover:bg-wellness-primary/90" 
          disabled={loading || passwordStrength.strength < 3}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Password
        </Button>
      </form>

      <Alert className="bg-blue-50 border-blue-200">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Your password is encrypted and stored securely. Next, you'll review our health disclaimers 
          to ensure safe use of our wellness platform.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default CreatePassword