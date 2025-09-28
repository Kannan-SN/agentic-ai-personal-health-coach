import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  TrendingUp, 
  User, 
  MessageCircle,
  AlertTriangle,
  Plus,
  Calendar,
  Target,
  Heart
} from 'lucide-react'
import { getWellnessPlans } from '@/services/user/wellness'
import { userInfo } from '@/services/user/client'
import { setPlans } from '@/store/slices/wellness.slice'
import { setProfile } from '@/store/slices/user.slice'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  
  const { 
    firstName, 
    healthStatus, 
    riskLevel, 
    requiresProfessionalConsultation 
  } = useSelector(state => state.auth)
  
  const { plans } = useSelector(state => state.wellness)
  const { profile } = useSelector(state => state.user)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch user info and wellness plans
        const [userResponse, plansResponse] = await Promise.all([
          userInfo(),
          getWellnessPlans()
        ])

        if (userResponse.success) {
          dispatch(setProfile(userResponse.data))
        }

        if (plansResponse.success) {
          dispatch(setPlans(plansResponse.data))
        }
      } catch (err) {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [dispatch])

  const activePlan = plans?.find(plan => plan.status === 'active')
  const completedPlans = plans?.filter(plan => plan.status === 'completed')?.length || 0

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'very_high': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'cleared_for_activity': return 'text-green-600'
      case 'requires_supervision': return 'text-orange-600'
      case 'profile_incomplete': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wellness-primary mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading your wellness dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-wellness-text">
              Welcome back, {firstName}!
            </h1>
            <p className="text-slate-600 mt-2">
              Let's continue your wellness journey with safe, personalized guidance.
            </p>
          </div>
          <Heart className="h-12 w-12 text-wellness-primary" />
        </div>
      </div>

      {/* Safety Alerts */}
      {requiresProfessionalConsultation && (
        <Alert className="border-wellness-warning bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Professional consultation recommended before starting new activities.</span>
            <Link to="/health-profile">
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-wellness-danger">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-lg font-semibold ${getHealthStatusColor(healthStatus)}`}>
                {healthStatus?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not Set'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getRiskLevelColor(riskLevel)}>
              {riskLevel?.replace(/_/g, ' ').toUpperCase() || 'NOT SET'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-wellness-primary">
              {plans?.filter(plan => plan.status === 'active')?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Completed Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-wellness-success">
              {completedPlans}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Plan or Create Plan */}
      {activePlan ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Wellness Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{activePlan.planName}</h3>
                <p className="text-slate-600">{activePlan.userProfileSnapshot?.primaryGoal}</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Week {activePlan.currentWeek} of {activePlan.planDurationWeeks}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round((activePlan.currentWeek / activePlan.planDurationWeeks) * 100)}%</span>
              </div>
              <Progress 
                value={(activePlan.currentWeek / activePlan.planDurationWeeks) * 100} 
                className="h-2"
              />
            </div>

            <div className="flex gap-3">
              <Link to={`/wellness-plan/${activePlan.id}`}>
                <Button className="bg-wellness-primary">
                  View Plan
                </Button>
              </Link>
              <Link to="/progress">
                <Button variant="outline">
                  Update Progress
                </Button>
              </Link>
              <Link to={`/chat/${activePlan.id}`}>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-wellness-primary/30">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-wellness-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to start your wellness journey?</h3>
            <p className="text-slate-600 mb-6">
              Create your first personalized wellness plan with AI-powered recommendations and safety measures.
            </p>
            <Link to="/wellness-plan">
              <Button className="bg-wellness-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Wellness Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/wellness-plan" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 mx-auto text-wellness-primary mb-2" />
              <h3 className="font-medium">Wellness Plans</h3>
              <p className="text-sm text-slate-600">View and manage your plans</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/progress" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-wellness-primary mb-2" />
              <h3 className="font-medium">Track Progress</h3>
              <p className="text-sm text-slate-600">Log your weekly progress</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/health-profile" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <User className="h-8 w-8 mx-auto text-wellness-primary mb-2" />
              <h3 className="font-medium">Health Profile</h3>
              <p className="text-sm text-slate-600">Manage your health info</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/chat" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 mx-auto text-wellness-primary mb-2" />
              <h3 className="font-medium">AI Assistant</h3>
              <p className="text-sm text-slate-600">Get wellness guidance</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Plans */}
      {plans && plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Wellness Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plans.slice(0, 3).map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{plan.planName}</h4>
                    <p className="text-sm text-slate-600">
                      {plan.userProfileSnapshot?.primaryGoal} • Week {plan.currentWeek}/{plan.planDurationWeeks}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={
                        plan.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        plan.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }
                    >
                      {plan.status}
                    </Badge>
                    <Link to={`/wellness-plan/${plan.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {plans.length > 3 && (
              <div className="text-center mt-4">
                <Link to="/wellness-plan">
                  <Button variant="outline">View All Plans</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard