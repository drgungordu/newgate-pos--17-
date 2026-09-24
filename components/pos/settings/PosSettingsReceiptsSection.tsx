import React from 'react';
import { Receipt } from 'lucide-react';
import { Employee } from '../../../types';

interface PosSettingsReceiptsSectionProps {
  currentUser: Employee;
}

export const PosSettingsReceiptsSection: React.FC<PosSettingsReceiptsSectionProps> = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white">Receipt Customization</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Header Title</label>
          <input
            type="text"
            defaultValue="Newgate POS & Kitchen"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Footer Note</label>
          <input
            type="text"
            defaultValue="Thank you for dining with us! Please come again."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
          />
        </div>
      </div>
    </div>
  );
};
