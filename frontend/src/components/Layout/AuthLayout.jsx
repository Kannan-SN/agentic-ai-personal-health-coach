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

       

        
        <Card className="w-full">
          <CardContent className="pt-6">
            {children}
          </CardContent>
        </Card>

       
      </div>
    </div>
  )
}

export default AuthLayout