import { vi } from 'vitest'

// Mock Supabase client globally
vi.mock('@/utils/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))
