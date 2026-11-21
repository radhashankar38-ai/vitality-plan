import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Globe, ArrowUpRight, Loader2, RefreshCw } from 'lucide-react';

export default function HealthInsights() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/health-insights');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch insights');
      }
      setInsights(data.insights || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <motion.div 
      key="insights"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full relative z-10"
    >
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h3 className="text-xl font-display font-black text-white flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-400" />
          Live Health Insights
        </h3>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Querying Global Matrix</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center">
          <p className="text-sm font-medium text-rose-400">{error}</p>
          <button 
            onClick={fetchInsights}
            className="mt-4 px-6 py-2 bg-rose-500/20 text-rose-300 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-rose-500/30 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight, idx) => (
            <motion.a 
              key={idx}
              href={insight.source}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between group hover:border-blue-500/50 transition-colors cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                </div>
                <h4 className="text-lg font-bold text-slate-200 mb-3 leading-tight group-hover:text-white transition-colors line-clamp-2">
                  {insight.title}
                </h4>
                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {insight.snippet}
                </p>
              </div>
              <div className="relative z-10 pt-4 border-t border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">
                  {insight.source.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                </p>
              </div>
            </motion.a>
          ))}
          {insights.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500">
              <p className="text-sm font-medium">No active insights found.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
