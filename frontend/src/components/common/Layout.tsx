import { ReactNode } from 'react'
import { Navbar } from '../navigation/Navbar'
import { HealthDisclaimer } from './HealthDisclaimer'

interface LayoutProps {
  children: ReactNode
  showDisclaimer?: boolean
}

export function Layout({ children, showDisclaimer = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      {showDisclaimer && <HealthDisclaimer />}
    </div>
  )
}