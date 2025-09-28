import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertTriangle, Shield } from 'lucide-react'
import { z } from 'zod'

const createPlanSchema = z.object({
  planName: z.string().min(3, 'Plan name must be at least 3 characters'),
  planDurationWeeks: z.number().min(1).max(12),
  confirmSafety: z.boolean().refine(val => val === true, {
    message: "You must confirm safety understanding"
  }),
})

const CreatePlanForm = ({ onSubmit, loading, error }) => {
  const [confirmSafety, setConfirmSafety] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      planDurationWeeks: 4,
      confirmSafety: false
    }
  })

  const onFormSubmit = (data) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Create Wellness Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-wellness-danger">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="planName">Plan Name</Label>
            <Input
              id="planName"
              placeholder="e.g., My Summer Fitness Journey"
              {...register('planName')}
              className={errors.planName ? 'border-wellness-danger' : ''}
            />
            {errors.planName && (
              <p className="text-sm text-wellness-danger">{errors.planName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="planDurationWeeks">Plan Duration</Label>
            <Select onValueChange={(value) => setValue('planDurationWeeks', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 weeks</SelectItem>
                <SelectItem value="4">4 weeks (Recommended)</SelectItem>
                <SelectItem value="6">6 weeks</SelectItem>
                <SelectItem value="8">8 weeks</SelectItem>
                <SelectItem value="12">12 weeks</SelectItem>
              </SelectContent>
            </Select>
            {errors.planDurationWeeks && (
              <p className="text-sm text-wellness-danger">{errors.planDurationWeeks.message}</p>
            )}
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> Your plan will be created based on your health profile. 
              If you have health conditions or take medications, professional consultation is recommended.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="confirmSafety"
                checked={confirmSafety}
                onCheckedChange={(checked) => {
                  setConfirmSafety(checked)
                  setValue('confirmSafety', checked)
                }}
                className="mt-1"
              />
              <label htmlFor="confirmSafety" className="text-sm text-slate-900 cursor-pointer">
                I understand that this AI-generated plan provides general wellness guidance only 
                and does not replace professional medical advice. I will consult healthcare 
                professionals for any health concerns and stop activities that cause pain or discomfort.
              </label>
            </div>
            {errors.confirmSafety && (
              <p className="text-sm text-wellness-danger">{errors.confirmSafety.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={!confirmSafety || loading}
            className="w-full bg-wellness-primary hover:bg-wellness-primary/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Wellness Plan
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

export default CreatePlanForm