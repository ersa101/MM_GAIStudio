
import React, { useMemo } from 'react';
import { Transaction, TransactionType, TransactionSource, Account, Category } from '../types';
import { format } from 'date-fns';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreVertical, 
  Pencil, 
  Trash2,
  Zap,
  FileSpreadsheet,
  User
} from 'lucide-react';

interface TransactionCardProps {
  tx: Transaction;
  categories: Category[];
  accounts: Account[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ 
  tx, 
  categories, 
  accounts,
  onEdit,
  onDelete
}) => {
  const getCategory = (id?: string) => categories.find(c => c.id === id);
  const getAccount = (id?: string) => accounts.find(a => a.id === id);

  const isTransfer = tx.transactionType === TransactionType.TRANSFER;
  const isExpense = tx.transactionType === TransactionType.EXPENSE;
  const isIncome = tx.transactionType === TransactionType.INCOME;

  const category = getCategory(tx.categoryId);
  const fromAcc = getAccount(tx.fromAccountId);
  const toAcc = getAccount(tx.toAccountId);

  const sourceConfig = useMemo(() => {
    switch (tx.source) {
      case TransactionSource.MAGIC_BOX:
        return { 
          label: 'Magic Box', 
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: Zap 
        };
      case TransactionSource.CSV_IMPORT:
        return { 
          label: 'CSV Import', 
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: FileSpreadsheet 
        };
      default:
        return { 
          label: 'Manual', 
          color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          icon: User 
        };
    }
  }, [tx.source]);

  const SourceBadge = () => (
    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider ${sourceConfig.color}`}>
      <sourceConfig.icon className="w-2.5 h-2.5" />
      {sourceConfig.label}
    </span>
  );

  if (isTransfer) {
    return (
      <div className="bg-slate-800 rounded-2xl p-4 border-l-4 border-blue-500 hover:bg-slate-750 transition-colors shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              TRANSFER
            </span>
            <SourceBadge />
            <span className="text-slate-500 text-[10px] font-bold uppercase">
              {format(new Date(tx.date), 'MMM d • hh:mm a')}
            </span>
          </div>
          
          <button className="p-1 hover:bg-slate-700 rounded text-slate-500">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 my-3">
          <div className="flex-1 text-center p-2 rounded-xl bg-slate-700/30 min-w-0">
            <div className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mb-1">From</div>
            <div className="font-bold text-slate-100 truncate text-xs">
              {fromAcc?.name || 'Unknown'}
            </div>
          </div>

          <div className="flex flex-col items-center px-1">
            <div className="text-sm font-black text-blue-400">
              ₹{tx.amount.toLocaleString()}
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400/50" />
          </div>

          <div className="flex-1 text-center p-2 rounded-xl bg-slate-700/30 min-w-0">
            <div className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mb-1">To</div>
            <div className="font-bold text-slate-100 truncate text-xs">
              {toAcc?.name || 'Unknown'}
            </div>
          </div>
        </div>

        {tx.description && (
          <p className="text-[11px] text-slate-500 mt-2 truncate italic">
            "{tx.description}"
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-slate-800 rounded-2xl p-4 border-l-4 hover:bg-slate-750 transition-colors shadow-lg ${
      isExpense ? 'border-rose-500' : 'border-emerald-500'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-xl shrink-0 ${
            isExpense ? 'bg-rose-500/10' : 'bg-emerald-500/10'
          }`}>
            {isExpense ? (
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
            ) : (
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xl mr-1">{category?.icon}</span>
                <span className="font-bold text-slate-100 truncate text-sm">
                  {category?.name || 'Uncategorized'}
                </span>
              </div>
              <SourceBadge />
            </div>
            
            {tx.description && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {tx.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
              <span>{format(new Date(tx.date), 'MMM d • hh:mm a')}</span>
              <span>•</span>
              <span className="truncate max-w-[80px]">{isExpense ? fromAcc?.name : toAcc?.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-1 ml-2 shrink-0">
          <div className={`text-right font-black text-sm ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isExpense ? '-' : '+'}₹{tx.amount.toLocaleString()}
          </div>
          
          <button className="p-1 hover:bg-slate-700 rounded text-slate-500">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
