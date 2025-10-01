import http from 'http'
import express from 'express'
import { json, urlencoded } from 'body-parser'
import cookieParser from 'cookie-parser'
import ip from 'ip'
import frameGuard from 'frameguard'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import connectDatabase from '@/database/connection'
import config from '@/config'
import router from '@/routes'

const app = express()

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}))

// MOVE CORS CONFIGURATION BEFORE RATE LIMITERS
console.log('config.FRONTEND_HOST: ', config.FRONTEND_HOST);
console.log('config.AGENT_HOST: ', config.AGENT_HOST);

app.use(
  cors({
    origin: [config.FRONTEND_HOST, config.AGENT_HOST],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Health-Data-Consent',
      'X-Medical-Clearance',
      'Device-Type',   // ✅ added
      'Timezone',      // ✅ added
      'TIMESTAMP',     // ✅ added
    ],
    exposedHeaders: [
      'X-Health-Data-Warning',
      'X-Professional-Consultation-Recommended',
      'X-Safety-Level',
      'X-Emergency-Protocols',
    ],
  })
);


// UPDATE RATE LIMITERS TO SKIP PREFLIGHT REQUESTS
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        type: 'rate_limit_exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS', // Skip preflight requests
})

const healthDataLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 50, 
    message: {
        success: false,
        message: 'Health data request limit exceeded. Please wait before making additional requests.',
        type: 'health_data_rate_limit'
    },
    skip: (req) => req.method === 'OPTIONS', // Skip preflight requests
})

// NOW APPLY RATE LIMITERS AFTER CORS
app.use('/api/user/health', healthDataLimiter)
app.use('/api/user/wellness', healthDataLimiter)
app.use(generalLimiter)

app.use(json({ limit: '16kb' }))
app.use(urlencoded({ extended: true }))
app.use(cookieParser())
app.use(frameGuard({ action: 'deny' }))
app.use(morgan('combined')) 

// Health service audit middleware
app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress
    const userAgent = req.get('User-Agent') || 'unknown'
    
    if (req.url.includes('/health') || req.url.includes('/wellness')) {
        console.log(`[HEALTH-ACCESS] ${new Date().toISOString()} - ${req.method} ${req.url} from ${clientIP}`)
    }
    
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'X-Health-Service': 'wellness-user-v1.0',
        'X-Health-Disclaimer': 'General wellness information only - not medical advice'
    })
    
    next()
})

const serverIP = ip.address()
console.log(`\x1b[95m[WELLNESS-SERVICE] SERVER IP: ${serverIP}`)
console.log(`\x1b[93m[WELLNESS-SERVICE] IMPORTANT: This service provides general wellness information only`)
console.log(`\x1b[93m[WELLNESS-SERVICE] Always consult healthcare professionals for medical advice`)

app.get('/', (req, res) => {
    res.json({ 
        status: 'UP', 
        service: 'Wellness User Service',
        version: '1.0.0',
        message: 'Personal Health & Wellness Coach User Service is running',
        important_notice: 'This service provides general wellness information only and cannot replace professional medical advice.',
        emergency_resources: {
            emergency_services: '911 (US)',
            crisis_text_line: 'Text HOME to 741741',
            suicide_prevention: '988 (US)'
        }
    })
})

app.use('/api', router)

app.use((error, req, res, next) => {
    console.error(`[WELLNESS-ERROR] ${new Date().toISOString()}:`, error)
    
    res.status(500).json({
        success: false,
        message: 'A system error occurred. For immediate health concerns, please consult with healthcare professionals.',
        error_type: 'system_error',
        professional_consultation_recommended: true,
        emergency_resources: {
            emergency_number: '911 (US)',
            crisis_text: 'Text HOME to 741741'
        }
    })
})

const server = http.createServer(app)

connectDatabase((isConnect) => {
    if (isConnect) {
        server.listen(config.PORT, () => {
            console.log(`\x1b[33m[WELLNESS-SERVICE] Server running on port ${config.PORT}...`)
            console.log(`\x1b[38;5;201m[WELLNESS-SERVICE] API HOST - http://${serverIP}:${config.PORT} or ${config.USER_HOST}`)
        })
    }
})