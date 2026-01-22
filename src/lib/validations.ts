/**
 * Zod validation schemas for server actions
 */

import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z
    .string()
    .regex(
      /^\+27\s?\d{2}\s?\d{3}\s?\d{4}$/,
      'Invalid South African phone number format. Use: +27 XX XXX XXXX'
    ),
})

export const createTransactionSchema = z.object({
  buyerId: z.string().uuid('Invalid buyer ID'),
  sellerId: z.string().uuid('Invalid seller ID'),
  listingId: z.string().uuid('Invalid listing ID'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .int('Amount must be an integer')
    .min(1, 'Amount must be at least 1'),
})

export const contactRequestSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID'),
  sellerId: z.string().uuid('Invalid seller ID'),
  buyerId: z.string().uuid('Invalid buyer ID'),
  message: z.string().max(500, 'Message too long (max 500 characters)').optional(),
})

export const imageUploadSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})

export const updateContactStatusSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  status: z.enum(['pending', 'accepted', 'declined']),
})

export const updateTransactionStatusSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction ID'),
  status: z.enum(['escrow_pending', 'funds_secured', 'shipped', 'completed']),
})
