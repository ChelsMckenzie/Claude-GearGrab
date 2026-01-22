import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserNav } from './user-nav'
import { Mountain, Search } from 'lucide-react'
import { getCurrentUser as getAuthUser } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'

async function getCurrentUser() {
  const user = await getAuthUser()

  if (!user) {
    return null
  }

  // Get profile for display name and verification status
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, is_verified')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email || '',
    displayName: profile?.display_name || 'User',
    isVerified: profile?.is_verified || false,
  }
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
