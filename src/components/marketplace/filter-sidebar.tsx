'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface FilterSidebarProps {
  categories: string[]
}

export function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || ''
  const currentMinPrice = parseInt(searchParams.get('minPrice') || '0')
  const currentMaxPrice = parseInt(searchParams.get('maxPrice') || '50000')

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      router.push(`/browse?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleCategoryClick = (category: string) => {
    if (currentCategory === category) {
      updateFilters({ category: null })
    } else {
      updateFilters({ category })
    }
  }

  const handlePriceChange = (values: number[]) => {
    updateFilters({
      minPrice: values[0].toString(),
      maxPrice: values[1].toString(),
    })
  }

  const handleClearFilters = () => {
    router.push('/browse')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <aside className="w-64 shrink-0 space-y-6" data-testid="filter-sidebar">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={currentCategory === category ? 'default' : 'outline'}
              size="sm"
              className={cn('w-full justify-start')}
              onClick={() => handleCategoryClick(category)}
              data-testid={`category-filter-${category.toLowerCase()}`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range (ZAR)</h3>
        <div className="px-2">
          <Slider
            value={[currentMinPrice, currentMaxPrice]}
            onValueChange={handlePriceChange}
            min={0}
            max={50000}
            step={500}
            data-testid="price-slider"
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span data-testid="min-price-label">{formatPrice(currentMinPrice)}</span>
            <span data-testid="max-price-label">{formatPrice(currentMaxPrice)}</span>
          </div>
        </div>
      </div>

      {(currentCategory || currentMinPrice > 0 || currentMaxPrice < 50000) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="w-full"
          data-testid="clear-filters"
        >
          Clear Filters
        </Button>
      )}
    </aside>
  )
}
