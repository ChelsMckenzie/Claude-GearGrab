'use server'

import type { Transaction, TransactionStatus } from '@/types/database'

// Mock transaction store
const mockTransactions: Map<string, Transaction> = new Map()

let transactionCounter = 0

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
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  transactionCounter++
  const transactionId = `txn-${transactionCounter}`

  const transaction: Transaction = {
    id: transactionId,
    buyer_id: buyerId,
    seller_id: sellerId,
    listing_id: listingId,
    amount,
    status: 'funds_secured', // Immediately mark as funds secured for mock
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockTransactions.set(transactionId, transaction)

  return { data: transaction, error: null }
}

export interface GetTransactionResult {
  data: Transaction | null
  error: string | null
}

export async function getTransaction(transactionId: string): Promise<GetTransactionResult> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const transaction = mockTransactions.get(transactionId)

  if (!transaction) {
    // Return a mock transaction for testing
    if (transactionId.startsWith('txn-')) {
      const mockTransaction: Transaction = {
        id: transactionId,
        buyer_id: 'user-buyer-1',
        seller_id: 'user-seller-1',
        listing_id: 'listing-1',
        amount: 1200,
        status: 'funds_secured',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockTransactions.set(transactionId, mockTransaction)
      return { data: mockTransaction, error: null }
    }
    return { data: null, error: 'Transaction not found' }
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
  await new Promise((resolve) => setTimeout(resolve, 500))

  const transaction = mockTransactions.get(transactionId)

  if (!transaction) {
    return { data: null, error: 'Transaction not found' }
  }

  transaction.status = status
  transaction.updated_at = new Date().toISOString()
  mockTransactions.set(transactionId, transaction)

  return { data: transaction, error: null }
}

export async function confirmShipping(transactionId: string): Promise<UpdateTransactionResult> {
  return updateTransactionStatus(transactionId, 'shipped')
}

export async function confirmReceipt(transactionId: string): Promise<UpdateTransactionResult> {
  return updateTransactionStatus(transactionId, 'completed')
}
