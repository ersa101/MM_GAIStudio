
import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Transaction, TransactionType, Category } from '../types';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

interface StatsProps {
  transactions: Transaction[];
  categories: Category[];
}

const Stats: React.FC<StatsProps> = ({ transactions, categories }) => {
  const chartData = useMemo(() => {
    // Last 7 days balance trend calculation
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const start = startOfDay(date);
      const end = endOfDay(date);
      
      const dayTxs = transactions.filter(tx => 
        isWithinInterval(new Date(tx.date), { start, end })
      );

      const net = dayTxs.reduce((acc, tx) => {
        if (tx.transactionType === TransactionType.INCOME) return acc + tx.amount;
        if (tx.transactionType === TransactionType.EXPENSE) return acc - tx.amount;
        return acc;
      }, 0);

      return { 
        name: format(date, 'MMM dd'), 
        amount: net,
        fullDate: date
      };
    }).reverse();

    return days;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(tx => tx.transactionType === TransactionType.EXPENSE);
    const totals: Record<string, number> = {};
    
    expenses.forEach(tx => {
      const cat = categories.find(c => c.id === tx.categoryId);
      const name = cat?.name || 'Other';
      totals[name] = (totals[name] || 0) + tx.amount;
    });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthTxs = transactions.filter(tx => 
      new Date(tx.date).getMonth() === now.getMonth() &&
      new Date(tx.date).getFullYear() === now.getFullYear()
    );

    const income = currentMonthTxs
      .filter(tx => tx.transactionType === TransactionType.INCOME)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expense = currentMonthTxs
      .filter(tx => tx.transactionType === TransactionType.EXPENSE)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

    return { income, expense, savingsRate };
  }, [transactions]);

  const COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#6366f1'];

  return (
    <div className="p-4 space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/50 shadow-lg">
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Monthly Spent</p>
          <p className="text-2xl font-black text-rose-400">₹{stats.expense.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700/50 shadow-lg">
          <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Savings Rate</p>
          <p className="text-2xl font-black text-emerald-400">{stats.savingsRate}%</p>
        </div>
      </div>

      {/* Net Trend */}
      <div className="bg-slate-800/80 p-6 rounded-[2rem] border border-slate-700/50 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-black text-white uppercase tracking-widest text-xs">Activity (7 Days)</h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Net Daily Change</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-slate-800/80 p-6 rounded-[2rem] border border-slate-700/50 shadow-xl">
        <h3 className="font-black text-white uppercase tracking-widest text-xs mb-8">Top Spending</h3>
        {categoryData.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full mt-4">
              {categoryData.slice(0, 4).map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-2xl border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">{cat.name}</span>
                  </div>
                  <span className="text-sm font-black text-white">₹{cat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 text-xs font-bold uppercase tracking-widest opacity-30">No Expense History</div>
        )}
      </div>
    </div>
  );
};

export default Stats;
