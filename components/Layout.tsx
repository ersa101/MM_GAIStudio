
import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  BarChart3, 
  Settings, 
  Cloud, 
  CloudOff,
  Plus
} from 'lucide-react';
import { SyncStatus } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  syncStatus: SyncStatus;
  onAddClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, syncStatus, onAddClick }) => {
  const tabs = [
    { id: 'transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { id: 'accounts', icon: Wallet, label: 'Accounts' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-slate-900 overflow-hidden relative shadow-2xl border-x border-slate-800">
      {/* Top Header */}
      <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Money Mngr</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-full border border-slate-700">
            {syncStatus.status === 'synced' ? (
              <Cloud className="w-4 h-4 text-emerald-400" />
            ) : (
              <CloudOff className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-xs font-medium text-slate-300">
              {syncStatus.status === 'synced' ? 'Synced' : 'Offline'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
            <img src="https://picsum.photos/32/32" alt="Avatar" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={onAddClick}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg shadow-purple-900/40 flex items-center justify-center transform active:scale-95 transition-all"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 px-6 py-3 safe-bottom z-20">
        <div className="flex justify-between items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id ? 'text-purple-500' : 'text-slate-500'
              }`}
            >
              <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] font-medium uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
