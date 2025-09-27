import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Shield, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function CreatePlan() {
  const [showSafetyDialog, setShowSafetyDialog] = useState(false)
  const [planCreating, setPlanCreating] = useState(false)

  const handleCreatePlan = async () => {
    setShowSafetyDialog(true)
  }

  const confirmCreatePlan = async () => {
    setPlanCreating(true)
    // API call to create wellness plan
    console.log('Creating wellness plan...')
    setShowSafetyDialog(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Create Your Wellness Plan</h1>
        <p className="text-muted-foreground">
          AI-powered personalized fitness and nutrition recommendations
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Our AI creates safe, personalized plans based on your health profile. Professional consultation is recommended for optimal results.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-health-primary" />
              Safety First Approach
            </CardTitle>
            <CardDescription>
              Your plan includes comprehensive safety measures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-health-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Conservative exercise progressions</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-health-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Nutritionally balanced meal recommendations</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-health-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Regular safety check-ins and monitoring</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-health-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Professional consultation recommendations</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-health-primary" />
              Professional Support
            </CardTitle>
            <CardDescription>
              We recommend professional guidance alongside AI coaching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-health-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Primary care physician consultation</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-health-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Registered dietitian for nutrition guidance</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-health-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Certified fitness professional oversight</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-health-primary rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm">Mental health support when needed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Ready to Start Your Wellness Journey?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your personalized plan will be created based on your health profile with appropriate safety measures and professional guidance recommendations.
            </p>
            <Button 
              onClick={handleCreatePlan} 
              size="lg" 
              className="bg-health-primary hover:bg-health-success"
              disabled={planCreating}
            >
              {planCreating ? 'Creating Plan...' : 'Create My Wellness Plan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSafetyDialog} onOpenChange={setShowSafetyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              Safety Confirmation
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <p>Before creating your wellness plan, please confirm you understand:</p>
              <ul className="space-y-2 text-sm">
                <li>• This provides general wellness guidance, not medical advice</li>
                <li>• Professional consultation is recommended for optimal safety</li>
                <li>• Stop any activity that causes pain or discomfort</li>
                <li>• Report concerning symptoms to healthcare providers</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowSafetyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreatePlan}>
              I Understand - Create Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}