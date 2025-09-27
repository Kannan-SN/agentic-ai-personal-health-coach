
import mongoose from 'mongoose'
import * as enums from '@/constants/enum'

const SecuritySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'users',
            index: true
        },
        type: {
            type: String,
            required: true,
            enum: Object.values(enums.SECURITY_TYPES),
            index: true
        },
        mode: {
            type: String,
            required: true,
            enum: Object.values(enums.SECURITY_MODES)
        },
        value: {
            type: String,
            default: '',
            select: false 
        },
        secret: {
            type: String,
            default: '',
            select: false 
        },
        expiresAt: {
            type: Date,
            default: null,
            index: true
        },
        requestAt: {
            type: Date,
            default: null
        },
        requestCount: {
            type: Number,
            default: 0
        },
        tries: {
            type: Number,
            default: 0
        },
        isCompleted: {
            type: Boolean,
            default: false,
            index: true
        },
        
     
        healthDataAccess: {
            type: Boolean,
            default: false
        },
        emergencyAccess: {
            type: Boolean,
            default: false
        },
        ipAddress: {
            type: String,
            default: null
        },
        userAgent: {
            type: String,
            default: null
        },
        failedAttempts: {
            type: Number,
            default: 0
        },
        lockedUntil: {
            type: Date,
            default: null
        }
    },
    { 
        timestamps: true,
        indexes: [
            { userId: 1, type: 1 },
            { expiresAt: 1 },
            { isCompleted: 1 },
            { healthDataAccess: 1 }
        ]
    }
)


SecuritySchema.pre('save', function(next) {
    if (this.healthDataAccess && !this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    }
    next()
})

export const Security = mongoose.model('security', SecuritySchema, 'security')

