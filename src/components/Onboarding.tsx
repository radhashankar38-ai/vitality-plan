import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ruler, Weight, Activity, User, Utensils, Zap, Sparkles, Brain, ArrowRight, HeartOff, Heart, Globe, Target } from 'lucide-react';
import TagInput from './TagInput';

interface ConfiguratorProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

export default function Configurator({ onSubmit, loading }: ConfiguratorProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    height: 175,
    weight: 70,
    unit: 'metric' as 'metric' | 'imperial',
    preference: 'build_muscle',
    dietPreference: 'balanced',
    allergies: [] as string[],
    likedFoods: [] as string[],
    dislikedFoods: [] as string[],
    cuisines: [] as string[],
    modelType: 'standard' as 'fast' | 'standard' | 'complex'
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleComplete = () => {
    onSubmit(formData);
  };

  const variants = {
    enter: (direction: number) => ({
      y: 40,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      y: -40,
      opacity: 0,
      scale: 1.05,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    })
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[70vh] flex flex-col justify-center relative z-10 px-4 mt-20 mb-32">
      {/* Progress Indicator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-12 h-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-slate-800'}`} />
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden w-full h-[600px] flex items-center mt-12">
        <AnimatePresence mode="wait" custom={1}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-12"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">
                  Biometrics
                </h1>
                <p className="text-slate-400 font-medium text-lg tracking-wide">Calibrate your physical parameters.</p>
              </div>

              <div className="flex gap-4 p-2 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800">
                <button
                  onClick={() => updateForm('unit', 'metric')}
                  className={`px-8 py-3 rounded-xl font-bold font-display text-sm transition-all ${formData.unit === 'metric' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)]' : 'text-slate-400 hover:text-white'}`}
                >
                  Metric
                </button>
                <button
                  onClick={() => updateForm('unit', 'imperial')}
                  className={`px-8 py-3 rounded-xl font-bold font-display text-sm transition-all ${formData.unit === 'imperial' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)]' : 'text-slate-400 hover:text-white'}`}
                >
                  Imperial
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl">
                <div className="flex-1 glass-panel p-8 rounded-3xl flex flex-col items-center gap-6 group hover:border-emerald-500/30 transition-colors">
                  <Ruler className="w-8 h-8 text-emerald-400" />
                  <div className="text-center w-full">
                    <input
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => updateForm('height', Number(e.target.value))}
                      className="w-full bg-transparent text-center text-5xl font-display font-black text-white focus:outline-none"
                      placeholder="0"
                    />
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2 block">
                      {formData.unit === 'metric' ? 'Centimeters' : 'Inches'}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 glass-panel p-8 rounded-3xl flex flex-col items-center gap-6 group hover:border-emerald-500/30 transition-colors">
                  <Weight className="w-8 h-8 text-emerald-400" />
                  <div className="text-center w-full">
                    <input
                      type="number"
                      value={formData.weight || ''}
                      onChange={(e) => updateForm('weight', Number(e.target.value))}
                      className="w-full bg-transparent text-center text-5xl font-display font-black text-white focus:outline-none"
                      placeholder="0"
                    />
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2 block">
                      {formData.unit === 'metric' ? 'Kilograms' : 'Pounds'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={nextStep}
                className="group flex items-center gap-3 text-emerald-400 font-display font-bold hover:text-emerald-300 transition-colors"
              >
                Proceed to Objectives
                <div className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-12"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">
                  Objectives
                </h1>
                <p className="text-slate-400 font-medium text-lg tracking-wide">Define your physiological trajectory.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                {[
                  { id: 'lose_weight', icon: Activity, label: 'Cut', desc: 'Fat loss & definition' },
                  { id: 'maintain', icon: User, label: 'Maintain', desc: 'Sustain current state' },
                  { id: 'build_muscle', icon: Target, label: 'Hypertrophy', desc: 'Build mass & strength' }
                ].map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => updateForm('preference', obj.id)}
                    className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all duration-300 ${
                      formData.preference === obj.id 
                      ? 'border-emerald-400 bg-emerald-900/10 text-white shadow-[0_0_30px_-5px_rgba(52,211,153,0.2)] scale-105' 
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <obj.icon className={`w-8 h-8 ${formData.preference === obj.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <h4 className="font-display font-black text-xl mb-1">{obj.label}</h4>
                      <p className="text-xs font-medium opacity-70 uppercase tracking-widest">{obj.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-6">
                <button onClick={prevStep} className="text-slate-500 font-display font-bold hover:text-slate-300 transition-colors">Back</button>
                <button
                  onClick={nextStep}
                  className="group flex items-center gap-3 text-emerald-400 font-display font-bold hover:text-emerald-300 transition-colors"
                >
                  Configure Nutrition
                  <div className="w-10 h-10 rounded-full border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
             <motion.div
             key="step3"
             custom={1}
             variants={variants}
             initial="enter"
             animate="center"
             exit="exit"
             className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-12"
           >
             <div className="space-y-3">
               <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">
                 Nutrition
               </h1>
               <p className="text-slate-400 font-medium text-base tracking-wide">Establish dietary constraints.</p>
             </div>

             <div className="w-full max-w-3xl space-y-3 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="glass-panel p-4 rounded-2xl">
                    <TagInput
                      label="Favorites"
                      icon={<Heart className="w-4 h-4 text-emerald-400" />}
                      tags={formData.likedFoods}
                      onChange={(tags) => updateForm('likedFoods', tags)}
                      placeholder="e.g. Salmon, Spinach..."
                    />
                  </div>
                  <div className="glass-panel p-4 rounded-2xl">
                    <TagInput
                      label="Cuisines"
                      icon={<Globe className="w-4 h-4 text-blue-400" />}
                      tags={formData.cuisines}
                      onChange={(tags) => updateForm('cuisines', tags)}
                      placeholder="e.g. Italian, Thai..."
                    />
                  </div>
                  <div className="glass-panel p-4 rounded-2xl">
                    <TagInput
                      label="Allergies"
                      icon={<HeartOff className="w-4 h-4 text-rose-400" />}
                      tags={formData.allergies}
                      onChange={(tags) => updateForm('allergies', tags)}
                      placeholder="e.g. Peanut, Dairy..."
                    />
                  </div>
                  <div className="glass-panel p-4 rounded-2xl">
                    <TagInput
                      label="Disliked Foods"
                      icon={<HeartOff className="w-4 h-4 text-slate-500" />}
                      tags={formData.dislikedFoods}
                      onChange={(tags) => updateForm('dislikedFoods', tags)}
                      placeholder="e.g. Mushroom, Tofu..."
                    />
                  </div>
                </div>
             </div>

             <div className="flex items-center gap-6 mt-8">
               <button onClick={prevStep} className="text-slate-500 font-display font-bold hover:text-slate-300 transition-colors">Back</button>
               <button
                 onClick={handleComplete}
                 disabled={loading}
                 className="group relative px-12 py-5 rounded-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <div className="absolute inset-0 bg-emerald-500 group-hover:scale-105 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none" />
                 <span className="relative z-10 font-display font-black text-white text-lg flex items-center gap-3 tracking-wide">
                   {loading ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       BUILDING
                     </>
                   ) : (
                     <>
                       BUILD ENGINE <Activity className="w-5 h-5" />
                     </>
                   )}
                 </span>
               </button>
             </div>
           </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
