import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Phone } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-wellness-background">
          <div className="w-full max-w-md space-y-4">
            <Card className="border-wellness-danger">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-wellness-danger">
                  <AlertTriangle className="h-5 w-5" />
                  Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  We encountered an unexpected error. For immediate health concerns, 
                  please contact healthcare professionals directly.
                </p>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-wellness-primary"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Application
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => this.setState({ hasError: false })}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* <Alert className="border-red-500 bg-red-50">
              <Phone className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Emergency Resources:</strong><br />
                Emergency: 911 (US) | Crisis: 741741 | Suicide Prevention: 988
              </AlertDescription>
            </Alert> */}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary