import React from 'react';
import { Search, Lock } from 'lucide-react';
import { Employee } from '../../../types';
import { NativeBridge } from '../../../services/nativeBridge';

interface PosShellHeaderProps {
  businessName?: string;
  currentUser: Employee;
  activeUser: Employee | null;
  onOpenGlobalSearch?: () => void;
  onLockTerminal: () => void;
}

export const PosShellHeader: React.FC<PosShellHeaderProps> = ({
  businessName = 'Newgate POS',
  currentUser,
  activeUser,
  onOpenGlobalSearch,
  onLockTerminal,
}) => {

  return (
    <header className="h-[58px] px-4 bg-[#20252b] border-b border-[#343b44] flex items-center justify-between shadow-md select-none">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <h1 className="text-base font-black text-white tracking-[0.18em] uppercase truncate">NEWGATE</h1>
          <span className="text-xs text-slate-300 truncate max-w-[220px]">{businessName}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Universal Search Button */}
        {onOpenGlobalSearch && (
          <button
            onClick={onOpenGlobalSearch}
            className="min-h-[44px] px-3 bg-[#161a1f] hover:bg-[#292f36] text-slate-200 rounded-lg text-xs font-bold flex items-center gap-2 border border-[#343b44] transition-colors"
          >
            <Search size={16} />
            <span className="hidden md:inline">Search</span>
          </button>
        )}


        {/* User badge & Logout */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-white block">{activeUser?.name || currentUser.name}</span>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">{activeUser?.role || currentUser.role}</span>
          </div>
          <button
            onClick={() => {
              NativeBridge.beep(1600, 60);
              onLockTerminal();
            }}
            className="min-h-[44px] min-w-[44px] p-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/60 transition-colors"
            title="Lock Terminal / Enter PIN"
          >
            <Lock size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
