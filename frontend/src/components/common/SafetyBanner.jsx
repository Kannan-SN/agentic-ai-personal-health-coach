import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle } from 'lucide-react'

const SafetyBanner = ({ type = 'general', className = '' }) => {
  const bannerTypes = {
    general: {
      icon: <Shield className="h-4 w-4" />,
      className: 'border-wellness-warning bg-amber-50',
      text: 'This service provides general wellness information only and cannot replace professional medical advice.'
    },
    emergency: {
      icon: <AlertTriangle className="h-4 w-4" />,
      className: 'border-wellness-danger bg-red-50',
      text: 'If experiencing emergency symptoms (chest pain, severe shortness of breath, etc.), call 911 immediately.'
    },
    consultation: {
      icon: <Shield className="h-4 w-4" />,
      className: 'border-blue-500 bg-blue-50',
      text: 'Professional consultation recommended before starting new health or fitness programs.'
    }
  }

  const banner = bannerTypes[type] || bannerTypes.general

  return (
    <Alert className={`${banner.className} ${className}`}>
      {banner.icon}
      <AlertDescription className="text-sm font-medium">
        {banner.text}
      </AlertDescription>
    </Alert>
  )
}

export default SafetyBanner