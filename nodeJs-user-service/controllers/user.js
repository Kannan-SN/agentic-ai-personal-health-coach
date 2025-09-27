import { User, HealthProfile, EmergencyAlert } from '@/models'
import { HealthSafetyValidator, logHealthRecommendation } from '@/utils/healthSafety'
import { encryptHealthData, decryptHealthData } from '@/security/crypto'
import { logAuthEvent } from '@/security/security'
import * as enums from '@/constants/enum'
import isEmpty from 'is-empty'

export const userInfo = async (req, res) => {
    try {
        const { user } = req

        const userData = {
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            email: user.email,
            isPasswordUpdated: user.isPasswordUpdated,
            healthStatus: user.healthStatus,
            healthDisclaimerAccepted: user.healthDisclaimerAccepted,
            riskLevel: user.riskLevel,
            requiresProfessionalConsultation: user.requiresProfessionalConsultation,
            emergencyContactsCount: user.emergencyContacts?.length || 0,
            medicalClearance: user.medicalClearance,
            lastLoginOn: user.lastLoginOn
        }

        return res.status(200).json({ 
            success: true, 
            data: userData,
            health_reminders: [
                'Keep your health profile updated for accurate recommendations',
                'Consult healthcare professionals for medical concerns',
                'Report any concerning symptoms immediately'
            ]
        })
        
    } catch (error) {
        console.error('[WELLNESS-USER] User info error:', error)
        return res.status(500).json({ 
            success: false, 
            message: 'Unable to retrieve user information' 
        })
    }
}

