import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Listing,
  ListingInsert,
  ListingUpdate,
  ListingFilters,
  Database,
} from '@/types/database'

export interface ListingsServiceResult<T> {
  data: T | null
  error: Error | null
}

export interface ListingsService {
  createListing(data: ListingInsert): Promise<ListingsServiceResult<Listing>>
  getListings(filters?: ListingFilters): Promise<ListingsServiceResult<Listing[]>>
  getListing(id: string): Promise<ListingsServiceResult<Listing>>
  updateListing(id: string, data: ListingUpdate): Promise<ListingsServiceResult<Listing>>
  deleteListing(id: string): Promise<ListingsServiceResult<null>>
}

export function createListingsService(
  supabase: SupabaseClient<Database>
): ListingsService {
  return {
    async createListing(data: ListingInsert): Promise<ListingsServiceResult<Listing>> {
      const { data: listing, error } = await supabase
        .from('listings')
        .insert(data)
        .select()
        .single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data: listing, error: null }
    },

    async getListings(filters?: ListingFilters): Promise<ListingsServiceResult<Listing[]>> {
      let query = supabase.from('listings').select('*')

      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category)
        }
        if (filters.minPrice !== undefined) {
          query = query.gte('price', filters.minPrice)
        }
        if (filters.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice)
        }
        if (filters.condition !== undefined) {
          query = query.eq('condition', filters.condition)
        }
        if (filters.brand) {
          query = query.eq('brand', filters.brand)
        }
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.userId) {
          query = query.eq('user_id', filters.userId)
        }
        if (filters.search) {
          query = query.or(
            `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`
          )
        }
      }

      const { data: listings, error } = await query.order('created_at', { ascending: false })

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data: listings, error: null }
    },

    async getListing(id: string): Promise<ListingsServiceResult<Listing>> {
      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data: listing, error: null }
    },

    async updateListing(
      id: string,
      data: ListingUpdate
    ): Promise<ListingsServiceResult<Listing>> {
      const { data: listing, error } = await supabase
        .from('listings')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data: listing, error: null }
    },

    async deleteListing(id: string): Promise<ListingsServiceResult<null>> {
      const { error } = await supabase.from('listings').delete().eq('id', id)

      if (error) {
        return { data: null, error: new Error(error.message) }
      }

      return { data: null, error: null }
    },
  }
}
