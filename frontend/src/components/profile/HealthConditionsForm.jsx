import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Heart, AlertTriangle, Pill } from 'lucide-react'

const commonConditions = [
  'Diabetes', 'High Blood Pressure', 'Heart Disease', 'Asthma', 
  'Arthritis', 'Back Problems', 'Anxiety', 'Depression',
  'High Cholesterol', 'Thyroid Issues', 'Sleep Apnea', 'Allergies'
]

const commonMedications = [
  'Blood Pressure Medication', 'Diabetes Medication', 'Heart Medication',
  'Blood Thinners', 'Cholesterol Medication', 'Thyroid Medication',
  'Antidepressants', 'Anti-anxiety Medication', 'Pain Medication',
  'Asthma Medication', 'Sleep Medication'
]

const HealthConditionsForm = ({ initialData, onSubmit, loading, error }) => {
  const [healthConditions, setHealthConditions] = useState(
    initialData?.healthConditions || []
  )
  const [medications, setMedications] = useState(
    initialData?.medications || []
  )
  const [injuries, setInjuries] = useState(
    initialData?.injuries || []
  )
  const [newCondition, setNewCondition] = useState('')
  const [newMedication, setNewMedication] = useState('')
  const [newInjury, setNewInjury] = useState('')

  const addHealthCondition = (condition) => {
    if (condition && !healthConditions.find(c => c.condition === condition)) {
      setHealthConditions([...healthConditions, {
        condition,
        severity: 'moderate',
        affectsExercise: false,
        affectsNutrition: false,
        requiresMonitoring: false
      }])
      setNewCondition('')
    }
  }

  const removeHealthCondition = (index) => {
    setHealthConditions(healthConditions.filter((_, i) => i !== index))
  }

  const updateHealthCondition = (index, field, value) => {
    const updated = [...healthConditions]
    updated[index] = { ...updated[index], [field]: value }
    setHealthConditions(updated)
  }

  const addMedication = (medication) => {
    if (medication && !medications.find(m => m.name === medication)) {
      setMedications([...medications, {
        name: medication,
        dosage: '',
        frequency: '',
        affectsExercise: false,
        affectsNutrition: false
      }])
      setNewMedication('')
    }
  }

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (index, field, value) => {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    setMedications(updated)
  }

  const addInjury = () => {
    if (newInjury) {
      setInjuries([...injuries, {
        injury: newInjury,
        status: 'healing',
        affectedAreas: [],
        restrictions: []
      }])
      setNewInjury('')
    }
  }

  const removeInjury = (index) => {
    setInjuries(injuries.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    const data = {
      healthConditions,
      medications,
      injuries
    }
    onSubmit(data)
  }

  const hasHighRiskConditions = healthConditions.some(
    condition => condition.severity === 'severe' || condition.requiresMonitoring
  )

  const hasExerciseAffectingMeds = medications.some(med => med.affectsExercise)

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-wellness-danger">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Health Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Add Health Condition</Label>
            <div className="flex gap-2">
              <Select onValueChange={addHealthCondition}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select common condition" />
                </SelectTrigger>
                <SelectContent>
                  {commonConditions.map(condition => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Or type custom condition"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHealthCondition(newCondition)}
                />
                <Button 
                  type="button"
                  onClick={() => addHealthCondition(newCondition)}
                  disabled={!newCondition}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {healthConditions.length > 0 && (
            <div className="space-y-3">
              {healthConditions.map((condition, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{condition.condition}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeHealthCondition(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select 
                        value={condition.severity}
                        onValueChange={(value) => updateHealthCondition(index, 'severity', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`affects-exercise-${index}`}
                        checked={condition.affectsExercise}
                        onCheckedChange={(checked) => updateHealthCondition(index, 'affectsExercise', checked)}
                      />
                      <label htmlFor={`affects-exercise-${index}`} className="text-sm">
                        Affects exercise ability
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`affects-nutrition-${index}`}
                        checked={condition.affectsNutrition}
                        onCheckedChange={(checked) => updateHealthCondition(index, 'affectsNutrition', checked)}
                      />
                      <label htmlFor={`affects-nutrition-${index}`} className="text-sm">
                        Affects nutrition requirements
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`requires-monitoring-${index}`}
                        checked={condition.requiresMonitoring}
                        onCheckedChange={(checked) => updateHealthCondition(index, 'requiresMonitoring', checked)}
                      />
                      <label htmlFor={`requires-monitoring-${index}`} className="text-sm">
                        Requires close monitoring
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Add Medication</Label>
            <div className="flex gap-2">
              <Select onValueChange={addMedication}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select common medication" />
                </SelectTrigger>
                <SelectContent>
                  {commonMedications.map(med => (
                    <SelectItem key={med} value={med}>
                      {med}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Or type medication name"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMedication(newMedication)}
                />
                <Button 
                  type="button"
                  onClick={() => addMedication(newMedication)}
                  disabled={!newMedication}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {medications.length > 0 && (
            <div className="space-y-3">
              {medications.map((medication, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{medication.name}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMedication(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Dosage</Label>
                      <Input
                        placeholder="e.g., 10mg"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Input
                        placeholder="e.g., Daily, Twice daily"
                        value={medication.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`med-affects-exercise-${index}`}
                        checked={medication.affectsExercise}
                        onCheckedChange={(checked) => updateMedication(index, 'affectsExercise', checked)}
                      />
                      <label htmlFor={`med-affects-exercise-${index}`} className="text-sm">
                        May affect exercise performance
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`med-affects-nutrition-${index}`}
                        checked={medication.affectsNutrition}
                        onCheckedChange={(checked) => updateMedication(index, 'affectsNutrition', checked)}
                      />
                      <label htmlFor={`med-affects-nutrition-${index}`} className="text-sm">
                        Has dietary restrictions or interactions
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Injuries */}
      <Card>
        <CardHeader>
          <CardTitle>Current or Recent Injuries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Add Injury</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Describe injury (e.g., Lower back strain)"
                value={newInjury}
                onChange={(e) => setNewInjury(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInjury()}
              />
              <Button 
                type="button"
                onClick={addInjury}
                disabled={!newInjury}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {injuries.length > 0 && (
            <div className="space-y-3">
              {injuries.map((injury, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{injury.injury}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeInjury(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety Warnings */}
      {(hasHighRiskConditions || hasExerciseAffectingMeds) && (
        <Alert className="border-wellness-warning bg-amber-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Professional consultation recommended:</strong> Your health conditions or medications 
            may require medical supervision before starting exercise or nutrition programs.
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-wellness-primary hover:bg-wellness-primary/90"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Health Conditions
      </Button>
    </div>
  )
}

export default HealthConditionsForm