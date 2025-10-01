import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Menu, 
  Home, 
  Activity, 
  TrendingUp, 
  User, 
  MessageCircle, 
  LogOut,
  AlertTriangle,
  Phone
} from 'lucide-react'
import { signout } from '@/services/user/client'
import { revokeAuth } from '@/store/slices/auth.slice'

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { firstName, lastName, healthStatus, riskLevel, requiresProfessionalConsultation } = useSelector(state => state.auth)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Wellness Plan', href: '/wellness-plan', icon: Activity },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Health Profile', href: '/health-profile', icon: User },
    { name: 'AI Chat', href: '/chat', icon: MessageCircle },
  ]

  const handleSignout = async () => {
    await signout()
    dispatch(revokeAuth())
    localStorage.removeItem('accessToken')
    navigate('/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-wellness-primary">Wellness Coach</h2>
        <p className="text-sm text-slate-600">Welcome, {firstName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-wellness-primary text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => mobile && setSidebarOpen(false)}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      

      {/* Emergency & Signout */}
      <div className="p-4 border-t space-y-2">
       
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignout}
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex bg-wellness-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-white">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile={true} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b p-4 flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <h1 className="text-lg font-semibold">Wellness Coach</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>

        {/* Health Disclaimer Bar */}
        <div className="bg-wellness-warning/10 border-t border-wellness-warning/20 p-2">
          <p className="text-xs text-center text-wellness-danger">
            This service provides general wellness information only - not medical advice. 
            Always consult healthcare professionals for medical concerns.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout