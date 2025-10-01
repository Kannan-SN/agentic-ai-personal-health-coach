import { WellnessPlan, HealthProfile, User, ProgressTracking, EmergencyAlert } from '@/models'
import { HealthSafetyValidator, logHealthRecommendation } from '@/utils/healthSafety'
import { logAuthEvent } from '@/security/security'
import * as agentService from '@/services/agent'
import * as enums from '@/constants/enum'
import isEmpty from 'is-empty'
import config from '@/config'



const mapActivityLevelToAgentService = (activityLevel) => {
    if (!activityLevel) {
        console.warn('[ENUM-MAPPING] Activity level is undefined, using default')
        return 'moderately_active'
    }

    const activityMapping = {
        sedentary: 'sedentary',
        light: 'lightly_active',
        lightly_active: 'lightly_active',
        moderate: 'moderately_active',
        moderately_active: 'moderately_active',
        active: 'very_active',
        very_active: 'very_active',
        extremely_active: 'extremely_active',
    }

    const normalized = activityLevel.toString().toLowerCase().replace(/\s+/g, '_')
    const mapped = activityMapping[normalized]
    
    if (!mapped) {
        console.error(`[ENUM-MAPPING] Unknown activity level: "${activityLevel}" (normalized: "${normalized}")`)
        console.error('[ENUM-MAPPING] Available values:', Object.keys(activityMapping))
        return 'moderately_active'
    }
    
    console.log(`[ENUM-MAPPING] Activity level mapped: ${activityLevel} -> ${mapped}`)
    return mapped
}

const mapPrimaryGoalToAgentService = (primaryGoal) => {
    if (!primaryGoal) {
        console.warn('[ENUM-MAPPING] Primary goal is undefined, using default')
        return 'general_wellness'
    }

    const goalMapping = {
        weight_loss: 'gentle_weight_loss',
        gentle_weight_loss: 'gentle_weight_loss',
        weight_gain: 'muscle_gain',
        muscle_gain: 'muscle_gain',
        general_fitness: 'improved_fitness',
        improved_fitness: 'improved_fitness',
        endurance: 'improved_fitness',
        strength: 'muscle_gain',
        flexibility: 'general_wellness',
        stress_reduction: 'stress_reduction',
        injury_recovery: 'general_wellness',
        chronic_condition_management: 'general_wellness',
        general_wellness: 'general_wellness',
    }

    const normalized = primaryGoal.toString().toLowerCase().replace(/\s+/g, '_')
    const mapped = goalMapping[normalized]
    
    if (!mapped) {
        console.error(`[ENUM-MAPPING] Unknown primary goal: "${primaryGoal}" (normalized: "${normalized}")`)
        console.error('[ENUM-MAPPING] Available values:', Object.keys(goalMapping))
        return 'general_wellness'
    }
    
    console.log(`[ENUM-MAPPING] Primary goal mapped: ${primaryGoal} -> ${mapped}`)
    return mapped
}

