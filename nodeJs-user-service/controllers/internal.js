import { WellnessPlan, User, EmergencyAlert } from '@/models'
import { sendEmergencyAlert, sendWellnessPlanNotification } from '@/services/mail'
import { logAuthEvent } from '@/security/security'
import * as enums from '@/constants/enum'

export const syncHealthPlanUpdate = async (req, res) => {
    try {
        const { params, body } = req
        const planId = params.planId

        const plan = await WellnessPlan.findById(planId)
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Wellness plan not found'
            })
        }

        const updatedFields = {}
        if (body.workoutPlan) updatedFields.workoutPlan = body.workoutPlan
        if (body.mealPlan) updatedFields.mealPlan = body.mealPlan
        if (body.safetyNotes) updatedFields.safetyNotes = body.safetyNotes
        if (body.healthAnalysis) updatedFields.healthAnalysis = body.healthAnalysis

        plan.modificationHistory.push({
            modifiedBy: 'agent_recommendation',
            modificationType: body.modificationType || 'plan_adjustment',
            description: body.description || 'Plan updated by Agent Service',
            reason: body.reason || 'AI optimization with safety considerations'
        })

        Object.assign(plan, updatedFields)
        await plan.save()

        console.log(`[WELLNESS-INTERNAL] Plan ${planId} synchronized with Agent Service`)

        return res.status(200).json({
            success: true,
            message: 'Health plan synchronized successfully'
        })

    } catch (error) {
        console.error('[WELLNESS-INTERNAL] Sync error:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to synchronize health plan'
        })
    }
}

export const handleEmergencyAlert = async (req, res) => {
    try {
        const { body } = req

        const emergencyAlert = new EmergencyAlert({
            userId: body.user_id,
            wellnessPlanId: body.plan_id || null,
            alertType: body.alert_type || enums.EMERGENCY_ALERT_TYPES.GENERAL_HEALTH_CONCERN,
            severity: body.severity || 'high',
            description: body.description,
            symptoms: body.symptoms || [],
            triggerSource: 'agent_service',
            status: 'new'
        })

        await emergencyAlert.save()

        const user = await User.findById(body.user_id)
        if (user) {
            await sendEmergencyAlert(user.email, user.firstName, {
                alertType: body.alert_type,
                severity: body.severity,
                description: body.description
            })

            await User.updateOne(
                { _id: user._id },
                {
                    $push: {
                        safetyFlags: {
                            flag: 'agent_service_emergency_alert',
                            severity: body.severity,
                            description: body.description,
                            flaggedAt: new Date()
                        }
                    }
                }
            )

            if (body.plan_id) {
                await WellnessPlan.updateOne(
                    { _id: body.plan_id },
                    {
                        $set: {
                            status: enums.WELLNESS_PLAN_STATES.REQUIRES_REVIEW,
                            pausedAt: new Date()
                        },
                        $push: {
                            emergencyFlags: {
                                flag: 'agent_service_alert',
                                severity: body.severity,
                                description: body.description,
                                flaggedAt: new Date()
                            }
                        }
                    }
                )
            }

            logAuthEvent('emergency_alert_processed', user._id, true, {
                ipAddress: req.ip,
                additionalData: {
                    alertType: body.alert_type,
                    severity: body.severity,
                    agentServiceAlert: true
                }
            })
        }

        console.log(`[WELLNESS-INTERNAL] Emergency alert processed for user ${body.user_id}`)

        return res.status(200).json({
            success: true,
            message: 'Emergency alert processed successfully',
            alert_id: emergencyAlert._id,
            actions_taken: [
                'User notified via email',
                'Safety flags updated',
                body.plan_id ? 'Wellness plan paused for review' : 'No active plan affected'
            ]
        })

    } catch (error) {
        console.error('[WELLNESS-INTERNAL] Emergency alert handling error:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to process emergency alert'
        })
    }
}

export const updatePlanStatus = async (req, res) => {
    try {
        const { params, body } = req
        const planId = params.planId

        const plan = await WellnessPlan.findById(planId)
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Wellness plan not found'
            })
        }

        const oldStatus = plan.status
        plan.status = body.status
        
        if (body.status === enums.WELLNESS_PLAN_STATES.COMPLETED) {
            plan.completedAt = new Date()
        } else if (body.status === enums.WELLNESS_PLAN_STATES.PAUSED) {
            plan.pausedAt = new Date()
        } else if (body.status === enums.WELLNESS_PLAN_STATES.ACTIVE && oldStatus === enums.WELLNESS_PLAN_STATES.PAUSED) {
            plan.resumedAt = new Date()
        }

        await plan.save()

        console.log(`[WELLNESS-INTERNAL] Plan ${planId} status updated: ${oldStatus} → ${body.status}`)

        return res.status(200).json({
            success: true,
            message: 'Plan status updated successfully',
            old_status: oldStatus,
            new_status: body.status
        })

    } catch (error) {
        console.error('[WELLNESS-INTERNAL] Status update error:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to update plan status'
        })
    }
}

export const flagProfessionalConsultationRequired = async (req, res) => {
    try {
        const { params, body } = req
        const userId = params.userId

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const consultationRequirement = {
            type: body.consultation_type || enums.CONSULTATION_TYPES.PRIMARY_CARE,
            priority: body.priority || 'high',
            reason: body.reason || 'Agent Service safety assessment requires professional consultation',
            completed: false,
            dueDate: body.due_date ? new Date(body.due_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }

        await User.updateOne(
            { _id: userId },
            {
                $set: { requiresProfessionalConsultation: true },
                $push: { consultationRequirements: consultationRequirement }
            }
        )

        console.log(`[WELLNESS-INTERNAL] Professional consultation flagged for user ${userId}`)

        return res.status(200).json({
            success: true,
            message: 'Professional consultation requirement added',
            consultation_type: consultationRequirement.type,
            priority: consultationRequirement.priority
        })

    } catch (error) {
        console.error('[WELLNESS-INTERNAL] Consultation flag error:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to flag professional consultation requirement'
        })
    }
}

export const validateHealthMetrics = async (req, res) => {
    try {
        const { body } = req

        const validationResult = {
            is_safe: true,
            concerns: [],
            recommendations: []
        }

        if (body.heart_rate && (body.heart_rate > 220 || body.heart_rate < 40)) {
            validationResult.is_safe = false
            validationResult.concerns.push('Heart rate outside normal range')
        }

        if (body.blood_pressure) {
            const [systolic, diastolic] = body.blood_pressure.split('/').map(Number)
            if (systolic > 180 || diastolic > 120) {
                validationResult.is_safe = false
                validationResult.concerns.push('Blood pressure critically high - seek immediate medical attention')
            }
        }

        if (body.weight_change && Math.abs(body.weight_change) > 10) {
            validationResult.concerns.push('Significant weight change detected - medical evaluation recommended')
        }

        if (!validationResult.is_safe) {
            validationResult.recommendations.push('Immediate medical consultation required')
            validationResult.recommendations.push('Discontinue current fitness activities until cleared by healthcare provider')
        }

        return res.status(200).json({
            success: true,
            validation_result: validationResult,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('[WELLNESS-INTERNAL] Health metrics validation error:', error)
        return res.status(500).json({
            success: false,
            message: 'Failed to validate health metrics'
        })
    }
}

export const agentHealthCheck = async (req, res) => {
    try {
        
        return res.status(200).json({
            success: true,
            service: 'wellness-user-service',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        })
    } catch (error) {
        console.error('[WELLNESS-INTERNAL] Health check error:', error)
        return res.status(500).json({
            success: false,
            message: 'Service health check failed'
        })
    }
}

