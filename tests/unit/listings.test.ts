import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createListingsService } from '@/services/listings'
import type { Listing, ListingInsert, Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock listing data
const mockListing: Listing = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  user_id: 'user-123',
  title: 'Garmin Fenix 7',
  description: 'Great condition GPS watch',
  price: 850000, // R8,500.00 in cents
  images: ['image1.jpg', 'image2.jpg'],
  category: 'Electronics',
  brand: 'Garmin',
  model: 'Fenix 7',
  condition: 8,
  estimated_retail_price: 1200000,
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockListingInsert: ListingInsert = {
  user_id: 'user-123',
  title: 'Garmin Fenix 7',
  description: 'Great condition GPS watch',
  price: 850000,
  images: ['image1.jpg', 'image2.jpg'],
  category: 'Electronics',
  brand: 'Garmin',
  model: 'Fenix 7',
  condition: 8,
}

// Helper to create a mock Supabase client
function createMockSupabaseClient() {
  const mockSingle = vi.fn()
  const mockSelect = vi.fn(() => ({ single: mockSingle }))
  const mockInsert = vi.fn(() => ({ select: mockSelect }))
  const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ select: mockSelect })) }))
  const mockDelete = vi.fn(() => ({ eq: vi.fn() }))
  const mockOrder = vi.fn()
  const mockEq = vi.fn(() => ({
    single: mockSingle,
    order: mockOrder,
    eq: vi.fn(() => ({ order: mockOrder })),
  }))
  const mockGte = vi.fn(() => ({
    lte: vi.fn(() => ({ order: mockOrder })),
    order: mockOrder,
    eq: mockEq,
  }))
  const mockLte = vi.fn(() => ({ order: mockOrder, eq: mockEq }))
  const mockOr = vi.fn(() => ({ order: mockOrder }))

  const mockFrom = vi.fn(() => ({
    insert: mockInsert,
    select: vi.fn(() => ({
      eq: mockEq,
      order: mockOrder,
      gte: mockGte,
      lte: mockLte,
      or: mockOr,
    })),
    update: mockUpdate,
    delete: mockDelete,
  }))

  return {
    client: { from: mockFrom } as unknown as SupabaseClient<Database>,
    mocks: {
      from: mockFrom,
      insert: mockInsert,
      select: mockSelect,
      single: mockSingle,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder,
    },
  }
}