export const createHealthProfile = async (req, res) => {
    try {
        const { user, body } = req

        // Check if health profile already exists
        const existingProfile = await HealthProfile.findOne({ userId: user._id })
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'Health profile already exists. Use update endpoint to modify.',
                action_required: 'update_profile'
            })
        }

        // Validate age safety
        if (body.age < enums.SAFETY_LIMITS.MIN_AGE || body.age > enums.SAFETY_LIMITS.MAX_AGE) {
            return res.status(400).json({
                success: false,
                message: `Age must be between ${enums.SAFETY_LIMITS.MIN_AGE} and ${enums.SAFETY_LIMITS.MAX_AGE} years`,
                professional_consultation_required: true
            })
        }

        // Run safety validation
        const safetyCheck = HealthSafetyValidator.validateUserProfileSafety({
            age: body.age,
            primary_goal: body.primaryGoal,
            health_conditions: body.healthConditions || [],
            current_activity_level: body.currentActivityLevel
        })

        // Create health profile with encrypted sensitive data
        const healthProfile = new HealthProfile({
            userId: user._id,
            age: body.age,
            dateOfBirth: body.dateOfBirth,
            gender: body.gender,
            height: body.height,
            weight: {
                current: body.weight?.current,
                unit: body.weight?.unit || 'lbs',
                history: []
            },
            currentActivityLevel: body.currentActivityLevel,
            primaryGoal: body.primaryGoal,
            secondaryGoals: body.secondaryGoals || [],
            timeAvailability: {
                dailyMinutes: Math.min(body.timeAvailability?.dailyMinutes || 30, enums.SAFETY_LIMITS.MAX_WORKOUT_MINUTES),
                preferredTimes: body.timeAvailability?.preferredTimes || [],
                availableDays: body.timeAvailability?.availableDays || []
            },
            preferredWorkoutTypes: body.preferredWorkoutTypes || [],
            availableEquipment: body.availableEquipment || ['bodyweight'],
            fitnessExperience: body.fitnessExperience || 'beginner',
            exerciseLimitations: body.exerciseLimitations || [],
            dietaryRestrictions: body.dietaryRestrictions || [],
            foodAllergies: body.foodAllergies || [],
            nutritionPreferences: {
                mealsPerDay: Math.max(2, Math.min(body.nutritionPreferences?.mealsPerDay || 3, 6)),
                snacksPerDay: Math.max(0, Math.min(body.nutritionPreferences?.snacksPerDay || 2, 4)),
                cookingExperience: body.nutritionPreferences?.cookingExperience || 'basic',
                prepTimePreference: Math.min(body.nutritionPreferences?.prepTimePreference || 30, 120)
            },
            healthConditions: body.healthConditions || [],
            medications: body.medications || [],
            injuries: body.injuries || [],
            riskFactors: [],
            medicalClearanceRequired: safetyCheck.risk_level !== enums.RISK_LEVELS.LOW
        })

        // Add risk factors based on safety check
        if (!safetyCheck.is_safe) {
            healthProfile.riskFactors = safetyCheck.concerns.map(concern => ({
                factor: concern,
                severity: safetyCheck.risk_level,
                requiresProfessionalConsultation: true
            }))
        }

        await healthProfile.save()

        // Update user health status and risk level
        const userUpdates = {
            healthStatus: safetyCheck.is_safe ? 
                enums.HEALTH_STATUS.CLEARED_FOR_ACTIVITY : 
                enums.HEALTH_STATUS.REQUIRES_SUPERVISION,
            riskLevel: safetyCheck.risk_level,
            requiresProfessionalConsultation: !safetyCheck.is_safe || safetyCheck.risk_level !== enums.RISK_LEVELS.LOW,
            lastRiskAssessment: new Date()
        }

        // Add safety flags for high-risk users
        if (!safetyCheck.is_safe) {
            await User.updateOne(
                { _id: user._id },
                {
                    $set: userUpdates,
                    $push: {
                        safetyFlags: {
                            $each: safetyCheck.concerns.map(concern => ({
                                flag: concern,
                                severity: 'moderate',
                                description: 'Health profile indicates potential risk factors',
                                flaggedAt: new Date()
                            }))
                        }
                    }
                }
            )
        } else {
            await User.updateOne({ _id: user._id }, { $set: userUpdates })
        }

        // Log health recommendation for audit
        logHealthRecommendation(user._id, 'health_profile_creation', safetyCheck)

        // Prepare response based on safety assessment
        const response = {
            success: true,
            message: 'Health profile created successfully',
            profile_id: healthProfile._id,
            completion_percentage: healthProfile.completionPercentage,
            safety_assessment: {
                risk_level: safetyCheck.risk_level,
                is_safe: safetyCheck.is_safe,
                professional_consultation_required: !safetyCheck.is_safe
            }
        }

        if (!safetyCheck.is_safe) {
            response.safety_concerns = safetyCheck.concerns
            response.recommendations = safetyCheck.recommendations
            response.next_steps = [
                'Schedule consultation with primary care physician',
                'Discuss fitness and nutrition goals with healthcare provider',
                'Obtain medical clearance before starting any exercise program',
                'Consider working with certified professionals'
            ]
            response.professional_resources = {
                find_doctor: 'https://www.ama-assn.org/go/freida',
                find_dietitian: 'https://www.eatright.org/find-a-nutrition-expert',
                find_fitness_professional: 'https://www.acsm.org/get-stay-certified/find-a-certified-professional'
            }
        } else {
            response.next_steps = [
                'Consider professional consultation for optimal results',
                'Review safety guidelines before starting',
                'Monitor your progress and symptoms',
                'Start gradually with any new activities'
            ]
        }

        response.disclaimers = [
            enums.HEALTH_DISCLAIMER,
            'AI recommendations cannot replace professional medical advice',
            'Individual health needs vary significantly'
        ]

        return res.status(201).json(response)

    } catch (error) {
        console.error('[WELLNESS-USER] Health profile creation error:', error)
        
        // Log the error for audit purposes
        logAuthEvent('health_profile_creation_error', req.user._id, false, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { error: error.message }
        })

        return res.status(500).json({
            success: false,
            message: 'Unable to create health profile. Please try again.',
            professional_consultation_recommended: true,
            support_resources: {
                emergency_services: '911 (US)',
                health_support: 'Consult with healthcare professionals for immediate concerns'
            }
        })
    }
}

