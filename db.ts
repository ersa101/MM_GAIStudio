
import { Dexie, type Table } from 'dexie';
import { 
  User, Account, Category, Transaction, 
  AccountType, AccountGroup, TransactionType,
  TransactionStatus, TransactionSource 
} from './types';

// Use named import for Dexie class to resolve TypeScript inheritance issues
export class MoneyMngrDB extends Dexie {
  users!: Table<User>;
  accounts!: Table<Account>;
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  accountTypes!: Table<AccountType>;
  accountGroups!: Table<AccountGroup>;

  constructor() {
    super('MoneyMngrDB');
    // Fix: Explicitly cast 'this' to any to access the 'version' method which may be obscured by type inheritance issues in some environments
    (this as any).version(1).stores({
      users: 'id, email',
      accounts: 'id, userId, typeId, groupId',
      categories: 'id, userId, type, parentId',
      transactions: 'id, userId, date, transactionType, categoryId, fromAccountId, toAccountId',
      accountTypes: 'id, userId',
      accountGroups: 'id, userId'
    });
  }
}

export const db = new MoneyMngrDB();

// Seeder function for first-time setup
export async function seedDefaultData(userId: string) {
  const accountTypes = [
    { id: 'at-1', userId, name: 'Bank', icon: '🏦', isLiability: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'at-2', userId, name: 'Cash', icon: '💵', isLiability: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'at-3', userId, name: 'Wallet', icon: '👛', isLiability: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'at-4', userId, name: 'Credit Card', icon: '💳', isLiability: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const categories = [
    { id: 'c-1', userId, name: 'Food', type: 'EXPENSE', icon: '🍔', color: '#ef4444', sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'c-2', userId, name: 'Transport', type: 'EXPENSE', icon: '🚗', color: '#3b82f6', sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'c-3', userId, name: 'Salary', type: 'INCOME', icon: '💰', color: '#10b981', sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  const groups = [
    { id: 'g-1', userId, name: 'Primary', sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];

  await db.accountTypes.bulkAdd(accountTypes);
  await db.categories.bulkAdd(categories as Category[]);
  await db.accountGroups.bulkAdd(groups);
  
  // Create a default account
  await db.accounts.add({
    id: 'acc-1',
    userId,
    name: 'Main Bank',
    typeId: 'at-1',
    balance: 5000,
    thresholdValue: 500,
    color: '#7c3aed',
    icon: '🏦',
    groupId: 'g-1',
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}
