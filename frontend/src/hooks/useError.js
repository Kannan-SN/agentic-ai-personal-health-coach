import { useState, useCallback } from 'react'

export const useError = () => {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAsync = useCallback(async (asyncFunction, errorMessage = 'An error occurred') => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await asyncFunction()
      return result
    } catch (err) {
      const message = err.response?.data?.message || err.message || errorMessage
      setError(message)
      console.error('Async error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((err, customMessage = null) => {
    const message = customMessage || err.response?.data?.message || err.message || 'An unexpected error occurred'
    setError(message)
    console.error('Error:', err)
  }, [])

  return {
    error,
    isLoading,
    handleAsync,
    clearError,
    handleError,
    setError,
    setIsLoading
  }
}