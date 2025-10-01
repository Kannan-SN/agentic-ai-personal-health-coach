import * as yup from 'yup'
import * as regex from '@/constants/regex'
import yupToFormError from '@/utils/yupToFormErrors'

const passwordSchema = yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must not exceed 32 characters')
    .matches(regex.PASSWORD, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .test('no-health-keywords', 'Password should not contain health-related terms for security', value => {
        if (!value) return true
        const healthKeywords = ['health', 'wellness', 'medical', 'doctor', 'patient', 'fitness']
        return !healthKeywords.some(keyword => value.toLowerCase().includes(keyword))
    })

const emailSchema = yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .matches(regex.EMAIL, 'Please enter a valid email format')
    .lowercase()
    .trim()

const nameSchema = yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim()

export const signup = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            firstName: nameSchema,
            lastName: nameSchema,
            middleName: yup.string()
                .max(50, 'Middle name must not exceed 50 characters')
                .matches(/^[a-zA-Z\s\-']*$/, 'Middle name can only contain letters, spaces, hyphens, and apostrophes')
                .trim(),
            email: emailSchema,
            password: passwordSchema,
            confirmPassword: yup.string()
                .required('Password confirmation is required')
                .oneOf([yup.ref('password')], 'Passwords must match'),
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Please correct the highlighted errors to continue with account creation',
            errors: formErrors,
            health_notice: 'This wellness service requires accurate information to provide safe recommendations'
        })
    }
}

export const signin = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            email: emailSchema,
            password: yup.string()
                .required('Password is required')
                .min(1, 'Password cannot be empty')
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Please provide valid signin credentials',
            errors: formErrors
        })
    }
}

// Keep this for any remaining password reset functionality
export const createPassword = async (req, res, next) => {
    try {
        const schema = yup.object().shape({
            password: passwordSchema,
            confirmPassword: yup.string()
                .required('Password confirmation is required')
                .oneOf([yup.ref('password')], 'Passwords must match'),
        })

        await schema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const formErrors = yupToFormError(error)
        return res.status(400).json({
            success: false,
            message: 'Please create a secure password and acknowledge health disclaimers',
            errors: formErrors,
            security_notice: 'Strong passwords help protect your personal health information'
        })
    }
}