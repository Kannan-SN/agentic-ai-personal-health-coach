import { WorkoutDay } from '@/types/wellness'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WorkoutPlanDisplayProps {
  workoutPlan: WorkoutDay[]
  currentWeek: number
}

export function WorkoutPlanDisplay({ workoutPlan, currentWeek }: WorkoutPlanDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Week {currentWeek} Workouts</h3>
        <Badge variant="outline">7 Days</Badge>
      </div>

      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Stop any exercise that causes pain or discomfort. Listen to your body and rest when needed.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {workoutPlan.map((day) => (
          <Card key={day.day} className={day.rest_day ? 'bg-gray-50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    Day {day.day}: {day.workout_name}
                  </CardTitle>
                  {!day.rest_day && (
                    <CardDescription className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {day.total_duration_minutes} minutes
                    </CardDescription>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  {day.rest_day ? 'Rest Day' : 'Start Workout'}
                </Button>
              </div>
            </CardHeader>
            
            {!day.rest_day && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {day.exercises.map((exercise, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {exercise.instructions}
                        </p>
                        {exercise.safety_notes && (
                          <p className="text-xs text-amber-700 mt-2 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {exercise.safety_notes}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {exercise.duration_minutes}min
                      </Badge>
                    </div>
                  ))}
                </div>
                
                {day.safety_notes && (
                  <Alert className="mt-4 border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      {day.safety_notes}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}