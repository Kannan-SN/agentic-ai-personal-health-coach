import config from '@/config'
import { createHMACSignature } from '@/security/security'
import axios from 'axios'

const createAgentSignature = (data, mode = 'body') => {
    const timestamp = Date.now().toString()
    const signature = createHMACSignature(data, timestamp, 'user')
    
    return { signature, timestamp }
}

export const createHealthPlan = async (healthPlanData) => {
    try {
        const { signature, timestamp } = createAgentSignature(healthPlanData, 'body')

        console.log('[WELLNESS-AGENT] Sending health plan request to Agent Service')
        
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
            timeout: config.REQUEST_TIMEOUT
        })

        console.log('[WELLNESS-AGENT] Received response from Agent Service:', response.status)

        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                ...response.data
            }
        } else {
            console.error('[WELLNESS-AGENT] Agent Service returned non-success status:', response.status)
            return { 
                success: false, 
                message: 'Agent Service request failed',
                status: response.status
            }
        }

    } catch (error) {
        console.error('[WELLNESS-AGENT] Error calling Agent Service:', error.message)
        
        if (error.response) {
            console.error('[WELLNESS-AGENT] Agent Service error response:', error.response.data)
            return {
                success: false,
                message: error.response.data?.message || 'Agent Service error',
                status: error.response.status,
                agent_error: error.response.data
            }
        } else if (error.request) {
            console.error('[WELLNESS-AGENT] No response from Agent Service')
            return {
                success: false,
                message: 'Agent Service unavailable. Please try again later.',
                error_type: 'service_unavailable'
            }
        } else {
            console.error('[WELLNESS-AGENT] Request setup error:', error.message)
            return {
                success: false,
                message: 'Failed to create request to Agent Service',
                error_type: 'request_error'
            }
        }
    }
}

export const updateHealthPlanProgress = async (planId, progressData) => {
    try {
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
            timeout: config.REQUEST_TIMEOUT
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
        console.error('[WELLNESS-AGENT] Progress update error:', error.message)
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
            timeout: config.REQUEST_TIMEOUT
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
        console.error('[WELLNESS-AGENT] Chat error:', error.message)
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
            timeout: config.REQUEST_TIMEOUT
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
        console.error('[WELLNESS-AGENT] Validation error:', error.message)
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

        console.log('[WELLNESS-AGENT] Emergency alert sent to Agent Service')

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
        console.error('[WELLNESS-AGENT] Emergency alert error:', error.message)
        return {
            success: false,
            message: 'Emergency alert service unavailable',
            error_type: 'emergency_service_error',
            fallback_required: true
        }
    }
}