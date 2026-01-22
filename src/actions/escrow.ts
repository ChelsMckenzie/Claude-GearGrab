'use server'

import type { Transaction, TransactionStatus } from '@/types/database'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { createTransactionSchema, updateTransactionStatusSchema } from '@/lib/validations'

export interface CreateTransactionResult {
  data: Transaction | null
  error: string | null
}

export async function createTransaction(
  buyerId: string,
  sellerId: string,
  listingId: string,
  amount: number
): Promise<CreateTransactionResult> {
  // ✅ Validate input
  const validationResult = createTransactionSchema.safeParse({
    buyerId,
    sellerId,
    listingId,
    amount,
  })

  if (!validationResult.success) {
    return { data: null, error: validationResult.error.errors[0].message }
  }

  // ✅ Verify buyer is authenticated and matches buyerId
  const { user } = await requireAuth()
  if (user.id !== buyerId) {
    return { data: null, error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      listing_id: listingId,
      amount,
      status: 'escrow_pending',
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export interface GetTransactionResult {
  data: Transaction | null
  error: string | null
}

export async function getTransaction(transactionId: string): Promise<GetTransactionResult> {
  const { user } = await requireAuth()
  const supabase = await createClient()

  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (error || !transaction) {
    return { data: null, error: 'Transaction not found' }
  }

  // ✅ Verify user is buyer or seller
  if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
    return { data: null, error: 'Unauthorized' }
  }

  return { data: transaction, error: null }
}

export interface UpdateTransactionResult {
  data: Transaction | null
  error: string | null
}

export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus
): Promise<UpdateTransactionResult> {
  // ✅ Validate input
  const validationResult = updateTransactionStatusSchema.safeParse({
    transactionId,
    status,
  })

  if (!validationResult.success) {
    return { data: null, error: validationResult.error.errors[0].message }
  }

  const { user } = await requireAuth()
  const supabase = await createClient()

  // Get transaction first to verify ownership
  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (!transaction) {
    return { data: null, error: 'Transaction not found' }
  }

  // ✅ Verify user is buyer or seller
  if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
    return { data: null, error: 'Unauthorized' }
  }

  // Update transaction
  const { data: updatedTransaction, error } = await supabase
    .from('transactions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', transactionId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: updatedTransaction, error: null }
}

export async function confirmShipping(transactionId: string): Promise<UpdateTransactionResult> {
  return updateTransactionStatus(transactionId, 'shipped')
}

export async function confirmReceipt(transactionId: string): Promise<UpdateTransactionResult> {
  return updateTransactionStatus(transactionId, 'completed')
}
