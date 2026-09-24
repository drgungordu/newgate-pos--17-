import React from 'react';
import { DollarSign, Shield, HelpCircle } from 'lucide-react';

interface PosSettingsCashSecurityHelpProps {
  activeSection: 'CASH' | 'SECURITY' | 'HELP';
  defaultOpeningFloat: number;
  setDefaultOpeningFloat: (val: number) => void;
  blindCloseEnabled: boolean;
  setBlindCloseEnabled: (val: boolean) => void;
  kioskLockTaskEnabled: boolean;
  setKioskLockTaskEnabled: (val: boolean) => void;
  requireManagerForVoids: boolean;
  setRequireManagerForVoids: (val: boolean) => void;
}

export const PosSettingsCashSecurityHelp: React.FC<PosSettingsCashSecurityHelpProps> = ({
  activeSection,
  defaultOpeningFloat,
  setDefaultOpeningFloat,
  blindCloseEnabled,
  setBlindCloseEnabled,
  kioskLockTaskEnabled,
  setKioskLockTaskEnabled,
  requireManagerForVoids,
  setRequireManagerForVoids,
}) => {
  if (activeSection === 'CASH') {
    return (
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-xl font-bold text-white">Cash Drawer Policies</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Default Shift Opening Float ($)</label>
            <input
              type="number"
              value={defaultOpeningFloat}
              onChange={(e) => setDefaultOpeningFloat(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
            />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <div>
              <h4 className="text-sm font-semibold text-white">Blind Closeout Enforcement</h4>
              <p className="text-xs text-slate-400">Cashier counts drawer without knowing the expected total.</p>
            </div>
            <button
              onClick={() => setBlindCloseEnabled(!blindCloseEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${blindCloseEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${blindCloseEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'SECURITY') {
    return (
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-xl font-bold text-white">Terminal Security & Lockout</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Require Manager PIN for Voids</h4>
              <p className="text-xs text-slate-400">Restricts line-item voids and comps to managers.</p>
            </div>
            <button
              onClick={() => setRequireManagerForVoids(!requireManagerForVoids)}
              className={`w-12 h-6 rounded-full transition-colors relative ${requireManagerForVoids ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${requireManagerForVoids ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white">Newgate Terminal Information</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-sm">
        <div className="flex justify-between text-slate-300">
          <span>Application Platform:</span>
          <span className="font-bold text-white">Newgate POS Android</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Version:</span>
          <span className="font-mono text-indigo-400">v1.0.0</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Build Architecture:</span>
          <span className="font-mono text-slate-400">Capacitor Android Native</span>
        </div>
      </div>
    </div>
  );
};
