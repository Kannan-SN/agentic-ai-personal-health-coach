import express from 'express'
import { verifySignature } from '@/middleware/verifySignature'
import * as internalController from '@/controllers/internal'
// import * as internalValidations from '@/validation/index'

const router = express.Router()

router.post('/sync-health-plan-update/:planId', 
    verifySignature, 
    // internalValidations.syncHealthPlanUpdate, 
    internalController.syncHealthPlanUpdate
)
router.post('/emergency-health-alert', 
    verifySignature, 
    // internalValidations.emergencyHealthAlert, 
    internalController.handleEmergencyAlert
)
router.post('/update-plan-status/:planId', 
    verifySignature, 
    // internalValidations.updatePlanStatus, 
    internalController.updatePlanStatus
)

router.post('/professional-consultation-required/:userId', 
    verifySignature, 
    // internalValidations.professionalConsultationRequired, 
    internalController.flagProfessionalConsultationRequired
)

router.post('/validate-health-metrics', 
    verifySignature, 
    // internalValidations.validateHealthMetrics, 
    internalController.validateHealthMetrics
)

router.post('/agent-health-check', 
    verifySignature, 
    internalController.agentHealthCheck
)

export default router