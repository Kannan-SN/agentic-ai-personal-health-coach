import * as yup from 'yup'
import * as regex from '@/constants/regex'
import * as enums from '@/constants/enums'
import yupToFormError from '@/utils/yupToFormErrors'


export const createHealthProfile = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            age: yup.number()
                .required('Age is required')
                .min(enums.SAFETY_LIMITS.MIN_AGE, `Age must be at least ${enums.SAFETY_LIMITS.MIN_AGE} years`)
                .max(enums.SAFETY_LIMITS.MAX_AGE, `Age must not exceed ${enums.SAFETY_LIMITS.MAX_AGE} years`)
                .integer('Age must be a whole number'),
            
            dateOfBirth: yup.date()
                .required('Date of birth is required')
                .max(new Date(), 'Date of birth cannot be in the future')
                .test('age-consistency', 'Date of birth must match provided age', function(value) {
                    if (!value || !this.parent.age) return true
                    const ageDiff = Math.floor((Date.now() - value.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    return Math.abs(ageDiff - this.parent.age) <= 1
                }),
            
            gender: yup.string()
                .required('Gender is required')
                .oneOf(['male', 'female', 'other', 'prefer_not_to_say'], 'Please select a valid gender option'),
            
            height: yup.object().shape({
                value: yup.number()
                    .required('Height is required')
                    .positive('Height must be positive')
                    .test('height-range', 'Height must be within reasonable range', function(value) {
                        if (!value) return true
                        const unit = this.parent.unit
                        if (unit === 'inches') return value >= 30 && value <= 120
                        if (unit === 'cm') return value >= 76 && value <= 305
                        return true
                    }),
                unit: yup.string()
                    .required('Height unit is required')
                    .oneOf(['inches', 'cm'], 'Height unit must be inches or cm')
            }).required('Height information is required'),
            
            weight: yup.object().shape({
                current: yup.number()
                    .required('Current weight is required')
                    .positive('Weight must be positive')
                    .test('weight-range', 'Weight must be within reasonable range', function(value) {
                        if (!value) return true
                        const unit = this.parent.unit
                        if (unit === 'lbs') return value >= 50 && value <= 1000
                        if (unit === 'kg') return value >= 23 && value <= 454
                        return true
                    }),
                unit: yup.string()
                    .required('Weight unit is required')
                    .oneOf(['lbs', 'kg'], 'Weight unit must be lbs or kg')
            }).required('Weight information is required'),
            
            currentActivityLevel: yup.string()
                .required('Current activity level is required')
                .oneOf(Object.values(enums.ACTIVITY_LEVELS), 'Please select a valid activity level'),
            
            primaryGoal: yup.string()
                .required('Primary health goal is required')
                .oneOf(Object.values(enums.HEALTH_GOALS), 'Please select a valid health goal'),
            
            secondaryGoals: yup.array()
                .of(yup.string().oneOf(Object.values(enums.HEALTH_GOALS)))
                .max(3, 'Maximum 3 secondary goals allowed'),
            
            timeAvailability: yup.object().shape({
                dailyMinutes: yup.number()
                    .required('Daily time availability is required')
                    .min(enums.SAFETY_LIMITS.MIN_WORKOUT_MINUTES, `Minimum ${enums.SAFETY_LIMITS.MIN_WORKOUT_MINUTES} minutes required`)
                    .max(enums.SAFETY_LIMITS.MAX_WORKOUT_MINUTES, `Maximum ${enums.SAFETY_LIMITS.MAX_WORKOUT_MINUTES} minutes for safety`),
                preferredTimes: yup.array()
                    .of(yup.string().oneOf(['early_morning', 'morning', 'midday', 'afternoon', 'evening', 'night']))
                    .max(4, 'Maximum 4 preferred times allowed'),
                availableDays: yup.array()
                    .of(yup.string().oneOf(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
                    .min(2, 'At least 2 available days required for effective planning')
                    .max(7, 'Maximum 7 days allowed')
            }).required('Time availability information is required'),
            
            preferredWorkoutTypes: yup.array()
                .of(yup.string().oneOf(Object.values(enums.WORKOUT_TYPES)))
                .min(1, 'At least one workout type preference required')
                .max(5, 'Maximum 5 workout type preferences allowed'),
            
            availableEquipment: yup.array()
                .of(yup.string())
                .min(1, 'At least one equipment option required (bodyweight if no equipment)'),
            
            fitnessExperience: yup.string()
                .required('Fitness experience level is required')
                .oneOf(['beginner', 'intermediate', 'advanced'], 'Please select a valid experience level'),
            
            exerciseLimitations: yup.array()
                .of(yup.object().shape({
                    limitation: yup.string().required('Limitation description required'),
                    severity: yup.string().oneOf(['mild', 'moderate', 'severe']).default('moderate'),
                    affectedMovements: yup.array().of(yup.string())
                }))
                .max(10, 'Maximum 10 exercise limitations allowed'),
            
            dietaryRestrictions: yup.array()
                .of(yup.string().oneOf(Object.values(enums.DIETARY_RESTRICTIONS)))
                .max(5, 'Maximum 5 dietary restrictions for safe nutrition planning'),
            
            foodAllergies: yup.array()
                .of(yup.object().shape({
                    allergen: yup.string().required('Allergen name required'),
                    severity: yup.string()
                        .required('Allergy severity required')
                        .oneOf(['mild', 'moderate', 'severe', 'life_threatening'], 'Please select valid severity level')
                }))
                .max(15, 'Maximum 15 food allergies allowed'),
            
            healthConditions: yup.array()
                .of(yup.string().max(100, 'Health condition description too long'))
                .max(20, 'Maximum 20 health conditions allowed')
                .test('safety-check', 'Certain health conditions require professional consultation', function(value) {
                    if (!value || value.length === 0) return true
                    const highRiskConditions = ['heart', 'cardiac', 'diabetes', 'pregnancy', 'surgery', 'chest pain']
                    const hasHighRisk = value.some(condition => 
                        highRiskConditions.some(risk => condition.toLowerCase().includes(risk))
                    )
                    if (hasHighRisk) {
                        return this.createError({
                            message: 'Your health conditions indicate professional medical consultation is required before proceeding'
                        })
                    }
                    return true
                }),
            
            medications: yup.array()
                .of(yup.object().shape({
                    name: yup.string()
                        .required('Medication name required')
                        .matches(regex.MEDICATION_NAME_PATTERN, 'Please enter a valid medication name'),
                    dosage: yup.string().max(50, 'Dosage description too long'),
                    frequency: yup.string().max(50, 'Frequency description too long'),
                    purpose: yup.string().max(100, 'Purpose description too long'),
                    affectsExercise: yup.boolean().default(false),
                    affectsNutrition: yup.boolean().default(false)
                }))
                .max(20, 'Maximum 20 medications allowed'),
            
            injuries: yup.array()
                .of(yup.object().shape({
                    injury: yup.string().required('Injury description required').max(100),
                    injuryDate: yup.date().max(new Date(), 'Injury date cannot be in the future'),
                    status: yup.string()
                        .oneOf(['healing', 'recovered', 'chronic', 'requires_therapy'])
                        .default('healing'),
                    affectedAreas: yup.array().of(yup.string()).max(10),
                    restrictions: yup.array().of(yup.string()).max(10)
                }))
                .max(10, 'Maximum 10 injury records allowed')
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Please complete your health profile with accurate information for safe recommendations',
            errors: formErrors,
            safety_notice: 'Accurate health information is essential for your safety and appropriate recommendations',
            professional_consultation_note: 'Consider consulting healthcare professionals for complex health conditions'
        })
    }
}

