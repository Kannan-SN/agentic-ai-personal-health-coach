export interface WellnessPlan {
  id: string
  planName: string
  status: 'active' | 'paused' | 'completed' | 'requires_review'
  planDurationWeeks: number
  currentWeek: number
  userProfileSnapshot: {
    primaryGoal: string
    riskLevel: string
  }
  workoutPlan: WorkoutDay[]
  mealPlan: MealPlanDay[]
  safetyNotes: string[]
  disclaimers: string[]
}

export interface WorkoutDay {
  day: number
  workout_name: string
  total_duration_minutes: number
  exercises: Exercise[]
  rest_day: boolean
  safety_notes: string
}

export interface Exercise {
  name: string
  duration_minutes: number
  instructions: string
  safety_notes: string
  modifications: string
}