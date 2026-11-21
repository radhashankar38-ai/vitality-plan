import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label: string;
  icon?: React.ReactNode;
}

export default function TagInput({ tags, onChange, placeholder, label, icon }: TagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.trim().replace(/,$/, '');
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wide">
        {icon} {label}
      </label>
      <div className="w-full bg-slate-900/50 border border-slate-700 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-400/10 focus-within:bg-slate-800 hover:bg-slate-800 rounded-xl p-2 min-h-[44px] flex flex-wrap gap-2 transition-all shadow-sm">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-600 text-sm font-bold rounded-full shadow-sm text-slate-300"
          >
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(index)}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-full p-0.5 transition-colors focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] bg-transparent border-0 focus:ring-0 px-2 py-1 outline-none text-sm font-display font-medium text-white placeholder:text-slate-600"
        />
      </div>
      <p className="text-[10px] text-slate-500 font-medium ml-1 uppercase tracking-wider">Press enter or comma to add</p>
    </div>
  );
}
