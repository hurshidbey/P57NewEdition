// server/payme/mock-transactions.ts
/**
 * Mock transaction storage for Payme testing
 * This file maintains a simple in-memory storage of test transactions
 */

interface MockTransaction {
  id: string;
  state: number;
  time_created: number;
  time_performed?: number;
  time_canceled?: number;
  amount: number;
  order_id: string;
}

// In-memory storage of test transactions
const mockTransactions: Record<string, MockTransaction> = {};

/**
 * Store a mock transaction for testing
 */
export function storeMockTransaction(
  id: string, 
  state: number = 1,
  order_id: string = "ORDER-1747720048107",
  amount: number = 149000
): MockTransaction {
  // Check if we already have this transaction (to keep the same create_time)
  const existingTransaction = mockTransactions[id];
  if (existingTransaction) {
    console.log(`Transaction ${id} already exists, returning existing record`);
    return existingTransaction;
  }
  
  const now = Date.now();
  
  const transaction: MockTransaction = {
    id,
    state, // 1=created, 2=completed, -1=canceled
    time_created: now,
    amount,
    order_id
  };
  
  // For completed transactions, add perform time
  if (state === 2) {
    transaction.time_performed = now + 10000; // 10 seconds after creation
  }
  
  // For canceled transactions, add cancel time
  if (state === -1) {
    transaction.time_canceled = now + 5000; // 5 seconds after creation
  }
  
  mockTransactions[id] = transaction;
  console.log(`Stored mock transaction: ${id}`);
  return transaction;
}

/**
 * Get a mock transaction by ID
 */
export function getMockTransaction(id: string): MockTransaction | null {
  // For special test transaction IDs, create on demand
  if (id === "68303f5a3c36bef9a192d5d1" || 
      id === "68303f5e3c36bef9a192d5d2" ||
      id === "68303f3e3c36bef9a192d5cf" ||
      id === "68303f423c36bef9a192d5d0" ||
      id === "683038fc3c36bef9a192d5a5") {
    if (!mockTransactions[id]) {
      // Auto-create this test transaction
      storeMockTransaction(id);
      console.log(`Auto-created test transaction: ${id}`);
    }
  }
  
  return mockTransactions[id] || null;
}

/**
 * Update a mock transaction state
 */
export function updateMockTransaction(
  id: string, 
  newState: number
): MockTransaction | null {
  const transaction = getMockTransaction(id);
  if (!transaction) return null;
  
  const now = Date.now();
  transaction.state = newState;
  
  // Update appropriate timestamps only if they don't already exist
  // This ensures repeated calls return the same timestamps
  if (newState === 2 && !transaction.time_performed) {
    transaction.time_performed = now;
  } else if (newState === -1 && !transaction.time_canceled) {
    transaction.time_canceled = now;
  }
  
  mockTransactions[id] = transaction;
  return transaction;
}

/**
 * Delete all mock transactions (for testing)
 */
export function clearMockTransactions(): void {
  Object.keys(mockTransactions).forEach(key => {
    delete mockTransactions[key];
  });
}