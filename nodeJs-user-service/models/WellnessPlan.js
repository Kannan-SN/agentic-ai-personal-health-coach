import mongoose from 'mongoose'
import * as enums from '@/constants/enum'

const ExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(enums.WORKOUT_TYPES),
        required: true
    },
    duration_minutes: {
        type: Number,
        min: 1,
        max: 60,
        required: true
    },
    intensity: {
        type: String,
        enum: Object.values(enums.INTENSITY_LEVELS),
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    target_muscles: [String],
    equipment_needed: [String],
    modifications: {
        type: String,
        default: ''
    },
    safety_notes: {
        type: String,
        required: true
    },
    calories_burned_estimate: {
        type: Number,
        min: 0,
        max: 500
    }
}, { _id: true })

const WorkoutSchema = new mongoose.Schema({
    day: {
        type: Number,
        min: 1,
        max: 7,
        required: true
    },
    workout_name: {
        type: String,
        required: true
    },
    total_duration_minutes: {
        type: Number,
        min: enums.SAFETY_LIMITS.MIN_WORKOUT_MINUTES,
        max: enums.SAFETY_LIMITS.MAX_WORKOUT_MINUTES,
        // required: true
    },
    warm_up: {
        type: String,
        // required: true
    },
    exercises: [ExerciseSchema],
    cool_down: {
        type: String,
        // required: true
    },
    intensity_level: {
        type: String,
        enum: Object.values(enums.INTENSITY_LEVELS),
        
    },
    estimated_calories_burned: {
        type: Number,
        min: 0,
        max: 1000
    },
    rest_day: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    userFeedback: {
        difficulty: {
            type: Number,
            min: 1,
            max: 5
        },
        enjoyment: {
            type: Number,
            min: 1,
            max: 5
        },
        notes: String
    }
}, { _id: true })

const MealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    meal_type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true
    },
    ingredients: [{
        type: String,
        required: true
    }],
    instructions: {
        type: String,
        required: true
    },
    prep_time_minutes: {
        type: Number,
        min: 0,
        max: 120,
        required: true
    },
    servings: {
        type: Number,
        min: 1,
        max: 8,
        required: true
    },
    estimated_calories: {
        type: Number,
        min: 50,
        max: 800,
        required: true
    },
    macronutrients: {
        protein: Number,
        carbs: Number,
        fats: Number,
        fiber: Number
    },
    dietary_tags: [{
        type: String,
        enum: Object.values(enums.DIETARY_RESTRICTIONS)
    }],
    allergen_warnings: [String],
    nutrition_notes: {
        type: String,
        default: ''
    }
}, { _id: true })

const DailyMealPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        min: 1,
        max: 7,
        required: true
    },
    meals: [MealSchema],
    total_estimated_calories: {
        type: Number,
        min: enums.SAFETY_LIMITS.MIN_CALORIES,
        max: enums.SAFETY_LIMITS.MAX_CALORIES,
        required: true
    },
    daily_water_goal_glasses: {
        type: Number,
        min: 6,
        max: 15,
        default: 8
    },
    nutrition_summary: {
        protein_grams: Number,
        carbs_grams: Number,
        fats_grams: Number,
        fiber_grams: Number,
        sodium_mg: Number
    },
    special_notes: {
        type: String,
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    }
}, { _id: true })

const WellnessPlanSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'users',
            index: true
        },
        
        // REMOVED: agentServicePlanId - not needed in microservice architecture
        // The Agent Service generates plans but doesn't persist them
        // This User Service is the single source of truth for plan data
        
        planName: {
            type: String,
            required: true,
            maxlength: 100
        },
        planDescription: {
            type: String,
            maxlength: 500
        },
        
        status: {
            type: String,
            default: enums.WELLNESS_PLAN_STATES.ACTIVE,
            enum: Object.values(enums.WELLNESS_PLAN_STATES),
            index: true
        },
        planDurationWeeks: {
            type: Number,
            min: 1,
            max: 12,
            required: true
        },
        currentWeek: {
            type: Number,
            min: 1,
            default: 1
        },
        
        userProfileSnapshot: {
            age: Number,
            primaryGoal: {
                type: String,
                enum: Object.values(enums.HEALTH_GOALS)
            },
            currentActivityLevel: {
                type: String,
                enum: Object.values(enums.ACTIVITY_LEVELS)
            },
            timeAvailabilityMinutes: Number,
            riskLevel: {
                type: String,
                enum: Object.values(enums.RISK_LEVELS)
            }
        },
        
        workoutPlan: [WorkoutSchema],
        mealPlan: [DailyMealPlanSchema],
        
        healthAnalysis: {
            overall_readiness_level: {
                type: String,
                enum: ['low', 'moderate', 'high']
            },
            primary_safety_concerns: [String],
            professional_consultations_recommended: [{
                type: {
                    type: String,
                    enum: Object.values(enums.CONSULTATION_TYPES)
                },
                priority: {
                    type: String,
                    enum: ['low', 'moderate', 'high']
                },
                reason: String,
                before_starting: Boolean,
                completed: {
                    type: Boolean,
                    default: false
                },
                completedAt: Date
            }],
            risk_level: {
                type: String,
                enum: Object.values(enums.RISK_LEVELS)
            },
            proceed_with_ai_plan: {
                type: Boolean,
                default: false
            }
        },
        
        safetyNotes: [String],
        disclaimers: [String],
        
        progressTracking: {
            weeklyProgress: [{
                week: Number,
                workoutsCompleted: Number,
                totalWorkouts: Number,
                mealsFollowed: Number,
                totalMeals: Number,
                weightChange: Number,
                energyLevel: {
                    type: Number,
                    min: 1,
                    max: 5
                },
                overallSatisfaction: {
                    type: Number,
                    min: 1,
                    max: 5
                },
                notes: String,
                concernsReported: [String],
                weekCompletedAt: Date
            }],
            totalWorkoutsCompleted: {
                type: Number,
                default: 0
            },
            totalMealsFollowed: {
                type: Number,
                default: 0
            },
            adherencePercentage: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            }
        },
        
        chatHistory: [{
            message: String,
            sender: {
                type: String,
                enum: ['user', 'agent']
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            messageType: {
                type: String,
                enum: ['question', 'modification_request', 'concern', 'feedback'],
                default: 'question'
            },
            response: String,
            safety_check_performed: {
                type: Boolean,
                default: true
            }
        }],
        
        emergencyFlags: [{
            flag: String,
            severity: {
                type: String,
                enum: ['low', 'moderate', 'high', 'critical']
            },
            description: String,
            flaggedAt: {
                type: Date,
                default: Date.now
            },
            resolved: {
                type: Boolean,
                default: false
            },
            resolvedAt: Date,
            actionTaken: String
        }],
        
        consultationStatus: {
            required: {
                type: Boolean,
                default: true
            },
            completed: {
                type: Boolean,
                default: false
            },
            completedAt: Date,
            provider: String,
            clearanceLevel: {
                type: String,
                enum: ['full', 'modified', 'suspended']
            },
            restrictions: [String],
            nextReviewDate: Date
        },
        
        modificationHistory: [{
            modifiedAt: {
                type: Date,
                default: Date.now
            },
            modifiedBy: {
                type: String,
                enum: ['user_request', 'agent_recommendation', 'safety_protocol', 'professional_guidance']
            },
            modificationType: {
                type: String,
                enum: ['workout_adjustment', 'meal_adjustment', 'safety_modification', 'goal_change']
            },
            description: String,
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
            reason: String
        }],
        
        complianceData: {
            healthDisclaimerAccepted: {
                type: Boolean,
                required: true
            },
            disclaimerVersion: String,
            disclaimerAcceptedAt: Date,
            dataRetentionConsent: {
                type: Boolean,
                default: true
            },
            lastAuditDate: Date,
            auditNotes: String
        },
        
        planStartDate: {
            type: Date,
            default: Date.now
        },
        planEndDate: Date,
        lastAccessedAt: Date,
        pausedAt: Date,
        resumedAt: Date,
        completedAt: Date
    },
    { 
        timestamps: true,
        indexes: [
            { userId: 1 },
            { status: 1 },
            { currentWeek: 1 },
            { 'healthAnalysis.risk_level': 1 },
            { 'consultationStatus.required': 1 },
            { planStartDate: 1 },
            { lastAccessedAt: 1 }
        ]
    }
)

