const TokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'users',
            index: true
        },
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true
        },
        isSessionEnded: {
            type: Boolean,
            default: false,
            index: true
        },
    
        healthDataAccess: {
            type: Boolean,
            default: false
        },
        lastHealthAccess: {
            type: Date,
            default: null
        },
        healthAccessCount: {
            type: Number,
            default: 0
        },
        
        ipAddress: {
            type: String,
            required: true
        },
        userAgent: {
            type: String,
            required: true
        },
        deviceFingerprint: {
            type: String,
            default: null
        },
        
     
        location: {
            country: String,
            region: String,
            city: String
        },

        sessionType: {
            type: String,
            enum: ['standard', 'health_access', 'emergency_access'],
            default: 'standard'
        },
        permissions: [{
            type: String,
            enum: ['read_health', 'write_health', 'emergency_access', 'plan_management']
        }],
        

        auditLog: [{
            action: String,
            timestamp: {
                type: Date,
                default: Date.now
            },
            resource: String,
            result: String
        }]
    },
    { 
        timestamps: true,
        indexes: [
            { userId: 1 },
            { sessionId: 1 },
            { expiresAt: 1 },
            { isSessionEnded: 1 },
            { healthDataAccess: 1 },
            { sessionType: 1 }
        ]
    }
)


TokenSchema.methods.logHealthAccess = function(action, resource) {
    this.lastHealthAccess = new Date()
    this.healthAccessCount += 1
    this.auditLog.push({
        action,
        resource,
        result: 'success',
        timestamp: new Date()
    })
}


TokenSchema.methods.isValidForHealthData = function() {
    return !this.isSessionEnded && 
           this.expiresAt > new Date() && 
           this.healthDataAccess
}

export const Token = mongoose.model('token', TokenSchema, 'token')