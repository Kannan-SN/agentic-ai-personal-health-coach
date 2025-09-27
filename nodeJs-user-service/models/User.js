import mongoose from 'mongoose'
import * as enums from '@/constants/enums'

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        middleName: {
            type: String,
            default: '',
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        password: {
            type: String,
            default: '',
            select: false 
        },
        isPasswordUpdated: {
            type: Boolean,
            default: false
        },
        passwordUpdatedOn: {
            type: Date,
            default: null
        },
        lastLoginOn: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            default: enums.USER_STATES.NEW,
            enum: Object.values(enums.USER_STATES),
            index: true
        },
        
        healthStatus: {
            type: String,
            default: enums.HEALTH_STATUS.PROFILE_INCOMPLETE,
            enum: Object.values(enums.HEALTH_STATUS),
            index: true
        },
        
        healthDisclaimerAccepted: {
            type: Boolean,
            default: false
        },
        healthDisclaimerVersion: {
            type: String,
            default: null
        },
        healthDisclaimerAcceptedAt: {
            type: Date,
            default: null
        },
        

        medicalClearance: {
            hasClearance: {
                type: Boolean,
                default: false
            },
            clearanceDate: {
                type: Date,
                default: null
            },
            clearanceProvider: {
                type: String,
                default: null
            },
            clearanceNotes: {
                type: String,
                default: null
            },
            expiresAt: {
                type: Date,
                default: null
            }
        },

        emergencyContacts: [{
            name: {
                type: String,
                required: true
            },
            relationship: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                default: null
            },
            isPrimary: {
                type: Boolean,
                default: false
            },
            canNotifyHealthConcerns: {
                type: Boolean,
                default: false
            }
        }],
        

        healthcareProviders: [{
            type: {
                type: String,
                enum: Object.values(enums.CONSULTATION_TYPES)
            },
            name: {
                type: String,
                required: true
            },
            contactInfo: {
                phone: String,
                email: String,
                address: String
            },
            isPrimary: {
                type: Boolean,
                default: false
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }],
        

        riskLevel: {
            type: String,
            default: enums.RISK_LEVELS.LOW,
            enum: Object.values(enums.RISK_LEVELS),
            index: true
        },
        lastRiskAssessment: {
            type: Date,
            default: null
        },
        
        healthDataAccess: {
            lastAccessed: {
                type: Date,
                default: null
            },
            accessCount: {
                type: Number,
                default: 0
            },
            lastExport: {
                type: Date,
                default: null
            }
        },
        
        
        requiresProfessionalConsultation: {
            type: Boolean,
            default: true 
        },
        consultationRequirements: [{
            type: {
                type: String,
                enum: Object.values(enums.CONSULTATION_TYPES)
            },
            priority: {
                type: String,
                enum: ['low', 'moderate', 'high', 'urgent'],
                default: 'moderate'
            },
            reason: {
                type: String,
                required: true
            },
            completed: {
                type: Boolean,
                default: false
            },
            completedAt: {
                type: Date,
                default: null
            },
            dueDate: {
                type: Date,
                default: null
            }
        }],
        
        safetyFlags: [{
            flag: {
                type: String,
                required: true
            },
            severity: {
                type: String,
                enum: ['low', 'moderate', 'high', 'critical'],
                default: 'moderate'
            },
            description: {
                type: String,
                required: true
            },
            flaggedAt: {
                type: Date,
                default: Date.now
            },
            resolved: {
                type: Boolean,
                default: false
            },
            resolvedAt: {
                type: Date,
                default: null
            }
        }],
        
       
        accountSecurity: {
            lastSecurityReview: {
                type: Date,
                default: null
            },
            healthDataEncrypted: {
                type: Boolean,
                default: true
            },
            auditLogEnabled: {
                type: Boolean,
                default: true
            }
        }
    },
    { 
        timestamps: true,
       
        indexes: [
            { email: 1 },
            { status: 1 },
            { healthStatus: 1 },
            { riskLevel: 1 },
            { 'medicalClearance.hasClearance': 1 },
            { requiresProfessionalConsultation: 1 },
            { createdAt: 1 },
            { lastLoginOn: 1 }
        ]
    }
)

UserSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName}`.trim()
})

UserSchema.methods.haValidMedicalClearance = function() {
    const clearance = this.medicalClearance
    return clearance.hasClearance && 
           clearance.expiresAt && 
           clearance.expiresAt > new Date()
}


UserSchema.methods.requiresImmediateConsultation = function() {
    return this.riskLevel === enums.RISK_LEVELS.VERY_HIGH ||
           this.riskLevel === enums.RISK_LEVELS.HIGH ||
           this.safetyFlags.some(flag => 
               !flag.resolved && 
               (flag.severity === 'critical' || flag.severity === 'high')
           )
}


UserSchema.methods.addSafetyFlag = function(flag, severity, description) {
    this.safetyFlags.push({
        flag,
        severity,
        description,
        flaggedAt: new Date()
    })
    

    if (severity === 'critical') {
        this.riskLevel = enums.RISK_LEVELS.VERY_HIGH
    } else if (severity === 'high' && this.riskLevel === enums.RISK_LEVELS.LOW) {
        this.riskLevel = enums.RISK_LEVELS.HIGH
    }
}


UserSchema.methods.logHealthDataAccess = function() {
    this.healthDataAccess.lastAccessed = new Date()
    this.healthDataAccess.accessCount += 1
}


UserSchema.pre('save', function(next) {
    if (this.healthStatus !== enums.HEALTH_STATUS.PROFILE_INCOMPLETE && 
        !this.healthDisclaimerAccepted) {
        const error = new Error('Health disclaimer must be accepted before proceeding')
        error.name = 'HealthComplianceError'
        return next(error)
    }

    if (this.riskLevel === enums.RISK_LEVELS.VERY_HIGH && 
        this.emergencyContacts.length === 0) {
        const error = new Error('Emergency contact required for high-risk users')
        error.name = 'SafetyRequirementError'
        return next(error)
    }
    
    next()
})

const User = mongoose.model('users', UserSchema, 'users')
export default User