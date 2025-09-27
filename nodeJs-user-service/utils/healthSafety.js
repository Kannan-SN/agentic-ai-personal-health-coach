import * as enums from '@/constants/enums'

export class HealthSafetyValidator {
    
    static validateUserProfileSafety(profileData) {
        const result = {
            is_safe: true,
            concerns: [],
            recommendations: [],
            risk_level: enums.RISK_LEVELS.LOW
        }

        const { age, primary_goal, health_conditions = [], current_activity_level } = profileData

        if (age && (age < 16 || age > 75)) {
            result.concerns.push('Age requires special consideration for health planning')
            result.recommendations.push('Professional medical supervision strongly recommended')
            result.risk_level = enums.RISK_LEVELS.MODERATE
        }

        const highRiskConditions = [
            'heart disease', 'cardiovascular', 'cardiac', 'diabetes', 'diabetic',
            'high blood pressure', 'hypertension', 'eating disorder', 'anorexia', 'bulimia',
            'pregnancy', 'pregnant', 'recent surgery', 'surgery', 'joint problems',
            'arthritis', 'back injury', 'spine', 'chest pain', 'shortness of breath',
            'dizziness', 'fainting', 'seizure', 'medication', 'chronic pain'
        ]

        for (const condition of health_conditions) {
            if (typeof condition === 'string') {
                const conditionLower = condition.toLowerCase()
                const hasHighRisk = highRiskConditions.some(risk => 
                    conditionLower.includes(risk)
                )
                
                if (hasHighRisk) {
                    result.concerns.push(`Health condition "${condition}" requires professional medical evaluation`)
                    result.recommendations.push('Medical clearance required before starting any fitness program')
                    result.risk_level = enums.RISK_LEVELS.HIGH
                    result.is_safe = false
                }
            }
        }

        if (primary_goal === enums.HEALTH_GOALS.WEIGHT_LOSS) {
            result.recommendations.push('Weight loss goals should be supervised by healthcare professionals')
            result.recommendations.push('Sustainable weight loss is typically 0.5-2 pounds per week')
        }

        if (primary_goal === enums.HEALTH_GOALS.INJURY_RECOVERY) {
            result.concerns.push('Injury recovery requires professional physical therapy guidance')
            result.recommendations.push('Consult with physical therapist or sports medicine physician')
            result.risk_level = enums.RISK_LEVELS.HIGH
        }
        if (current_activity_level === enums.ACTIVITY_LEVELS.SEDENTARY) {
            result.recommendations.push('Gradual increase in activity recommended for sedentary individuals')
            result.recommendations.push('Start with low-intensity activities and build slowly')
        }

       
        const mentalHealthGoals = [enums.HEALTH_GOALS.STRESS_REDUCTION]
        if (mentalHealthGoals.includes(primary_goal)) {
            result.recommendations.push('Mental health goals benefit from professional counseling support')
        }

        if (result.risk_level === enums.RISK_LEVELS.HIGH || result.concerns.length > 2) {
            result.is_safe = false
        }

        return result
    }

    static validateCalorieTarget(calories, age, goal) {
        const result = {
            is_valid: true,
            adjusted_calories: calories,
            warnings: [],
            recommendations: []
        }

       
        if (calories < enums.SAFETY_LIMITS.MIN_CALORIES) {
            result.is_valid = false
            result.adjusted_calories = enums.SAFETY_LIMITS.MIN_CALORIES
            result.warnings.push(`Calorie target too low. Adjusted to safe minimum: ${enums.SAFETY_LIMITS.MIN_CALORIES}`)
            result.recommendations.push('Very low calorie diets require medical supervision')
        }

        if (calories > enums.SAFETY_LIMITS.MAX_CALORIES) {
            result.is_valid = false
            result.adjusted_calories = enums.SAFETY_LIMITS.MAX_CALORIES
            result.warnings.push(`Calorie target too high. Adjusted to safe maximum: ${enums.SAFETY_LIMITS.MAX_CALORIES}`)
        }

        if (age && age > 65 && calories < 1500) {
            result.warnings.push('Older adults require adequate nutrition - very low calories not recommended')
        }

        if (age && age < 18) {
            result.warnings.push('Growing individuals require adequate calories for healthy development')
            result.recommendations.push('Pediatric nutrition specialist consultation recommended')
        }

        
        if (goal === enums.HEALTH_GOALS.WEIGHT_LOSS && calories < 1500) {
            result.warnings.push('Extreme calorie restriction can be dangerous and unsustainable')
            result.recommendations.push('Consult registered dietitian for safe weight loss approach')
        }

        return result
    }

