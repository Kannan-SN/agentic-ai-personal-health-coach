import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Phone } from 'lucide-react'

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-4">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-wellness-primary">Wellness Coach</h1>
          <p className="text-sm text-slate-600 mt-1">Personal Health & Wellness Assistant</p>
        </div>

        {/* Health Disclaimer Alert */}
        <Alert className="border-wellness-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This service provides general wellness information only and cannot replace professional medical advice.
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Card className="w-full">
          <CardContent className="pt-6">
            {children}
          </CardContent>
        </Card>

        {/* Emergency Resources */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-red-600 space-y-1">
            <div>Emergency: 911 (US)</div>
            <div>Crisis Text: HOME to 741741</div>
            <div>Suicide Prevention: 988 (US)</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AuthLayout