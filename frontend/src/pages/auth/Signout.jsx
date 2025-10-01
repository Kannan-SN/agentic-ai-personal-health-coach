import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Loader2, Phone } from 'lucide-react'
import { signout } from '@/services/user/client'
import { revokeAuth } from '@/store/slices/auth.slice'

const Signout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const performSignout = async () => {
      try {
        // Call signout API
        await signout()
      } catch (error) {
        console.error('Signout API error:', error)
        // Continue with local cleanup even if API fails
      } finally {
        // Clear Redux state
        dispatch(revokeAuth())
        
        // Clear local storage
        localStorage.removeItem('accessToken')
        
        // Redirect after a brief delay to show the message
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    }

    performSignout()
  }, [dispatch, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-4">
        {/* Main signout card */}
        <Card className="w-full">
          <CardContent className="pt-6 text-center">
            <div className="space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-wellness-success" />
              <div>
                <h2 className="text-2xl font-bold text-wellness-text">Signed Out Successfully</h2>
                <p className="text-slate-600 mt-2">
                  Thank you for using Wellness Coach. Your session has been securely ended.
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Redirecting to login...</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health reminder */}
        <Alert className="bg-blue-50 border-blue-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Remember to continue your wellness journey with healthy habits and regular 
            check-ups with healthcare professionals.
          </AlertDescription>
        </Alert>

        {/* Emergency resources */}
        {/* <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 text-center">
            <div className="flex items-center justify-center gap-2 text-red-700 mb-2">
              <Phone className="h-4 w-4" />
              <span className="text-sm font-medium">Emergency Resources Always Available</span>
            </div>
            <div className="text-xs text-red-600 space-y-1">
              <div>Emergency Services: 911 (US)</div>
              <div>Poison Control: 1-800-222-1222 (US)</div>
              <div>Crisis Text Line: Text HOME to 741741</div>
              <div>Suicide Prevention: 988 (US)</div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}

export default Signout