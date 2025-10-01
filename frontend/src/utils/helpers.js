import { EMERGENCY_KEYWORDS, RISK_LEVELS } from './constants'

export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export const calculateBMI = (weight, height, weightUnit = 'lbs', heightUnit = 'inches') => {
  if (!weight || !height) return null
  
  // Convert to metric
  let weightKg = weightUnit === 'lbs' ? weight * 0.453592 : weight
  let heightM = heightUnit === 'inches' ? height * 0.0254 : height / 100
  
  const bmi = weightKg / (heightM * heightM)
  return Math.round(bmi * 10) / 10
}

export const getBMICategory = (bmi) => {
  if (!bmi) return null
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal weight'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export const detectEmergencyKeywords = (text) => {
  if (!text) return false
  const lowerText = text.toLowerCase()
  return EMERGENCY_KEYWORDS.some(keyword => lowerText.includes(keyword))
}

export const getRiskLevelColor = (riskLevel) => {
  switch (riskLevel) {
    case RISK_LEVELS.LOW:
      return 'bg-green-100 text-green-800 border-green-200'
    case RISK_LEVELS.MODERATE:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case RISK_LEVELS.HIGH:
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case RISK_LEVELS.VERY_HIGH:
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getHealthStatusColor = (status) => {
  switch (status) {
    case 'cleared_for_activity':
      return 'text-green-600'
    case 'requires_supervision':
      return 'text-orange-600'
    case 'profile_incomplete':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

export const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const formatActivityLevel = (level) => {
  const levels = {
    sedentary: 'Sedentary (Little to no exercise)',
    light: 'Light (1-3 days/week)',
    moderate: 'Moderate (3-5 days/week)',
    active: 'Active (6-7 days/week)',
    very_active: 'Very Active (2x/day or intense)'
  }
  return levels[level] || level
}

export const formatGoal = (goal) => {
  const goals = {
    weight_loss: 'Weight Loss',
    weight_gain: 'Weight Gain',
    muscle_gain: 'Muscle Gain',
    general_fitness: 'General Fitness',
    endurance: 'Endurance',
    strength: 'Strength'
  }
  return goals[goal] || goal
}

export const getCompletionPercentage = (current, total) => {
  if (!total || total === 0) return 0
  return Math.min(Math.round((current / total) * 100), 100)
}

export const sortByDate = (array, dateField = 'createdAt', ascending = false) => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateField])
    const dateB = new Date(b[dateField])
    return ascending ? dateA - dateB : dateB - dateA
  })
}