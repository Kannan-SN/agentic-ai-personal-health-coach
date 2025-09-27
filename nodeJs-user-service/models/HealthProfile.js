import mongoose from 'mongoose'
import * as enums from '@/constants/enum'

const HealthProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'users',
            index: true,
            unique: true
        },
        age: {
            type: Number,
            required: true,
            min: enums.SAFETY_LIMITS.MIN_AGE,
            max: enums.SAFETY_LIMITS.MAX_AGE,
            validate: {
                validator: function(age) {
                    return age >= enums.SAFETY_LIMITS.MIN_AGE && age <= enums.SAFETY_LIMITS.MAX_AGE
                },
                message: `Age must be between ${enums.SAFETY_LIMITS.MIN_AGE} and ${enums.SAFETY_LIMITS.MAX_AGE}`
            }
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
            required: true
        },
        height: {
            value: {
                type: Number,
                required: true,
                min: 30,
                max: 120 
            },
            unit: {
                type: String,
                enum: ['inches', 'cm'],
                default: 'inches'
            }
        },
        weight: {
            current: {
                type: Number,
                required: true,
                min: 50, 
                max: 1000 
            },
            unit: {
                type: String,
                enum: ['lbs', 'kg'],
                default: 'lbs'
            },
            history: [{
                weight: Number,
                recordedAt: {
                    type: Date,
                    default: Date.now
                },
                source: {
                    type: String,
                    enum: ['user_input', 'device_sync', 'healthcare_provider'],
                    default: 'user_input'
                }
            }]
        },
        
        currentActivityLevel: {
            type: String,
            required: true,
            enum: Object.values(enums.ACTIVITY_LEVELS),
            index: true
        },
        
        primaryGoal: {
            type: String,
            required: true,
            enum: Object.values(enums.HEALTH_GOALS),
            index: true
        },
        secondaryGoals: [{
            type: String,
            enum: Object.values(enums.HEALTH_GOALS)
        }],
        
        timeAvailability: {
            dailyMinutes: {
                type: Number,
                required: true,
                min: enums.SAFETY_LIMITS.MIN_WORKOUT_MINUTES,
                max: enums.SAFETY_LIMITS.MAX_WORKOUT_MINUTES
            },
            preferredTimes: [{
                type: String,
                enum: ['early_morning', 'morning', 'midday', 'afternoon', 'evening', 'night']
            }],
            availableDays: [{
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            }]
        },
        
        // Exercise Preferences
        preferredWorkoutTypes: [{
            type: String,
            enum: Object.values(enums.WORKOUT_TYPES)
        }],
        availableEquipment: [{
            type: String,
            default: 'bodyweight'
        }],
        fitnessExperience: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
        exerciseLimitations: [{
            limitation: String,
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe'],
                default: 'moderate'
            },
            affectedMovements: [String]
        }],
        
        // Dietary Information
        dietaryRestrictions: [{
            type: String,
            enum: Object.values(enums.DIETARY_RESTRICTIONS)
        }],
        foodAllergies: [{
            allergen: {
                type: String,
                required: true
            },
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe', 'life_threatening'],
                required: true
            }
        }],
        nutritionPreferences: {
            mealsPerDay: {
                type: Number,
                min: 2,
                max: 6,
                default: 3
            },
            snacksPerDay: {
                type: Number,
                min: 0,
                max: 4,
                default: 2
            },
            cookingExperience: {
                type: String,
                enum: ['none', 'basic', 'intermediate', 'advanced'],
                default: 'basic'
            },
            prepTimePreference: {
                type: Number,
                min: 5,
                max: 120,
                default: 30
            }
        },
        
        // Medical History and Health Conditions
        healthConditions: [{
            condition: {
                type: String,
                required: true
            },
            diagnosedDate: Date,
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe'],
                default: 'moderate'
            },
            currentTreatment: String,
            affectsExercise: {
                type: Boolean,
                default: false
            },
            affectsNutrition: {
                type: Boolean,
                default: false
            },
            requiresMonitoring: {
                type: Boolean,
                default: false
            }
        }],
        
        medications: [{
            name: {
                type: String,
                required: true
            },
            dosage: String,
            frequency: String,
            purpose: String,
            affectsExercise: {
                type: Boolean,
                default: false
            },
            affectsNutrition: {
                type: Boolean,
                default: false
            },
            sideEffects: [String]
        }],
        
        injuries: [{
            injury: {
                type: String,
                required: true
            },
            injuryDate: Date,
            status: {
                type: String,
                enum: ['healing', 'recovered', 'chronic', 'requires_therapy'],
                default: 'healing'
            },
            affectedAreas: [String],
            restrictions: [String]
        }],
        
        // Risk Assessment Data
        riskFactors: [{
            factor: {
                type: String,
                required: true
            },
            severity: {
                type: String,
                enum: ['low', 'moderate', 'high', 'critical'],
                required: true
            },
            requiresProfessionalConsultation: {
                type: Boolean,
                default: false
            }
        }],
        
        // Vital Signs and Measurements
        vitalSigns: {
            restingHeartRate: {
                value: Number,
                recordedAt: Date,
                source: String
            },
            bloodPressure: {
                systolic: Number,
                diastolic: Number,
                recordedAt: Date,
                source: String
            },
            bodyComposition: {
                bodyFat: Number,
                muscleMass: Number,
                recordedAt: Date,
                source: String
            }
        },
        
     
        medicalClearanceRequired: {
            type: Boolean,
            default: true 
        },
        lastHealthAssessment: {
            type: Date,
            default: null
        },
        nextRecommendedAssessment: {
            type: Date,
            default: null
        },
        
        
        dataSharing: {
            allowEmergencyAccess: {
                type: Boolean,
                default: true
            },
            allowResearchParticipation: {
                type: Boolean,
                default: false
            },
            shareWithHealthcareProviders: {
                type: Boolean,
                default: false
            }
        },
        
        
        completionPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        profileQualityScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    { 
        timestamps: true,
        indexes: [
            { userId: 1 },
            { primaryGoal: 1 },
            { currentActivityLevel: 1 },
            { age: 1 },
            { medicalClearanceRequired: 1 },
            { lastHealthAssessment: 1 },
            { completionPercentage: 1 }
        ]
    }
)