export const createWellnessPlan = async (req, res) => {
    console.log('[WELLNESS-PLAN] ===== CREATE WELLNESS PLAN START =====')
    console.log('[WELLNESS-PLAN] User ID:', req.user._id)
    console.log('[WELLNESS-PLAN] User health status:', req.user.healthStatus)
    console.log('[WELLNESS-PLAN] Health disclaimer accepted:', req.user.healthDisclaimerAccepted)

    try {
        const { user, body } = req

        // Verify health profile exists
        const healthProfile = await HealthProfile.findOne({ userId: user._id })
        if (!healthProfile) {
            console.error('[WELLNESS-PLAN] Health profile not found for user:', user._id)
            return res.status(400).json({
                success: false,
                message: 'Health profile required before creating wellness plan',
                action_required: 'create_health_profile',
            })
        }

        console.log('[WELLNESS-PLAN] Health Profile Retrieved:')
        console.log('- Age:', healthProfile.age)
        console.log('- Current Activity Level (raw):', healthProfile.currentActivityLevel)
        console.log('- Primary Goal (raw):', healthProfile.primaryGoal)
        console.log('- Time Availability:', healthProfile.timeAvailability?.dailyMinutes)
        console.log('- Health Conditions:', healthProfile.healthConditions)
        console.log('- Dietary Restrictions:', healthProfile.dietaryRestrictions)

        // Check if user has accepted health disclaimers
        if (!user.healthDisclaimerAccepted) {
            console.error('[WELLNESS-PLAN] Health disclaimer not accepted')
            return res.status(403).json({
                success: false,
                message: 'Health disclaimer must be accepted before creating wellness plans',
                action_required: 'accept_health_disclaimer',
            })
        }

        // Check for active plans (limit to 1 active plan per user)
        const activePlan = await WellnessPlan.findOne({
            userId: user._id,
            status: { $in: [enums.WELLNESS_PLAN_STATES.ACTIVE, enums.WELLNESS_PLAN_STATES.DRAFT] },
        })

        if (activePlan) {
            console.warn('[WELLNESS-PLAN] Active plan already exists:', activePlan._id)
            return res.status(400).json({
                success: false,
                message: 'Active wellness plan already exists. Complete or cancel current plan before creating a new one.',
                existing_plan_id: activePlan._id,
                action_required: 'manage_existing_plan',
            })
        }

        // Run comprehensive safety validation
        const safetyCheck = HealthSafetyValidator.validateUserProfileSafety({
            age: healthProfile.age,
            primary_goal: healthProfile.primaryGoal,
            health_conditions: healthProfile.healthConditions || [],
            current_activity_level: healthProfile.currentActivityLevel,
        })

        console.log('[WELLNESS-PLAN] Safety Check Result:')
        console.log('- Is Safe:', safetyCheck.is_safe)
        console.log('- Risk Level:', safetyCheck.risk_level)
        console.log('- Concerns:', safetyCheck.concerns)

        // Check if user requires professional consultation before AI plan
        if (!safetyCheck.is_safe || (user.requiresImmediateConsultation && user.requiresImmediateConsultation())) {
            console.warn('[WELLNESS-PLAN] Professional consultation required - blocking plan creation')
            logHealthRecommendation(user._id, 'wellness_plan_blocked_safety', safetyCheck)

            return res.status(403).json({
                success: false,
                message: 'Professional medical consultation required before creating AI-generated wellness plans',
                safety_concerns: safetyCheck.concerns,
                recommendations: safetyCheck.recommendations,
                professional_consultation_required: true,
                next_steps: [
                    'Schedule consultation with primary care physician',
                    'Discuss fitness and nutrition goals with healthcare provider',
                    'Obtain medical clearance for exercise and diet programs',
                    'Return with professional approval for AI-assisted planning',
                ],
                professional_resources: {
                    find_doctor: 'https://www.ama-assn.org/go/freida',
                    find_dietitian: 'https://www.eatright.org/find-a-nutrition-expert',
                    find_fitness_professional: 'https://www.acsm.org/get-stay-certified/find-a-certified-professional',
                },
            })
        }

        // Apply enum mapping with fallbacks
        const mappedActivityLevel = mapActivityLevelToAgentService(healthProfile.currentActivityLevel)
        const mappedPrimaryGoal = mapPrimaryGoalToAgentService(healthProfile.primaryGoal)

        console.log('[WELLNESS-PLAN] Enum Mapping Results:')
        console.log('- Activity Level:', healthProfile.currentActivityLevel, '->', mappedActivityLevel)
        console.log('- Primary Goal:', healthProfile.primaryGoal, '->', mappedPrimaryGoal)

        // Prepare data for Agent Service with proper enum mapping
        const agentRequestData = {
            user_id: user._id.toString(),
            plan_name: body.planName || `${healthProfile.primaryGoal} Plan`,
            age: healthProfile.age,
            current_activity_level: mappedActivityLevel,
            primary_goal: mappedPrimaryGoal,
            time_availability_minutes: Math.min(
                healthProfile.timeAvailability?.dailyMinutes || 30,
                enums.SAFETY_LIMITS?.MAX_WORKOUT_MINUTES || 120
            ),
            preferred_workout_types: healthProfile.preferredWorkoutTypes || [],
            available_equipment: healthProfile.availableEquipment || ['bodyweight'],
            dietary_restrictions: healthProfile.dietaryRestrictions || [],
            health_conditions: healthProfile.healthConditions || [],
            medical_clearance: healthProfile.medicalClearanceRequired ? false : true,
            health_disclaimer_acknowledged: user.healthDisclaimerAccepted,
            plan_duration_weeks: Math.min(body.planDurationWeeks || 4, 12),
        }

        console.log('[WELLNESS-PLAN] Agent Service Request Data:')
        console.log(JSON.stringify(agentRequestData, null, 2))

        // Call Agent Service to generate wellness plan
        console.log('[WELLNESS-PLAN] Calling Agent Service...')
        const agentResponse = await agentService.createHealthPlan(agentRequestData)

        console.log('[WELLNESS-PLAN] Agent Service Response:')
        console.log('- Success:', agentResponse.success)
        console.log('- Require Consultation:', agentResponse.require_professional_consultation)

        // Check for professional consultation recommendation FIRST
        if (agentResponse.require_professional_consultation || agentResponse.consultation_plan) {
            console.log('[WELLNESS-PLAN] Professional consultation recommended by Agent Service')
            
            logHealthRecommendation(user._id, 'professional_consultation_recommended', {
                reason: 'AI agent recommended professional consultation',
                consultation_plan: agentResponse.consultation_plan,
            })

            return res.status(200).json({
                success: true,
                message: agentResponse.message || 'Professional consultation recommended for your safety',
                consultation_required: true,
                consultation_plan: agentResponse.consultation_plan,
                safety_information: {
                    safety_concerns: agentResponse.consultation_plan?.safety_concerns || [],
                    next_steps: agentResponse.consultation_plan?.next_steps || [],
                    interim_recommendations: agentResponse.consultation_plan?.interim_recommendations || [],
                },
                professional_resources: {
                    find_doctor: 'https://www.ama-assn.org/go/freida',
                    find_dietitian: 'https://www.eatright.org/find-a-nutrition-expert',
                    find_fitness_professional: 'https://www.acsm.org/get-stay-certified/find-a-certified-professional',
                },
                emergency_resources: config.EMERGENCY_CONTACTS || {
                    US_EMERGENCY: '911',
                    US_POISON_CONTROL: '1-800-222-1222',
                    US_CRISIS_TEXT: '741741',
                    US_SUICIDE_PREVENTION: '988',
                },
            })
        }

        // Check for actual failures
        if (!agentResponse.success) {
            console.error('[WELLNESS-PLAN] Agent Service returned failure:', agentResponse.message)
            return res.status(500).json({
                success: false,
                message: agentResponse.message || 'Unable to generate personalized wellness plan at this time',
                error_details: process.env.NODE_ENV === 'development' ? agentResponse.error : undefined,
                recommendation: 'Consider consulting with healthcare professionals for manual plan creation',
                professional_consultation_recommended: true,
            })
        }

        // Extract plan data from Agent Service response (microservice architecture)
        console.log('[WELLNESS-PLAN] Creating wellness plan in database...')
        
        const planData = agentResponse.plan_data || {}
        const workoutPlan = planData.workout_plan || []
        const mealPlan = planData.meal_plan || []
        const safetyInfo = agentResponse.safety_information || {}
        
        console.log('[WELLNESS-PLAN] Extracted from Agent Response:')
        console.log('- Workout days:', workoutPlan.length)
        console.log('- Meal plan days:', mealPlan.length)
        console.log('- Safety notes:', safetyInfo.safety_notes?.length || 0)
        
        const wellnessPlan = new WellnessPlan({
            userId: user._id,
            // REMOVED: agentServicePlanId - not needed in microservice architecture
            planName: planData.plan_name || agentRequestData.plan_name,
            planDescription: `AI-generated ${healthProfile.primaryGoal} plan with safety considerations`,
            status: enums.WELLNESS_PLAN_STATES.ACTIVE,
            planDurationWeeks: planData.plan_duration_weeks || agentRequestData.plan_duration_weeks,
            currentWeek: 1,
            userProfileSnapshot: {
                age: healthProfile.age,
                primaryGoal: healthProfile.primaryGoal,
                currentActivityLevel: healthProfile.currentActivityLevel,
                timeAvailabilityMinutes: healthProfile.timeAvailability?.dailyMinutes,
                riskLevel: user.riskLevel || 'low',
            },
            workoutPlan: workoutPlan,
            mealPlan: mealPlan,
            healthAnalysis: safetyInfo.health_analysis || {},
            safetyNotes: safetyInfo.safety_notes || [],
            disclaimers: safetyInfo.disclaimers || [enums.HEALTH_DISCLAIMER],
            complianceData: {
                healthDisclaimerAccepted: user.healthDisclaimerAccepted,
                disclaimerVersion: user.healthDisclaimerVersion,
                disclaimerAcceptedAt: user.healthDisclaimerAcceptedAt,
                dataRetentionConsent: true,
            },
        })

        await wellnessPlan.save()
        console.log('[WELLNESS-PLAN] Wellness plan saved successfully:', wellnessPlan._id)

        // Log successful plan creation
        logHealthRecommendation(user._id, 'wellness_plan_created', safetyCheck)
        logAuthEvent('wellness_plan_created', user._id, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: {
                planId: wellnessPlan._id,
                primaryGoal: healthProfile.primaryGoal,
                riskLevel: user.riskLevel || 'low',
            },
        })

        console.log('[WELLNESS-PLAN] ===== CREATE WELLNESS PLAN SUCCESS =====')

        return res.status(201).json({
            success: true,
            message: 'Wellness plan created successfully with comprehensive safety measures',
            plan_id: wellnessPlan._id,
            plan_summary: {
                name: wellnessPlan.planName,
                duration_weeks: wellnessPlan.planDurationWeeks,
                primary_goal: healthProfile.primaryGoal,
                workout_days_per_week: workoutPlan.filter((w) => !w.rest_day).length,
                daily_meal_plans: mealPlan.length,
                risk_level: agentResponse.plan_summary?.risk_level || 'low',
            },
            safety_information: {
                safety_notes: wellnessPlan.safetyNotes,
                disclaimers: wellnessPlan.disclaimers,
                professional_consultation_recommended: safetyInfo.professional_consultations_recommended || [],
                monitoring_required: true,
            },
            next_steps: agentResponse.next_steps || [
                'Review all safety information and disclaimers',
                'Start with the monitoring and tracking approach',
                'Follow the gradual progression outlined in your plan',
                'Report any concerning symptoms immediately',
                'Schedule regular check-ins with healthcare professionals',
            ],
            emergency_resources: config.EMERGENCY_CONTACTS || {
                US_EMERGENCY: '911',
                US_POISON_CONTROL: '1-800-222-1222',
                US_CRISIS_TEXT: '741741',
                US_SUICIDE_PREVENTION: '988',
            },
        })

    } catch (error) {
        console.error('[WELLNESS-PLAN] ===== CREATE WELLNESS PLAN ERROR =====')
        console.error('[WELLNESS-PLAN] Error:', error.message)
        console.error('[WELLNESS-PLAN] Stack:', error.stack)

        logAuthEvent('wellness_plan_creation_error', req.user?._id, false, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: {
                error: error.message,
                stack: error.stack,
            },
        })

        return res.status(500).json({
            success: false,
            message: 'Unable to create wellness plan due to a system error. For immediate health guidance, please consult with healthcare professionals.',
            error_details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            professional_consultation_recommended: true,
            emergency_resources: config.EMERGENCY_CONTACTS || {
                US_EMERGENCY: '911',
                US_POISON_CONTROL: '1-800-222-1222',
                US_CRISIS_TEXT: '741741',
                US_SUICIDE_PREVENTION: '988',
            },
        })
    }
}

