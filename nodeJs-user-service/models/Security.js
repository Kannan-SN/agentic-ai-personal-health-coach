// models/Security.js
import mongoose from 'mongoose'
import * as enums from '@/constants/enum'

const SecuritySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: Object.values(enums.SECURITY_TYPES),
        required: true
    },
    mode: {
        type: String,
        enum: Object.values(enums.SECURITY_MODES),
        required: true
    },
    value: {
        type: String,
        required: true,
        index: true
    },
    secret: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },
    attempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 3
    },
    healthDataAccess: {
        type: Boolean,
        default: false
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    location: {
        country: String,
        region: String,
        city: String
    },
    riskLevel: {
        type: String,
        enum: Object.values(enums.RISK_LEVELS),
        default: enums.RISK_LEVELS.LOW
    },
    metadata: {
        deviceFingerprint: String,
        referrer: String,
        emergencyContact: Boolean,
        medicalClearance: Boolean
    }
}, {
    timestamps: true,
    collection: 'security_operations'
})

// Indexes for performance and security
SecuritySchema.index({ userId: 1, type: 1 })
SecuritySchema.index({ value: 1, type: 1 })
SecuritySchema.index({ expiresAt: 1 })
SecuritySchema.index({ isCompleted: 1 })
SecuritySchema.index({ createdAt: 1 })

// Virtual for checking if operation is expired
SecuritySchema.virtual('isExpired').get(function() {
    return this.expiresAt < new Date()
})

// Virtual for checking if attempts exceeded
SecuritySchema.virtual('isLocked').get(function() {
    return this.attempts >= this.maxAttempts
})

// Method to increment attempts
SecuritySchema.methods.incrementAttempts = function() {
    this.attempts += 1
    
    if (this.attempts >= this.maxAttempts) {
        console.warn(`[WELLNESS-SECURITY] Max attempts reached for ${this.type} operation - User: ${this.userId}`)
    }
    
    return this.save()
}

// Method to complete operation
SecuritySchema.methods.complete = function(metadata = {}) {
    this.isCompleted = true
    this.completedAt = new Date()
    
    if (Object.keys(metadata).length > 0) {
        this.metadata = { ...this.metadata, ...metadata }
    }
    
    console.log(`[WELLNESS-SECURITY] Security operation completed: ${this.type} for user ${this.userId}`)
    return this.save()
}

// Method to check if operation is valid for completion
SecuritySchema.methods.canComplete = function() {
    if (this.isExpired) {
        return { valid: false, reason: 'Operation has expired' }
    }
    
    if (this.isCompleted) {
        return { valid: false, reason: 'Operation already completed' }
    }
    
    if (this.isLocked) {
        return { valid: false, reason: 'Too many attempts, operation locked' }
    }
    
    return { valid: true }
}

// Static method to cleanup expired operations
SecuritySchema.statics.cleanupExpired = function() {
    return this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { 
                isCompleted: true,
                completedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days old
            }
        ]
    })
}

// Static method to find active operation
SecuritySchema.statics.findActiveOperation = function(userId, type) {
    return this.findOne({
        userId,
        type,
        isCompleted: false,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: this.maxAttempts || 3 }
    })
}

// Pre-save middleware for health-related operations
SecuritySchema.pre('save', function(next) {
    // Set higher security for health data operations
    if ([
        enums.SECURITY_TYPES.HEALTH_DATA_ACCESS,
        enums.SECURITY_TYPES.EMERGENCY_CONTACT_VERIFICATION
    ].includes(this.type)) {
        this.healthDataAccess = true
        this.maxAttempts = 2 // Stricter for health data
    }
    
    next()
})

// Post-save middleware for logging
SecuritySchema.post('save', function(doc) {
    if (doc.isCompleted && doc.type === enums.SECURITY_TYPES.HEALTH_DATA_ACCESS) {
        console.log(`[WELLNESS-SECURITY-AUDIT] Health data access granted - User: ${doc.userId}, IP: ${doc.ipAddress}`)
    }
})

const Security = mongoose.model('Security', SecuritySchema)

export default Security