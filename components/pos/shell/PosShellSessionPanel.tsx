import React from 'react';
import { Wifi, Battery, Lock } from 'lucide-react';
import { Employee } from '../../../types';
import { NativeBridge } from '../../../services/nativeBridge';

interface PosShellSessionPanelProps {
  businessName?: string;
  activeUser: Employee;
  businessDate: string;
  drawerBalance: string;
  batteryLevel: number;
  terminalName?: string;
  deviceId?: string;
  deviceRole?: string;
  onLockTerminal: () => void;
}

export const PosShellSessionPanel: React.FC<PosShellSessionPanelProps> = ({
  businessName = 'Lumi Restaurant & Bar',
  activeUser,
  businessDate,
  drawerBalance,
  batteryLevel,
  terminalName,
  deviceId,
  deviceRole,
  onLockTerminal,
}) => {
  return (
    <aside aria-label="Status rail" className="w-full lg:w-[248px] xl:w-[280px] shrink-0 bg-[#20252b] border-l border-[#343b44] p-4 flex flex-col justify-between space-y-4 max-h-full overflow-y-auto">
      <div className="space-y-4">
        {/* Merchant Identity Branding */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-black">
            POS APPLIANCE
          </div>
          <h2 className="text-base font-black text-white tracking-tight mt-0.5 truncate">
            {businessName}
          </h2>
          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{terminalName || 'Main Register'}{deviceId ? ` • ${deviceId}` : ''}</span>
            {deviceRole && (
              <span className="px-1.5 py-0.5 bg-indigo-950/80 text-indigo-300 font-mono text-[10px] font-bold rounded border border-indigo-700/60">
                {deviceRole}
              </span>
            )}
          </div>
        </div>

        {/* Current Employee Profile Card */}
        <div className="p-3 bg-slate-800/50 border-y border-slate-700/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-base flex items-center justify-center">
            {activeUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-white truncate">{activeUser.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded text-[10px] font-extrabold uppercase border border-indigo-800/80">
                {activeUser.role}
              </span>
              <span className="text-[11px] text-slate-400">ID: {activeUser.id}</span>
            </div>
          </div>
        </div>

        {/* Operational Shift & Drawer Telemetry */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 bg-slate-800/40 rounded-lg border border-slate-800">
            <span className="text-slate-400">Business Date</span>
            <span className="font-mono text-white font-bold">{businessDate}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-800/40 rounded-lg border border-slate-800">
            <span className="text-slate-400">Shift Status</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Shift #1 (Active)
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-800/40 rounded-lg border border-slate-800">
            <span className="text-slate-400">Cash Float</span>
            <span className="font-mono font-bold text-slate-200">{drawerBalance}</span>
          </div>
        </div>

        {/* Hardware & Network Status Indicator */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Hardware & Telemetry
          </div>
          <div className="p-3 bg-slate-950/40 border-y border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Wifi size={14} className="text-emerald-400" /> Mesh Sync
              </span>
              <span className="text-emerald-400 font-bold text-[11px]">Online (5ms)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Battery size={14} className={batteryLevel > 20 ? 'text-emerald-400' : 'text-rose-400'} /> Battery
              </span>
              <span className="font-mono font-bold text-slate-200 text-[11px]">{batteryLevel}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Thermal ESC/POS</span>
              <span className="text-emerald-400 font-bold text-[11px]">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Touch "LOCK / SIGN OUT" Action */}
      <div className="pt-2">
        <button
          onClick={() => {
            NativeBridge.beep(1600, 60);
            onLockTerminal();
          }}
          className="w-full min-h-[52px] py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all transform active:scale-95 border border-rose-500/50"
        >
          <Lock size={18} />
          <span>Lock Terminal / Switch User</span>
        </button>
      </div>
    </aside>
  );
};