export const getWellnessPlans = async (req, res) => {
    try {
        const { user } = req

        const plans = await WellnessPlan.find(
            { userId: user._id },
            {
                'planName': 1,
                'status': 1,
                'planDurationWeeks': 1,
                'currentWeek': 1,
                'userProfileSnapshot.primaryGoal': 1,
                'userProfileSnapshot.riskLevel': 1,
                'planStartDate': 1,
                'lastAccessedAt': 1,
                'progressTracking.adherencePercentage': 1,
                'createdAt': 1,
            },
        )
            .sort({ createdAt: -1 })
            .lean()

        // FIXED: Transform _id to id for frontend compatibility
        const plansWithProgress = plans.map((plan) => ({
            ...plan,
            id: plan._id.toString(),  // ✅ Add id field
            _id: undefined,            // ✅ Remove _id to avoid confusion
            completion_percentage: Math.min((plan.currentWeek / plan.planDurationWeeks) * 100, 100),
            is_active: plan.status === enums.WELLNESS_PLAN_STATES.ACTIVE,
            requires_attention: plan.status === enums.WELLNESS_PLAN_STATES.REQUIRES_REVIEW,
        }))

        return res.status(200).json({
            success: true,
            data: plansWithProgress,
            total_plans: plans.length,
            active_plans: plans.filter((p) => p.status === enums.WELLNESS_PLAN_STATES.ACTIVE).length,
            health_reminders: [
                'Follow your wellness plan consistently for best results',
                'Monitor your progress and report any concerning symptoms',
                'Consult healthcare professionals for any health concerns',
                'Stay hydrated and get adequate rest',
            ],
        })
    } catch (error) {
        console.error('[WELLNESS-PLAN] Get plans error:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve wellness plans',
        })
    }
}