export const updateHealthProfile = async (req, res, next) => {
    try {
       
        const schema = yup.object().shape({
            age: yup.number()
                .min(enums.SAFETY_LIMITS.MIN_AGE, `Age must be at least ${enums.SAFETY_LIMITS.MIN_AGE} years`)
                .max(enums.SAFETY_LIMITS.MAX_AGE, `Age must not exceed ${enums.SAFETY_LIMITS.MAX_AGE} years`)
                .integer('Age must be a whole number'),
            
            currentActivityLevel: yup.string()
                .oneOf(Object.values(enums.ACTIVITY_LEVELS), 'Please select a valid activity level'),
            
            primaryGoal: yup.string()
                .oneOf(Object.values(enums.HEALTH_GOALS), 'Please select a valid health goal'),
            
            'timeAvailability.dailyMinutes': yup.number()
                .min(enums.SAFETY_LIMITS.MIN_WORKOUT_MINUTES, `Minimum ${enums.SAFETY_LIMITS.MIN_WORKOUT_MINUTES} minutes required`)
                .max(enums.SAFETY_LIMITS.MAX_WORKOUT_MINUTES, `Maximum ${enums.SAFETY_LIMITS.MAX_WORKOUT_MINUTES} minutes for safety`),
            
            healthConditions: yup.array()
                .of(yup.string().max(100, 'Health condition description too long'))
                .max(20, 'Maximum 20 health conditions allowed'),
            
            medications: yup.array()
                .of(yup.object().shape({
                    name: yup.string().matches(regex.MEDICATION_NAME_PATTERN, 'Please enter a valid medication name')
                }))
                .max(20, 'Maximum 20 medications allowed')
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Please correct the health profile information',
            errors: formErrors
        })
    }
}

