import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Calendar, AlertTriangle, CheckCircle, Target } from 'lucide-react'
import ProgressForm from '@/components/progress/ProgressForm'
import { getWellnessPlans, updatePlanProgress } from '@/services/user/wellness'
import { setPlans, setActivePlan } from '@/store/slices/wellness.slice'

const ProgressTracking = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  
  const dispatch = useDispatch()
  const { plans } = useSelector(state => state.wellness)
  
  const activePlan = plans?.find(plan => plan.status === 'active')

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await getWellnessPlans()
      if (response.success) {
        dispatch(setPlans(response.data))
      }
    } catch (err) {
      setError('Failed to load wellness plans')
    }
  }

  const handleProgressSubmit = async (progressData) => {
    if (!activePlan) {
      setError('No active plan found')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const response = await updatePlanProgress(activePlan.id, progressData)
      
      if (response.success) {
        setSuccess('Progress updated successfully!')
        setShowForm(false)
        await fetchPlans()
        
        // Check if plan was paused due to safety concerns
        if (response.plan_paused) {
          setError('Your plan has been paused due to safety concerns. Please consult with a healthcare professional.')
        }
      } else {
        if (response.emergency_alert_created) {
          setError('Emergency alert created due to concerning symptoms. Please seek medical attention immediately.')
        } else {
          setError(response.message || 'Failed to update progress')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred while updating progress')
    } finally {
      setLoading(false)
    }
  }

  if (!activePlan) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Plan</h3>
            <p className="text-slate-600 mb-6">
              You need an active wellness plan to track progress. Create a plan first to get started.
            </p>
            <Button 
              onClick={() => window.location.href = '/wellness-plan'}
              className="bg-wellness-primary"
            >
              Create Wellness Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowForm(false)}
            className="mb-4"
          >
            ← Back to Progress Overview
          </Button>
          <h1 className="text-3xl font-bold text-wellness-text">Update Progress</h1>
          <p className="text-slate-600 mt-2">Week {activePlan.currentWeek} of {activePlan.planDurationWeeks}</p>
        </div>

        <ProgressForm
          onSubmit={handleProgressSubmit}
          loading={loading}
          error={error}
          activePlan={activePlan}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wellness-text">Progress Tracking</h1>
          <p className="text-slate-600 mt-2">Monitor your wellness journey and health metrics</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-wellness-primary"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Update Progress
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-wellness-danger">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-wellness-success bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Current Plan: {activePlan.planName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-wellness-primary">{activePlan.currentWeek}</div>
              <div className="text-sm text-slate-600">Current Week</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-wellness-success">
                {Math.round((activePlan.currentWeek / activePlan.planDurationWeeks) * 100)}%
              </div>
              <div className="text-sm text-slate-600">Complete</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {activePlan.planDurationWeeks - activePlan.currentWeek + 1}
              </div>
              <div className="text-sm text-slate-600">Weeks Remaining</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Goal: {activePlan.userProfileSnapshot?.primaryGoal}</p>
              <p className="text-sm text-slate-600">Risk Level: {activePlan.userProfileSnapshot?.riskLevel || 'Low'}</p>
            </div>
            <Badge 
              className={
                activePlan.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                activePlan.status === 'paused' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-gray-50 text-gray-700 border-gray-200'
              }
            >
              {activePlan.status}
            </Badge>
          </div>

          {activePlan.emergencyFlags?.some(flag => !flag.resolved) && (
            <Alert className="border-wellness-danger bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This plan has safety flags that require attention. Please consult with a healthcare professional.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Weekly Progress History */}
      {activePlan.progressTracking?.weeklyProgress?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Progress History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activePlan.progressTracking.weeklyProgress
                .sort((a, b) => b.week - a.week)
                .slice(0, 5)
                .map((weekData, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Week {weekData.week}</h4>
                    <div className="text-sm text-slate-600">
                      {new Date(weekData.weekCompletedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-600">Workouts</div>
                      <div className="font-medium">
                        {weekData.workoutsCompleted}/{weekData.totalWorkouts}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-600">Meals</div>
                      <div className="font-medium">
                        {weekData.mealsFollowed}/{weekData.totalMeals}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-600">Energy</div>
                      <div className="font-medium">{weekData.energyLevel}/5</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Satisfaction</div>
                      <div className="font-medium">{weekData.overallSatisfaction}/5</div>
                    </div>
                  </div>

                  {weekData.notes && (
                    <div className="mt-3 p-3 bg-slate-50 rounded text-sm">
                      <strong>Notes:</strong> {weekData.notes}
                    </div>
                  )}

                  {weekData.concernsReported?.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                      <strong>Concerns:</strong> {weekData.concernsReported.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Adherence Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Adherence</span>
                <span>{activePlan.progressTracking?.adherencePercentage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-wellness-primary h-2 rounded-full transition-all"
                  style={{ width: `${activePlan.progressTracking?.adherencePercentage || 0}%` }}
                />
              </div>
            </div>
            
            <div className="text-sm text-slate-600">
              <div>Total Workouts: {activePlan.progressTracking?.totalWorkoutsCompleted || 0}</div>
              <div>Total Meals: {activePlan.progressTracking?.totalMealsFollowed || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Safety Level</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {activePlan.healthAnalysis?.risk_level || 'Low'} Risk
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Professional Consultation</span>
                <Badge variant="outline" className={
                  activePlan.consultationStatus?.required 
                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    : 'bg-green-50 text-green-700 border-green-200'
                }>
                  {activePlan.consultationStatus?.required ? 'Required' : 'Optional'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Emergency Flags</span>
                <Badge variant="outline" className={
                  activePlan.emergencyFlags?.some(flag => !flag.resolved)
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-green-50 text-green-700 border-green-200'
                }>
                  {activePlan.emergencyFlags?.some(flag => !flag.resolved) ? 'Active' : 'None'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Reminders */}
      <Card className="border-wellness-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-wellness-danger">
            <AlertTriangle className="h-5 w-5" />
            Important Safety Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ul className="space-y-1 text-slate-700">
            <li>• Stop any activity that causes pain or unusual discomfort</li>
            <li>• Report concerning symptoms to healthcare providers immediately</li>
            <li>• This tracking is for wellness monitoring only - not medical diagnosis</li>
            <li>• Seek professional medical attention for any health concerns</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProgressTracking