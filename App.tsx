
import React, { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDefaultData } from './db';
import { 
  Transaction, TransactionType, Account, Category, 
  AccountType, SyncStatus, TransactionStatus 
} from './types';
import Layout from './components/Layout';
import Transactions from './components/Transactions';
import Accounts from './components/Accounts';
import Stats from './components/Stats';
import { Settings } from './components/Settings';
import { AddTransactionModal } from './components/AddTransactionModal';
import { v4 as uuidv4 } from 'uuid';
import { Toaster, toast } from 'react-hot-toast';

// v1.0 Launch: Local-only, no auth required. 
const LOCAL_USER = 'pwa-user';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Database Queries - always using LOCAL_USER for v1
  const transactions = useLiveQuery(() => 
    db.transactions.where('userId').equals(LOCAL_USER).toArray()
  ) || [];
  
  const accounts = useLiveQuery(() => 
    db.accounts.where('userId').equals(LOCAL_USER).toArray()
  ) || [];
  
  const categories = useLiveQuery(() => 
    db.categories.where('userId').equals(LOCAL_USER).toArray()
  ) || [];
  
  const accountTypes = useLiveQuery(() => 
    db.accountTypes.where('userId').equals(LOCAL_USER).toArray()
  ) || [];

  // Initial Seeding
  useEffect(() => {
    const init = async () => {
      const user = await db.users.get(LOCAL_USER);
      if (!user) {
        await db.users.add({
          id: LOCAL_USER,
          email: 'local@device.pwa',
          name: 'Local User',
          isAdmin: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        await seedDefaultData(LOCAL_USER);
      }
    };
    init();
  }, []);

  const handleAddTransaction = useCallback(async (txData: Partial<Transaction>) => {
    try {
      const newTx: Transaction = {
        id: uuidv4(),
        userId: LOCAL_USER,
        date: txData.date || new Date().toISOString(),
        amount: txData.amount || 0,
        transactionType: txData.transactionType || TransactionType.EXPENSE,
        description: txData.description || 'New Entry',
        status: txData.status || TransactionStatus.CONFIRMED,
        source: txData.source || 'MANUAL',
        currency: 'INR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...txData
      } as Transaction;

      await db.transactions.add(newTx);
      
      // Balance updates
      if (newTx.fromAccountId && (newTx.transactionType === TransactionType.EXPENSE || newTx.transactionType === TransactionType.TRANSFER)) {
        const acc = await db.accounts.get(newTx.fromAccountId);
        if (acc) {
          await db.accounts.update(acc.id, { balance: acc.balance - newTx.amount });
        }
      }
      if (newTx.toAccountId && (newTx.transactionType === TransactionType.INCOME || newTx.transactionType === TransactionType.TRANSFER)) {
        const acc = await db.accounts.get(newTx.toAccountId);
        if (acc) {
          await db.accounts.update(acc.id, { balance: acc.balance + newTx.amount });
        }
      }

      toast.success('Entry committed successfully');
    } catch (err) {
      toast.error('Failed to save entry');
      console.error(err);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'transactions':
        return <Transactions transactions={transactions} categories={categories} accounts={accounts} />;
      case 'accounts':
        return <Accounts accounts={accounts} accountTypes={accountTypes} />;
      case 'stats':
        return <Stats transactions={transactions} categories={categories} />;
      case 'settings':
        return <Settings onLogout={() => toast('Logout coming in v2.0!')} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }
        }}
      />
      
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        syncStatus={{
          lastSyncAt: null,
          status: 'offline',
          pendingCount: 0
        }}
        onAddClick={() => setIsAddModalOpen(true)}
      >
        {renderContent()}
      </Layout>

      {isAddModalOpen && (
        <AddTransactionModal 
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddTransaction}
          categories={categories}
          accounts={accounts}
        />
      )}
    </>
  );
};

export default App;