export const getWellnessPlanById = async (req, res) => {
    try {
        const { user, params } = req
        const planId = params.planId
        
        // FIXED: Validate ID before querying
        if (!planId || planId === 'undefined' || planId === 'null') {
            console.error('[WELLNESS-PLAN] Invalid plan ID:', planId)
            return res.status(400).json({
                success: false,
                message: 'Invalid plan ID provided',
            })
        }

        console.log('[WELLNESS-PLAN] Fetching plan:', planId)

        const plan = await WellnessPlan.findOne({
            _id: planId,
            userId: user._id,
        }).lean()

        if (!plan) {
            console.log('[WELLNESS-PLAN] Plan not found:', planId)
            return res.status(404).json({
                success: false,
                message: 'Wellness plan not found',
            })
        }

        // Update last accessed time
        await WellnessPlan.updateOne(
            { _id: planId }, 
            { $set: { lastAccessedAt: new Date() } }
        )

        // Calculate current progress
        const completionPercentage = Math.min((plan.currentWeek / plan.planDurationWeeks) * 100, 100)
        const requiresAttention = plan.emergencyFlags?.some((flag) => !flag.resolved && flag.severity === 'high')

        // FIXED: Transform _id to id
        const response = {
            success: true,
            data: {
                ...plan,
                id: plan._id.toString(),  // ✅ Add id field
                _id: undefined,            // ✅ Remove _id
                completion_percentage: completionPercentage,
                requires_attention: requiresAttention,
                days_remaining: Math.max(0, plan.planDurationWeeks * 7 - (plan.currentWeek - 1) * 7),
                safety_status: plan.healthAnalysis?.risk_level || 'low',
            },
            safety_reminders: [
                'Follow the plan as designed and monitor how you feel',
                'Stop any activity that causes pain or discomfort',
                'Report concerning symptoms to healthcare providers immediately',
                'Stay within the recommended intensity and duration limits',
            ],
        }

        // Add urgent warnings if applicable
        if (requiresAttention) {
            response.urgent_attention_required = true
            response.emergency_flags = plan.emergencyFlags.filter((flag) => !flag.resolved)
        }

        return res.status(200).json(response)
    } catch (error) {
        console.error('[WELLNESS-PLAN] Get plan by ID error:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve wellness plan',
        })
    }
}
export const updatePlanProgress = async (req, res) => {
    try {
        const { user, params, body } = req

        const plan = await WellnessPlan.findOne({
            _id: params.planId,
            userId: user._id,
        })

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Wellness plan not found',
            })
        }

        if (plan.status !== enums.WELLNESS_PLAN_STATES.ACTIVE) {
            return res.status(400).json({
                success: false,
                message: `Cannot update progress for ${plan.status} plan`,
                current_status: plan.status,
            })
        }

        // Safety validation for progress update
        const concerningSymptoms =
            body.reportedSymptoms?.filter((symptom) => symptom.severity === 'severe' || symptom.symptom.toLowerCase().includes('pain')) || []

        if (concerningSymptoms.length > 0) {
            // Check for emergency symptoms
            const emergencyCheck = HealthSafetyValidator.detectEmergencySymptoms(concerningSymptoms.map((s) => s.symptom))

            if (emergencyCheck.has_emergency_symptoms) {
                // Create emergency alert and pause plan
                const emergencyAlert = new EmergencyAlert({
                    userId: user._id,
                    wellnessPlanId: plan._id,
                    alertType: enums.EMERGENCY_ALERT_TYPES.SEVERE_PAIN,
                    severity: 'high',
                    description: `Concerning symptoms reported during progress update: ${concerningSymptoms.map((s) => s.symptom).join(', ')}`,
                    symptoms: concerningSymptoms.map((s) => s.symptom),
                    triggerSource: 'progress_tracking',
                    status: 'new',
                })

                await emergencyAlert.save()

                plan.status = enums.WELLNESS_PLAN_STATES.REQUIRES_REVIEW
                plan.pausedAt = new Date()
                plan.addEmergencyFlag('severe_symptoms_reported', 'high', 'User reported concerning symptoms during progress update')

                await plan.save()

                return res.status(200).json({
                    success: true,
                    message: 'Concerning symptoms detected. Your wellness plan has been paused for safety.',
                    plan_paused: true,
                    emergency_alert_created: true,
                    immediate_actions: [
                        'Consult with your healthcare provider immediately',
                        'Do not continue with the current workout or meal plan',
                        'Seek medical attention if symptoms are severe or worsening',
                        'Contact emergency services if experiencing emergency symptoms',
                    ],
                    emergency_resources: config.EMERGENCY_CONTACTS,
                })
            }
        }

        // Create progress tracking entry
        const progressEntry = new ProgressTracking({
            userId: user._id,
            wellnessPlanId: plan._id,
            week: body.currentWeek || plan.currentWeek,
            day: body.currentDay || 1,
            workoutProgress: body.workoutProgress || {},
            mealProgress: body.mealProgress || {},
            healthMetrics: body.healthMetrics || {},
            reportedSymptoms: body.reportedSymptoms || [],
            notes: body.notes || '',
            concerns: body.concerns || '',
        })

        await progressEntry.save()

        // Update plan progress
        const weekUpdate = Math.min(body.currentWeek || plan.currentWeek, plan.planDurationWeeks)
        plan.currentWeek = weekUpdate
        plan.lastAccessedAt = new Date()

        // Add weekly progress summary
        const weeklyProgress = {
            week: weekUpdate,
            workoutsCompleted: body.workoutProgress?.completed ? 1 : 0,
            totalWorkouts: plan.workoutPlan.filter((w) => !w.rest_day).length,
            mealsFollowed: Object.values(body.mealProgress || {}).filter((meal) => meal.followed).length,
            totalMeals: plan.mealPlan.reduce((total, day) => total + day.meals.length, 0) / 7, // Average per day
            energyLevel: body.healthMetrics?.energy_level || null,
            overallSatisfaction: body.overallSatisfaction || null,
            notes: body.notes || '',
            concernsReported: body.reportedSymptoms?.map((s) => s.symptom) || [],
            weekCompletedAt: new Date(),
        }

        // Check if week already exists in progress tracking
        const existingWeekIndex = plan.progressTracking.weeklyProgress.findIndex((wp) => wp.week === weekUpdate)
        if (existingWeekIndex >= 0) {
            plan.progressTracking.weeklyProgress[existingWeekIndex] = weeklyProgress
        } else {
            plan.progressTracking.weeklyProgress.push(weeklyProgress)
        }

        // Update total completion counts
        plan.progressTracking.totalWorkoutsCompleted += weeklyProgress.workoutsCompleted
        plan.progressTracking.totalMealsFollowed += weeklyProgress.mealsFollowed

        // Check if plan is completed
        if (plan.currentWeek >= plan.planDurationWeeks) {
            plan.status = enums.WELLNESS_PLAN_STATES.COMPLETED
            plan.completedAt = new Date()
        }

        await plan.save()

        const response = {
            success: true,
            message: 'Progress updated successfully',
            current_week: plan.currentWeek,
            total_weeks: plan.planDurationWeeks,
            completion_percentage: Math.min((plan.currentWeek / plan.planDurationWeeks) * 100, 100),
            plan_status: plan.status,
        }

        if (plan.status === enums.WELLNESS_PLAN_STATES.COMPLETED) {
            response.plan_completed = true
            response.congratulations_message = 'Congratulations on completing your wellness plan!'
            response.next_steps = [
                'Schedule a consultation with your healthcare provider to review your progress',
                'Consider creating a new plan to continue your wellness journey',
                'Maintain healthy habits developed during this program',
                'Continue monitoring your health and fitness regularly',
            ]
        }

        return res.status(200).json(response)
    } catch (error) {
        console.error('[WELLNESS-PLAN] Update progress error:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to update progress. If experiencing health concerns, please consult healthcare professionals.',
            emergency_resources: config.EMERGENCY_CONTACTS,
        })
    }
}

