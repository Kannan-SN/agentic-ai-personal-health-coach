import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Activity, 
  Apple, 
  MessageCircle, 
  Play, 
  Pause, 
  AlertTriangle,
  Calendar,
  Target,
  Shield
} from 'lucide-react'
import PlanCard from '@/components/wellness/PlanCard'
import CreatePlanForm from '@/components/wellness/CreatePlanForm'
import { 
  getWellnessPlans, 
  getWellnessPlanById, 
  createWellnessPlan,
  pauseWellnessPlan,
  resumeWellnessPlan 
} from '@/services/user/wellness'
import { setPlans, setActivePlan } from '@/store/slices/wellness.slice'

const WellnessPlan = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const { plans, activePlan } = useSelector(state => state.wellness)
  const { healthProfile } = useSelector(state => state.user)

  useEffect(() => {
    fetchPlans()
    if (id) {
      fetchPlanById(id)
    }
  }, [id])

  const fetchPlans = async () => {
    try {
      const response = await getWellnessPlans()
      if (response.success) {
        dispatch(setPlans(response.data))
        if (!id && response.data.length === 0) {
          setShowCreateForm(true)
        }
      }
    } catch (err) {
      setError('Failed to load wellness plans')
    }
  }

  const fetchPlanById = async (planId) => {
    try {
      setLoading(true)
      const response = await getWellnessPlanById(planId)
      if (response.success) {
        dispatch(setActivePlan(response.data))
      } else {
        setError('Plan not found')
      }
    } catch (err) {
      setError('Failed to load plan details')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async (planData) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await createWellnessPlan(planData)
      
      if (response.success) {
        await fetchPlans()
        setShowCreateForm(false)
        navigate(`/wellness-plan/${response.plan_id}`)
      } else {
        if (response.professional_consultation_required) {
          setError('Professional consultation required before creating a plan. Please update your health profile or consult a healthcare provider.')
        } else {
          setError(response.message || 'Failed to create wellness plan')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred while creating your plan')
    } finally {
      setLoading(false)
    }
  }

  const handlePausePlan = async (planId) => {
    try {
      const reason = prompt('Please provide a reason for pausing (optional):')
      const response = await pauseWellnessPlan(planId, { reason: reason || 'User requested pause' })
      
      if (response.success) {
        await fetchPlans()
        if (activePlan?.id === planId) {
          await fetchPlanById(planId)
        }
      }
    } catch (err) {
      setError('Failed to pause plan')
    }
  }

  const handleResumePlan = async (planId) => {
    try {
      const response = await resumeWellnessPlan(planId, { 
        readyToResume: true,
        healthStatusUpdate: ''
      })
      
      if (response.success) {
        await fetchPlans()
        if (activePlan?.id === planId) {
          await fetchPlanById(planId)
        }
      }
    } catch (err) {
      setError('Failed to resume plan')
    }
  }

  const WorkoutView = ({ workoutPlan }) => (
    <div className="space-y-4">
      {workoutPlan?.map((workout, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Day {workout.day}: {workout.workout_name}</CardTitle>
              {workout.rest_day && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">Rest Day</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {workout.rest_day ? (
              <p className="text-slate-600">{workout.notes || 'Rest and recovery day'}</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Duration: {workout.total_duration_minutes} minutes</div>
                  <div>Intensity: {workout.intensity_level}</div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Warm-up</h4>
                  <p className="text-sm text-slate-600">{workout.warm_up}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Exercises</h4>
                  {workout.exercises?.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">{exercise.name}</h5>
                        <Badge variant="outline">{exercise.type}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{exercise.instructions}</p>
                      <div className="text-xs text-slate-500">
                        Duration: {exercise.duration_minutes} min | Intensity: {exercise.intensity}
                      </div>
                      {exercise.safety_notes && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                          <strong>Safety:</strong> {exercise.safety_notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Cool-down</h4>
                  <p className="text-sm text-slate-600">{workout.cool_down}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const MealView = ({ mealPlan }) => (
    <div className="space-y-4">
      {mealPlan?.map((day, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">Day {day.day}</CardTitle>
            <p className="text-sm text-slate-600">
              Total Calories: {day.total_estimated_calories} | Water: {day.daily_water_goal_glasses} glasses
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {day.meals?.map((meal, mealIndex) => (
              <div key={mealIndex} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{meal.name}</h4>
                  <Badge variant="outline">{meal.meal_type}</Badge>
                </div>
                <div className="text-sm text-slate-600 mb-2">
                  Calories: {meal.estimated_calories} | Prep time: {meal.prep_time_minutes} min
                </div>
                <div className="space-y-2">
                  <div>
                    <strong className="text-sm">Ingredients:</strong>
                    <ul className="text-sm text-slate-600 ml-4 mt-1">
                      {meal.ingredients?.map((ingredient, i) => (
                        <li key={i}>• {ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-sm">Instructions:</strong>
                    <p className="text-sm text-slate-600">{meal.instructions}</p>
                  </div>
                  {meal.allergen_warnings?.length > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                      <strong>Allergen warnings:</strong> {meal.allergen_warnings.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Show create form if no plans exist or user clicked create
  if (showCreateForm || (plans?.length === 0 && !loading)) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <CreatePlanForm 
          onSubmit={handleCreatePlan}
          loading={loading}
          error={error}
        />
        {plans?.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              View Existing Plans
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Show specific plan details
  if (id && activePlan) {
    return (
      <div className="p-6 space-y-6">
        {/* Plan Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-wellness-text">{activePlan.planName}</h1>
              <p className="text-slate-600 mt-2">{activePlan.planDescription}</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  Week {activePlan.currentWeek} of {activePlan.planDurationWeeks}
                </Badge>
                <Badge variant="outline">
                  {activePlan.userProfileSnapshot?.primaryGoal}
                </Badge>
              </div>
            </div>
            <Activity className="h-12 w-12 text-wellness-primary" />
          </div>
        </div>

        {/* Safety Alerts */}
        {activePlan.emergencyFlags?.some(flag => !flag.resolved) && (
          <Alert className="border-wellness-danger bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This plan requires attention due to safety concerns. Please review with a healthcare professional.
            </AlertDescription>
          </Alert>
        )}

        {/* Plan Controls */}
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate('/progress')}
            className="bg-wellness-primary"
          >
            Update Progress
          </Button>
          <Button 
            onClick={() => navigate(`/chat/${activePlan.id}`)}
            variant="outline"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat with AI
          </Button>
          {activePlan.status === 'active' ? (
            <Button 
              onClick={() => handlePausePlan(activePlan.id)}
              variant="outline"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause Plan
            </Button>
          ) : (
            <Button 
              onClick={() => handleResumePlan(activePlan.id)}
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume Plan
            </Button>
          )}
        </div>

        {/* Plan Content */}
        <Tabs defaultValue="workout" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workout" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Workout Plan
            </TabsTrigger>
            <TabsTrigger value="meals" className="flex items-center gap-2">
              <Apple className="h-4 w-4" />
              Meal Plan
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workout" className="space-y-4">
            <WorkoutView workoutPlan={activePlan.workoutPlan} />
          </TabsContent>
          
          <TabsContent value="meals" className="space-y-4">
            <MealView mealPlan={activePlan.mealPlan} />
          </TabsContent>
        </Tabs>

        {/* Safety Notes */}
        {activePlan.safetyNotes?.length > 0 && (
          <Card className="border-wellness-warning">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-wellness-danger">
                <Shield className="h-5 w-5" />
                Safety Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {activePlan.safetyNotes.map((note, index) => (
                  <li key={index} className="text-sm text-slate-700">• {note}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Show plans list
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wellness-text">Wellness Plans</h1>
          <p className="text-slate-600 mt-2">Manage your personalized fitness and nutrition plans</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-wellness-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {error && (
        <Alert className="border-wellness-danger">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wellness-primary mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading your wellness plans...</p>
        </div>
      ) : plans?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onViewPlan={(id) => navigate(`/wellness-plan/${id}`)}
              onPausePlan={handlePausePlan}
              onResumePlan={handleResumePlan}
              onChat={(id) => navigate(`/chat/${id}`)}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 mx-auto text-wellness-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">No wellness plans yet</h3>
            <p className="text-slate-600 mb-6">
              Create your first personalized wellness plan to get started on your health journey.
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-wellness-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default WellnessPlan