// Virtual for completion percentage
WellnessPlanSchema.virtual('completionPercentage').get(function() {
    if (this.planDurationWeeks === 0) return 0
    return Math.min((this.currentWeek / this.planDurationWeeks) * 100, 100)
})

// Method to check if plan requires immediate attention
WellnessPlanSchema.methods.requiresImmediateAttention = function() {
    return this.emergencyFlags.some(flag => 
        !flag.resolved && (flag.severity === 'critical' || flag.severity === 'high')
    ) || this.healthAnalysis.risk_level === enums.RISK_LEVELS.VERY_HIGH
}

// Method to calculate adherence percentage
WellnessPlanSchema.methods.calculateAdherence = function() {
    const totalExpected = this.workoutPlan.length + this.mealPlan.length
    const totalCompleted = this.progressTracking.totalWorkoutsCompleted + this.progressTracking.totalMealsFollowed
    
    if (totalExpected === 0) return 0
    
    this.progressTracking.adherencePercentage = Math.round((totalCompleted / totalExpected) * 100)
    return this.progressTracking.adherencePercentage
}

// Method to add emergency flag
WellnessPlanSchema.methods.addEmergencyFlag = function(flag, severity, description) {
    this.emergencyFlags.push({
        flag,
        severity,
        description,
        flaggedAt: new Date()
    })
    
    if (severity === 'critical') {
        this.status = enums.WELLNESS_PLAN_STATES.REQUIRES_REVIEW
        this.pausedAt = new Date()
    }
}

// Method to update last access time
WellnessPlanSchema.methods.updateAccess = function() {
    this.lastAccessedAt = new Date()
}

// Pre-save middleware
WellnessPlanSchema.pre('save', function(next) {
    // Calculate plan end date
    if (!this.planEndDate && this.planStartDate && this.planDurationWeeks) {
        this.planEndDate = new Date(this.planStartDate.getTime() + (this.planDurationWeeks * 7 * 24 * 60 * 60 * 1000))
    }
    
    // Validate weekly workout limits
    const weeklyWorkoutMinutes = this.workoutPlan
        .filter(workout => !workout.rest_day)
        .reduce((total, workout) => total + workout.total_duration_minutes, 0)
    
    if (weeklyWorkoutMinutes > enums.SAFETY_LIMITS.MAX_WEEKLY_WORKOUT_HOURS * 60) {
        const error = new Error('Weekly workout duration exceeds safety limits')
        error.name = 'SafetyLimitError'
        return next(error)
    }
    
    // Validate calorie limits
    for (const dailyPlan of this.mealPlan) {
        if (dailyPlan.total_estimated_calories < enums.SAFETY_LIMITS.MIN_CALORIES) {
            const error = new Error(`Day ${dailyPlan.day} calories below safe minimum`)
            error.name = 'NutritionSafetyError'
            return next(error)
        }
        if (dailyPlan.total_estimated_calories > enums.SAFETY_LIMITS.MAX_CALORIES) {
            const error = new Error(`Day ${dailyPlan.day} calories above safe maximum`)
            error.name = 'NutritionSafetyError'
            return next(error)
        }
    }
    
    // Update adherence percentage
    this.calculateAdherence()
    
    next()
})

const WellnessPlan = mongoose.model('wellnessplans', WellnessPlanSchema, 'wellnessplans')
export default WellnessPlan