import express from 'express'
import * as userValidation from '@/validation/user'
import * as userController from '@/controllers/user'
import * as wellnessController from '@/controllers/wellness'
import { userAuthenticate, requireHealthAccess } from '@/security/passport'
import { healthEndpointRateLimit } from '@/middleware/verifySignature'

const router = express.Router()

// Basic user information
router.get('/info', userAuthenticate, userController.userInfo)

// Health disclaimer acceptance - no special permissions needed
router.post('/health-disclaimer', userAuthenticate,
    //  userValidation.acceptHealthDisclaimer, 
     userController.acceptHealthDisclaimer)

// Health profile management - basic health features use standard auth + disclaimer
router.post('/health-profile', userAuthenticate,
    //  userValidation.createHealthProfile,
      userController.createHealthProfile)
router.get('/health-profile', userAuthenticate, userController.getHealthProfile)
router.put('/health-profile', userAuthenticate, userValidation.updateHealthProfile, userController.updateHealthProfile)

// Emergency contacts - standard auth
router.post('/emergency-contact', userAuthenticate, userValidation.addEmergencyContact, userController.addEmergencyContact)

// Health concerns reporting - standard auth with rate limiting
router.post('/health-concern', userAuthenticate, healthEndpointRateLimit, userValidation.reportHealthConcern, userController.reportHealthConcern)

// Wellness plan management - use standard auth, validation happens in passport.js
router.post('/wellness-plan', userAuthenticate, wellnessController.createWellnessPlan)
router.get('/wellness-plans', userAuthenticate, wellnessController.getWellnessPlans)
router.get('/wellness-plan/:planId', userAuthenticate, wellnessController.getWellnessPlanById)
router.put('/wellness-plan/:planId/progress', userAuthenticate, userValidation.updatePlanProgress, wellnessController.updatePlanProgress)
router.post('/wellness-plan/:planId/pause', userAuthenticate, userValidation.pauseWellnessPlan, wellnessController.pauseWellnessPlan)
router.post('/wellness-plan/:planId/resume', userAuthenticate, userValidation.resumeWellnessPlan, wellnessController.resumeWellnessPlan)

// Keep requireHealthAccess only for truly sensitive endpoints (currently none)
// Example for future use:
// router.get('/medical-records', userAuthenticate, requireHealthAccess, userController.getMedicalRecords)

export default router