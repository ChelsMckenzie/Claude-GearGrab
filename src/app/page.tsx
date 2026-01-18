import Link from 'next/link'
import { getFeaturedListings } from '@/actions/listings'
import { ListingCard } from '@/components/marketplace/listing-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Sparkles, Lock, ArrowRight } from 'lucide-react'

const categories = [
  { name: 'Hiking', slug: 'Hiking', emoji: '🥾' },
  { name: 'Cycling', slug: 'Cycling', emoji: '🚴' },
  { name: 'Camping', slug: 'Camping', emoji: '⛺' },
  { name: 'Climbing', slug: 'Climbing', emoji: '🧗' },
  { name: 'Water Sports', slug: 'Water Sports', emoji: '🏄' },
  { name: 'Running', slug: 'Running', emoji: '🏃' },
]

export default async function Home() {
  const { data: featuredListings } = await getFeaturedListings(4)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight" data-testid="hero-title">
            Buy & Sell Outdoor Gear
            <span className="text-primary"> Securely</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            South Africa&apos;s trusted marketplace for outdoor and adventure equipment.
            AI-powered listings, verified sellers, and escrow protection.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" data-testid="browse-button">
                Browse Gear
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/list">
              <Button size="lg" variant="outline" data-testid="sell-button">
                Sell Your Gear
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" data-testid="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/browse?category=${encodeURIComponent(category.slug)}`}
                data-testid={`category-${category.slug.toLowerCase().replace(' ', '-')}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <span className="text-4xl">{category.emoji}</span>
                    <p className="mt-2 font-medium">{category.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      {featuredListings && featuredListings.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Featured Gear</h2>
              <Link href="/browse">
                <Button variant="ghost">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              data-testid="featured-listings-grid"
            >
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="py-16 px-4" data-testid="trust-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Why GearGrab?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2" data-testid="trust-ai">
                  AI-Powered Listings
                </h3>
                <p className="text-muted-foreground">
                  Upload a photo and our AI instantly identifies your gear, suggests pricing, and
                  creates your listing in seconds.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2" data-testid="trust-verified">
                  Verified Sellers
                </h3>
                <p className="text-muted-foreground">
                  KYC verification ensures you&apos;re dealing with real people. Look for the
                  verified badge before you buy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2" data-testid="trust-escrow">
                  Escrow Protection
                </h3>
                <p className="text-muted-foreground">
                  Your money is held securely until you receive your item and confirm
                  satisfaction. No more scams.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to sell your gear?</h2>
          <p className="text-lg opacity-90 mb-8">
            List your outdoor equipment in seconds with our AI-powered listing engine.
          </p>
          <Link href="/list">
            <Button size="lg" variant="secondary">
              Start Selling Now
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
