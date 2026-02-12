
import React from 'react';
import { Transaction, Category, Account } from '../types';
import { format } from 'date-fns';
import { ArrowLeftRight } from 'lucide-react';
import { TransactionCard } from './TransactionCard';

interface TransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, categories, accounts }) => {
  const groupedTransactions = transactions.reduce((acc, tx) => {
    const dateStr = format(new Date(tx.date), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <ArrowLeftRight className="w-16 h-16 mb-4 opacity-20" />
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {sortedDates.map(date => (
        <div key={date} className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">
              {format(new Date(date), 'MMM d, yyyy')}
            </h3>
            <span className="text-[10px] font-black text-slate-600 uppercase">
              {groupedTransactions[date].length} items
            </span>
          </div>
          
          <div className="space-y-2">
            {groupedTransactions[date].map((tx) => (
              <TransactionCard 
                key={tx.id} 
                tx={tx} 
                categories={categories} 
                accounts={accounts} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Transactions;