// Calculate BMI
HealthProfileSchema.virtual('bmi').get(function() {
    if (!this.height?.value || !this.weight?.current) return null
    
    let heightInMeters = this.height.value
    let weightInKg = this.weight.current
    
   
    if (this.height.unit === 'inches') {
        heightInMeters = this.height.value * 0.0254
    } else {
        heightInMeters = this.height.value / 100
    }
    
    if (this.weight.unit === 'lbs') {
        weightInKg = this.weight.current * 0.453592
    }
    
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1)
})


HealthProfileSchema.methods.calculateCompletionPercentage = function() {
    let completed = 0
    const totalFields = 15
    
    if (this.age) completed++
    if (this.height.value) completed++
    if (this.weight.current) completed++
    if (this.currentActivityLevel) completed++
    if (this.primaryGoal) completed++
    if (this.timeAvailability.dailyMinutes) completed++
    if (this.preferredWorkoutTypes.length > 0) completed++
    if (this.fitnessExperience) completed++
    if (this.dietaryRestrictions.length >= 0) completed++ 
    if (this.nutritionPreferences.mealsPerDay) completed++
    if (this.healthConditions.length >= 0) completed++ 
    if (this.medications.length >= 0) completed++ 
    if (this.injuries.length >= 0) completed++ 
    if (this.dataSharing.allowEmergencyAccess !== undefined) completed++
    if (this.emergencyContacts && this.emergencyContacts.length > 0) completed++
    
    this.completionPercentage = Math.round((completed / totalFields) * 100)
    return this.completionPercentage
}


HealthProfileSchema.methods.requiresProfessionalConsultation = function() {
   
    if (this.age < 16 || this.age > 65) return true
    
    
    if (this.healthConditions.some(condition => condition.requiresMonitoring)) return true
    
   
    if (this.riskFactors.some(factor => 
        factor.severity === 'high' || factor.severity === 'critical'
    )) return true
    
    
    if (this.medications.some(med => med.affectsExercise || med.affectsNutrition)) return true
    
    
    if (this.injuries.some(injury => 
        injury.status === 'healing' || injury.status === 'requires_therapy'
    )) return true
    
    return false
}


HealthProfileSchema.pre('save', function(next) {
    this.calculateCompletionPercentage()
    this.lastUpdated = new Date()
    
    if (this.requiresProfessionalConsultation()) {
        this.nextRecommendedAssessment = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    } else {
        this.nextRecommendedAssessment = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) 
    }
    
    next()
})

const HealthProfile = mongoose.model('healthprofiles', HealthProfileSchema, 'healthprofiles')
export default HealthProfile