import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertTriangle, Heart, Activity, Apple } from 'lucide-react'
import { z } from 'zod'

const progressSchema = z.object({
  currentWeek: z.number().min(1).max(52),
  energyLevel: z.number().min(1).max(5),
  sleepHours: z.number().min(1).max(24).optional(),
  sleepQuality: z.number().min(1).max(5).optional(),
  stressLevel: z.number().min(1).max(5).optional(),
  mood: z.number().min(1).max(5).optional(),
  workoutCompletionRate: z.number().min(0).max(100).optional(),
  nutritionAdherence: z.number().min(0).max(100).optional(),
  waterIntake: z.number().min(0).max(20).optional(),
  progressNotes: z.string().max(1000).optional(),
})

const concerningSymptoms = [
  'Chest pain', 'Severe shortness of breath', 'Dizziness or fainting',
  'Severe fatigue', 'Joint pain', 'Back pain', 'Headaches',
  'Nausea', 'Unusual mood changes', 'Sleep disturbances'
]

const ProgressForm = ({ onSubmit, loading, error, activePlan }) => {
  const [reportedSymptoms, setReportedSymptoms] = useState([])
  const [hasConcerns, setHasConcerns] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      currentWeek: activePlan?.currentWeek || 1,
      energyLevel: 3,
      sleepQuality: 3,
      stressLevel: 3,
      mood: 3,
    }
  })

  const energyLevel = watch('energyLevel')
  const sleepQuality = watch('sleepQuality')
  const stressLevel = watch('stressLevel')
  const mood = watch('mood')

  const handleSymptomChange = (symptom, checked) => {
    if (checked) {
      setReportedSymptoms([...reportedSymptoms, symptom])
    } else {
      setReportedSymptoms(reportedSymptoms.filter(s => s !== symptom))
    }
  }

  const onFormSubmit = (data) => {
    const progressData = {
      ...data,
      reportedSymptoms: reportedSymptoms.map(symptom => ({
        symptom,
        severity: 'moderate' // Default severity
      })),
      concerns: hasConcerns ? data.progressNotes : ''
    }
    onSubmit(progressData)
  }

  const getEnergyLevelColor = (level) => {
    if (level <= 2) return 'text-red-600'
    if (level <= 3) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getMoodColor = (mood) => {
    if (mood <= 2) return 'text-red-600'
    if (mood <= 3) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {error && (
        <Alert className="border-wellness-danger">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Week Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Week Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentWeek">Current Week</Label>
              <Input
                id="currentWeek"
                type="number"
                min="1"
                max="52"
                {...register('currentWeek', { valueAsNumber: true })}
                className={errors.currentWeek ? 'border-wellness-danger' : ''}
              />
              {errors.currentWeek && (
                <p className="text-sm text-wellness-danger">{errors.currentWeek.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workoutCompletionRate">Workout Completion (%)</Label>
              <Input
                id="workoutCompletionRate"
                type="number"
                min="0"
                max="100"
                placeholder="e.g., 80"
                {...register('workoutCompletionRate', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nutritionAdherence">Nutrition Plan Adherence (%)</Label>
            <Input
              id="nutritionAdherence"
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 75"
              {...register('nutritionAdherence', { valueAsNumber: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health & Wellness Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="energyLevel">Energy Level (1-5)</Label>
              <Select onValueChange={(value) => setValue('energyLevel', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select energy level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Moderate</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
              <p className={`text-sm font-medium ${getEnergyLevelColor(energyLevel)}`}>
                {energyLevel <= 2 && 'Consider rest and professional consultation if persistent'}
                {energyLevel === 3 && 'Normal energy levels'}
                {energyLevel >= 4 && 'Good energy levels'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleepHours">Sleep Hours per Night</Label>
              <Input
                id="sleepHours"
                type="number"
                min="1"
                max="24"
                placeholder="e.g., 8"
                {...register('sleepHours', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleepQuality">Sleep Quality (1-5)</Label>
              <Select onValueChange={(value) => setValue('sleepQuality', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sleep quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Poor</SelectItem>
                  <SelectItem value="2">2 - Poor</SelectItem>
                  <SelectItem value="3">3 - Fair</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">Overall Mood (1-5)</Label>
              <Select onValueChange={(value) => setValue('mood', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Neutral</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
              <p className={`text-sm font-medium ${getMoodColor(mood)}`}>
                {mood <= 2 && 'Consider speaking with a healthcare professional if mood remains low'}
                {mood === 3 && 'Neutral mood - consider stress management techniques'}
                {mood >= 4 && 'Positive mood levels'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stressLevel">Stress Level (1-5)</Label>
              <Select onValueChange={(value) => setValue('stressLevel', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stress level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Moderate</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
              {stressLevel >= 4 && (
                <p className="text-sm text-wellness-danger">
                  High stress levels detected. Consider stress management techniques and professional support.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="waterIntake">Daily Water Intake (glasses)</Label>
              <Input
                id="waterIntake"
                type="number"
                min="0"
                max="20"
                placeholder="e.g., 8"
                {...register('waterIntake', { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Symptom Screening */}
      <Card className="border-wellness-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-wellness-danger">
            <AlertTriangle className="h-5 w-5" />
            Health Symptom Screening
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-700">
            Have you experienced any of the following symptoms this week? (Check all that apply)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {concerningSymptoms.map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  id={symptom}
                  checked={reportedSymptoms.includes(symptom)}
                  onCheckedChange={(checked) => handleSymptomChange(symptom, checked)}
                />
                <label htmlFor={symptom} className="text-sm cursor-pointer">
                  {symptom}
                </label>
              </div>
            ))}
          </div>

          {reportedSymptoms.length > 0 && (
            <Alert className="border-wellness-danger bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have reported concerning symptoms. Please consult with a healthcare professional 
                before continuing your wellness plan.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Progress Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Notes & Observations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="progressNotes">How are you feeling about your progress?</Label>
            <Textarea
              id="progressNotes"
              placeholder="Share your thoughts, challenges, achievements, or any concerns..."
              {...register('progressNotes')}
              className="min-h-[100px]"
            />
            {errors.progressNotes && (
              <p className="text-sm text-wellness-danger">{errors.progressNotes.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="hasConcerns"
              checked={hasConcerns}
              onCheckedChange={setHasConcerns}
            />
            <label htmlFor="hasConcerns" className="text-sm cursor-pointer">
              I have health concerns that require professional attention
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Warning */}
      {(reportedSymptoms.length > 0 || hasConcerns || energyLevel <= 2 || mood <= 2) && (
        <Alert className="border-wellness-danger bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Based on your responses, we recommend consulting with a healthcare professional. 
            If you're experiencing severe symptoms, please seek immediate medical attention.
            <div className="mt-2 text-sm">
              <strong>Emergency: 911 (US) | Crisis Text: HOME to 741741</strong>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-wellness-primary hover:bg-wellness-primary/90"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Progress Update
      </Button>
    </form>
  )
}

export default ProgressForm