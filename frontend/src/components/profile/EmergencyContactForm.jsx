import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Phone, AlertTriangle } from 'lucide-react'
import { z } from 'zod'

const emergencyContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  isPrimary: z.boolean().optional(),
  canNotifyHealthConcerns: z.boolean().optional(),
})

const relationships = [
  'Spouse/Partner', 'Parent', 'Child', 'Sibling', 'Friend',
  'Neighbor', 'Coworker', 'Other Family Member', 'Healthcare Provider'
]

const EmergencyContactForm = ({ onSubmit, loading, error }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      isPrimary: false,
      canNotifyHealthConcerns: false,
    }
  })

  const isPrimary = watch('isPrimary')
  const canNotifyHealthConcerns = watch('canNotifyHealthConcerns')

  const onFormSubmit = (data) => {
    onSubmit(data)
    reset() // Clear form after submission
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Add Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            {error && (
              <Alert className="border-wellness-danger">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  {...register('name')}
                  className={errors.name ? 'border-wellness-danger' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-wellness-danger">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Select onValueChange={(value) => setValue('relationship', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map(relationship => (
                      <SelectItem key={relationship} value={relationship}>
                        {relationship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.relationship && (
                  <p className="text-sm text-wellness-danger">{errors.relationship.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  {...register('phone')}
                  className={errors.phone ? 'border-wellness-danger' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-wellness-danger">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-wellness-danger' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-wellness-danger">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="isPrimary"
                  checked={isPrimary}
                  onCheckedChange={(checked) => setValue('isPrimary', checked)}
                />
                <label htmlFor="isPrimary" className="text-sm cursor-pointer">
                  Set as primary emergency contact
                </label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="canNotifyHealthConcerns"
                  checked={canNotifyHealthConcerns}
                  onCheckedChange={(checked) => setValue('canNotifyHealthConcerns', checked)}
                  className="mt-1"
                />
                <label htmlFor="canNotifyHealthConcerns" className="text-sm cursor-pointer">
                  Allow notifications about health concerns detected by the wellness system
                  <p className="text-xs text-slate-600 mt-1">
                    This contact may be notified if our system detects potential health risks
                  </p>
                </label>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Phone className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Emergency contacts will be notified in case of health emergencies or safety concerns 
                detected by our wellness monitoring system. We recommend adding at least one contact 
                who can reach you quickly.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-wellness-primary hover:bg-wellness-primary/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Emergency Contact
            </Button>
          </form>
        </CardContent>
      </Card>

      <Alert className="border-wellness-warning bg-amber-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy Notice:</strong> Emergency contact information is encrypted and only used 
          for safety purposes. Contacts will only be notified in case of genuine health emergencies 
          or significant safety concerns detected by our monitoring systems.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default EmergencyContactForm