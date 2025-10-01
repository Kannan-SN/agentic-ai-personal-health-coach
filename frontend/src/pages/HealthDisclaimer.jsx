import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertTriangle, Phone, Shield } from 'lucide-react'
import { acceptHealthDisclaimer } from '@/services/user/client'
import { setupAuthentication } from '@/store/slices/auth.slice'
import { healthDisclaimerSchema } from '@/utils/validation'

const HealthDisclaimer = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async () => {
    if (!acceptTerms) {
      setError('You must accept the health disclaimer to continue')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await acceptHealthDisclaimer({
        acceptTerms: true,
        disclaimerVersion: '1.0.0'
      })
      
      if (response.success) {
        dispatch(setupAuthentication({
          healthDisclaimerAccepted: true,
        }))
        navigate('/dashboard')
      } else {
        setError(response.message || 'Failed to accept disclaimer')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-wellness-primary" />
        <h2 className="text-3xl font-bold text-wellness-text mt-4">Health & Safety Disclaimer</h2>
        <p className="text-slate-600 mt-2">
          Please read and accept these important health and safety guidelines
        </p>
      </div>

      {error && (
        <Alert className="border-wellness-danger">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* General Health Disclaimer */}
        <Card className="border-wellness-warning">
          <CardHeader>
            <CardTitle className="text-wellness-danger flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              General Health Information Only
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-medium text-wellness-danger">
              This service provides general wellness information only and cannot replace professional medical advice.
            </p>
            <ul className="space-y-2 text-slate-700">
              <li>• Always consult with qualified healthcare professionals for medical concerns, diagnosis, or treatment</li>
              <li>• Individual health needs vary significantly - AI cannot account for all medical complexities</li>
              <li>• This platform is not intended to diagnose, treat, cure, or prevent any disease</li>
              <li>• Never disregard professional medical advice based on information from this service</li>
            </ul>
          </CardContent>
        </Card>

        {/* Exercise Safety */}
        <Card>
          <CardHeader>
            <CardTitle className="text-wellness-primary">Exercise Safety Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="space-y-2 text-slate-700">
              <li>• Consult healthcare providers before starting any exercise program</li>
              <li>• Stop any activity that causes pain, dizziness, or unusual discomfort</li>
              <li>• Exercise recommendations are general guidance only</li>
              <li>• Professional supervision recommended for high-risk individuals</li>
              <li>• Listen to your body and progress gradually</li>
            </ul>
          </CardContent>
        </Card>

        {/* Nutrition Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-wellness-primary">Nutrition Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="space-y-2 text-slate-700">
              <li>• Nutrition information is for educational purposes only</li>
              <li>• Not personalized medical nutrition therapy</li>
              <li>• Consult registered dietitians for specific dietary needs</li>
              <li>• Consider food allergies and medical dietary restrictions</li>
              <li>• Individual nutritional needs vary significantly</li>
            </ul>
          </CardContent>
        </Card>

        {/* Emergency Situations */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Situations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-medium text-red-700">
              If you experience emergency symptoms, seek immediate medical attention:
            </p>
            <ul className="space-y-2 text-red-600">
              <li>• Chest pain or severe shortness of breath</li>
              <li>• Dizziness, fainting, or loss of consciousness</li>
              <li>• Severe injury or bleeding</li>
              <li>• Any symptoms that feel life-threatening</li>
            </ul>
            {/* <div className="mt-4 p-3 bg-red-100 rounded-lg">
              <p className="font-medium text-red-800">Emergency Resources:</p>
              <div className="mt-2 space-y-1 text-red-700">
                <div>Emergency Services: 911 (US)</div>
                <div>Poison Control: 1-800-222-1222 (US)</div>
                <div>Crisis Text Line: Text HOME to 741741</div>
                <div>Suicide Prevention: 988 (US)</div>
              </div>
            </div> */}
          </CardContent>
        </Card>

        {/* User Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-wellness-primary">Your Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="space-y-2 text-slate-700">
              <li>• Provide accurate health information to the best of your ability</li>
              <li>• Follow safety recommendations and guidelines</li>
              <li>• Report concerning symptoms to healthcare providers immediately</li>
              <li>• Use this service responsibly and not for emergency situations</li>
              <li>• Maintain regular check-ups with healthcare professionals</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Acceptance */}
      <Card className="border-2 border-wellness-primary">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept-terms"
                checked={acceptTerms}
                onCheckedChange={setAcceptTerms}
                className="mt-1"
              />
              <label htmlFor="accept-terms" className="text-sm font-medium text-slate-900 cursor-pointer">
                I have read, understood, and accept all health and safety disclaimers above. 
                I acknowledge that this service provides general wellness information only and 
                cannot replace professional medical advice. I will consult healthcare professionals 
                for medical concerns and emergency situations.
              </label>
            </div>

            <Button 
              onClick={onSubmit}
              disabled={!acceptTerms || loading}
              className="w-full bg-wellness-primary hover:bg-wellness-primary/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept & Continue to Wellness Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-blue-50 border-blue-200">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-sm">
          These disclaimers help ensure your safety and the responsible use of our wellness platform. 
          Your health and wellbeing are our top priority.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default HealthDisclaimer