import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Phone } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ProgressForm {
  currentWeek: number
  energyLevel: number
  painLevel: number
  completedWorkouts: number
  concerningSymptoms: string
  notes: string
}

export function ProgressTracker() {
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false)
  const form = useForm<ProgressForm>()

  const onSubmit = (data: ProgressForm) => {
    // Check for concerning symptoms
    if (data.painLevel >= 7 || data.energyLevel <= 2) {
      setShowEmergencyDialog(true)
      return
    }

    console.log('Progress update:', data)
    // API call to update progress
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress Check-In</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Your safety is our priority. Please report any concerning symptoms or high pain levels immediately.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="energyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Energy Level (1-5 scale)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select energy level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Low Energy</SelectItem>
                        <SelectItem value="2">2 - Low Energy</SelectItem>
                        <SelectItem value="3">3 - Moderate Energy</SelectItem>
                        <SelectItem value="4">4 - High Energy</SelectItem>
                        <SelectItem value="5">5 - Very High Energy</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="painLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pain Level (0-10 scale)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pain level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">0 - No Pain</SelectItem>
                        <SelectItem value="1">1-2 - Mild Pain</SelectItem>
                        <SelectItem value="3">3-4 - Moderate Pain</SelectItem>
                        <SelectItem value="5">5-6 - Moderate to Severe</SelectItem>
                        <SelectItem value="7">7-8 - Severe Pain</SelectItem>
                        <SelectItem value="9">9-10 - Extreme Pain</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="concerningSymptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Any Concerning Symptoms?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Report any unusual symptoms, pain, or concerns..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How are you feeling overall? Any adjustments needed?"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1">
                  Update Progress
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setShowEmergencyDialog(true)}
                  className="flex items-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Emergency Support</DialogTitle>
            <DialogDescription className="space-y-4">
              <p className="font-medium">If you're experiencing severe symptoms, please seek immediate medical attention.</p>
              
              <div className="space-y-2 text-sm">
                <p><strong>Emergency Services:</strong> 911 (US)</p>
                <p><strong>Poison Control:</strong> 1-800-222-1222 (US)</p>
                <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
              </div>

              <p className="text-sm text-muted-foreground">
                For non-emergency concerns, please contact your healthcare provider or pause your wellness plan until you can consult with a professional.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowEmergencyDialog(false)}>
              Close
            </Button>
            <Button variant="destructive" asChild>
              <a href="tel:911">Call 911</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}