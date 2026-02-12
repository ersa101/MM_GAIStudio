
import React, { useState, useEffect } from 'react';
import { Clipboard, Wand2, Timer, CheckCircle2, Loader2, Sparkles, XCircle } from 'lucide-react';
import { parseSMS, ParsedSMS } from '../lib/sms-parser';
import { TransactionType, TransactionStatus, TransactionSource, Transaction } from '../types';
import { llmService } from '../lib/llmService';
import { toast } from 'react-hot-toast';

interface MagicBoxProps {
  onAddTransaction: (tx: Partial<Transaction>) => void;
  onCancel?: () => void;
}

const MagicBox: React.FC<MagicBoxProps> = ({ onAddTransaction, onCancel }) => {
  const [smsText, setSmsText] = useState('');
  const [parsed, setParsed] = useState<ParsedSMS | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSmsText(text);
      processTextLocally(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const processTextLocally = (text: string) => {
    if (!text.trim()) {
      setParsed(null);
      setCountdown(null);
      return;
    }
    const result = parseSMS(text);
    if (result) {
      setParsed(result);
    } else {
      setParsed(null);
    }
  };

  const handleFetchAISuggestion = async () => {
    if (!smsText.trim()) return;
    setAiLoading(true);
    setCountdown(null);

    try {
      const suggestion = await llmService.getSuggestion(smsText);
      setParsed(suggestion);
      
      if (suggestion.confidence >= 80) {
        setCountdown(3);
        toast.success('AI found a strong match!');
      }
    } catch (error) {
      toast.error('AI suggestion failed. Try manual entry.');
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      submitTransaction();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const submitTransaction = () => {
    if (!parsed) return;
    
    onAddTransaction({
      amount: parsed.amount,
      date: new Date().toISOString(),
      transactionType: parsed.type,
      description: `Magic: ${parsed.bankName} ${parsed.merchant || ''}`.trim(),
      status: TransactionStatus.PENDING,
      source: TransactionSource.MAGIC_BOX,
      currency: 'INR'
    });
    
    reset();
  };

  const reset = () => {
    setSmsText('');
    setParsed(null);
    setCountdown(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-3xl p-5 border border-slate-700 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Magic Box</h2>
              <p className="text-xs text-slate-400 tracking-tight">Paste SMS and let AI handle the rest</p>
            </div>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="p-2 text-slate-500 hover:text-slate-100 transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="relative">
          <textarea
            value={smsText}
            onChange={(e) => {
              setSmsText(e.target.value);
              processTextLocally(e.target.value);
            }}
            placeholder="e.g. HDFC Bank: Rs.500.00 debited from A/c XX1234..."
            className="w-full h-28 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all resize-none text-sm"
          />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button 
              onClick={handlePaste}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-700 transition-colors"
              title="Paste from clipboard"
            >
              <Clipboard className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleFetchAISuggestion}
            disabled={!smsText.trim() || aiLoading}
            className="flex-1 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 font-bold text-xs rounded-xl uppercase tracking-widest transition-all border border-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Use AI Suggestions
          </button>
        </div>

        {parsed && (
          <div className="mt-6 animate-in slide-in-from-top-4 duration-300">
            <div className={`p-5 rounded-2xl border ${
              countdown !== null ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-emerald-600/10 border-emerald-500/30'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Extracted</p>
                  <p className="text-2xl font-black text-white">₹{parsed.amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Type</p>
                  <p className={`font-black ${parsed.type === TransactionType.EXPENSE ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {parsed.type}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] px-2 py-0.5 bg-slate-900/50 rounded-full border border-slate-700 text-slate-300 font-black uppercase tracking-tighter">
                  {parsed.bankName}
                </span>
                {parsed.accountLast4 && (
                  <span className="text-[10px] px-2 py-0.5 bg-slate-900/50 rounded-full border border-slate-700 text-slate-300 font-black uppercase tracking-tighter">
                    A/c **{parsed.accountLast4}
                  </span>
                )}
                {parsed.merchant && (
                  <span className="text-[10px] px-2 py-0.5 bg-purple-900/40 rounded-full border border-purple-700/50 text-purple-200 font-black uppercase tracking-tighter">
                    {parsed.merchant}
                  </span>
                )}
              </div>

              {countdown !== null ? (
                <div className="flex items-center justify-between pt-2 border-t border-indigo-500/20">
                  <div className="flex items-center gap-2 text-indigo-400 font-black">
                    <Timer className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] uppercase tracking-widest">Saving in {countdown}s...</span>
                  </div>
                  <button 
                    onClick={() => setCountdown(null)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black rounded-full uppercase tracking-widest transition-colors"
                  >
                    Hold
                  </button>
                </div>
              ) : (
                <button 
                  onClick={submitTransaction}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Approve Entry
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MagicBox;
