import express from 'express'
import * as userValidation from '@/validation/user'
import * as userController from '@/controllers/user'
import * as wellnessController from '@/controllers/wellness'
import { userAuthenticate, requireHealthAccess } from '@/security/passport'
import { healthEndpointRateLimit } from '@/middleware/verifySignature'

const router = express.Router()

// Basic user information
router.get('/info', userAuthenticate, userController.userInfo)

// Health disclaimer acceptance
router.post('/health-disclaimer', userAuthenticate, userValidation.acceptHealthDisclaimer, userController.acceptHealthDisclaimer)

// Health profile management
router.post('/health-profile', userAuthenticate, userValidation.createHealthProfile, userController.createHealthProfile)
router.get('/health-profile', userAuthenticate, requireHealthAccess, userController.getHealthProfile)
router.put('/health-profile', userAuthenticate, requireHealthAccess, userValidation.updateHealthProfile, userController.updateHealthProfile)

// Emergency contacts
router.post('/emergency-contact', userAuthenticate, userValidation.addEmergencyContact, userController.addEmergencyContact)

// Health concerns reporting
router.post('/health-concern', userAuthenticate, healthEndpointRateLimit, userValidation.reportHealthConcern, userController.reportHealthConcern)

// Wellness plan management
router.post('/wellness-plan', userAuthenticate, requireHealthAccess, userValidation.createWellnessPlan, wellnessController.createWellnessPlan)
router.get('/wellness-plans', userAuthenticate, wellnessController.getWellnessPlans)
router.get('/wellness-plan/:planId', userAuthenticate, wellnessController.getWellnessPlanById)
router.put('/wellness-plan/:planId/progress', userAuthenticate, requireHealthAccess, userValidation.updatePlanProgress, wellnessController.updatePlanProgress)
router.post('/wellness-plan/:planId/pause', userAuthenticate, userValidation.pauseWellnessPlan, wellnessController.pauseWellnessPlan)
router.post('/wellness-plan/:planId/resume', userAuthenticate, userValidation.resumeWellnessPlan, wellnessController.resumeWellnessPlan)

export default router