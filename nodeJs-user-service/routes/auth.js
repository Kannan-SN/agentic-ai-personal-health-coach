import express from 'express'
import * as authValidation from '@/validations/auth'
import * as authController from '@/controllers/auth'
import { userAuthenticate } from '@/security/passport'

const router = express.Router()

// Public authentication routes
router.post('/signup', authValidation.signup, authController.signup)
router.get('/email-verify/:verificationToken', authController.verifySignup)
router.post('/signin', authValidation.signin, authController.signin)
router.get('/signout', authController.signout)

// Protected authentication routes
router.post('/create-password', userAuthenticate, authValidation.createPassword, authController.createPassword)
router.get('/refresh-token', userAuthenticate, authController.refreshToken)

export default router