describe('ListingsService', () => {
  describe('createListing', () => {
    it('should call supabase insert with correct data', async () => {
      const { client, mocks } = createMockSupabaseClient()
      mocks.single.mockResolvedValue({ data: mockListing, error: null })

      const service = createListingsService(client)
      const result = await service.createListing(mockListingInsert)

      expect(mocks.from).toHaveBeenCalledWith('listings')
      expect(mocks.insert).toHaveBeenCalledWith(mockListingInsert)
      expect(result.data).toEqual(mockListing)
      expect(result.error).toBeNull()
    })

    it('should return error when insert fails', async () => {
      const { client, mocks } = createMockSupabaseClient()
      mocks.single.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      })

      const service = createListingsService(client)
      const result = await service.createListing(mockListingInsert)

      expect(result.data).toBeNull()
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe('Insert failed')
    })
  })

  describe('getListings', () => {
    it('should call supabase select and order by created_at', async () => {
      const { client, mocks } = createMockSupabaseClient()
      mocks.order.mockResolvedValue({ data: [mockListing], error: null })

      const service = createListingsService(client)
      const result = await service.getListings()

      expect(mocks.from).toHaveBeenCalledWith('listings')
      expect(result.data).toEqual([mockListing])
      expect(result.error).toBeNull()
    })

    it('should apply category filter', async () => {
      const { client, mocks } = createMockSupabaseClient()
      mocks.order.mockResolvedValue({ data: [mockListing], error: null })

      const service = createListingsService(client)
      await service.getListings({ category: 'Electronics' })

      expect(mocks.from).toHaveBeenCalledWith('listings')
      expect(mocks.eq).toHaveBeenCalledWith('category', 'Electronics')
    })

    it('should return error when select fails', async () => {
      const { client, mocks } = createMockSupabaseClient()
      mocks.order.mockResolvedValue({
        data: null,
        error: { message: 'Select failed' },
      })

      const service = createListingsService(client)
      const result = await service.getListings()

      expect(result.data).toBeNull()
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe('Select failed')
    })
  })

  describe('getListing', () => {
    it('should call supabase select with id filter', async () => {
      const { client, mocks } = createMockSupabaseClient()
      mocks.single.mockResolvedValue({ data: mockListing, error: null })

      const service = createListingsService(client)
      const result = await service.getListing(mockListing.id)

      expect(mocks.from).toHaveBeenCalledWith('listings')
      expect(mocks.eq).toHaveBeenCalledWith('id', mockListing.id)
      expect(result.data).toEqual(mockListing)
      expect(result.error).toBeNull()
    })

    it('should return error when listing not found', async () => {
      const { client, mocks } = createMockSupabaseClient()
      mocks.single.mockResolvedValue({
        data: null,
        error: { message: 'Row not found' },
      })

      const service = createListingsService(client)
      const result = await service.getListing('non-existent-id')

      expect(result.data).toBeNull()
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe('Row not found')
    })
  })

  describe('updateListing', () => {
    it('should call supabase update with correct data', async () => {
      const { client, mocks } = createMockSupabaseClient()
      const updatedListing = { ...mockListing, title: 'Updated Title' }

      // Create a proper chain for update
      const mockUpdateSingle = vi.fn().mockResolvedValue({ data: updatedListing, error: null })
      const mockUpdateSelect = vi.fn(() => ({ single: mockUpdateSingle }))
      const mockUpdateEq = vi.fn(() => ({ select: mockUpdateSelect }))
      mocks.update.mockReturnValue({ eq: mockUpdateEq })

      const service = createListingsService(client)
      const result = await service.updateListing(mockListing.id, { title: 'Updated Title' })

      expect(mocks.from).toHaveBeenCalledWith('listings')
      expect(mocks.update).toHaveBeenCalledWith({ title: 'Updated Title' })
      expect(mockUpdateEq).toHaveBeenCalledWith('id', mockListing.id)
      expect(result.data).toEqual(updatedListing)
      expect(result.error).toBeNull()
    })

    it('should return error when update fails', async () => {
      const { client, mocks } = createMockSupabaseClient()

      const mockUpdateSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      })
      const mockUpdateSelect = vi.fn(() => ({ single: mockUpdateSingle }))
      const mockUpdateEq = vi.fn(() => ({ select: mockUpdateSelect }))
      mocks.update.mockReturnValue({ eq: mockUpdateEq })

      const service = createListingsService(client)
      const result = await service.updateListing(mockListing.id, { title: 'Updated Title' })

      expect(result.data).toBeNull()
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe('Update failed')
    })
  })

  describe('deleteListing', () => {
    it('should call supabase delete with correct id', async () => {
      const { client, mocks } = createMockSupabaseClient()

      const mockDeleteEq = vi.fn().mockResolvedValue({ error: null })
      mocks.delete.mockReturnValue({ eq: mockDeleteEq })

      const service = createListingsService(client)
      const result = await service.deleteListing(mockListing.id)

      expect(mocks.from).toHaveBeenCalledWith('listings')
      expect(mockDeleteEq).toHaveBeenCalledWith('id', mockListing.id)
      expect(result.error).toBeNull()
    })

    it('should return error when delete fails', async () => {
      const { client, mocks } = createMockSupabaseClient()

      const mockDeleteEq = vi.fn().mockResolvedValue({
        error: { message: 'Delete failed' }
      })
      mocks.delete.mockReturnValue({ eq: mockDeleteEq })

      const service = createListingsService(client)
      const result = await service.deleteListing(mockListing.id)

      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe('Delete failed')
    })
  })
})
