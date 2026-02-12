
import React from 'react';
import { Account, AccountType } from '../types';
import { Wallet, AlertCircle } from 'lucide-react';

interface AccountsProps {
  accounts: Account[];
  accountTypes: AccountType[];
}

const Accounts: React.FC<AccountsProps> = ({ accounts, accountTypes }) => {
  const getAccountType = (id: string) => accountTypes.find(t => t.id === id);

  const totalBalance = accounts.reduce((sum, acc) => {
    const type = getAccountType(acc.typeId);
    return type?.isLiability ? sum - acc.balance : sum + acc.balance;
  }, 0);

  return (
    <div className="p-4 space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-purple-900/20">
        <p className="text-purple-100 text-sm font-medium uppercase tracking-widest mb-1">Total Net Worth</p>
        <h2 className="text-4xl font-black text-white">₹{totalBalance.toLocaleString()}</h2>
        <div className="mt-4 flex gap-4">
          <div className="bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
            <p className="text-[10px] text-purple-200 uppercase font-bold">Accounts</p>
            <p className="text-lg font-bold text-white">{accounts.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {accounts.map(acc => {
          const type = getAccountType(acc.typeId);
          const spendable = acc.balance - acc.thresholdValue;
          const progress = Math.max(0, Math.min(100, (acc.balance / (acc.thresholdValue * 2)) * 100));

          return (
            <div key={acc.id} className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 hover:border-purple-500/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner"
                    style={{ backgroundColor: acc.color + '20' }}
                  >
                    {acc.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">{acc.name}</h3>
                    <p className="text-xs text-slate-500">{type?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-100">₹{acc.balance.toLocaleString()}</p>
                  {acc.balance < acc.thresholdValue && (
                    <p className="text-[10px] text-rose-400 font-bold uppercase flex items-center justify-end gap-1">
                      <AlertCircle className="w-3 h-3" /> Low Balance
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-tighter">
                  <span>Spendable: ₹{spendable.toLocaleString()}</span>
                  <span>Safety: ₹{acc.thresholdValue.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      acc.balance < acc.thresholdValue ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Accounts;
