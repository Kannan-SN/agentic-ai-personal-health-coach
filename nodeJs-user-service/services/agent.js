import config from '@/config'
import { createHMACSignature } from '@/security/security'
import axios from 'axios'

const createAgentSignature = (data, mode = 'body') => {
    const timestamp = Date.now().toString()
    const signature = createHMACSignature(data, timestamp, 'user')
    
    return { signature, timestamp }
}

export const createHealthPlan = async (healthPlanData) => {
    const startTime = Date.now()
    
    try {
        console.log('[AGENT-SERVICE] ===== CALLING AGENT SERVICE =====')
        console.log('[AGENT-SERVICE] URL:', config.AGENT_HOST)
        console.log('[AGENT-SERVICE] Endpoint: /api/internal/create-health-plan')
        console.log('[AGENT-SERVICE] Request Data:', JSON.stringify(healthPlanData, null, 2))
        
        const { signature, timestamp } = createAgentSignature(healthPlanData, 'body')

        const response = await axios({
            method: 'POST',
            url: `${config.AGENT_HOST}/api/internal/create-health-plan`,
            data: healthPlanData,
            headers: {
                'Content-Type': 'application/json',
                'WELLNESS-SIGNATURE': signature,
                'WELLNESS-TIMESTAMP': timestamp,
                'WELLNESS-VALIDATE': 'body',
                'WELLNESS-ORIGIN': 'user',
                'WELLNESS-HEALTH-DATA': 'true'
            },
            // timeout: 90000, // 90 seconds
            validateStatus: (status) => status < 600 // Don't throw on any status < 600
        })

        const duration = Date.now() - startTime
        console.log('[AGENT-SERVICE] Response received in', duration, 'ms')
        console.log('[AGENT-SERVICE] Status:', response.status)
        console.log('[AGENT-SERVICE] Response Data:', JSON.stringify(response.data, null, 2))

        // Handle 202 - Professional consultation required
        if (response.status === 202) {
            console.log('[AGENT-SERVICE] Professional consultation recommended')
            return {
                success: false,
                require_professional_consultation: true,
                consultation_plan: response.data.consultation_plan,
                message: response.data.message || 'Professional consultation recommended',
                ...response.data
            }
        }

        // Handle 201 or 200 - Success
        if (response.status === 200 || response.status === 201) {
            console.log('[AGENT-SERVICE] ===== AGENT SERVICE SUCCESS =====')
            return {
                success: true,
                ...response.data
            }
        }

        // Handle 400-499 errors
        if (response.status >= 400 && response.status < 500) {
            console.error('[AGENT-SERVICE] Client error:', response.status)
            return {
                success: false,
                message: response.data?.message || 'Invalid request to agent service',
                error: response.data,
                status: response.status
            }
        }

        // Handle 500+ errors
        console.error('[AGENT-SERVICE] Server error:', response.status)
        return {
            success: false,
            message: response.data?.message || 'Agent service error',
            error: response.data,
            status: response.status
        }

    } catch (error) {
        const duration = Date.now() - startTime
        console.error('[AGENT-SERVICE] ===== AGENT SERVICE ERROR =====')
        console.error('[AGENT-SERVICE] Failed after', duration, 'ms')
        console.error('[AGENT-SERVICE] Error:', error.message)
        
        if (error.response) {
            console.error('[AGENT-SERVICE] Error Status:', error.response.status)
            console.error('[AGENT-SERVICE] Error Data:', JSON.stringify(error.response.data, null, 2))
            
            // Handle error response gracefully
            return {
                success: false,
                message: error.response.data?.message || 'Agent service error',
                error: error.response.data,
                status: error.response.status,
            }
        } else if (error.request) {
            console.error('[AGENT-SERVICE] No response received from agent service')
            console.error('[AGENT-SERVICE] Is agent service running at:', config.AGENT_HOST)
            
            return {
                success: false,
                message: 'Unable to reach agent service. Please ensure it is running and accessible.',
                error: 'NO_RESPONSE',
                error_type: 'service_unavailable'
            }
        } else {
            console.error('[AGENT-SERVICE] Error setting up request:', error.message)
            console.error('[AGENT-SERVICE] Stack:', error.stack)
            
            return {
                success: false,
                message: 'Failed to communicate with agent service',
                error: error.message,
                error_type: 'request_setup_error'
            }
        }
    }
}

