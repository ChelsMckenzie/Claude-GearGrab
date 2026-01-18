import { Suspense } from 'react'
import { getListings, getCategories } from '@/actions/listings'
import { ListingCard } from '@/components/marketplace/listing-card'
import { FilterSidebar } from '@/components/marketplace/filter-sidebar'
import type { ListingFilters } from '@/types/database'

interface BrowsePageProps {
  searchParams: Promise<{
    category?: string
    minPrice?: string
    maxPrice?: string
    search?: string
  }>
}

async function ListingsGrid({ searchParams }: { searchParams: BrowsePageProps['searchParams'] }) {
  const params = await searchParams

  const filters: ListingFilters = {
    category: params.category,
    minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
    search: params.search,
    status: 'active',
  }

  const { data: listings, error } = await getListings(filters)

  if (error) {
    return <div className="text-destructive">Error loading listings: {error}</div>
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground" data-testid="no-listings">
        No listings found. Try adjusting your filters.
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      data-testid="listings-grid"
    >
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}

async function FilterSidebarWrapper() {
  const categories = await getCategories()
  return <FilterSidebar categories={categories} />
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Browse Gear</h1>
          <p className="text-muted-foreground mt-1">
            Find outdoor and adventure equipment from verified sellers
          </p>
        </div>

        <div className="flex gap-8">
          <Suspense fallback={<div className="w-64 shrink-0">Loading filters...</div>}>
            <FilterSidebarWrapper />
          </Suspense>

          <div className="flex-1">
            {params.category && (
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">
                  Showing results for:{' '}
                  <span className="font-medium text-foreground">{params.category}</span>
                </span>
              </div>
            )}

            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-72 bg-muted animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              }
            >
              <ListingsGrid searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}
