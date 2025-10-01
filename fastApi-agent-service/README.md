# Personal Health & Wellness Coach - Agent Service

An AI-powered personal health and wellness coaching service that provides personalized workout plans and meal suggestions with comprehensive safety measures and professional consultation recommendations.


**This AI service provides general wellness information only and cannot replace professional medical advice.** Always consult with qualified healthcare providers, registered dietitians, or certified fitness professionals before starting any new diet or exercise program, especially if you have pre-existing health conditions, are pregnant, or are taking medications.

## Features

- 🏋️ **AI-Generated Workout Plans** - Personalized exercise routines with safety considerations
- 🥗 **Nutritional Meal Planning** - Balanced meal suggestions respecting dietary restrictions
- 🩺 **Health Safety Analysis** - Comprehensive safety screening and professional consultation recommendations
- 📊 **Progress Monitoring** - Safe progress tracking with health concern detection
- 🔒 **HIPAA-Compliant Security** - Enterprise-grade security for health data protection
- 🚨 **Emergency Protocols** - Automatic detection of concerning symptoms with appropriate referrals

## Safety-First Architecture

This service is built with safety as the primary concern:

- **Conservative AI Recommendations** - All AI-generated plans err on the side of caution
- **Professional Consultation Integration** - Automatic recommendations for healthcare provider consultation
- **Symptom Screening** - Continuous monitoring for concerning health indicators
- **Emergency Detection** - Immediate routing to emergency services when appropriate
- **Comprehensive Disclaimers** - Clear communication of AI limitations

## Prerequisites

- Python 3.11+
- MongoDB 4.4+
- Google Gemini API key
- Healthcare professional consultation (recommended before use)

## Installation

### Local Development Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Kannan-SN/agentic-ai-personal-health-coach.git

cd fastApi-agent-service
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
```bash
cp local.env.template local.env
# Edit local.env with your configuration
```

5. **Start MongoDB:**
```bash
# Using Docker
docker run --name wellness-mongo -p 27017:27017 -d mongo:latest

# Or use your local MongoDB installation
mongod
```

6. **Run the service:**
```bash
python -m backend.server
```

### Docker Deployment

1. **Build the image:**
```bash
docker build -t wellness-agent-service .
```

2. **Run with environment file:**
```bash
docker run -d \
  --name wellness-agent \
  --env-file local.env \
  -p 5000:5000 \
  wellness-agent-service
```

## Environment Configuration

Create a `local.env` file with the following variables:

```bash
# Required
MONGO_URI="mongodb://localhost:27017/wellness-agent-service"
GEMINI_API_KEY="your-gemini-api-key"
HMAC_AGENT_KEY="your-secure-hmac-key"
HMAC_USER_KEY="your-secure-hmac-key"

# Service Hosts
USER_HOST="http://localhost:5001"
FRONT_HOST="http://localhost:3000"


## API Documentation

Once running, visit:
- **Swagger UI:** `http://localhost:5000/docs`
- **ReDoc:** `http://localhost:5000/redoc`
- **Health Check:** `http://localhost:5000/health`

## Health & Safety Architecture

### Multi-Agent AI System

1. **Health Analyzer Agent** - Assesses user health profile for safety risks
2. **Workout Generator Agent** - Creates safe, progressive exercise plans
3. **Meal Planner Agent** - Develops balanced nutrition recommendations

### Safety Validation Pipeline

```
User Input → Health Screening → Risk Assessment → AI Generation → Safety Validation → Professional Review Recommendation
```

### Emergency Response Protocol

- **Immediate Symptoms:** Chest pain, breathing difficulty → Emergency services
- **Concerning Patterns:** Rapid weight loss, excessive fatigue → Healthcare provider
- **High-Risk Profiles:** Chronic conditions, age factors → Medical clearance required

## Security Features

- **HMAC Signature Verification** - Secure inter-service communication
- **JWT Authentication** - Secure user session management
- **Health Data Encryption** - All sensitive data encrypted at rest and in transit
- **Audit Logging** - Comprehensive access logging for compliance
- **Rate Limiting** - Protection against abuse and data mining

## Professional Integration

The service is designed to complement, not replace, professional healthcare:

- **Medical Clearance Tracking** - Monitors and requires professional approval for high-risk users
- **Healthcare Provider Integration** - APIs for professional oversight and monitoring
- **Progress Sharing** - Secure data export for professional consultations

## Contributing

We welcome contributions that enhance safety and effectiveness:

1. All health-related features must include comprehensive safety measures
2. Professional medical review required for any clinical recommendations
3. User testing must include healthcare professional oversight
4. Code must pass security and privacy audits




## Disclaimer

This software is provided for informational purposes only and is not intended to diagnose, treat, cure, or prevent any disease or health condition. The creators, contributors, and distributors of this software disclaim any responsibility for health outcomes resulting from its use.

---

**Remember: Your health is invaluable. When in doubt, consult with qualified healthcare professionals.**