export const updateHealthProfile = async (req, res) => {
    try {
        const { user, body } = req

        const healthProfile = await HealthProfile.findOne({ userId: user._id })
        if (!healthProfile) {
            return res.status(404).json({
                success: false,
                message: 'Health profile not found. Please create one first.',
                action_required: 'create_profile'
            })
        }

        // Validate updates and run safety checks
        const updatedData = { ...body }
        
        // Re-run safety validation if critical fields changed
        const criticalFields = ['age', 'primaryGoal', 'healthConditions', 'medications', 'injuries']
        const hasCriticalChanges = criticalFields.some(field => 
            body[field] !== undefined && JSON.stringify(body[field]) !== JSON.stringify(healthProfile[field])
        )

        let safetyCheck = { is_safe: true, risk_level: healthProfile.riskLevel || enums.RISK_LEVELS.LOW }
        
        if (hasCriticalChanges) {
            safetyCheck = HealthSafetyValidator.validateUserProfileSafety({
                age: body.age || healthProfile.age,
                primary_goal: body.primaryGoal || healthProfile.primaryGoal,
                health_conditions: body.healthConditions || healthProfile.healthConditions || [],
                current_activity_level: body.currentActivityLevel || healthProfile.currentActivityLevel
            })
        }

        // Update health profile
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] !== undefined) {
                healthProfile[key] = updatedData[key]
            }
        })

        // Update weight history if weight changed
        if (body.weight?.current && body.weight.current !== healthProfile.weight.current) {
            healthProfile.weight.history.push({
                weight: healthProfile.weight.current,
                recordedAt: new Date(),
                source: 'user_input'
            })
            healthProfile.weight.current = body.weight.current
        }

        await healthProfile.save()

        // Update user risk assessment if critical changes
        if (hasCriticalChanges) {
            const userUpdates = {
                riskLevel: safetyCheck.risk_level,
                requiresProfessionalConsultation: !safetyCheck.is_safe,
                lastRiskAssessment: new Date()
            }

            if (!safetyCheck.is_safe && safetyCheck.concerns) {
                userUpdates.healthStatus = enums.HEALTH_STATUS.REQUIRES_SUPERVISION
                
                // Add new safety flags
                await User.updateOne(
                    { _id: user._id },
                    {
                        $set: userUpdates,
                        $push: {
                            safetyFlags: {
                                $each: safetyCheck.concerns.map(concern => ({
                                    flag: concern,
                                    severity: 'moderate',
                                    description: 'Updated health profile indicates potential risk factors',
                                    flaggedAt: new Date()
                                }))
                            }
                        }
                    }
                )
            } else {
                await User.updateOne({ _id: user._id }, { $set: userUpdates })
            }

            // Log health recommendation update
            logHealthRecommendation(user._id, 'health_profile_update', safetyCheck)
        }

        const response = {
            success: true,
            message: 'Health profile updated successfully',
            completion_percentage: healthProfile.completionPercentage,
            last_updated: healthProfile.lastUpdated
        }

        if (hasCriticalChanges) {
            response.safety_reassessment = {
                risk_level: safetyCheck.risk_level,
                is_safe: safetyCheck.is_safe,
                professional_consultation_required: !safetyCheck.is_safe
            }

            if (!safetyCheck.is_safe) {
                response.safety_concerns = safetyCheck.concerns
                response.recommendations = safetyCheck.recommendations
                response.action_required = 'professional_consultation'
            }
        }

        return res.status(200).json(response)

    } catch (error) {
        console.error('[WELLNESS-USER] Health profile update error:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to update health profile. Please try again.'
        })
    }
}

