export interface HealthProfile {
  age: number
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  height: { value: number; unit: 'inches' | 'cm' }
  weight: { current: number; unit: 'lbs' | 'kg' }
  currentActivityLevel: string
  primaryGoal: string
  healthConditions: Array<{
    condition: string
    severity: 'mild' | 'moderate' | 'severe'
    affectsExercise: boolean
    affectsNutrition: boolean
  }>
  medications: Array<{
    name: string
    affectsExercise: boolean
    affectsNutrition: boolean
  }>
  injuries: Array<{
    injury: string
    status: 'healing' | 'recovered' | 'chronic'
    restrictions: string[]
  }>
  dietaryRestrictions: string[]
  timeAvailability: {
    dailyMinutes: number
    preferredTimes: string[]
    availableDays: string[]
  }
}