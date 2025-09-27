import { Button } from '@/components/ui/button'
import { Heart, Menu, Phone } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function Navbar() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-health-primary" />
          <span className="text-xl font-semibold">Wellness Coach</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/dashboard" className="text-sm font-medium hover:text-health-primary">
            Dashboard
          </a>
          <a href="/wellness" className="text-sm font-medium hover:text-health-primary">
            Plans
          </a>
          <a href="/profile" className="text-sm font-medium hover:text-health-primary">
            Profile
          </a>
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Phone className="h-4 w-4 mr-2" />
            Emergency
          </Button>
          
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col space-y-4 mt-6">
                <a href="/dashboard">Dashboard</a>
                <a href="/wellness">Plans</a>
                <a href="/profile">Profile</a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}