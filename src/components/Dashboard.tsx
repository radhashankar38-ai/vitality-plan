import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Dumbbell, Weight, Plus, Flame, Clock, Globe } from 'lucide-react';
import HealthInsights from './HealthInsights';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'log' | 'insights'>('overview');
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [bmiHistory, setBmiHistory] = useState<any[]>([]);

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('workout_logs') || '[]');
    setWorkoutLogs(logs);

    const bmiLogs = JSON.parse(localStorage.getItem('bmi_history') || '[]');
    bmiLogs.sort((a: any, b: any) => a.timestamp - b.timestamp);
    const formattedBmi = bmiLogs.map((log: any) => ({
      ...log,
      dateShort: new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));
    setBmiHistory(formattedBmi);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const dataOverview = [
    { name: 'Mon', active: 45, cal: 320 },
    { name: 'Tue', active: 60, cal: 450 },
    { name: 'Wed', active: 30, cal: 210 },
    { name: 'Thu', active: 90, cal: 600 },
    { name: 'Fri', active: 45, cal: 350 },
    { name: 'Sat', active: 120, cal: 800 },
    { name: 'Sun', active: 60, cal: 400 },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={containerVariants}
      className="w-full max-w-7xl mx-auto min-h-[80vh] flex flex-col pt-24 pb-32"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-2 text-white uppercase drop-shadow-sm">Telemetry</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Biometric Tracking Matrix</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1.5 rounded-full border border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'overview' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Metrics
          </button>
          <button 
            onClick={() => setActiveTab('log')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${activeTab === 'log' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Plus className="w-3.5 h-3.5" /> Log Data
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${activeTab === 'insights' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Globe className="w-3.5 h-3.5" /> Insights
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-6 h-full min-h-[600px] relative z-10"
          >
          {/* Quick Stats */}
          <motion.section variants={itemVariants} className="md:col-span-4 md:row-span-2 glass-panel rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
             <div className="flex justify-between items-start relative z-10">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><Dumbbell className="w-3.5 h-3.5 text-slate-400"/> Sessions</p>
             </div>
             <div className="relative z-10">
               <p className="text-6xl font-display font-black tracking-tighter text-white">{workoutLogs.length}</p>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Total Logs</p>
             </div>
          </motion.section>

          <motion.section variants={itemVariants} className="md:col-span-4 md:row-span-2 glass-panel rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group border-emerald-500/20">
             <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
             <div className="flex justify-between items-start relative z-10">
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2"><Clock className="w-3.5 h-3.5"/> Active Time</p>
             </div>
             <div className="relative z-10">
               <p className="text-6xl font-display font-black tracking-tighter text-white">{workoutLogs.reduce((acc, l) => acc + l.duration, 0)}</p>
               <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-2">Minutes Recorded</p>
             </div>
          </motion.section>

          <motion.section variants={itemVariants} className="md:col-span-4 md:row-span-2 glass-panel rounded-[2rem] p-8 flex flex-col justify-between group">
             <div className="flex justify-between items-start">
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2"><Flame className="w-3.5 h-3.5" /> Output</p>
             </div>
             <div>
               <p className="text-6xl font-display font-black tracking-tighter text-white">
                 2.4<span className="text-2xl text-slate-500 ml-1">k</span>
               </p>
               <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-2">Est. kcal Burned</p>
             </div>
          </motion.section>

          {/* Activity Chart */}
          <motion.section variants={itemVariants} className="md:col-span-8 md:row-span-4 glass-panel rounded-[2rem] p-8 flex flex-col">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Activity Trend</h3>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem', color: '#f8fafc', fontWeight: 'bold', fontSize: '12px' }}
                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  />
                  <Bar dataKey="active" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* BMI History Trend */}
          <motion.section variants={itemVariants} className="md:col-span-4 md:row-span-4 glass-panel rounded-[2rem] p-8 flex flex-col">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">BMI Progression</h3>
             <div className="flex-1 w-full min-h-[250px] flex items-center justify-center">
               {bmiHistory.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={bmiHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="dateShort" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                     <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem', color: '#f8fafc', fontWeight: 'bold', fontSize: '12px' }}
                     />
                     <Line type="monotone" dataKey="bmi" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                   </LineChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="text-center text-slate-500">
                   <Weight className="w-8 h-8 mx-auto mb-2 opacity-50" />
                   <p className="text-xs font-bold uppercase tracking-widest">No Data Available</p>
                   <p className="text-[10px] mt-1">Generate a plan to record BMI</p>
                 </div>
               )}
             </div>
          </motion.section>
        </motion.div>
        )}
        
        {activeTab === 'log' && (
        <motion.div 
          key="log"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-2xl mx-auto w-full relative z-10"
        >
          <div className="glass-panel p-8 md:p-12 rounded-[2rem]">
            <h3 className="text-xl font-display font-black text-white mb-8 border-b border-slate-800 pb-4">Input Session Data</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const type = (form.elements.namedItem('type') as HTMLSelectElement).value;
              const duration = Number((form.elements.namedItem('duration') as HTMLInputElement).value);
              const date = (form.elements.namedItem('date') as HTMLInputElement).value;
              
              const newLog = { id: Date.now().toString(), type, duration, date };
              const updated = [...workoutLogs, newLog];
              setWorkoutLogs(updated);
              localStorage.setItem('workout_logs', JSON.stringify(updated));
              setActiveTab('overview');
            }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Protocol Type</label>
                <select name="type" required className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-bold">
                  <option value="strength">Strength / Hypertrophy</option>
                  <option value="cardio">Cardiovascular</option>
                  <option value="flexibility">Flexibility / Mobility</option>
                  <option value="sports">Athletics</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration (Mins)</label>
                <input type="number" name="duration" required min="1" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-bold" placeholder="45" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Timestamp</label>
                <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-bold [color-scheme:dark]" />
              </div>

              <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-xl font-display font-black tracking-widest uppercase hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Commit Data
              </button>
            </form>
          </div>
        </motion.div>
        )}

        {activeTab === 'insights' && (
          <HealthInsights />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
