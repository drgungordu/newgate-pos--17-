import React from 'react';
import { Heart } from 'lucide-react';
import { Employee } from '../../../types';

interface PosSettingsTipsSectionProps {
  tipConfig?: any;
  currentUser: Employee;
}

export const PosSettingsTipsSection: React.FC<PosSettingsTipsSectionProps> = ({ tipConfig, currentUser }) => {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white">Gratuity & Tip Configuration</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-300">Suggested Tip Percentages</span>
          <span className="text-sm font-mono text-indigo-400 font-bold">15%, 18%, 20%, 25%</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-sm font-semibold text-slate-300">Enable Custom Tip Amount</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Enabled</span>
        </div>
      </div>
    </div>
  );
};
