import { getProfile } from '@/actions/kyc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { VerifyButton } from './verify-button'
import { CheckCircle, Phone, Calendar } from 'lucide-react'

export default async function ProfilePage() {
  // Mock current user - in production this would come from auth
  const currentUserId = 'user-buyer-1'

  const { data: profile, error } = await getProfile(currentUserId)

  if (error || !profile) {
    return (
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Profile not found</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const initials = profile.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold" data-testid="profile-name">
                    {profile.display_name}
                  </h2>
                  {profile.is_verified && (
                    <Badge
                      className="bg-green-100 text-green-800 hover:bg-green-100"
                      data-testid="verified-badge"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">Member since 2024</p>
              </div>
            </div>

            {/* Contact Info */}
            {profile.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{profile.phone}</span>
              </div>
            )}

            {/* Verification Section */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Identity Verification
              </h3>

              {profile.is_verified ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Your identity has been verified</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Buyers can trust that you are a verified seller on GearGrab.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Verify your identity to build trust with buyers and unlock all platform features.
                  </p>
                  <VerifyButton userId={profile.id} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
