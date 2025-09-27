import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export function HealthDisclaimer() {
  return (
    <Alert className="fixed bottom-4 right-4 max-w-sm border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-sm text-amber-800">
        General wellness information only. Consult healthcare professionals for medical advice.
      </AlertDescription>
    </Alert>
  )
}