import mongoose from 'mongoose'

const ProgressTrackingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'users',
            index: true
        },
        wellnessPlanId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'wellnessplans',
            index: true
        },
        

        entryDate: {
            type: Date,
            required: true,
            default: Date.now,
            index: true
        },
        week: {
            type: Number,
            required: true,
            min: 1
        },
        day: {
            type: Number,
            required: true,
            min: 1,
            max: 7
        },

        workoutProgress: {
            completed: {
                type: Boolean,
                default: false
            },
            duration_minutes: {
                type: Number,
                min: 0,
                max: 180
            },
            intensity_perceived: {
                type: Number,
                min: 1,
                max: 10
            },
            exercises_completed: Number,
            exercises_skipped: Number,
            modifications_made: [String],
            difficulty_rating: {
                type: Number,
                min: 1,
                max: 5
            },
            enjoyment_rating: {
                type: Number,
                min: 1,
                max: 5
            }
        },
        mealProgress: {
            breakfast: {
                followed: Boolean,
                modifications: String,
                enjoyment: {
                    type: Number,
                    min: 1,
                    max: 5
                }
            },
            lunch: {
                followed: Boolean,
                modifications: String,
                enjoyment: {
                    type: Number,
                    min: 1,
                    max: 5
                }
            },
            dinner: {
                followed: Boolean,
                modifications: String,
                enjoyment: {
                    type: Number,
                    min: 1,
                    max: 5
                }
            },
            snacks: {
                followed: Boolean,
                modifications: String
            },
            water_intake_glasses: {
                type: Number,
                min: 0,
                max: 20
            }
        },
        healthMetrics: {
            energy_level: {
                type: Number,
                min: 1,
                max: 5,
                required: true
            },
            sleep_hours: {
                type: Number,
                min: 0,
                max: 24
            },
            sleep_quality: {
                type: Number,
                min: 1,
                max: 5
            },
            stress_level: {
                type: Number,
                min: 1,
                max: 5
            },
            mood: {
                type: Number,
                min: 1,
                max: 5
            },
            pain_level: {
                type: Number,
                min: 0,
                max: 10
            },
            pain_locations: [String]
        },
        reportedSymptoms: [{
            symptom: {
                type: String,
                required: true
            },
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe'],
                required: true
            },
            duration: String,
            related_to_exercise: Boolean,
            related_to_meal: Boolean
        }],
        
        safetyFlags: [{
            flag: String,
            severity: {
                type: String,
                enum: ['low', 'moderate', 'high', 'critical']
            },
            auto_detected: Boolean,
            requires_attention: Boolean
        }],
        notes: {
            type: String,
            maxlength: 1000
        },
        concerns: {
            type: String,
            maxlength: 500
        },
        achievements: {
            type: String,
            maxlength: 500
        },
        progressPhotos: [{
            url: String,
            type: {
                type: String,
                enum: ['front', 'side', 'back', 'exercise_form']
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        measurements: {
            weight: {
                value: Number,
                unit: {
                    type: String,
                    enum: ['lbs', 'kg']
                }
            },
            body_measurements: {
                chest: Number,
                waist: Number,
                hips: Number,
                arms: Number,
                thighs: Number,
                unit: {
                    type: String,
                    enum: ['inches', 'cm']
                }
            }
        },
        safetyReview: {
            reviewed: {
                type: Boolean,
                default: false
            },
            reviewedAt: Date,
            reviewedBy: {
                type: String,
                enum: ['automated_system', 'health_professional', 'support_staff']
            },
            flagsRaised: [String],
            actionRequired: {
                type: Boolean,
                default: false
            },
            actionTaken: String
        },
        
        dataQuality: {
            completeness: {
                type: Number,
                min: 0,
                max: 100
            },
            reliability: {
                type: String,
                enum: ['high', 'medium', 'low'],
                default: 'medium'
            }
        }
    },
    { 
        timestamps: true,
        indexes: [
            { userId: 1, entryDate: -1 },
            { wellnessPlanId: 1 },
            { week: 1, day: 1 },
            { 'healthMetrics.energy_level': 1 },
            { 'safetyReview.actionRequired': 1 },
            { entryDate: -1 }
        ]
    }
)


ProgressTrackingSchema.methods.checkSafetyConcerns = function() {
    const concerns = []
    const severeSymptomsReported = this.reportedSymptoms.some(symptom => 
        symptom.severity === 'severe'
    )
    if (severeSymptomsReported) {
        concerns.push('severe_symptoms_reported')
    }
    
    if (this.healthMetrics.energy_level <= 2) {
        concerns.push('very_low_energy')
    }
    if (this.healthMetrics.pain_level >= 7) {
        concerns.push('high_pain_level')
    }
    if (this.healthMetrics.stress_level >= 4 && this.healthMetrics.mood <= 2) {
        concerns.push('high_stress_low_mood')
    }
    
    return concerns
}


ProgressTrackingSchema.methods.calculateCompleteness = function() {
    let completed = 0
    const total = 10
    
    if (this.workoutProgress.completed !== undefined) completed++
    if (this.mealProgress.breakfast.followed !== undefined) completed++
    if (this.mealProgress.lunch.followed !== undefined) completed++
    if (this.mealProgress.dinner.followed !== undefined) completed++
    if (this.healthMetrics.energy_level) completed++
    if (this.healthMetrics.sleep_hours) completed++
    if (this.healthMetrics.sleep_quality) completed++
    if (this.healthMetrics.stress_level) completed++
    if (this.healthMetrics.mood) completed++
    if (this.mealProgress.water_intake_glasses) completed++
    
    this.dataQuality.completeness = Math.round((completed / total) * 100)
    return this.dataQuality.completeness
}


ProgressTrackingSchema.pre('save', function(next) {
    this.calculateCompleteness()
    const concerns = this.checkSafetyConcerns()
    if (concerns.length > 0) {
        this.safetyFlags = concerns.map(concern => ({
            flag: concern,
            severity: 'moderate',
            auto_detected: true,
            requires_attention: true
        }))
        
        this.safetyReview.actionRequired = true
    }
    
    next()
})

export const ProgressTracking = mongoose.model('progresstracking', ProgressTrackingSchema, 'progresstracking')