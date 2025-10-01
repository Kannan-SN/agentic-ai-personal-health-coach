import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Bot, AlertTriangle, Shield } from 'lucide-react'

const MessageBubble = ({ message, isUser }) => {
  const hasHealthWarning = message.safety_check_performed && message.contains_medical_advice === false
  const hasEmergencyFlag = message.emergency_detected

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-wellness-primary text-white' 
            : 'bg-slate-200 text-slate-600'
        }`}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <Card className={`${
            isUser 
              ? 'bg-wellness-primary text-white border-wellness-primary' 
              : 'bg-white border-slate-200'
          }`}>
            <CardContent className="p-3">
              <div className="text-sm whitespace-pre-wrap">
                {message.message || message.response}
              </div>
              
              {/* Timestamp */}
              <div className={`text-xs mt-2 ${
                isUser ? 'text-blue-100' : 'text-slate-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>

          {/* Safety Warnings for AI responses */}
          {!isUser && hasEmergencyFlag && (
            <Alert className="border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Emergency detected:</strong> If you're experiencing severe symptoms, 
                please call 911 or seek immediate medical attention.
              </AlertDescription>
            </Alert>
          )}

          {!isUser && hasHealthWarning && (
            <Alert className="border-amber-500 bg-amber-50">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This is general wellness information only - not medical advice. 
                Consult healthcare professionals for medical concerns.
              </AlertDescription>
            </Alert>
          )}

          {/* Professional consultation recommendations */}
          {!isUser && message.professional_consultation_recommended && (
            <Alert className="border-blue-500 bg-blue-50">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Professional consultation recommended for your specific situation.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble