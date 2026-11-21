import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, FileText, Activity } from 'lucide-react';

interface NavigationProps {
  currentView: 'plan' | 'dashboard';
  setCurrentView: (view: 'plan' | 'dashboard') => void;
}

export default function Navigation({ currentView, setCurrentView }: NavigationProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="flex items-center gap-2 p-2 rounded-full glass-panel border-white/5 bg-slate-950/60 shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <button
          onClick={() => setCurrentView('plan')}
          className={`relative px-6 py-3 rounded-full text-sm font-bold font-display flex items-center gap-2 transition-colors ${
            currentView === 'plan' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {currentView === 'plan' && (
            <motion.div
              layoutId="nav-pill"
              className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <FileText className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Architect</span>
        </button>

        <button
          onClick={() => setCurrentView('dashboard')}
          className={`relative px-6 py-3 rounded-full text-sm font-bold font-display flex items-center gap-2 transition-colors ${
            currentView === 'dashboard' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {currentView === 'dashboard' && (
            <motion.div
              layoutId="nav-pill"
              className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <Activity className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Telemetry</span>
        </button>
      </div>
    </motion.div>
  );
}
