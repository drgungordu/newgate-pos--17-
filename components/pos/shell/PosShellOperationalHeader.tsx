import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { PosInternalRoute } from './PosShellTypes';
import { Employee } from '../../../types';

interface PosShellOperationalHeaderProps {
  posRoute: PosInternalRoute;
  currentUser?: Employee | null;
  onBackToHub: () => void;
}

export const PosShellOperationalHeader: React.FC<PosShellOperationalHeaderProps> = ({
  posRoute,
  currentUser,
  onBackToHub,
}) => {
  return (
    <header className="h-[58px] bg-[#20252b] border-b border-[#343b44] px-4 flex items-center justify-between z-30 shrink-0">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBackToHub}
          className="min-h-[44px] flex items-center space-x-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs font-semibold"
        >
          <ArrowLeft size={16} />
          <span>App Hub</span>
        </button>
        <span className="text-slate-600">/</span>
        <span className="text-sm font-bold text-white tracking-wide uppercase">{posRoute}</span>
      </div>

      {currentUser && (
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-750">
          <User size={14} className="text-indigo-400" />
          <span className="font-semibold text-slate-200">{currentUser.name}</span>
          <span className="text-slate-500">•</span>
          <span>{currentUser.role}</span>
        </div>
      )}
    </header>
  );
};
