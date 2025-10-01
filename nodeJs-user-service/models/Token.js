// models/Token.js
import mongoose from 'mongoose'
import * as enums from '@/constants/enum'

const TokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    sessionType: {
        type: String,
        enum: ['standard', 'health_access', 'emergency'],
        default: 'standard'
    },
    healthDataAccess: {
        type: Boolean,
        default: false
    },
    permissions: [{
        type: String,
        enum: ['read_profile', 'write_profile', 'health_data', 'wellness_plans', 'emergency_access']
    }],
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    isSessionEnded: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true
    },
    lastHealthAccess: {
        type: Date
    },
    healthAccessCount: {
        type: Number,
        default: 0
    },
    riskLevel: {
        type: String,
        enum: Object.values(enums.RISK_LEVELS),
        default: enums.RISK_LEVELS.LOW
    },
    deviceFingerprint: {
        type: String
    },
    location: {
        country: String,
        region: String,
        city: String,
        timezone: String
    }
}, {
    timestamps: true,
    collection: 'tokens'
})

// Indexes for performance
TokenSchema.index({ userId: 1, sessionId: 1 })
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
TokenSchema.index({ sessionType: 1, healthDataAccess: 1 })
TokenSchema.index({ isSessionEnded: 1 })

// Virtual for checking if session is expired
TokenSchema.virtual('isExpired').get(function() {
    return this.expiresAt < new Date()
})

// Method to end session
TokenSchema.methods.endSession = function() {
    this.isSessionEnded = true
    this.updatedAt = new Date()
    return this.save()
}

// Method to extend session
TokenSchema.methods.extendSession = function(additionalTime) {
    this.expiresAt = new Date(this.expiresAt.getTime() + additionalTime)
    this.updatedAt = new Date()
    return this.save()
}

// Method to upgrade to health access
TokenSchema.methods.enableHealthAccess = function() {
    this.healthDataAccess = true
    this.sessionType = 'health_access'
    this.updatedAt = new Date()
    return this.save()
}

// Static method to cleanup expired sessions
TokenSchema.statics.cleanupExpiredSessions = function() {
    return this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { isSessionEnded: true }
        ]
    })
}

// Pre-save middleware for health session validation
TokenSchema.pre('save', function(next) {
    if (this.healthDataAccess && this.sessionType === 'standard') {
        this.sessionType = 'health_access'
    }
    next()
})

// Log health data access
TokenSchema.methods.logHealthAccess = function() {
    this.lastHealthAccess = new Date()
    this.healthAccessCount = (this.healthAccessCount || 0) + 1
    console.log(`[WELLNESS-TOKEN] Health data accessed - User: ${this.userId}, Session: ${this.sessionId}, Count: ${this.healthAccessCount}`)
}

const Token = mongoose.model('Token', TokenSchema)

export default Token