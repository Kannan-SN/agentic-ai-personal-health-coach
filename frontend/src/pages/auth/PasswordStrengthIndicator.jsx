import React from 'react'

const PasswordStrengthIndicator = ({ password }) => {
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      noHealthTerms: !['health', 'wellness', 'medical', 'doctor', 'patient', 'fitness']
        .some(term => password.toLowerCase().includes(term))
    }
    
    score = Object.values(checks).filter(Boolean).length
    
    if (score < 3) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score < 5) return { score, label: 'Medium', color: 'bg-yellow-500' }
    if (score < 6) return { score, label: 'Strong', color: 'bg-green-500' }
    return { score, label: 'Very Strong', color: 'bg-green-600' }
  }

  const strength = getPasswordStrength(password)
  const widthPercentage = (strength.score / 6) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span>Password Strength</span>
        <span className={`font-medium ${
          strength.score < 3 ? 'text-red-600' :
          strength.score < 5 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {strength.label}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${widthPercentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-600">
        <div className="space-y-1">
          <div className={password?.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
            ✓ At least 8 characters
          </div>
          <div className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            ✓ One uppercase letter
          </div>
          <div className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            ✓ One lowercase letter
          </div>
          <div className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            ✓ One number
          </div>
          <div className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
            ✓ One special character
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasswordStrengthIndicator