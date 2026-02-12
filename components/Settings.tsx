
import React from 'react';
import { Database, ChevronRight, Github, Info, ShieldCheck, Zap } from 'lucide-react';

interface SettingsProps {
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = () => {
  const sections = [
    {
      title: 'Local Security',
      description: 'Your data is stored 100% locally on this device. No cloud sync is active in v1.0.',
      icon: ShieldCheck,
      component: (
        <div className="mt-4 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest text-center">Privacy Verified</p>
        </div>
      )
    },
    {
      title: 'Preferences',
      description: 'Manage categories and application behavior.',
      icon: Database,
      component: (
        <div className="space-y-2 mt-4">
          <button className="w-full bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center group">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Manage Categories</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-500 transition-colors" />
          </button>
          <button className="w-full bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center group">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Currency Settings</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-500 transition-colors" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header Profile */}
      <div className="bg-slate-800/40 p-6 rounded-[2.5rem] border border-slate-800 flex items-center gap-4 shadow-xl">
        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-purple-600 to-indigo-600 border-2 border-white/10 flex items-center justify-center text-3xl shadow-lg">
          🏠
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Device Instance</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Local-Only Node</p>
        </div>
      </div>

      {sections.map(section => (
        <div key={section.title} className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800/50 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-800 rounded-xl">
              <section.icon className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="font-black text-white uppercase tracking-widest text-[10px]">{section.title}</h3>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">{section.description}</p>
          {section.component}
        </div>
      ))}

      {/* App Info */}
      <div className="pt-8 space-y-3 px-2">
        <div className="flex items-center gap-2 text-slate-700">
          <Zap className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Offline-Ready PWA</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <Github className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Money Mngr v1.0.0</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <Info className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
};
