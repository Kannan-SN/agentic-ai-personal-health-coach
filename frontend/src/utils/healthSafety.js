import { EMERGENCY_KEYWORDS, RISK_LEVELS, SAFETY_LIMITS } from './constants'

export const validateHealthInput = (data) => {
  const errors = []
  const warnings = []

  // Age validation
  if (data.age && (data.age < SAFETY_LIMITS.MIN_AGE || data.age > SAFETY_LIMITS.MAX_AGE)) {
    errors.push(`Age must be between ${SAFETY_LIMITS.MIN_AGE} and ${SAFETY_LIMITS.MAX_AGE}`)
  }

  // Professional consultation recommendations
  if (data.age && (data.age < 18 || data.age > 65)) {
    warnings.push('Professional consultation recommended for this age group')
  }

  // High-risk conditions
  const highRiskConditions = [
    'heart disease', 'diabetes', 'high blood pressure', 'chest pain',
    'heart attack', 'stroke', 'eating disorder', 'pregnancy'
  ]

  if (data.healthConditions) {
    const hasHighRisk = data.healthConditions.some(condition =>
      highRiskConditions.some(risk => 
        condition.condition?.toLowerCase().includes(risk)
      )
    )
    
    if (hasHighRisk) {
      warnings.push('High-risk health conditions detected - professional consultation strongly recommended')
    }
  }

  // Medication concerns
  if (data.medications) {
    const exerciseAffectingMeds = data.medications.filter(med => med.affectsExercise)
    if (exerciseAffectingMeds.length > 0) {
      warnings.push('Some medications may affect exercise - consult healthcare provider')
    }
  }

  return { errors, warnings, isValid: errors.length === 0 }
}

export const assessRiskLevel = (healthData) => {
  let riskScore = 0

  // Age risk factors
  if (healthData.age) {
    if (healthData.age < 18 || healthData.age > 65) riskScore += 2
    if (healthData.age > 75) riskScore += 3
  }

  // Health conditions
  if (healthData.healthConditions) {
    riskScore += healthData.healthConditions.filter(
      condition => condition.severity === 'severe'
    ).length * 3

    riskScore += healthData.healthConditions.filter(
      condition => condition.requiresMonitoring
    ).length * 2

    riskScore += healthData.healthConditions.filter(
      condition => condition.affectsExercise
    ).length * 2
  }

  // Medications
  if (healthData.medications) {
    riskScore += healthData.medications.filter(
      med => med.affectsExercise
    ).length * 2
  }

  // Current injuries
  if (healthData.injuries) {
    riskScore += healthData.injuries.filter(
      injury => injury.status === 'healing'
    ).length * 2
  }

  // Determine risk level
  if (riskScore >= 10) return RISK_LEVELS.VERY_HIGH
  if (riskScore >= 6) return RISK_LEVELS.HIGH
  if (riskScore >= 3) return RISK_LEVELS.MODERATE
  return RISK_LEVELS.LOW
}

export const detectEmergencySymptoms = (symptoms) => {
  if (!symptoms || !Array.isArray(symptoms)) return { hasEmergency: false, concerns: [] }

  const emergencySymptoms = [
    'chest pain', 'severe chest pain', 'heart attack', 'stroke',
    'can\'t breathe', 'difficulty breathing', 'severe shortness of breath',
    'unconscious', 'loss of consciousness', 'severe bleeding',
    'severe head injury', 'poisoning', 'overdose'
  ]

  const criticalSymptoms = symptoms.filter(symptom =>
    emergencySymptoms.some(emergency =>
      symptom.toLowerCase().includes(emergency)
    )
  )

  return {
    hasEmergency: criticalSymptoms.length > 0,
    concerns: criticalSymptoms
  }
}

export const validateWorkoutIntensity = (workoutData, userProfile) => {
  const concerns = []

  // Duration limits
  if (workoutData.duration > SAFETY_LIMITS.MAX_WORKOUT_MINUTES) {
    concerns.push('Workout duration exceeds safety recommendations')
  }

  // Age-based intensity checks
  if (userProfile.age > 65 && workoutData.intensity === 'high') {
    concerns.push('High intensity workouts may require medical clearance for users over 65')
  }

  // Health condition considerations
  if (userProfile.healthConditions) {
    const cardiacConditions = userProfile.healthConditions.filter(condition =>
      ['heart disease', 'high blood pressure', 'chest pain'].some(cardiac =>
        condition.condition.toLowerCase().includes(cardiac)
      )
    )

    if (cardiacConditions.length > 0 && workoutData.intensity !== 'low') {
      concerns.push('Cardiac conditions present - low intensity recommended')
    }
  }

  return {
    isValid: concerns.length === 0,
    concerns,
    recommendations: concerns.length > 0 ? [
      'Consult healthcare provider before proceeding',
      'Consider modifying workout intensity',
      'Monitor symptoms during exercise'
    ] : []
  }
}

export const validateNutritionPlan = (nutritionData, userProfile) => {
  const concerns = []

  // Calorie limits
  if (nutritionData.dailyCalories < SAFETY_LIMITS.MIN_CALORIES) {
    concerns.push('Daily calories below safe minimum')
  }

  if (nutritionData.dailyCalories > SAFETY_LIMITS.MAX_CALORIES) {
    concerns.push('Daily calories above recommended maximum')
  }

  // Special dietary considerations
  if (userProfile.healthConditions) {
    const diabetic = userProfile.healthConditions.some(condition =>
      condition.condition.toLowerCase().includes('diabetes')
    )

    if (diabetic && nutritionData.highCarb) {
      concerns.push('High carbohydrate content may not be suitable for diabetic individuals')
    }
  }

  // Food allergies
  if (userProfile.foodAllergies && nutritionData.ingredients) {
    const allergenConflicts = userProfile.foodAllergies.filter(allergy =>
      nutritionData.ingredients.some(ingredient =>
        ingredient.toLowerCase().includes(allergy.allergen.toLowerCase())
      )
    )

    if (allergenConflicts.length > 0) {
      concerns.push(`Potential allergen conflicts: ${allergenConflicts.map(a => a.allergen).join(', ')}`)
    }
  }

  return {
    isValid: concerns.length === 0,
    concerns,
    recommendations: concerns.length > 0 ? [
      'Review nutrition plan with healthcare provider',
      'Consider allergy-safe alternatives',
      'Monitor body response to dietary changes'
    ] : []
  }
}

export const generateSafetyRecommendations = (userProfile) => {
  const recommendations = [
    'This service provides general wellness information only - not medical advice',
    'Always consult healthcare professionals for medical concerns',
    'Stop any activity that causes pain or unusual discomfort'
  ]

  const riskLevel = assessRiskLevel(userProfile)

  if (riskLevel === RISK_LEVELS.HIGH || riskLevel === RISK_LEVELS.VERY_HIGH) {
    recommendations.unshift('Professional medical consultation required before starting any wellness program')
    recommendations.push('Consider working with certified fitness and nutrition professionals')
  }

  if (userProfile.age > 65) {
    recommendations.push('Age-appropriate exercise modifications recommended')
    recommendations.push('Regular health monitoring advised')
  }

  if (userProfile.healthConditions && userProfile.healthConditions.length > 0) {
    recommendations.push('Health conditions require special consideration in planning')
    recommendations.push('Inform healthcare providers about your wellness activities')
  }

  return recommendations
}