export const getHealthProfile = async (req, res) => {
    try {
        const { user } = req

        const healthProfile = await HealthProfile.findOne({ userId: user._id }).lean()
        if (!healthProfile) {
            return res.status(404).json({
                success: false,
                message: 'Health profile not found. Please create one first.',
                action_required: 'create_health_profile'
            })
        }

        // Remove sensitive data and prepare response
        const sanitizedProfile = {
            ...healthProfile,
            // Remove internal tracking fields
            _id: undefined,
            userId: undefined,
            __v: undefined
        }

        return res.status(200).json({
            success: true,
            data: sanitizedProfile,
            completion_percentage: healthProfile.completionPercentage,
            next_assessment_date: healthProfile.nextRecommendedAssessment,
            health_reminders: [
                'Keep your profile updated for accurate recommendations',
                'Schedule regular check-ups with healthcare providers',
                'Report any new health conditions or medications'
            ]
        })

    } catch (error) {
        console.error('[WELLNESS-USER] Get health profile error:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve health profile'
        })
    }
}

export const acceptHealthDisclaimer = async (req, res) => {
    try {
        const { user, body } = req

        if (user.healthDisclaimerAccepted) {
            return res.status(400).json({
                success: false,
                message: 'Health disclaimer already accepted'
            })
        }

        // Validate disclaimer acceptance
        if (!body.acceptTerms || !body.disclaimerVersion) {
            return res.status(400).json({
                success: false,
                message: 'Terms acceptance and disclaimer version required',
                errors: {
                    acceptTerms: !body.acceptTerms ? 'Must accept health disclaimer terms' : undefined,
                    disclaimerVersion: !body.disclaimerVersion ? 'Disclaimer version required' : undefined
                }
            })
        }

        // Update user with disclaimer acceptance
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    healthDisclaimerAccepted: true,
                    healthDisclaimerVersion: body.disclaimerVersion,
                    healthDisclaimerAcceptedAt: new Date()
                }
            }
        )

        logAuthEvent('health_disclaimer_accepted', user._id, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { 
                disclaimerVersion: body.disclaimerVersion,
                acceptedAt: new Date().toISOString()
            }
        })

        return res.status(200).json({
            success: true,
            message: 'Health disclaimer accepted successfully',
            disclaimer_version: body.disclaimerVersion,
            accepted_at: new Date(),
            next_steps: [
                'Complete your comprehensive health profile',
                'Add emergency contact information',
                'Consider scheduling a consultation with your healthcare provider'
            ],
            important_reminders: [
                'This service provides general wellness information only',
                'Professional medical consultation is recommended for personalized care',
                'Report any concerning symptoms to healthcare providers immediately'
            ]
        })

    } catch (error) {
        console.error('[WELLNESS-USER] Accept health disclaimer error:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to process disclaimer acceptance'
        })
    }
}

export const addEmergencyContact = async (req, res) => {
    try {
        const { user, body } = req

        // Validate emergency contact data
        if (!body.name || !body.relationship || !body.phone) {
            return res.status(400).json({
                success: false,
                message: 'Name, relationship, and phone number are required',
                errors: {
                    name: !body.name ? 'Contact name is required' : undefined,
                    relationship: !body.relationship ? 'Relationship is required' : undefined,
                    phone: !body.phone ? 'Phone number is required' : undefined
                }
            })
        }

        // Check if maximum emergency contacts reached
        const currentUser = await User.findById(user._id).lean()
        if (currentUser.emergencyContacts && currentUser.emergencyContacts.length >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Maximum of 3 emergency contacts allowed',
                action_required: 'remove_existing_contact'
            })
        }

        // Ensure only one primary contact
        const isPrimary = body.isPrimary || (currentUser.emergencyContacts?.length === 0)
        if (isPrimary && currentUser.emergencyContacts?.some(contact => contact.isPrimary)) {
            // Remove primary flag from existing contacts
            await User.updateOne(
                { _id: user._id },
                { $set: { 'emergencyContacts.$[elem].isPrimary': false } },
                { arrayFilters: [{ 'elem.isPrimary': true }] }
            )
        }

        // Add new emergency contact
        const newContact = {
            name: body.name,
            relationship: body.relationship,
            phone: body.phone,
            email: body.email || null,
            isPrimary: isPrimary,
            canNotifyHealthConcerns: body.canNotifyHealthConcerns || false
        }

        await User.updateOne(
            { _id: user._id },
            { $push: { emergencyContacts: newContact } }
        )

        logAuthEvent('emergency_contact_added', user._id, true, {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            additionalData: { 
                contactName: body.name,
                relationship: body.relationship,
                isPrimary: isPrimary
            }
        })

        return res.status(201).json({
            success: true,
            message: 'Emergency contact added successfully',
            contact_added: {
                name: body.name,
                relationship: body.relationship,
                isPrimary: isPrimary
            },
            total_contacts: (currentUser.emergencyContacts?.length || 0) + 1,
            next_steps: currentUser.emergencyContacts?.length === 0 ? [
                'Your first emergency contact has been set as primary',
                'Consider adding a secondary emergency contact',
                'Review privacy settings for health concern notifications'
            ] : [
                'Emergency contact added to your profile',
                'Review and update contact information regularly'
            ]
        })

    } catch (error) {
        console.error('[WELLNESS-USER] Add emergency contact error:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to add emergency contact'
        })
    }
}

