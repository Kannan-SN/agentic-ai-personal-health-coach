import express from 'express'
import authRouter from './auth'
import userRouter from './user'
import internalRouter from './internal'
// import healthRouter from './'

const router = express.Router()

// Authentication routes
router.use('/auth', authRouter)

// User management routes
router.use('/user', userRouter)

// Internal service routes
router.use('/internal', internalRouter)

// Health-specific public routes
// router.use('/health', healthRouter)


router.get('/health-disclaimer', (req, res) => {
    res.json({
        success: true,
        disclaimers: {
            general_health: "This service provides general wellness information only and cannot replace professional medical advice. Always consult with qualified healthcare professionals for medical concerns, diagnosis, or treatment.",
            exercise_safety: "Exercise recommendations are general guidance only. Consult healthcare providers before starting any exercise program, especially if you have health conditions, injuries, or take medications.",
            nutrition_guidance: "Nutrition information is for educational purposes only and not personalized medical nutrition therapy. Consult registered dietitians or healthcare providers for specific dietary needs.",
            ai_limitations: "AI-generated health recommendations are based on general wellness principles and cannot account for individual medical complexities.",
            emergency_situations: "If you experience chest pain, severe shortness of breath, dizziness, fainting, or other emergency symptoms, seek immediate medical attention."
        },
        emergency_resources: {
            emergency_services: "911 (US)",
            poison_control: "1-800-222-1222 (US)",
            crisis_text_line: "Text HOME to 741741",
            suicide_prevention: "988 (US)"
        },
        professional_resources: {
            find_doctor: "https://www.ama-assn.org/go/freida",
            find_dietitian: "https://www.eatright.org/find-a-nutrition-expert",
            find_fitness_professional: "https://www.acsm.org/get-stay-certified/find-a-certified-professional"
        },
        version: "1.0.0",
        last_updated: "2024-01-01"
    })
})

export default router
