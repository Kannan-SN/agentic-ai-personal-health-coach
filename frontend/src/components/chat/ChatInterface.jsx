import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, AlertTriangle, Bot, User, Loader2 } from 'lucide-react'
import MessageBubble from './MessageBubble'
import SafetyWarning from './SafetyWarning'

const ChatInterface = ({ planId, onSendMessage, messages, loading, error }) => {
  const [inputMessage, setInputMessage] = useState('')
  const [showSafetyWarning, setShowSafetyWarning] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const emergencyKeywords = [
    'chest pain', 'heart attack', 'can\'t breathe', 'dizzy', 'faint',
    'severe pain', 'emergency', 'help', 'hospital', 'ambulance'
  ]

  const detectEmergencyKeywords = (message) => {
    const lowerMessage = message.toLowerCase()
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    // Check for emergency keywords
    if (detectEmergencyKeywords(inputMessage)) {
      setShowSafetyWarning(true)
      return
    }

    try {
      await onSendMessage(inputMessage)
      setInputMessage('')
      inputRef.current?.focus()
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmergencyOverride = () => {
    setShowSafetyWarning(false)
    onSendMessage(inputMessage)
    setInputMessage('')
  }

  if (showSafetyWarning) {
    return (
      <SafetyWarning 
        message={inputMessage}
        onCancel={() => setShowSafetyWarning(false)}
        onContinue={handleEmergencyOverride}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <Card className="border-b rounded-b-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-wellness-primary" />
            AI Wellness Assistant
          </CardTitle>
          <p className="text-sm text-slate-600">
            Get personalized guidance for your wellness journey
          </p>
        </CardHeader>
      </Card>

      {/* Safety Disclaimer */}
      <Alert className="border-wellness-warning bg-amber-50 rounded-none border-x-0">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          This AI provides general wellness information only - not medical advice. 
          For emergencies, call 911. For health concerns, consult healthcare professionals.
        </AlertDescription>
      </Alert>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {error && (
          <Alert className="border-wellness-danger">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              Welcome to your AI Wellness Assistant
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Ask questions about your wellness plan, nutrition, exercise, or general health guidance. 
              Remember, this is general information only - not medical advice.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble 
            key={index}
            message={message}
            isUser={message.sender === 'user'}
          />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-600">
            <Bot className="h-5 w-5" />
            <div className="flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <Card className="border-t rounded-t-none">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your wellness plan, nutrition, exercise..."
              className="flex-1"
              disabled={loading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className="bg-wellness-primary hover:bg-wellness-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-slate-500">
            Press Enter to send • Shift+Enter for new line
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChatInterface