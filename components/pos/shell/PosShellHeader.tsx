import React from 'react';
import { Search, Lock } from 'lucide-react';
import { Employee } from '../../../types';
import { MerchantMode, DeviceRole } from '../../../types/device';
import { NativeBridge } from '../../../services/nativeBridge';

interface PosShellHeaderProps {
  currentMode: MerchantMode;
  deviceRole?: DeviceRole;
  businessDate: string;
  currentUser: Employee;
  activeUser: Employee | null;
  onOpenGlobalSearch?: () => void;
  onOpenCfd: () => void;
  onOpenProvisioning: () => void;
  onAdminExit: () => void;
  onLockTerminal: () => void;
  onDevChangeMode?: (mode: MerchantMode) => void;
  onDevChangeRole?: (role: DeviceRole) => void;
}

export const PosShellHeader: React.FC<PosShellHeaderProps> = ({
  currentMode,
  deviceRole = 'REGISTER',
  businessDate,
  currentUser,
  activeUser,
  onOpenGlobalSearch,
  onOpenCfd,
  onOpenProvisioning,
  onAdminExit,
  onLockTerminal,
  onDevChangeMode,
  onDevChangeRole,
}) => {

  return (
    <header className="h-20 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-lg select-none">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <h1 className="text-xl font-black text-white tracking-tight">The Newgate POS</h1>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 shadow-sm"
              title="Merchant Mode: Locked to merchant business account / provisioned appliance profile"
            >
              <Lock size={10} className="text-slate-400" />
              <span>{currentMode}</span>
            </span>

            {/* Device Role Badge */}
            <span
              className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 flex items-center gap-1.5 shadow-sm"
              title="Hardware Appliance Role: Governs active routes & tile visibility on this terminal"
            >
              <Lock size={10} className="text-indigo-400" />
              <span>{deviceRole}</span>
            </span>

          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden xl:inline">
          Business Date: {businessDate}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {/* Universal Search Button */}
        {onOpenGlobalSearch && (
          <button
            onClick={onOpenGlobalSearch}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Search size={16} />
            <span className="hidden md:inline">Global Search</span>
          </button>
        )}


        {/* User badge & Logout */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-white block">{activeUser?.name || currentUser.name}</span>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">{activeUser?.role || currentUser.role}</span>
          </div>
          <button
            onClick={() => {
              NativeBridge.beep(1600, 60);
              onLockTerminal();
            }}
            className="p-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl border border-rose-800/60 transition-colors"
            title="Lock Terminal / Enter PIN"
          >
            <Lock size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
