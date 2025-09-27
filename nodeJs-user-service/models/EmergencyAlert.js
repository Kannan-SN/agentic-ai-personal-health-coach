// models/EmergencyAlert.js
import mongoose from 'mongoose'
import * as enums from '@/constants/enum'

const EmergencyAlertSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'users',
            index: true
        },
        wellnessPlanId: {
            type: mongoose.Types.ObjectId,
            ref: 'wellnessplans',
            default: null
        },
        
        // Alert Details
        alertType: {
            type: String,
            required: true,
            enum: Object.values(enums.EMERGENCY_ALERT_TYPES),
            index: true
        },
        severity: {
            type: String,
            required: true,
            enum: ['low', 'moderate', 'high', 'critical'],
            index: true
        },
        description: {
            type: String,
            required: true,
            maxlength: 1000
        },
        symptoms: [String],
        
        // Context Information
        triggerSource: {
            type: String,
            enum: ['user_report', 'progress_tracking', 'chat_analysis', 'automated_detection'],
            required: true
        },
        contextData: {
            workoutRelated: Boolean,
            mealRelated: Boolean,
            timeOfDay: String,
            activityBeforeSymptoms: String
        },
        
        // Response and Actions
        status: {
            type: String,
            enum: ['new', 'acknowledged', 'in_progress', 'resolved', 'escalated'],
            default: 'new',
            index: true
        },
        responseActions: [{
            action: {
                type: String,
                required: true
            },
            performedBy: {
                type: String,
                enum: ['system', 'user', 'healthcare_provider', 'emergency_contact']
            },
            performedAt: {
                type: Date,
                default: Date.now
            },
            result: String,
            notes: String
        }],
        
        // Emergency Contacts Notified
        contactsNotified: [{
            contactType: {
                type: String,
                enum: ['emergency_contact', 'healthcare_provider', 'emergency_services']
            },
            contactInfo: String,
            notifiedAt: Date,
            method: {
                type: String,
                enum: ['email', 'sms', 'phone_call', 'automated_call']
            },
            successful: Boolean,
            response: String
        }],
        
        // Professional Follow-up
        professionalConsultation: {
            required: {
                type: Boolean,
                default: true
            },
            completed: {
                type: Boolean,
                default: false
            },
            provider: String,
            consultationDate: Date,
            outcome: String,
            recommendations: [String]
        },
        
        // Resolution
        resolvedAt: Date,
        resolution: String,
        followUpRequired: {
            type: Boolean,
            default: false
        },
        followUpDate: Date,
        
        // Audit and Compliance
        auditTrail: [{
            timestamp: {
                type: Date,
                default: Date.now
            },
            action: String,
            performedBy: String,
            ipAddress: String,
            details: String
        }]
    },
    { 
        timestamps: true,
        indexes: [
            { userId: 1 },
            { alertType: 1 },
            { severity: 1 },
            { status: 1 },
            { createdAt: -1 },
            { resolvedAt: 1 }
        ]
    }
)

// Method to escalate alert
EmergencyAlertSchema.methods.escalate = function(reason) {
    this.status = 'escalated'
    this.responseActions.push({
        action: 'alert_escalated',
        performedBy: 'system',
        result: 'escalated_to_emergency_services',
        notes: reason
    })
}

// Method to add audit entry
EmergencyAlertSchema.methods.addAuditEntry = function(action, performedBy, ipAddress, details) {
    this.auditTrail.push({
        action,
        performedBy,
        ipAddress,
        details,
        timestamp: new Date()
    })
}

export const EmergencyAlert = mongoose.model('emergencyalerts', EmergencyAlertSchema, 'emergencyalerts')

