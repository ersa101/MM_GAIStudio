
import React, { useState } from 'react';
import { Wallet, LogIn, UserPlus, Mail, Lock, User as UserIcon, Chrome } from 'lucide-react';

interface AuthProps {
  onLogin: (email: string) => void;
}

export const LoginPage: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onLogin(email);
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-slate-900 overflow-hidden items-center justify-center p-8">
      <div className="w-20 h-20 bg-purple-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-purple-900/50 mb-8 animate-bounce">
        <Wallet className="w-10 h-10 text-white" />
      </div>

      <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Money Mngr</h1>
      <p className="text-slate-500 text-sm mb-12 font-medium uppercase tracking-[0.2em]">Privacy First Finance</p>

      <div className="w-full space-y-4">
        <button 
          onClick={() => onLogin('google-user@gmail.com')}
          className="w-full bg-white text-slate-900 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-slate-100 transition-all active:scale-[0.98]"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Or with email</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-xl shadow-purple-900/40 hover:bg-purple-700 transition-all mt-4"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button 
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-center text-slate-500 text-xs font-bold uppercase tracking-widest py-4 hover:text-purple-400 transition-colors"
        >
          {isRegister ? 'Already have an account? Login' : 'New here? Register now'}
        </button>
      </div>
    </div>
  );
};
