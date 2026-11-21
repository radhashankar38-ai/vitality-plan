import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Activity, ArrowRight, Zap, Target, CheckCircle2, ListTodo, Loader2, Lightbulb } from 'lucide-react';
import { googleSignIn, getAccessToken } from '../lib/auth';

interface PlanResultProps {
  data: any;
  onReset: () => void;
}

export default function PlanResult({ data, onReset }: PlanResultProps) {
  const planData = data.plan || data;
  const { bmiCategory = "Unknown", dietPlan = { summary: "", breakfast: "", lunch: "", dinner: "", snacks: "" }, exercisePlan = { summary: "", routine: [] } } = planData || {};

  const [savingTasks, setSavingTasks] = useState(false);
  const [tasksSaved, setTasksSaved] = useState(false);
  const [taskError, setTaskError] = useState('');

  const saveToGoogleTasks = async () => {
    const confirmed = window.confirm(`Are you sure you want to create ${(exercisePlan?.routine || []).length} task(s) in Google Tasks?`);
    if (!confirmed) return;

    setSavingTasks(true);
    setTaskError('');
    try {
      let token = await getAccessToken();
      if (!token) {
        const authResult = await googleSignIn();
        token = authResult?.accessToken || null;
      }

      if (!token) {
        throw new Error("Failed to authenticate with Google.");
      }

      // Create tasks for each day
      const days = exercisePlan?.routine || [];
      
      for (const day of days) {
        const title = `Aura Workout: ${day.day}`;
        const notes = (day.exercises || []).join('\n');
        
        const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title,
            notes
          })
        });

        if (!res.ok) {
          throw new Error('Failed to create task');
        }
      }
      
      setTasksSaved(true);
      setTimeout(() => setTasksSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      setTaskError(err.message || "Failed to save tasks");
      setTimeout(() => setTaskError(''), 4000);
    } finally {
      setSavingTasks(false);
    }
  };

  const [savingKeep, setSavingKeep] = useState(false);
  const [keepSaved, setKeepSaved] = useState(false);
  const [keepError, setKeepError] = useState('');

  const saveToGoogleKeep = async () => {
    const confirmed = window.confirm(`Are you sure you want to create a new note in Google Keep?`);
    if (!confirmed) return;

    setSavingKeep(true);
    setKeepError('');
    try {
      let token = await getAccessToken();
      if (!token) {
        const authResult = await googleSignIn();
        token = authResult?.accessToken || null;
      }
      if (!token) {
        throw new Error("Failed to authenticate with Google.");
      }

      const text = `${dietPlan.summary}\n\nPhase 1: Breakfast\n${dietPlan.breakfast}\n\nPhase 2: Lunch\n${dietPlan.lunch}\n\nPhase 3: Dinner\n${dietPlan.dinner}\n\nSupport: Snacks\n${dietPlan.snacks}`;

      const res = await fetch('https://keep.googleapis.com/v1/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Aura Nutritional Matrix',
          body: {
            text: {
              text: text
            }
          }
        })
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Keep API Error:", errBody);
        throw new Error('Failed to create Keep note');
      }

      setKeepSaved(true);
      setTimeout(() => setKeepSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      setKeepError(err.message || "Failed to save note");
      setTimeout(() => setKeepError(''), 4000);
    } finally {
      setSavingKeep(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 25 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
      className="w-full max-w-6xl mx-auto min-h-[80vh] flex flex-col justify-center pt-24 pb-32"
    >
      <motion.div variants={itemVariants} className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter text-white mb-4 drop-shadow-sm uppercase">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Protocol</span>
        </h2>
        <div className="flex items-center justify-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Status: Optimal</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        
        {/* Profile Card */}
        <motion.section 
          variants={itemVariants}
          className="md:col-span-4 glass-panel rounded-[2rem] p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-colors flex flex-col items-center justify-center text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent z-0 pointer-events-none" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">Physiological Profile</h3>
          
          <div className="relative w-32 h-32 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 mb-4">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
              <motion.circle 
                cx="64" cy="64" r="56" 
                stroke="currentColor" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray="352" 
                initial={{ strokeDashoffset: 352 }}
                animate={{ strokeDashoffset: 352 - (352 * 0.75) }} // Mock 75% fill
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-display font-black text-white tracking-widest uppercase mt-1">{bmiCategory}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider relative z-10">Baseline Established</p>
        </motion.section>

        {/* Nutritional Protocol */}
        <motion.section 
          variants={itemVariants}
          className="md:col-span-8 glass-panel rounded-[2rem] p-8 relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-6 right-6 z-20 hidden sm:block">
            <button 
              onClick={saveToGoogleKeep}
              disabled={savingKeep || keepSaved}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${keepSaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : keepError ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-sm backdrop-blur-md'}`}
            >
              {savingKeep ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing</>
              ) : keepSaved ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Saved to Keep</>
              ) : keepError ? (
                <span>{keepError}</span>
              ) : (
                <><Lightbulb className="w-3.5 h-3.5" /> Save to Keep</>
              )}
            </button>
          </div>
          
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10 w-full">
             <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <Zap className="w-4 h-4" /> Nutritional Matrix
             </h3>
             {/* Mobile button */}
             <div className="sm:hidden block">
               <button 
                 onClick={saveToGoogleKeep}
                 disabled={savingKeep || keepSaved}
                 className={`flex w-fit items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${keepSaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : keepError ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-sm'}`}
               >
                 {savingKeep ? (
                   <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing</>
                 ) : keepSaved ? (
                   <><CheckCircle2 className="w-3.5 h-3.5" /> Saved to Keep</>
                 ) : keepError ? (
                   <span>{keepError}</span>
                 ) : (
                   <><Lightbulb className="w-3.5 h-3.5" /> Save to Keep</>
                 )}
               </button>
             </div>
           </div>

           <p className="text-slate-300 font-medium leading-relaxed mb-8">{dietPlan.summary}</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
             <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 flex flex-col group hover:bg-slate-800/50 transition-colors">
               <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Phase 1: Breakfast</h4>
               <p className="text-sm text-slate-300 leading-relaxed">{dietPlan.breakfast}</p>
             </div>
             <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 flex flex-col group hover:bg-slate-800/50 transition-colors">
               <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Phase 2: Lunch</h4>
               <p className="text-sm text-slate-300 leading-relaxed">{dietPlan.lunch}</p>
             </div>
             <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 flex flex-col group hover:bg-slate-800/50 transition-colors">
               <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Phase 3: Dinner</h4>
               <p className="text-sm text-slate-300 leading-relaxed">{dietPlan.dinner}</p>
             </div>
             <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 flex flex-col group hover:bg-slate-800/50 transition-colors">
               <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Support: Snacks</h4>
               <p className="text-sm text-slate-300 leading-relaxed">{dietPlan.snacks}</p>
             </div>
           </div>
        </motion.section>

        {/* Kinematic Protocol */}
        <motion.section 
          variants={itemVariants}
          className="md:col-span-12 glass-panel rounded-[2rem] p-8 relative overflow-hidden"
        >
          <div className="absolute top-6 right-6 z-20 hidden sm:block">
            <button 
              onClick={saveToGoogleTasks}
              disabled={savingTasks || tasksSaved}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${tasksSaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : taskError ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 shadow-sm backdrop-blur-md'}`}
            >
              {savingTasks ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing</>
              ) : tasksSaved ? (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Saved to Tasks</>
              ) : taskError ? (
                <span>{taskError}</span>
              ) : (
                <><ListTodo className="w-3.5 h-3.5" /> Add to Google Tasks</>
              )}
            </button>
          </div>

          <div className="relative z-10 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-4 h-4" /> Kinematic Protocol
              </h3>
              
              {/* Mobile button */}
              <div className="sm:hidden block">
                <button 
                  onClick={saveToGoogleTasks}
                  disabled={savingTasks || tasksSaved}
                  className={`flex w-fit items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${tasksSaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : taskError ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 shadow-sm'}`}
                >
                  {savingTasks ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing</>
                  ) : tasksSaved ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Saved to Tasks</>
                  ) : taskError ? (
                    <span>{taskError}</span>
                  ) : (
                    <><ListTodo className="w-3.5 h-3.5" /> Add to Google Tasks</>
                  )}
                </button>
              </div>
            </div>
            
            <p className="text-slate-300 font-medium leading-relaxed mb-10 text-lg max-w-4xl sm:pr-40">{exercisePlan.summary}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {(exercisePlan?.routine || []).map((day: any, idx: number) => (
                <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-colors group">
                  <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-3">{day.day}</div>
                  <ul className="space-y-3">
                    {(day.exercises || []).map((ex: string, eIdx: number) => (
                      <li key={eIdx} className="text-sm font-medium text-slate-300 flex items-start gap-2 leading-snug">
                        <span className="text-blue-500 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity">▸</span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

      </div>

      <motion.div variants={itemVariants} className="mt-16 flex justify-center">
        <button
          onClick={onReset}
          className="group flex items-center gap-3 px-8 py-4 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-display font-bold transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 text-emerald-400" />
          RECALIBRATE PROTOCOL
        </button>
      </motion.div>

    </motion.div>
  );
}
