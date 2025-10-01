# Wellness User Service - Personal Health & Wellness Coach

**🚨 CRITICAL HEALTH DISCLAIMER**

**This service provides general wellness information only and cannot replace professional medical advice.** Always consult with qualified healthcare professionals for medical concerns, diagnosis, or treatment. This AI system has significant limitations and cannot account for individual medical complexities.


## 📋 Project Overview

The **Wellness User Service** is a Node.js microservice that manages user authentication, health profiles, and wellness plan coordination for an AI-powered Personal Health & Wellness Coach platform. The service emphasizes **safety-first design** with mandatory professional consultation recommendations for high-risk users.

### 🛡️ Core Safety Principles

- **Conservative AI Recommendations:** All suggestions err on the side of caution
- **Professional-First Approach:** High-risk users are routed to healthcare providers
- **Emergency Detection:** Automatic screening for concerning symptoms with immediate escalation
- **Health Data Protection:** Enterprise-grade security for personal health information
- **Transparent Limitations:** Clear communication about AI system limitations

## 🏗️ Architecture

```
Frontend (React) ↔ Wellness User Service (Node.js) ↔ Wellness Agent Service (Python/FastAPI)
```

### Technology Stack
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with enhanced health data protection
- **File Storage:** AWS S3 for health documents
- **Security:** HMAC signature verification, encryption, audit logging
- **Email:** Nodemailer with Brevo transport for health notifications

## 📁 Project Structure

```
wellness-user-service/
├── config/
│   └── index.js                 # Environment and service configuration
├── constants/
│   ├── enums.js                # Health-specific enums and safety limits
│   ├── values.js               # Health timeouts and compliance retention
│   └── regex.js                # Enhanced validation patterns
├── controllers/
│   ├── auth.js                 # Authentication with health data protection
│   ├── user.js                 # User and health profile management
│   ├── wellness.js             # Wellness plan management
│   └── internal.js             # Inter-service communication handlers
├── database/
│   └── connection.js           # MongoDB connection with health data config
├── integrations/
│   └── s3.js                   # AWS S3 for health documents
├── middleware/
│   └── verifySignature.js      # HMAC verification for microservices
├── models/
│   ├── User.js                 # Enhanced user model with health fields
│   ├── HealthProfile.js        # Comprehensive health profiling
│   ├── WellnessPlan.js         # AI-generated wellness plans
│   ├── EmergencyAlert.js       # Emergency detection and response
│   ├── ProgressTracking.js     # Safety-monitored progress tracking
│   ├── Security.js             # Enhanced security for health operations
│   └── Token.js                # Session management with health access
├── routes/
│   ├── auth.js                 # Authentication endpoints
│   ├── user.js                 # User management and health features
│   └── internal.js             # Agent service communication
├── security/
│   ├── crypto.js               # Dual-layer encryption for health data
│   ├── security.js             # JWT, passwords, HMAC, risk assessment
│   └── passport.js             # Authentication middleware
├── services/
│   ├── agent.js                # Agent Service integration
│   └── mail.js                 # Health-specific email notifications
├── utils/
│   ├── healthSafety.js         # HealthSafetyValidator class
│   ├── generateSecurityToken.js # Secure token generation
│   └── yupToFormErrors.js      # Enhanced validation error handling
├── validations/
│   ├── auth.js                 # Authentication validation
│   └── user.js                 # Health profile and plan validation
├── private/
│   └── auth_public_key.pem     # RSA public key for JWT verification
├── server.js                   # Express server with health middleware
├── executable.js               # Babel entry point
├── package.json                # Dependencies and scripts
└── local.env                   # Environment configuration
```

## 🔒 Security Features

### Enhanced Authentication
- **Health-Specific Sessions:** Shorter timeouts for health data access (1 hour)
- **Risk-Based Authentication:** Dynamic risk scoring for health data requests
- **Emergency Access Protocols:** Special procedures for critical situations
- **Comprehensive Audit Logging:** Full compliance tracking for health data access

### Health Data Protection
- **Dual-Layer Encryption:** Standard + health-enhanced encryption for sensitive data
- **Professional Consultation Gates:** High-risk users cannot access AI plans without medical clearance
- **Emergency Symptom Detection:** Automatic screening with immediate escalation protocols
- **Safety Flag System:** Continuous monitoring for concerning patterns

### Inter-Service Security
- **HMAC Signature Verification:** Secure communication with Agent Service
- **Timing Attack Protection:** Secure signature comparison
- **Health Data Request Validation:** Enhanced safety checks for health-related operations

## 🏥 Health Safety Features