export const acceptHealthDisclaimer = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            acceptTerms: yup.boolean()
                .required('Disclaimer acceptance is required')
                .oneOf([true], 'You must accept the health disclaimer to proceed'),
            disclaimerVersion: yup.string()
                .required('Disclaimer version is required')
                .matches(/^\d+\.\d+$/, 'Invalid disclaimer version format'),
            understandLimitations: yup.boolean()
                .required('Understanding of AI limitations is required')
                .oneOf([true], 'You must acknowledge the limitations of AI health recommendations'),
            emergencyAwareness: yup.boolean()
                .required('Emergency awareness confirmation is required')
                .oneOf([true], 'You must confirm understanding of emergency procedures')
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Health disclaimer acceptance is required to proceed',
            errors: formErrors,
            disclaimer_note: 'Understanding these terms is essential for your safety when using health services'
        })
    }
}

export const addEmergencyContact = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            name: yup.string()
                .required('Contact name is required')
                .min(2, 'Name must be at least 2 characters')
                .max(50, 'Name must not exceed 50 characters')
                .matches(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
            
            relationship: yup.string()
                .required('Relationship is required')
                .min(2, 'Relationship must be at least 2 characters')
                .max(30, 'Relationship must not exceed 30 characters')
                .matches(regex.EMERGENCY_CONTACT_RELATIONSHIP, 'Please enter a valid relationship'),
            
            phone: yup.string()
                .required('Phone number is required')
                .matches(regex.PHONE_NUMBER, 'Please enter a valid phone number'),
            
            email: yup.string()
                .email('Please enter a valid email address')
                .matches(regex.EMAIL, 'Please enter a valid email format'),
            
            isPrimary: yup.boolean().default(false),
            
            canNotifyHealthConcerns: yup.boolean()
                .default(false)
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Please provide valid emergency contact information',
            errors: formErrors,
            safety_note: 'Emergency contacts are important for your safety during health and fitness activities'
        })
    }
}

export const reportHealthConcern = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            description: yup.string()
                .required('Please describe your health concern')
                .min(10, 'Please provide more detail about your concern')
                .max(500, 'Description must not exceed 500 characters')
                .test('emergency-keywords', 'Emergency symptoms detected - please seek immediate medical attention', function(value) {
                    if (!value) return true
                    const emergencyKeywords = ['chest pain', 'heart attack', 'can\'t breathe', 'difficulty breathing', 'unconscious', 'fainting']
                    const hasEmergency = emergencyKeywords.some(keyword => value.toLowerCase().includes(keyword))
                    if (hasEmergency) {
                        return this.createError({
                            message: 'Emergency symptoms detected. Please call 911 or seek immediate medical attention.'
                        })
                    }
                    return true
                }),
            
            severity: yup.string()
                .required('Please indicate the severity level')
                .oneOf(['mild', 'moderate', 'severe'], 'Please select a valid severity level'),
            
            symptoms: yup.array()
                .of(yup.string().max(100, 'Symptom description too long'))
                .max(10, 'Maximum 10 symptoms allowed'),
            
            relatedToExercise: yup.boolean().default(false),
            relatedToMeal: yup.boolean().default(false),
            
            whenOccurred: yup.string()
                .max(100, 'Description too long')
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Please provide complete information about your health concern',
            errors: formErrors,
            urgent_notice: Object.values(formErrors).some(error => error.includes('Emergency')) ? 
                'Emergency symptoms detected - please seek immediate medical attention' : undefined,
            emergency_resources: {
                emergency_services: '911 (US)',
                poison_control: '1-800-222-1222 (US)'
            }
        })
    }
}

export const createWellnessPlan = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            planName: yup.string()
                .max(100, 'Plan name must not exceed 100 characters')
                .matches(/^[a-zA-Z0-9\s\-_]+$/, 'Plan name can only contain letters, numbers, spaces, hyphens, and underscores'),
            
            planDurationWeeks: yup.number()
                .min(1, 'Plan duration must be at least 1 week')
                .max(12, 'Plan duration cannot exceed 12 weeks for safety')
                .integer('Duration must be a whole number'),
            
            agreeToSafetyGuidelines: yup.boolean()
                .required('Safety guidelines agreement is required')
                .oneOf([true], 'You must agree to follow safety guidelines'),
            
            professionalConsultationAcknowledged: yup.boolean()
                .required('Professional consultation acknowledgment is required')
                .oneOf([true], 'You must acknowledge the importance of professional consultation')
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Please complete the wellness plan requirements',
            errors: formErrors,
            safety_reminder: 'Safety guidelines help ensure your wellness plan is appropriate and effective'
        })
    }
}

