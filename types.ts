
export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

export enum TransactionSource {
  MANUAL = 'MANUAL',
  CSV_IMPORT = 'CSV_IMPORT',
  MAGIC_BOX = 'MAGIC_BOX'
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserOwnedEntity extends BaseEntity {
  userId: string;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  image?: string;
  passwordHash?: string;
  isAdmin: boolean;
}

export interface Account extends UserOwnedEntity {
  name: string;
  typeId: string;
  balance: number;
  thresholdValue: number;
  color: string;
  icon: string;
  groupId: string;
  sortOrder: number;
}

export interface Category extends UserOwnedEntity {
  name: string;
  type: 'EXPENSE' | 'INCOME';
  parentId?: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export interface Transaction extends UserOwnedEntity {
  date: string;
  amount: number;
  transactionType: TransactionType;
  fromAccountId?: string;
  toAccountId?: string;
  categoryId?: string;
  subCategoryId?: string;
  description: string;
  status: TransactionStatus;
  source: TransactionSource;
  currency: string;
  tags?: string;
}

export interface AccountType extends UserOwnedEntity {
  name: string;
  icon: string;
  isLiability: boolean;
}

export interface AccountGroup extends UserOwnedEntity {
  name: string;
  sortOrder: number;
}

export interface SyncStatus {
  lastSyncAt: string | null;
  status: 'synced' | 'syncing' | 'offline' | 'error';
  pendingCount: number;
}