export const updateHealthPlanProgress = async (planId, progressData) => {
    try {
        console.log('[AGENT-SERVICE] Updating health plan progress:', planId)
        const { signature, timestamp } = createAgentSignature(progressData, 'body')

        const response = await axios({
            method: 'POST',
            url: `${config.AGENT_HOST}/api/internal/update-health-plan-progress/${planId}`,
            data: progressData,
            headers: {
                'Content-Type': 'application/json',
                'WELLNESS-SIGNATURE': signature,
                'WELLNESS-TIMESTAMP': timestamp,
                'WELLNESS-VALIDATE': 'body',
                'WELLNESS-ORIGIN': 'user',
                'WELLNESS-HEALTH-DATA': 'true'
            },
            timeout: 30000
        })

        if (response.status === 200) {
            return {
                success: true,
                ...response.data
            }
        } else {
            return { 
                success: false, 
                message: 'Progress update failed',
                status: response.status
            }
        }

    } catch (error) {
        console.error('[AGENT-SERVICE] Progress update error:', error.message)
        return {
            success: false,
            message: 'Unable to sync progress with Agent Service',
            error_type: 'sync_error'
        }
    }
}

export const chatWithHealthPlan = async (planId, chatData) => {
    try {
        const { signature, timestamp } = createAgentSignature(chatData, 'body')

        const response = await axios({
            method: 'POST',
            url: `${config.AGENT_HOST}/api/user/health-plan/${planId}/chat`,
            data: chatData,
            headers: {
                'Content-Type': 'application/json',
                'WELLNESS-SIGNATURE': signature,
                'WELLNESS-TIMESTAMP': timestamp,
                'WELLNESS-VALIDATE': 'body',
                'WELLNESS-ORIGIN': 'user',
                'WELLNESS-HEALTH-DATA': 'true'
            },
            timeout: 30000
        })

        if (response.status === 200) {
            return {
                success: true,
                ...response.data
            }
        } else {
            return { 
                success: false, 
                message: 'Chat request failed'
            }
        }

    } catch (error) {
        console.error('[AGENT-SERVICE] Chat error:', error.message)
        return {
            success: false,
            message: 'Unable to process chat request',
            error_type: 'chat_error'
        }
    }
}

export const validateHealthPlanModifications = async (modificationData) => {
    try {
        const { signature, timestamp } = createAgentSignature(modificationData, 'body')

        const response = await axios({
            method: 'POST',
            url: `${config.AGENT_HOST}/api/internal/validate-health-modifications`,
            data: modificationData,
            headers: {
                'Content-Type': 'application/json',
                'WELLNESS-SIGNATURE': signature,
                'WELLNESS-TIMESTAMP': timestamp,
                'WELLNESS-VALIDATE': 'body',
                'WELLNESS-ORIGIN': 'user',
                'WELLNESS-HEALTH-DATA': 'true'
            },
            timeout: 30000
        })

        if (response.status === 200) {
            return {
                success: true,
                ...response.data
            }
        } else {
            return { 
                success: false, 
                message: 'Validation request failed'
            }
        }

    } catch (error) {
        console.error('[AGENT-SERVICE] Validation error:', error.message)
        return {
            success: false,
            message: 'Unable to validate modifications',
            error_type: 'validation_error'
        }
    }
}

export const sendEmergencyAlert = async (alertData) => {
    try {
        const { signature, timestamp } = createAgentSignature(alertData, 'body')

        const response = await axios({
            method: 'POST',
            url: `${config.AGENT_HOST}/api/internal/emergency-health-alert`,
            data: {
                ...alertData,
                alert_source: 'user_service',
                timestamp: new Date().toISOString()
            },
            headers: {
                'Content-Type': 'application/json',
                'WELLNESS-SIGNATURE': signature,
                'WELLNESS-TIMESTAMP': timestamp,
                'WELLNESS-VALIDATE': 'body',
                'WELLNESS-ORIGIN': 'user',
                'WELLNESS-HEALTH-DATA': 'true'
            },
            timeout: 10000 
        })

        console.log('[AGENT-SERVICE] Emergency alert sent to Agent Service')

        if (response.status === 200) {
            return {
                success: true,
                ...response.data
            }
        } else {
            return { 
                success: false, 
                message: 'Emergency alert failed'
            }
        }

    } catch (error) {
        console.error('[AGENT-SERVICE] Emergency alert error:', error.message)
        return {
            success: false,
            message: 'Emergency alert service unavailable',
            error_type: 'emergency_service_error',
            fallback_required: true
        }
    }
}