### Conservative Design Principles
- **Calorie Safety Limits:** Minimum 1200, maximum 3000 calories per day
- **Exercise Duration Limits:** Maximum 120 minutes per session, 8 hours per week
- **Age Restrictions:** Service limited to ages 13-100 with special considerations
- **Pain Level Monitoring:** Automatic medical consultation triggers for pain levels ≥7/10

### Professional Consultation Requirements
- **High-Risk Detection:** Users with concerning health conditions automatically require medical clearance
- **Emergency Escalation:** Immediate professional referral for emergency symptoms
- **Regular Check-ins:** Automated reminders for professional consultations
- **Conservative Defaults:** When in doubt, the system requires professional guidance

### Emergency Response System
- **Keyword Detection:** Automatic screening for emergency symptoms in user input
- **Immediate Escalation:** Emergency alerts trigger professional notification protocols
- **Plan Suspension:** Automatic wellness plan pausing for safety concerns
- **Resource Provision:** Immediate access to emergency contact information

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB 5.0 or higher
- AWS S3 account (for health documents)
- SMTP service (Brevo/SendinBlue recommended)

### Installation

1. **Clone and Setup:**
   ```bash
   git clone <repository-url>
   cd wellness-user-service
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp local.env.template local.env
   # Edit local.env with your configuration
   ```

3. **Generate RSA Keys:**
   ```bash
   # Generate private key
   openssl genrsa -out private_key.pem 2048
   
   # Generate public key
   openssl rsa -in private_key.pem -pubout -out private/auth_public_key.pem
   
   # Base64 encode private key for AUTH_PRIVATE_SIGNER
   base64 -i private_key.pem
   ```

4. **Start Development Server:**
   ```bash
   npm start
   ```

### Required Environment Variables

```env
# Server Configuration
PORT=3000
MONGO_URI="mongodb://localhost:27017/wellness-coach"

# Microservice Hosts
USER_HOST="http://localhost:3000"
AGENT_HOST="http://localhost:8000"
FRONTEND_HOST="http://localhost:3001"

# Security & Encryption
CRYPTO_SECRET="your-crypto-secret-minimum-32-chars"
HEALTH_DATA_ENCRYPTION_KEY="your-health-encryption-key-minimum-32-chars"
AUTH_PRIVATE_SIGNER="base64-encoded-rsa-private-key"

# AWS S3 (Health Documents)
AWS_S3_REGION="us-east-1"
AWS_S3_PUBLIC="your-wellness-bucket"
AWS_S3_ACCESS="your-access-key"
AWS_S3_SECRET="your-secret-key"

# Inter-service Security
HMAC_AGENT_KEY="your-agent-hmac-key-minimum-32-chars"
HMAC_USER_KEY="your-user-hmac-key-minimum-32-chars"

# Email Service
MAIL="health-notifications@your-domain.com"
PASSWORD="your-brevo-api-key"
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account with health disclaimers
- `GET /api/auth/email-verify/:token` - Verify email address
- `POST /api/auth/create-password` - Set secure password with health acknowledgments
- `POST /api/auth/signin` - Sign in with risk assessment
- `GET /api/auth/refresh-token` - Refresh authentication tokens
- `GET /api/auth/signout` - Secure sign out

### User Management
- `GET /api/user/info` - Get user information
- `POST /api/user/health-disclaimer` - Accept health service disclaimers
- `POST /api/user/health-profile` - Create comprehensive health profile
- `GET /api/user/health-profile` - Retrieve health profile (requires health access)
- `PUT /api/user/health-profile` - Update health profile with safety validation
- `POST /api/user/emergency-contact` - Add emergency contact information
- `POST /api/user/health-concern` - Report health concerns with emergency detection

### Wellness Plans
- `POST /api/user/wellness-plan` - Create AI-generated wellness plan (requires health access + safety validation)
- `GET /api/user/wellness-plans` - List user's wellness plans
- `GET /api/user/wellness-plan/:id` - Get specific wellness plan details
- `PUT /api/user/wellness-plan/:id/progress` - Update progress with safety monitoring
- `POST /api/user/wellness-plan/:id/pause` - Pause plan (with health concern detection)
- `POST /api/user/wellness-plan/:id/resume` - Resume plan (with safety confirmation)

### Internal (Agent Service Communication)
- `POST /api/internal/sync-health-plan-update/:id` - Sync plan updates from Agent Service
- `POST /api/internal/emergency-health-alert` - Handle emergency alerts from Agent Service
- `POST /api/internal/update-plan-status/:id` - Update plan status
- `POST /api/internal/professional-consultation-required/:userId` - Flag consultation requirements



**Remember: Your health and safety are our top priorities. When in doubt, consult with qualified healthcare professionals.**