    static validateWorkoutPlan(workoutMinutesPerDay, activityLevel, age) {
        const result = {
            is_valid: true,
            adjusted_minutes: workoutMinutesPerDay,
            warnings: [],
            recommendations: []
        }

      
        if (workoutMinutesPerDay < enums.SAFETY_LIMITS.MIN_WORKOUT_MINUTES) {
            result.adjusted_minutes = enums.SAFETY_LIMITS.MIN_WORKOUT_MINUTES
            result.recommendations.push('Even short workouts provide health benefits')
        }

        if (workoutMinutesPerDay > enums.SAFETY_LIMITS.MAX_WORKOUT_MINUTES) {
            result.is_valid = false
            result.adjusted_minutes = enums.SAFETY_LIMITS.MAX_WORKOUT_MINUTES
            result.warnings.push('Workout duration exceeds recommended limits for general population')
            result.recommendations.push('Extended exercise requires professional supervision')
        }

        if (activityLevel === enums.ACTIVITY_LEVELS.SEDENTARY && workoutMinutesPerDay > 45) {
            result.warnings.push('Gradual increase in activity recommended for sedentary individuals')
            result.recommendations.push('Start with 15-20 minutes and increase gradually each week')
        }

        
        if (age && age > 65 && workoutMinutesPerDay > 60) {
            result.warnings.push('Adults over 65 should consult healthcare providers for exercise guidance')
            result.recommendations.push('Focus on balance, strength, and cardiovascular health')
        }

        if (age && age < 18) {
            result.recommendations.push('Youth fitness should be age-appropriate and fun')
            result.recommendations.push('Avoid excessive training that could affect growth')
        }

        return result
    }

    static detectEmergencySymptoms(symptoms) {
        const emergencyKeywords = [
            'chest pain', 'severe chest pain', 'heart attack',
            'can\'t breathe', 'difficulty breathing', 'shortness of breath',
            'severe dizziness', 'fainting', 'passed out', 'unconscious',
            'severe nausea', 'vomiting blood', 'blood vomit',
            'broken bone', 'fracture', 'severe injury',
            'allergic reaction', 'anaphylaxis', 'swelling throat',
            'suicidal', 'self harm', 'want to die'
        ]

        const emergencyFlags = []
        
        for (const symptom of symptoms) {
            if (typeof symptom === 'string') {
                const symptomLower = symptom.toLowerCase()
                const hasEmergency = emergencyKeywords.some(keyword => 
                    symptomLower.includes(keyword)
                )
                
                if (hasEmergency) {
                    emergencyFlags.push({
                        symptom,
                        severity: 'critical',
                        requires_immediate_attention: true,
                        emergency_services_recommended: true
                    })
                }
            }
        }

        return {
            has_emergency_symptoms: emergencyFlags.length > 0,
            emergency_flags: emergencyFlags,
            immediate_action_required: emergencyFlags.length > 0
        }
    }

    static validateDietaryRestrictions(restrictions, goal) {
        const result = {
            is_valid: true,
            warnings: [],
            recommendations: []
        }

        if (restrictions.length > 3) {
            result.warnings.push('Multiple dietary restrictions may require professional nutrition guidance')
            result.recommendations.push('Registered dietitian consultation recommended for complex restrictions')
        }
        if (restrictions.includes(enums.DIETARY_RESTRICTIONS.VEGAN) && 
            goal === enums.HEALTH_GOALS.MUSCLE_GAIN) {
            result.recommendations.push('Vegan muscle building requires careful protein planning')
            result.recommendations.push('Consider plant-based protein supplements and variety')
        }

        const medicalRestrictions = [
            enums.DIETARY_RESTRICTIONS.DIABETIC_FRIENDLY,
            enums.DIETARY_RESTRICTIONS.HEART_HEALTHY,
            enums.DIETARY_RESTRICTIONS.LOW_SODIUM
        ]

        const hasMedicalRestriction = restrictions.some(restriction => 
            medicalRestrictions.includes(restriction)
        )

        if (hasMedicalRestriction) {
            result.recommendations.push('Medical dietary restrictions should be reviewed with healthcare provider')
            result.warnings.push('Monitor health parameters when following medical diet plans')
        }

        return result
    }

    static getSafetyDisclaimer() {
        return enums.HEALTH_DISCLAIMER
    }

    static getExerciseDisclaimer() {
        return enums.EXERCISE_DISCLAIMER
    }

    static getNutritionDisclaimer() {
        return enums.NUTRITION_DISCLAIMER
    }
}


export const logHealthRecommendation = (userId, recommendationType, safetyCheck) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        userId: userId.toString(),
        recommendationType,
        safetyValidation: safetyCheck,
        serviceVersion: '1.0.0'
    }
    
    
    console.log(`[WELLNESS-HEALTH-AUDIT] ${JSON.stringify(logEntry)}`)
    
    return logEntry
}