export const pauseWellnessPlan = async (req, res) => {
    try {
        const { user, params, body } = req

        const plan = await WellnessPlan.findOne({
            _id: params.planId,
            userId: user._id,
        })

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Wellness plan not found',
            })
        }

        if (plan.status !== enums.WELLNESS_PLAN_STATES.ACTIVE) {
            return res.status(400).json({
                success: false,
                message: `Cannot pause ${plan.status} plan`,
            })
        }

        // Check reason for pause and flag health concerns
        const pauseReason = body.reason?.toLowerCase() || ''
        const healthRelatedPause = ['injury', 'illness', 'pain', 'doctor', 'medical', 'hospital', 'surgery'].some((keyword) =>
            pauseReason.includes(keyword),
        )

        plan.status = enums.WELLNESS_PLAN_STATES.PAUSED
        plan.pausedAt = new Date()

        // Add modification history
        plan.modificationHistory.push({
            modifiedBy: 'user_request',
            modificationType: 'safety_modification',
            description: `Plan paused by user: ${body.reason || 'No reason provided'}`,
            reason: body.reason || 'User requested pause',
        })

        if (healthRelatedPause) {
            plan.emergencyFlags.push({
                flag: 'health_related_pause',
                severity: 'moderate',
                description: `Plan paused due to health concern: ${body.reason}`,
                flaggedAt: new Date(),
            })

            // Update user safety flags
            await User.updateOne(
                { _id: user._id },
                {
                    $push: {
                        safetyFlags: {
                            flag: 'wellness_plan_health_pause',
                            severity: 'moderate',
                            description: `Wellness plan paused due to: ${body.reason}`,
                            flaggedAt: new Date(),
                        },
                    },
                },
            )
        }

        await plan.save()

        logAuthEvent('wellness_plan_paused', user._id, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: {
                planId: plan._id,
                reason: body.reason,
                healthRelated: healthRelatedPause,
            },
        })

        const response = {
            success: true,
            message: 'Wellness plan paused successfully',
            plan_status: plan.status,
            paused_at: plan.pausedAt,
            can_resume: true,
        }

        if (healthRelatedPause) {
            response.health_concern_flagged = true
            response.recommendations = [
                'Consult with your healthcare provider about the health concern',
                'Obtain medical clearance before resuming the plan',
                'Focus on recovery and follow professional medical advice',
                'Consider modifying the plan based on professional recommendations',
            ]
            response.professional_resources = {
                find_doctor: 'https://www.ama-assn.org/go/freida',
                urgent_care: 'Contact your healthcare provider or urgent care center',
            }
        } else {
            response.recommendations = [
                'Take the time you need away from the plan',
                'Resume when you feel ready and motivated',
                'Consider adjusting the plan if needed when resuming',
                'Maintain healthy habits even while the plan is paused',
            ]
        }

        return res.status(200).json(response)
    } catch (error) {
        console.error('[WELLNESS-PLAN] Pause plan error:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to pause wellness plan',
        })
    }
}

