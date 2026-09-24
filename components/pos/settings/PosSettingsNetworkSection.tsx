import React from 'react';
import { Wifi, CheckCircle2 } from 'lucide-react';
import { Employee } from '../../../types';

interface PosSettingsNetworkSectionProps {
  currentUser: Employee;
}

export const PosSettingsNetworkSection: React.FC<PosSettingsNetworkSectionProps> = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white">Network & Offline Sync State</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wifi size={20} className="text-emerald-400" />
            <span className="text-sm font-semibold text-slate-200">Terminal Connectivity</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Online</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-sm font-semibold text-slate-300">Offline Queue</span>
          <span className="text-xs font-mono text-slate-400">0 pending transactions</span>
        </div>
      </div>
    </div>
  );
};
