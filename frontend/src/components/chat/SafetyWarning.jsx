import React from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Phone, ArrowLeft } from 'lucide-react'

const SafetyWarning = ({ message, onCancel, onContinue }) => {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <Card className="max-w-md w-full border-red-500">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-red-700">
            <AlertTriangle className="h-6 w-6" />
            Emergency Keywords Detected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your message contains words that may indicate a medical emergency. 
              This AI assistant cannot help with emergency situations.
            </AlertDescription>
          </Alert>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">If this is an emergency:</h4>
            <div className="space-y-2 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span><strong>Call 911</strong> (US Emergency Services)</span>
              </div>
              <div>• Poison Control: 1-800-222-1222</div>
              <div>• Crisis Text Line: Text HOME to 741741</div>
              <div>• Suicide Prevention: 988</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">For non-emergency health concerns:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• Contact your healthcare provider</div>
              <div>• Visit an urgent care center</div>
              <div>• Call your doctor's nurse line</div>
              <div>• Use telehealth services</div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-slate-600">
              Your message: <em>"{message}"</em>
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={onCancel}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={onContinue}
                variant="outline"
                className="flex-1"
              >
                Continue Anyway
              </Button>
            </div>
            
            <p className="text-xs text-slate-500">
              Only continue if this is not an emergency and you understand the limitations of AI assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SafetyWarning