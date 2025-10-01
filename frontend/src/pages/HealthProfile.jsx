import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { User, Heart, Shield, Phone, AlertTriangle, CheckCircle } from 'lucide-react'
import BasicInfoForm from '@/components/profile/BasicInfoForm'
import HealthConditionsForm from '@/components/profile/HealthConditionsForm'
import EmergencyContactForm from '@/components/profile/EmergencyContactForm'
import { 
  getHealthProfile, 
  createHealthProfile, 
  updateHealthProfile,
  addEmergencyContact 
} from '@/services/user/client'
import { setHealthProfile } from '@/store/slices/user.slice'

const HealthProfile = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  
  const dispatch = useDispatch()
  const { healthProfile } = useSelector(state => state.user)
  const { requiresProfessionalConsultation, riskLevel } = useSelector(state => state.auth)

  useEffect(() => {
    fetchHealthProfile()
  }, [])

  const fetchHealthProfile = async () => {
    try {
      setLoading(true)
      const response = await getHealthProfile()
      
      if (response.success) {
        dispatch(setHealthProfile(response.data))
      } else if (response.action_required === 'create_health_profile') {
        // Profile doesn't exist yet - this is fine for new users
        setError('')
      } else {
        setError('Failed to load health profile')
      }
    } catch (err) {
      setError('Failed to load health profile')
    } finally {
      setLoading(false)
    }
  }

  const handleBasicInfoSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      let response
      if (healthProfile) {
        response = await updateHealthProfile(data)
      } else {
        response = await createHealthProfile(data)
      }
      
      if (response.success) {
        setSuccess('Basic information updated successfully')
        await fetchHealthProfile()
      } else {
        if (response.professional_consultation_required) {
          setError('Your profile indicates professional consultation is required before proceeding with wellness plans.')
        } else {
          setError(response.message || 'Failed to save profile')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleHealthConditionsSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const response = await updateHealthProfile(data)
      
      if (response.success) {
        setSuccess('Health conditions updated successfully')
        await fetchHealthProfile()
      } else {
        setError(response.message || 'Failed to save health conditions')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEmergencyContactSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const response = await addEmergencyContact(data)
      
      if (response.success) {
        setSuccess('Emergency contact added successfully')
      } else {
        setError(response.message || 'Failed to add emergency contact')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const completionPercentage = healthProfile?.completionPercentage || 0

  if (loading && !healthProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wellness-primary mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading your health profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-wellness-text">Health Profile</h1>
            <p className="text-slate-600 mt-2">
              Manage your health information for personalized and safe wellness recommendations
            </p>
          </div>
          <User className="h-12 w-12 text-wellness-primary" />
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-wellness-danger">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-wellness-success bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {requiresProfessionalConsultation && (
        <Alert className="border-wellness-warning bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Professional consultation recommended based on your health profile. 
            Please consult with healthcare professionals before starting new wellness programs.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-sm text-slate-600">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Risk Level</span>
              <Badge className={
                riskLevel === 'low' ? 'bg-green-50 text-green-700 border-green-200' :
                riskLevel === 'moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                riskLevel === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                'bg-red-50 text-red-700 border-red-200'
              }>
                {riskLevel?.toUpperCase() || 'NOT SET'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Updated</span>
              <span className="text-slate-600">
                {healthProfile?.lastUpdated 
                  ? new Date(healthProfile.lastUpdated).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Professional Review</span>
              <Badge variant="outline" className={
                requiresProfessionalConsultation 
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }>
                {requiresProfessionalConsultation ? 'Required' : 'Optional'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Health Conditions
          </TabsTrigger>
          {/* <TabsTrigger value="emergency" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Emergency Contacts
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <BasicInfoForm
            initialData={healthProfile}
            onSubmit={handleBasicInfoSubmit}
            loading={loading}
            error={error}
          />
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <HealthConditionsForm
            initialData={healthProfile}
            onSubmit={handleHealthConditionsSubmit}
            loading={loading}
            error={error}
          />
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <EmergencyContactForm
            onSubmit={handleEmergencyContactSubmit}
            loading={loading}
            error={error}
          />
        </TabsContent>
      </Tabs>

      {/* Important Health Notice */}
      <Card className="border-wellness-danger">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-wellness-danger">
            <AlertTriangle className="h-5 w-5" />
            Important Health Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ul className="space-y-1 text-slate-700">
            <li>• Keep your health profile updated for accurate recommendations</li>
            <li>• This information helps ensure safe, personalized wellness plans</li>
            <li>• Always consult healthcare professionals for medical concerns</li>
            <li>• Report any new health conditions or medication changes immediately</li>
            <li>• Your health data is encrypted and securely stored</li>
          </ul>
          
          {/* <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
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
    </div>
  )
}

export default HealthProfile