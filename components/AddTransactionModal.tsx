
import React, { useState, useMemo } from 'react';
import { 
  X, 
  PenLine, 
  Sparkles, 
  Zap, 
  Loader2, 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Check,
  Clipboard,
  Timer,
  PlusCircle,
  Tag
} from 'lucide-react';
import { Transaction, TransactionType, TransactionStatus, TransactionSource, Category, Account } from '../types';
import { parseSMS } from '../lib/sms-parser';
import { llmService } from '../lib/llmService';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';

const LOCAL_USER = 'pwa-user';

interface AddTransactionModalProps {
  onClose: () => void;
  onAdd: (tx: Partial<Transaction>) => void;
  categories: Category[];
  accounts: Account[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onAdd, categories, accounts }) => {
  const [entryMode, setEntryMode] = useState<'manual' | 'magicbox'>('manual');
  
  // Unified State
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));

  // Magic Box State
  const [smsText, setSmsText] = useState('');
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [parseSource, setParseSource] = useState<'manual' | 'regex' | 'ai'>('manual');
  const [suggestedCategoryName, setSuggestedCategoryName] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (transactionType === TransactionType.TRANSFER) return [];
    return categories.filter(c => c.type === (transactionType as any));
  }, [categories, transactionType]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSmsText(text);
      handleParseRegex(text);
    } catch (err) {
      toast.error('Clipboard access denied');
    }
  };

  const handleParseRegex = (text: string) => {
    if (!text.trim()) return;
    const result = parseSMS(text);
    if (result) {
      applyParsedData(result, 'regex');
    }
  };

  const handleParseAI = async () => {
    if (!smsText.trim()) return;
    setIsParsingAI(true);
    try {
      const suggestion = await llmService.getSuggestion(smsText);
      applyParsedData(suggestion, 'ai');
      if (suggestion.confidence >= 80) {
        toast.success('AI parsed successfully!');
      }
    } catch (error) {
      toast.error('AI suggestion failed');
    } finally {
      setIsParsingAI(false);
    }
  };

  const applyParsedData = (data: any, source: 'regex' | 'ai') => {
    if (data.amount) setAmount(data.amount.toString());
    if (data.type) setTransactionType(data.type);
    if (data.merchant || data.bankName) {
      setDescription(`Magic: ${data.bankName} ${data.merchant || ''}`.trim());
    }
    setParseSource(source);
    setSuggestedCategoryName(null);
    
    // Auto-select category if AI provided one
    if (data.category) {
      const cat = categories.find(c => 
        c.type === (data.type || transactionType) && 
        c.name.toLowerCase().includes(data.category.toLowerCase())
      );
      if (cat) {
        setCategoryId(cat.id);
      } else {
        setSuggestedCategoryName(data.category);
        setCategoryId(''); // Reset so user sees the "create" option
      }
    }
  };

  const handleCreateSuggestedCategory = async () => {
    if (!suggestedCategoryName) return;
    
    const newCat: Category = {
      id: uuidv4(),
      userId: LOCAL_USER,
      name: suggestedCategoryName,
      type: (transactionType as any) === 'TRANSFER' ? 'EXPENSE' : (transactionType as any),
      icon: '🏷️',
      color: '#7c3aed',
      sortOrder: categories.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.categories.add(newCat);
      setCategoryId(newCat.id);
      setSuggestedCategoryName(null);
      toast.success(`Created category "${suggestedCategoryName}"`);
    } catch (err) {
      toast.error('Failed to create category');
    }
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    
    onAdd({
      amount: parseFloat(amount),
      transactionType,
      description,
      fromAccountId: (transactionType === TransactionType.EXPENSE || transactionType === TransactionType.TRANSFER) ? fromAccountId : undefined,
      toAccountId: (transactionType === TransactionType.INCOME || transactionType === TransactionType.TRANSFER) ? toAccountId : undefined,
      categoryId: transactionType !== TransactionType.TRANSFER ? categoryId : undefined,
      status: parseSource === 'manual' ? TransactionStatus.CONFIRMED : TransactionStatus.PENDING,
      source: parseSource === 'ai' || parseSource === 'regex' ? TransactionSource.MAGIC_BOX : TransactionSource.MANUAL,
      date: new Date(date).toISOString(),
      currency: 'INR'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:items-center">
      <div className="w-full max-w-lg bg-slate-900 rounded-t-[40px] sm:rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-white">Entry Center</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">v1.0 Official Launch</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex p-4 gap-2 shrink-0">
          <button
            onClick={() => setEntryMode('manual')}
            className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all border ${
              entryMode === 'manual' 
                ? 'bg-purple-600 text-white border-purple-500 shadow-xl shadow-purple-900/30' 
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            <PenLine className="w-4 h-4" />
            Manual Entry
          </button>
          <button
            onClick={() => setEntryMode('magicbox')}
            className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all border ${
              entryMode === 'magicbox' 
                ? 'bg-purple-600 text-white border-purple-500 shadow-xl shadow-purple-900/30' 
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Magic Box
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* SMS Parsing Section (Visible only in Magic Box mode) */}
          {entryMode === 'magicbox' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="relative">
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  placeholder="Paste bank SMS text here..."
                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all resize-none text-xs font-medium"
                />
                <button 
                  onClick={handlePaste}
                  className="absolute bottom-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleParseAI}
                disabled={!smsText.trim() || isParsingAI}
                className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-30"
              >
                {isParsingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Trigger AI Parser
              </button>
              {parseSource !== 'manual' && (
                <div className="flex items-center gap-2 px-1">
                  <Check className="w-3 h-3 text-emerald-500" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    Parsed via {parseSource === 'ai' ? 'Gemini AI' : 'Regex Patterns'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-2">
            {Object.values(TransactionType).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTransactionType(t);
                  setCategoryId('');
                  setSuggestedCategoryName(null);
                }}
                className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  transactionType === t 
                    ? 'bg-slate-700 border-purple-500 text-white shadow-lg' 
                    : 'bg-slate-800/50 border-slate-800 text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Value (INR)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-black text-xl">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 pl-10 text-3xl font-black text-white placeholder:text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              />
            </div>
          </div>

          {/* Category Section with Suggested Category */}
          {transactionType !== TransactionType.TRANSFER && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account</label>
                  <select
                    value={transactionType === TransactionType.INCOME ? toAccountId : fromAccountId}
                    onChange={(e) => transactionType === TransactionType.INCOME ? setToAccountId(e.target.value) : setFromAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-xs font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-purple-600"
                  >
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      if (e.target.value) setSuggestedCategoryName(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-xs font-bold appearance-none focus:outline-none focus:ring-1 focus:ring-purple-600"
                  >
                    <option value="" disabled>Select</option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Suggestion Banner */}
              {suggestedCategoryName && (
                <div className="animate-in fade-in slide-in-from-bottom-2 bg-purple-600/10 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-purple-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">New Suggestion</p>
                      <p className="text-sm font-bold text-white truncate">Create "{suggestedCategoryName}"?</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateSuggestedCategory}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-900/40"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Transfer Visualization */}
          {transactionType === TransactionType.TRANSFER && (
            <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800/50 flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">From</label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs font-bold appearance-none focus:outline-none"
                >
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>)}
                </select>
              </div>
              <RefreshCw className="w-5 h-5 text-purple-500 shrink-0 mt-4 animate-spin-slow" />
              <div className="flex-1 space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">To</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs font-bold appearance-none focus:outline-none"
                >
                  <option value="" disabled>Target</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Note Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description / Note</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-purple-600 transition-all"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleSave}
            className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-[2rem] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-purple-900/40 mt-4 active:scale-[0.98]"
          >
            Commit Entry
          </button>
        </div>
      </div>
    </div>
  );
};
