import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle } from 'lucide-react'

const healthProfileSchema = z.object({
  age: z.number().min(13).max(100),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  height: z.object({
    value: z.number().min(30).max(120),
    unit: z.enum(['inches', 'cm']),
  }),
  weight: z.object({
    current: z.number().min(50).max(1000),
    unit: z.enum(['lbs', 'kg']),
  }),
  currentActivityLevel: z.string(),
  primaryGoal: z.string(),
  healthConditions: z.array(z.string()),
  medications: z.array(z.string()),
  timeAvailability: z.object({
    dailyMinutes: z.number().min(10).max(120),
  }),
})

type HealthProfileForm = z.infer<typeof healthProfileSchema>

export function HealthProfileForm() {
  const form = useForm<HealthProfileForm>({
    resolver: zodResolver(healthProfileSchema),
    defaultValues: {
      age: 25,
      gender: 'prefer_not_to_say',
      height: { value: 65, unit: 'inches' },
      weight: { current: 150, unit: 'lbs' },
      currentActivityLevel: 'moderately_active',
      primaryGoal: 'general_wellness',
      healthConditions: [],
      medications: [],
      timeAvailability: { dailyMinutes: 30 },
    },
  })

  const onSubmit = async (data: HealthProfileForm) => {
    console.log('Health profile:', data)
    // API call to create health profile
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Health Profile Setup</CardTitle>
          <CardDescription>
            Help us create a safe, personalized wellness plan for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              This information helps us provide safe recommendations. Always consult healthcare professionals for medical advice.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="currentActivityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Activity Level *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                        <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                        <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                        <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primaryGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Wellness Goal *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general_wellness">General Wellness</SelectItem>
                        <SelectItem value="weight_loss">Gentle Weight Management</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Building</SelectItem>
                        <SelectItem value="endurance">Improve Endurance</SelectItem>
                        <SelectItem value="flexibility">Increase Flexibility</SelectItem>
                        <SelectItem value="stress_reduction">Stress Reduction</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  Professional consultation is recommended for personalized medical advice and to ensure your safety.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full">
                Create Health Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}