export const reportHealthConcern = async (req, res) => {
    try {
        const { user, body } = req

        // Validate concern report
        if (!body.description || !body.severity) {
            return res.status(400).json({
                success: false,
                message: 'Concern description and severity level required',
                errors: {
                    description: !body.description ? 'Please describe your health concern' : undefined,
                    severity: !body.severity ? 'Please indicate severity level' : undefined
                }
            })
        }

        // Check for emergency symptoms
        const emergencyCheck = HealthSafetyValidator.detectEmergencySymptoms([body.description])
        
        if (emergencyCheck.has_emergency_symptoms) {
            // Create emergency alert
            const emergencyAlert = new EmergencyAlert({
                userId: user._id,
                alertType: enums.EMERGENCY_ALERT_TYPES.CHEST_PAIN, // Default, should be determined by symptoms
                severity: 'critical',
                description: body.description,
                symptoms: [body.description],
                triggerSource: 'user_report',
                status: 'new'
            })

            await emergencyAlert.save()

            return res.status(200).json({
                success: true,
                message: 'Emergency concern detected. Please seek immediate medical attention.',
                emergency_detected: true,
                alert_id: emergencyAlert._id,
                immediate_actions: [
                    'Call emergency services (911) if experiencing severe symptoms',
                    'Contact your healthcare provider immediately',
                    'Go to the nearest emergency room if symptoms are severe',
                    'Do not delay seeking professional medical help'
                ],
                emergency_resources: {
                    emergency_services: '911 (US)',
                    poison_control: '1-800-222-1222 (US)',
                    crisis_text_line: 'Text HOME to 741741'
                }
            })
        }

        // For non-emergency concerns, add to user's safety flags
        await User.updateOne(
            { _id: user._id },
            {
                $push: {
                    safetyFlags: {
                        flag: 'user_reported_health_concern',
                        severity: body.severity,
                        description: body.description,
                        flaggedAt: new Date()
                    }
                }
            }
        )

        return res.status(200).json({
            success: true,
            message: 'Health concern reported successfully',
            recommendations: [
                'Consider consulting with your healthcare provider',
                'Monitor symptoms and seek professional help if they worsen',
                'Avoid strenuous activity until cleared by a medical professional',
                'Document any changes in your symptoms'
            ],
            next_steps: [
                'Schedule appointment with healthcare provider if symptoms persist',
                'Contact emergency services if symptoms become severe',
                'Update your health profile with any new information'
            ]
        })

    } catch (error) {
        console.error('[WELLNESS-USER] Report health concern error:', error)
        return res.status(500).json({
            success: false,
            message: 'Unable to process health concern report. Please contact healthcare professionals directly.',
            emergency_resources: {
                emergency_services: '911 (US)',
                health_support: 'Contact your healthcare provider'
            }
        })
    }
}