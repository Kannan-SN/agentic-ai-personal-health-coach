import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, AlertTriangle, Shield, ArrowLeft } from 'lucide-react'
import ChatInterface from '@/components/chat/ChatInterface'
import { sendChat, getChatHistory } from '@/services/agent/client'
import { setChatMessages, addChatMessage } from '@/store/slices/wellness.slice'
import { getWellnessPlans } from '@/services/user/wellness'

const HealthChat = () => {
  const { planId } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  
  const dispatch = useDispatch()
  const { chatMessages, plans } = useSelector(state => state.wellness)
  const { healthDisclaimerAccepted } = useSelector(state => state.auth)

  useEffect(() => {
    if (!healthDisclaimerAccepted) {
      setError('Health disclaimer must be accepted before using AI chat')
      return
    }

    if (planId) {
      fetchChatHistory(planId)
      const plan = plans?.find(p => p.id === planId)
      setSelectedPlan(plan)
    } else {
      // Load available plans if no specific plan selected
      loadPlans()
    }
  }, [planId, healthDisclaimerAccepted])

  const loadPlans = async () => {
    try {
      const response = await getWellnessPlans()
      if (response.success && response.data.length > 0) {
        const activePlan = response.data.find(plan => plan.status === 'active')
        if (activePlan) {
          setSelectedPlan(activePlan)
          fetchChatHistory(activePlan.id)
        }
      }
    } catch (err) {
      setError('Failed to load wellness plans')
    }
  }

  const fetchChatHistory = async (planId) => {
    try {
      const response = await getChatHistory(planId)
      if (response.success) {
        dispatch(setChatMessages(response.data || []))
      }
    } catch (err) {
      console.error('Failed to load chat history:', err)
      // Don't show error for missing chat history - it's normal for new plans
      dispatch(setChatMessages([]))
    }
  }

  const handleSendMessage = async (message) => {
    if (!selectedPlan) {
      setError('No active wellness plan found')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Add user message immediately
      const userMessage = {
        message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        messageType: 'question'
      }
      dispatch(addChatMessage(userMessage))

      // Send to agent service
      const response = await sendChat({ message }, selectedPlan.id)
      
      if (response.success) {
        // Add AI response
        const aiMessage = {
          message: response.response || response.message,
          sender: 'agent',
          timestamp: new Date().toISOString(),
          messageType: 'response',
          safety_check_performed: response.safety_check_performed || true,
          emergency_detected: response.emergency_detected || false,
          professional_consultation_recommended: response.professional_consultation_recommended || false
        }
        dispatch(addChatMessage(aiMessage))

        // Handle any safety alerts
        if (response.emergency_detected) {
          setError('Emergency situation detected. Please seek immediate medical attention if needed.')
        }
      } else {
        setError(response.message || 'Failed to send message')
        
        // Add error message to chat
        const errorMessage = {
          message: 'Sorry, I encountered an error processing your message. Please try again or contact support if the issue persists.',
          sender: 'agent',
          timestamp: new Date().toISOString(),
          messageType: 'error'
        }
        dispatch(addChatMessage(errorMessage))
      }
    } catch (err) {
      setError('Failed to send message. Please check your connection and try again.')
      console.error('Chat error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!healthDisclaimerAccepted) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border-wellness-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-wellness-danger">
              <AlertTriangle className="h-5 w-5" />
              Health Disclaimer Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4">
              You must accept the health disclaimer before using the AI wellness assistant.
            </p>
            <Button onClick={() => window.location.href = '/health-disclaimer'}>
              Accept Health Disclaimer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!selectedPlan) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Wellness Plan</h3>
            <p className="text-slate-600 mb-6">
              You need an active wellness plan to chat with the AI assistant about your health journey.
            </p>
            <Button 
              onClick={() => window.location.href = '/wellness-plan'}
              className="bg-wellness-primary"
            >
              Create Wellness Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center gap-4 mb-4">
          {planId && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-wellness-text">AI Wellness Assistant</h1>
            <p className="text-slate-600">
              Plan: {selectedPlan.planName} • {selectedPlan.userProfileSnapshot?.primaryGoal}
            </p>
          </div>
        </div>

        {/* Important Safety Notice */}
        <Alert className="border-wellness-warning bg-amber-50 mb-4">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Important:</strong> This AI provides general wellness guidance only - not medical advice. 
            For emergencies call 911. For health concerns, consult healthcare professionals. 
            Never ignore professional medical advice based on AI responses.
          </AlertDescription>
        </Alert>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 mx-6 mb-6">
        <ChatInterface
          planId={selectedPlan.id}
          onSendMessage={handleSendMessage}
          messages={chatMessages}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}

export default HealthChat