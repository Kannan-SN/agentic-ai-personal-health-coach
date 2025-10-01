import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

const ErrorMessage = ({ 
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry = null,
  showEmergencyInfo = false,
  className = ""
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <Alert className="border-wellness-danger">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="font-medium">{title}</div>
            <div className="text-sm">{message}</div>
            
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {showEmergencyInfo && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>For immediate health concerns:</strong><br />
            Emergency: 911 (US) | Crisis Text: HOME to 741741
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default ErrorMessage