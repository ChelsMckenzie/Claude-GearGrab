import { notFound } from 'next/navigation'
import { getListingDetails } from '@/actions/listings'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ContactActions } from './contact-actions'
import { EscrowActions } from './escrow-actions'
import { cn } from '@/lib/utils'
import { CheckCircle, User } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

interface ListingDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params

  const user = await getCurrentUser()
  const currentUserId = user?.id

  const { data, error } = await getListingDetails(id, currentUserId)

  if (error || !data) {
    notFound()
  }

  const { listing, isOwner, sellerName, sellerVerified } = data

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const conditionColor = {
    New: 'bg-green-100 text-green-800',
    'Slightly used': 'bg-yellow-100 text-yellow-800',
    'Very used': 'bg-orange-100 text-orange-800',
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-6xl text-gray-400">
                {listing.category === 'Hiking' ? '🥾' : '🚴'}
              </span>
            </div>
            {listing.condition && (
              <Badge
                className={cn(
                  'absolute top-4 right-4',
                  conditionColor[listing.condition as keyof typeof conditionColor]
                )}
                data-testid="detail-condition-badge"
              >
                {listing.condition}
              </Badge>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold" data-testid="listing-detail-title">
                {listing.title}
              </h1>
              {listing.brand && listing.model && (
                <p className="text-lg text-muted-foreground mt-1" data-testid="listing-brand-model">
                  {listing.brand} {listing.model}
                </p>
              )}
            </div>

            {/* Price Section */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary" data-testid="listing-detail-price">
                    {formatPrice(listing.price)}
                  </span>
                  {listing.retail_price && listing.retail_price > listing.price && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(listing.retail_price)}
                      </span>
                      {listing.discount_percent && (
                        <Badge variant="secondary" className="ml-2">
                          {listing.discount_percent}% off
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category & Condition */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" data-testid="listing-detail-category">
                {listing.category}
              </Badge>
              {listing.sub_category && (
                <Badge variant="outline">{listing.sub_category}</Badge>
              )}
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium" data-testid="seller-name">{sellerName}</span>
                  {sellerVerified && (
                    <Badge
                      className="bg-green-100 text-green-800 hover:bg-green-100"
                      data-testid="verified-seller-badge"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Seller</p>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground" data-testid="listing-detail-description">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Product Link */}
            {listing.product_link && (
              <div>
                <h3 className="font-semibold mb-2">Product Link</h3>
                <a
                  href={listing.product_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View original product
                </a>
              </div>
            )}

            {/* Contact Actions */}
            <ContactActions
              listingId={listing.id}
              sellerId={listing.user_id}
              isOwner={isOwner}
            />

            {/* Buy Securely (Escrow) - only show for logged-in non-owners */}
            {!isOwner && currentUserId && (
              <EscrowActions
                listingId={listing.id}
                sellerId={listing.user_id}
                buyerId={currentUserId}
                amount={listing.price}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
