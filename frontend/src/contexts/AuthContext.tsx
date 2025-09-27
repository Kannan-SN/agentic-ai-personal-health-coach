import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthState } from '@/types/auth'
import { api } from '@/lib/api'

interface AuthContextType extends AuthState {
  signin: (email: string, password: string) => Promise<void>
  signup: (userData: any) => Promise<void>
  signout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.get('/user/info')
      setState({
        user: response.data.data,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const signin = async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password })
    setState({
      user: response.data.data,
      isAuthenticated: true,
      isLoading: false,
    })
  }

  const signup = async (userData: any) => {
    await api.post('/auth/signup', userData)
  }

  const signout = async () => {
    await api.get('/auth/signout')
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  return (
    <AuthContext.Provider value={{ ...state, signin, signup, signout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}