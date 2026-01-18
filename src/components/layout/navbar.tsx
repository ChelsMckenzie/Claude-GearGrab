import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserNav } from './user-nav'
import { Mountain, Search } from 'lucide-react'

// Mock function to get current user session
// In production, this would use Supabase auth
async function getCurrentUser() {
  // Check for mock user cookie/session
  // For now, we'll use an environment variable or default to mock user
  const mockLoggedIn = process.env.MOCK_USER_LOGGED_IN === 'true'

  if (mockLoggedIn) {
    return {
      id: 'user-seller-1',
      email: 'seller@example.com',
      displayName: 'Sarah Seller',
      isVerified: true,
    }
  }

  return null
}

export async function Navbar() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" data-testid="logo">
          <Mountain className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl">GearGrab</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/browse"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-testid="nav-browse"
          >
            Browse
          </Link>
          <Link
            href="/list"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-testid="nav-sell"
          >
            Sell
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search Button (Mobile) */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="w-5 h-5" />
          </Button>

          {/* Auth Buttons or User Nav */}
          {user ? (
            <UserNav user={user} />
          ) : (
            <div className="flex items-center gap-2" data-testid="auth-buttons">
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="sign-in-button">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" data-testid="join-button">
                  Join
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