export const updatePlanProgress = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            currentWeek: yup.number()
                .required('Current week is required')
                .min(1, 'Week must be at least 1')
                .max(52, 'Week cannot exceed 52')
                .integer('Week must be a whole number'),
            
            currentDay: yup.number()
                .min(1, 'Day must be at least 1')
                .max(7, 'Day cannot exceed 7')
                .integer('Day must be a whole number'),
            
            workoutProgress: yup.object().shape({
                completed: yup.boolean(),
                duration_minutes: yup.number()
                    .min(0, 'Duration cannot be negative')
                    .max(180, 'Duration exceeds safe limits'),
                intensity_perceived: yup.number()
                    .min(1, 'Intensity must be at least 1')
                    .max(10, 'Intensity cannot exceed 10'),
                difficulty_rating: yup.number()
                    .min(1, 'Rating must be at least 1')
                    .max(5, 'Rating cannot exceed 5')
            }),
            
            mealProgress: yup.object().shape({
                breakfast: yup.object().shape({ followed: yup.boolean() }),
                lunch: yup.object().shape({ followed: yup.boolean() }),
                dinner: yup.object().shape({ followed: yup.boolean() }),
                water_intake_glasses: yup.number()
                    .min(0, 'Water intake cannot be negative')
                    .max(20, 'Water intake seems excessive - please verify')
            }),
            
            healthMetrics: yup.object().shape({
                energy_level: yup.number()
                    .required('Energy level is required for safety monitoring')
                    .min(1, 'Energy level must be at least 1')
                    .max(5, 'Energy level cannot exceed 5'),
                sleep_hours: yup.number()
                    .min(0, 'Sleep hours cannot be negative')
                    .max(24, 'Sleep hours cannot exceed 24'),
                stress_level: yup.number()
                    .min(1, 'Stress level must be at least 1')
                    .max(5, 'Stress level cannot exceed 5'),
                mood: yup.number()
                    .min(1, 'Mood must be at least 1')
                    .max(5, 'Mood cannot exceed 5'),
                pain_level: yup.number()
                    .min(0, 'Pain level cannot be negative')
                    .max(10, 'Pain level cannot exceed 10')
                    .test('high-pain', 'High pain levels require immediate attention', function(value) {
                        if (value && value >= 7) {
                            return this.createError({
                                message: 'Pain level 7+ requires medical attention. Please consult a healthcare provider.'
                            })
                        }
                        return true
                    })
            }),
            
            reportedSymptoms: yup.array()
                .of(yup.object().shape({
                    symptom: yup.string().required('Symptom description required').max(100),
                    severity: yup.string()
                        .required('Symptom severity required')
                        .oneOf(['mild', 'moderate', 'severe'])
                }))
                .max(10, 'Maximum 10 symptoms allowed'),
            
            notes: yup.string()
                .max(1000, 'Notes must not exceed 1000 characters'),
            
            concerns: yup.string()
                .max(500, 'Concerns must not exceed 500 characters')
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Please provide complete and accurate progress information',
            errors: formErrors,
            safety_notice: 'Accurate progress tracking helps ensure your safety and plan effectiveness'
        })
    }
}

export const pauseWellnessPlan = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            reason: yup.string()
                .required('Please provide a reason for pausing your plan')
                .min(5, 'Please provide more detail about the reason')
                .max(200, 'Reason must not exceed 200 characters'),
            
            expectedDuration: yup.string()
                .max(50, 'Duration description too long')
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Please provide a reason for pausing your wellness plan',
            errors: formErrors
        })
    }
}

export const resumeWellnessPlan = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            healthConcernResolved: yup.boolean()
                .when('$hasHealthFlags', {
                    is: true,
                    then: yup.boolean()
                        .required('Health concern resolution confirmation required')
                        .oneOf([true], 'Please confirm health concerns have been addressed')
                }),
            
            resumeNotes: yup.string()
                .max(200, 'Notes must not exceed 200 characters'),
            
            readyToResume: yup.boolean()
                .required('Readiness confirmation is required')
                .oneOf([true], 'Please confirm you are ready to resume')
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Please confirm your readiness to resume the wellness plan',
            errors: formErrors,
            safety_note: 'Confirming readiness helps ensure safe resumption of activities'
        })
    }
}