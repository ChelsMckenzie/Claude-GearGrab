import { getUserListings, getIncomingRequests } from '@/actions/dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ListingsTab } from './listings-tab'
import { InquiriesTab } from './inquiries-tab'
import { SettingsTab } from './settings-tab'
import { Package, MessageSquare, Settings } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const currentUserId = user.id

  const [listingsResult, requestsResult] = await Promise.all([
    getUserListings(currentUserId),
    getIncomingRequests(currentUserId),
  ])

  const listings = listingsResult.data || []
  const requests = requestsResult.data || []

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" data-testid="dashboard-title">
            Seller Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your listings and respond to buyer inquiries
          </p>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="listings" data-testid="tab-listings">
              <Package className="w-4 h-4 mr-2" />
              Listings
            </TabsTrigger>
            <TabsTrigger value="inquiries" data-testid="tab-inquiries">
              <MessageSquare className="w-4 h-4 mr-2" />
              Inquiries
              {requests.filter((r) => r.status === 'pending').length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {requests.filter((r) => r.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <ListingsTab listings={listings} />
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiriesTab requests={requests} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
