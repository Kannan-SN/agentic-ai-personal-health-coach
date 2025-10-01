import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, AlertTriangle, Calendar } from 'lucide-react'
import { z } from 'zod'

const basicInfoSchema = z.object({
  age: z.number().min(13, 'Age must be at least 13').max(100, 'Age must be less than 100'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  height: z.number().min(30, 'Height is required').max(300, 'Invalid height'),
  heightUnit: z.enum(['inches', 'cm']),
  weight: z.number().min(50, 'Weight is required').max(1000, 'Invalid weight'),
  weightUnit: z.enum(['lbs', 'kg']),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  primaryGoal: z.enum(['weight_loss', 'weight_gain', 'muscle_gain', 'general_fitness', 'endurance', 'strength']),
}).refine((data) => {
  // Validate age matches date of birth
  if (data.dateOfBirth && data.age) {
    const birthDate = new Date(data.dateOfBirth)
    const today = new Date()
    const calculatedAge = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000))
    return Math.abs(calculatedAge - data.age) <= 1
  }
  return true
}, {
  message: "Age must match date of birth",
  path: ["age"]
})

const BasicInfoForm = ({ initialData, onSubmit, loading, error }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      age: initialData?.age || '',
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
      height: initialData?.height?.value || '',
      heightUnit: initialData?.height?.unit || 'inches',
      weight: initialData?.weight?.current || '',
      weightUnit: initialData?.weight?.unit || 'lbs',
      gender: initialData?.gender || '',
      activityLevel: initialData?.currentActivityLevel || '',
      primaryGoal: initialData?.primaryGoal || '',
    }
  })

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      reset({
        age: initialData.age || '',
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        height: initialData.height?.value || '',
        heightUnit: initialData.height?.unit || 'inches',
        weight: initialData.weight?.current || '',
        weightUnit: initialData.weight?.unit || 'lbs',
        gender: initialData.gender || '',
        activityLevel: initialData.currentActivityLevel || '',
        primaryGoal: initialData.primaryGoal || '',
      })
    }
  }, [initialData, reset])

  const age = watch('age')
  const primaryGoal = watch('primaryGoal')
  const dateOfBirth = watch('dateOfBirth')

  // Calculate age from date of birth
  const calculateAge = (birthDate) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    return Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000))
  }

  // Auto-update age when date of birth changes
  React.useEffect(() => {
    if (dateOfBirth) {
      const calculatedAge = calculateAge(dateOfBirth)
      if (calculatedAge && calculatedAge !== age) {
        setValue('age', calculatedAge)
      }
    }
  }, [dateOfBirth, setValue, age])

  const getAgeWarning = (age) => {
    if (age < 18) return 'Professional consultation strongly recommended for users under 18'
    if (age > 65) return 'Professional consultation recommended for users over 65'
    return null
  }

  const getGoalWarning = (goal) => {
    if (goal === 'weight_loss' || goal === 'weight_gain') {
      return 'Weight management goals require careful monitoring and professional guidance'
    }
    return null
  }

  const onFormSubmit = (data) => {
    const formattedData = {
      age: data.age,
      dateOfBirth: new Date(data.dateOfBirth).toISOString(),
      height: {
        value: data.height,
        unit: data.heightUnit
      },
      weight: {
        current: data.weight,
        unit: data.weightUnit
      },
      gender: data.gender,
      currentActivityLevel: data.activityLevel,
      primaryGoal: data.primaryGoal
    }
    onSubmit(formattedData)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleSubmit(onFormSubmit)(e)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert className="border-red-300 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth *
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('dateOfBirth')}
                className={errors.dateOfBirth ? 'border-red-300' : ''}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="100"
                {...register('age', { valueAsNumber: true })}
                className={errors.age ? 'border-red-300' : 'bg-gray-50'}
                readOnly
              />
              {errors.age && (
                <p className="text-sm text-red-600">{errors.age.message}</p>
              )}
              {age && getAgeWarning(age) && (
                <p className="text-sm text-amber-600">{getAgeWarning(age)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={watch('gender')} onValueChange={(value) => setValue('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height *</Label>
              <div className="flex gap-2">
                <Input
                  id="height"
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  {...register('height', { valueAsNumber: true })}
                  className={errors.height ? 'border-red-300' : ''}
                />
            <div className="space-y-2">
              {/* <Label htmlFor="heightUnit">Height Unit</Label> */}
              <Select value={watch('heightUnit')} onValueChange={(value) => setValue('heightUnit', value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inches">in</SelectItem>
                  <SelectItem value="cm">cm</SelectItem>
                </SelectContent>
              </Select>
            </div>
              </div>
              {errors.height && (
                <p className="text-sm text-red-600">{errors.height.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight *</Label>
              <div className="flex gap-2">
                <Input
                  id="weight"
                  type="number"
                  min="50"
                  max="1000"
                  step="0.1"
                  {...register('weight', { valueAsNumber: true })}
                  className={errors.weight ? 'border-red-300' : ''}
                />
            <div className="space-y-2">
              {/* <Label htmlFor="weightUnit">Weight Unit</Label> */}
              <Select value={watch('weightUnit')} onValueChange={(value) => setValue('weightUnit', value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lbs">lbs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
              </div>
              {errors.weight && (
                <p className="text-sm text-red-600">{errors.weight.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">Current Activity Level *</Label>
              <Select value={watch('activityLevel')} onValueChange={(value) => setValue('activityLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (2x/day or intense)</SelectItem>
                </SelectContent>
              </Select>
              {errors.activityLevel && (
                <p className="text-sm text-red-600">{errors.activityLevel.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryGoal">Primary Goal *</Label>
              <Select value={watch('primaryGoal')} onValueChange={(value) => setValue('primaryGoal', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="weight_gain">Weight Gain</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                </SelectContent>
              </Select>
              {errors.primaryGoal && (
                <p className="text-sm text-red-600">{errors.primaryGoal.message}</p>
              )}
              {primaryGoal && getGoalWarning(primaryGoal) && (
                <p className="text-sm text-amber-600">{getGoalWarning(primaryGoal)}</p>
              )}
            </div>
          </div>

          <Alert className="border-blue-300 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Privacy Notice:</strong> Your health information is encrypted and protected. Age is automatically calculated from your date of birth for accuracy.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleFormSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Basic Information
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BasicInfoForm