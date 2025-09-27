export interface User {
  firstName: string
  lastName: string
  email: string
  healthStatus: string
  healthDisclaimerAccepted: boolean
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high'
  requiresProfessionalConsultation: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}