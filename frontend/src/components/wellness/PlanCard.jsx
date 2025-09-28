import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Calendar, Target, AlertTriangle, Play, Pause, MessageCircle } from 'lucide-react'

const PlanCard = ({ plan, onViewPlan, onPausePlan, onResumePlan, onChat }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200'
      case 'paused': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'requires_review': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const completionPercentage = Math.round((plan.currentWeek / plan.planDurationWeeks) * 100)
  const hasEmergencyFlags = plan.emergencyFlags?.some(flag => !flag.resolved && flag.severity === 'high')

  return (
    <Card className={`${hasEmergencyFlags ? 'border-wellness-danger' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{plan.planName}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              {plan.userProfileSnapshot?.primaryGoal}
            </p>
          </div>
          <Badge className={getStatusColor(plan.status)}>
            {plan.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasEmergencyFlags && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Requires attention</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>Week {plan.currentWeek}/{plan.planDurationWeeks}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-500" />
            <span>{plan.userProfileSnapshot?.riskLevel || 'Low'} Risk</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => onViewPlan(plan.id)}
            className="flex-1 bg-wellness-primary"
            size="sm"
          >
            View Plan
          </Button>
          
          {plan.status === 'active' && (
            <Button 
              onClick={() => onPausePlan(plan.id)}
              variant="outline"
              size="sm"
            >
              <Pause className="h-4 w-4" />
            </Button>
          )}
          
          {plan.status === 'paused' && (
            <Button 
              onClick={() => onResumePlan(plan.id)}
              variant="outline"
              size="sm"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            onClick={() => onChat(plan.id)}
            variant="outline"
            size="sm"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default PlanCard