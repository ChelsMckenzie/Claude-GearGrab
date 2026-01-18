// Database types matching the Supabase schema

export const LISTING_STATUS = {
  ACTIVE: 'active',
  SOLD: 'sold',
  HIDDEN: 'hidden',
} as const

export type ListingStatus = (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS]

export const CONTACT_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
} as const

export type ContactRequestStatus = (typeof CONTACT_REQUEST_STATUS)[keyof typeof CONTACT_REQUEST_STATUS]

export const ITEM_CONDITION = {
  NEW: 'New',
  SLIGHTLY_USED: 'Slightly used',
  VERY_USED: 'Very used',
} as const

export type ItemCondition = (typeof ITEM_CONDITION)[keyof typeof ITEM_CONDITION]

// ===========================================
// AI ANALYSIS RESULT
// ===========================================
export interface GearAnalysisResult {
  brand: string
  model: string
  category: string
  sub_category: string
  retail_price: number // In ZAR
  description: string
  product_link: string
  confidence: number // 0-100
}

// ===========================================
// PROFILES
// ===========================================
export interface Profile {
  id: string
  display_name: string
  phone: string | null
  avatar_url: string | null
  is_verified: boolean
  allow_whatsapp: boolean
  created_at: string
  updated_at: string
}

export interface ProfileInsert {
  id: string
  display_name: string
  phone?: string | null
  avatar_url?: string | null
  is_verified?: boolean
  allow_whatsapp?: boolean
}

export interface ProfileUpdate {
  display_name?: string
  phone?: string | null
  avatar_url?: string | null
  is_verified?: boolean
  allow_whatsapp?: boolean
}

// ===========================================
// LISTINGS
// ===========================================
export interface Listing {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number // Sale price in ZAR (calculated from retail * (1 - discount))
  images: string[]
  category: string
  sub_category: string | null
  brand: string | null
  model: string | null
  condition: ItemCondition | null
  retail_price: number | null // Retail price in ZAR
  discount_percent: number | null // Discount percentage (0-100)
  product_link: string | null // Link to original product page
  estimated_retail_price: number | null // AI suggested retail price
  status: ListingStatus
  created_at: string
  updated_at: string
}

export interface ListingInsert {
  user_id: string
  title: string
  description?: string | null
  price: number
  images?: string[]
  category: string
  sub_category?: string | null
  brand?: string | null
  model?: string | null
  condition?: ItemCondition | null
  retail_price?: number | null
  discount_percent?: number | null
  product_link?: string | null
  estimated_retail_price?: number | null
  status?: ListingStatus
}

export interface ListingUpdate {
  title?: string
  description?: string | null
  price?: number
  images?: string[]
  category?: string
  sub_category?: string | null
  brand?: string | null
  model?: string | null
  condition?: ItemCondition | null
  retail_price?: number | null
  discount_percent?: number | null
  product_link?: string | null
  estimated_retail_price?: number | null
  status?: ListingStatus
}

export interface ListingFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  condition?: number
  brand?: string
  status?: ListingStatus
  userId?: string
  search?: string
}

// ===========================================
// CONTACT REQUESTS
// ===========================================
export interface ContactRequest {
  id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  status: ContactRequestStatus
  message: string | null
  created_at: string
  updated_at: string
}

export interface ContactRequestInsert {
  buyer_id: string
  seller_id: string
  listing_id: string
  message?: string | null
}

export interface ContactRequestUpdate {
  status?: ContactRequestStatus
}

// ===========================================
// CONVERSATIONS
// ===========================================
export interface Conversation {
  id: string
  listing_id: string | null
  contact_request_id: string | null
  participants: string[]
  created_at: string
  updated_at: string
}

export interface ConversationInsert {
  listing_id?: string | null
  contact_request_id?: string | null
  participants: string[]
}

// ===========================================
// MESSAGES
// ===========================================
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface MessageInsert {
  conversation_id: string
  sender_id: string
  content: string
}

// ===========================================
// REVIEWS
// ===========================================
export interface Review {
  id: string
  reviewer_id: string
  target_user_id: string
  listing_id: string | null
  rating: number // 1-5
  comment: string | null
  created_at: string
}

export interface ReviewInsert {
  reviewer_id: string
  target_user_id: string
  listing_id?: string | null
  rating: number
  comment?: string | null
}

// ===========================================
// TRANSACTIONS (ESCROW)
// ===========================================
export const TRANSACTION_STATUS = {
  ESCROW_PENDING: 'escrow_pending',
  FUNDS_SECURED: 'funds_secured',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
} as const

export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS]

export interface Transaction {
  id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  amount: number
  status: TransactionStatus
  created_at: string
  updated_at: string
}

export interface TransactionInsert {
  buyer_id: string
  seller_id: string
  listing_id: string
  amount: number
  status?: TransactionStatus
}

export interface TransactionUpdate {
  status?: TransactionStatus
}

// ===========================================
// DATABASE SCHEMA TYPE
// ===========================================
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      listings: {
        Row: Listing
        Insert: ListingInsert
        Update: ListingUpdate
      }
      contact_requests: {
        Row: ContactRequest
        Insert: ContactRequestInsert
        Update: ContactRequestUpdate
      }
      conversations: {
        Row: Conversation
        Insert: ConversationInsert
        Update: never
      }
      messages: {
        Row: Message
        Insert: MessageInsert
        Update: never
      }
      reviews: {
        Row: Review
        Insert: ReviewInsert
        Update: never
      }
      transactions: {
        Row: Transaction
        Insert: TransactionInsert
        Update: TransactionUpdate
      }
    }
  }
}
