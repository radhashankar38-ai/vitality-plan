import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import Background from './components/Background';
import Navigation from './components/Navigation';
import Onboarding from './components/Onboarding';
import PlanResult from './components/PlanResult';
import Dashboard from './components/Dashboard';
import { initAuth } from './lib/auth';

export default function App() {
  useEffect(() => {
    initAuth();
  }, []);

  const [currentView, setCurrentView] = useState<'plan' | 'dashboard'>('plan');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleGeneratePlan = async (formData: any) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }
      
      setResult(data);
      
      if (data.bmi) {
        const history = JSON.parse(localStorage.getItem('bmi_history') || '[]');
        const newRecord = {
          date: new Date().toISOString().split('T')[0],
          bmi: data.bmi,
          timestamp: Date.now()
        };
        localStorage.setItem('bmi_history', JSON.stringify([...history, newRecord]));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-300 font-sans flex flex-col overflow-x-hidden relative selection:bg-emerald-500/30 selection:text-emerald-200">
      <Background />
      
      <header className="fixed top-0 left-0 w-full z-40 p-6 pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center pointer-events-auto">
              <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-display font-black tracking-tight text-white uppercase">AURA</h1>
              <p className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">Biometric Intelligence</p>
            </div>
          </div>
        </div>
      </header>

      <Navigation currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1 w-full flex flex-col relative z-10 p-4 lg:p-8">
        <AnimatePresence mode="wait">
          {currentView === 'plan' ? (
            !result ? (
              <Onboarding onSubmit={handleGeneratePlan} loading={loading} />
            ) : (
              <PlanResult data={result} onReset={resetForm} />
            )
          ) : (
            <Dashboard />
          )}
        </AnimatePresence>

        {/* Error overlay */}
        <AnimatePresence>
          {error && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white px-6 py-3 rounded-full shadow-[0_0_40px_-10px_rgba(244,63,94,0.8)] font-bold flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
