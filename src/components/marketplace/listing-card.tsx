import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Listing } from '@/types/database'
import { cn } from '@/lib/utils'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
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
    <Link href={`/listings/${listing.id}`} data-testid={`listing-card-${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-square relative bg-muted">
          {listing.images[0] ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-4xl text-gray-400">
                {listing.category === 'Hiking' ? '🥾' : '🚴'}
              </span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          {listing.condition && (
            <Badge
              className={cn(
                'absolute top-2 right-2',
                conditionColor[listing.condition as keyof typeof conditionColor]
              )}
              data-testid={`condition-badge-${listing.id}`}
            >
              {listing.condition}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3
            className="font-semibold text-lg truncate"
            data-testid={`listing-title-${listing.id}`}
          >
            {listing.title}
          </h3>
          {listing.brand && (
            <p className="text-sm text-muted-foreground">{listing.brand}</p>
          )}
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className="text-xl font-bold text-primary"
              data-testid={`listing-price-${listing.id}`}
            >
              {formatPrice(listing.price)}
            </span>
            {listing.retail_price && listing.retail_price > listing.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(listing.retail_price)}
              </span>
            )}
          </div>
          <Badge variant="outline" className="mt-2" data-testid={`category-badge-${listing.id}`}>
            {listing.category}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