export const resumeWellnessPlan = async (req, res) => {
    try {
        const { user, params, body } = req

        const plan = await WellnessPlan.findOne({
            _id: params.planId,
            userId: user._id,
        })

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Wellness plan not found',
            })
        }

        if (plan.status !== enums.WELLNESS_PLAN_STATES.PAUSED) {
            return res.status(400).json({
                success: false,
                message: `Cannot resume ${plan.status} plan`,
            })
        }

        // Check if user has addressed any health concerns
        const hadHealthFlags = plan.emergencyFlags.some((flag) => flag.flag === 'health_related_pause' && !flag.resolved)

        if (hadHealthFlags && !body.healthConcernResolved) {
            return res.status(400).json({
                success: false,
                message: 'Please confirm that health concerns have been addressed before resuming',
                health_concern_resolution_required: true,
                recommendations: [
                    'Consult with healthcare provider about resuming exercise',
                    'Ensure any health issues have been properly addressed',
                    'Consider plan modifications based on professional advice',
                ],
            })
        }

        // Check pause duration - if very long, recommend plan review
        const pauseDuration = Date.now() - plan.pausedAt.getTime()
        const longPause = pauseDuration > 30 * 24 * 60 * 60 * 1000 // 30 days

        plan.status = enums.WELLNESS_PLAN_STATES.ACTIVE
        plan.resumedAt = new Date()
        plan.lastAccessedAt = new Date()

        // Resolve health-related flags if user confirmed resolution
        if (hadHealthFlags && body.healthConcernResolved) {
            plan.emergencyFlags.forEach((flag) => {
                if (flag.flag === 'health_related_pause' && !flag.resolved) {
                    flag.resolved = true
                    flag.resolvedAt = new Date()
                    flag.actionTaken = 'User confirmed health concern resolved'
                }
            })
        }

        // Add modification history
        plan.modificationHistory.push({
            modifiedBy: 'user_request',
            modificationType: 'safety_modification',
            description: 'Plan resumed by user',
            reason: body.resumeNotes || 'User requested resume',
        })

        await plan.save()

        logAuthEvent('wellness_plan_resumed', user._id, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: {
                planId: plan._id,
                pauseDuration: Math.round(pauseDuration / (24 * 60 * 60 * 1000)),
                longPause,
            },
        })

        const response = {
            success: true,
            message: 'Wellness plan resumed successfully',
            plan_status: plan.status,
            resumed_at: plan.resumedAt,
            current_week: plan.currentWeek,
            weeks_remaining: plan.planDurationWeeks - plan.currentWeek + 1,
        }

        if (longPause) {
            response.long_pause_detected = true
            response.recommendations = [
                'Consider starting gradually after the extended pause',
                'Monitor your energy levels and adjust intensity as needed',
                'May want to review and update your plan based on any changes',
                'Consult healthcare provider if you have new health considerations',
            ]
        } else {
            response.recommendations = [
                'Resume gradually and listen to your body',
                'Continue monitoring your progress and any symptoms',
                'Maintain the safety practices outlined in your plan',
                'Report any new concerns immediately',
            ]
        }

        response.safety_reminders = [
            'Start at a comfortable intensity and build back up',
            'Stop any activity that causes pain or discomfort',
            'Monitor your response to resuming the program',
            'Contact healthcare providers for any concerns',
        ]

        return res.status(200).json(response)
    } catch (error) {
        console.error('[WELLNESS-PLAN] Resume plan error:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to resume wellness plan',
        })
    }
}
