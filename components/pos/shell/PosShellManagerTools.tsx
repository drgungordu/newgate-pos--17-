import React from 'react';
import { Wrench, Shield, ArrowLeft, RefreshCw, LayoutDashboard, Database, Printer } from 'lucide-react';
import { Employee } from '../../../types';
import { NativeBridge } from '../../../services/nativeBridge';
import { SyncService } from '../../../services/syncService';

interface PosShellManagerToolsProps {
  currentMode?: string;
  currentUser?: Employee | null;
  businessName?: string;
  onExitToHub: () => void;
  onSwitchToAdmin: () => void;
}

export const PosShellManagerTools: React.FC<PosShellManagerToolsProps> = ({
  currentMode = 'RESTAURANT',
  currentUser,
  businessName = 'Newgate Merchant',
  onExitToHub,
  onSwitchToAdmin,
}) => {
  const [diagnosticStatus, setDiagnosticStatus] = React.useState('');
  const testPrinter = async () => {
    const result = await NativeBridge.printReceipt({ rawText: 'NEWGATE POS TEST PRINT\n' });
    setDiagnosticStatus(`Printer: ${result}`);
  };
  const auditOutbox = async () => {
    const result = await SyncService.flushIfOnline();
    setDiagnosticStatus(`Outbox: ${result.synced} synced, ${result.failed} failed`);
  };
  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Wrench size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">Manager & Terminal Diagnostics</h2>
            <p className="text-xs text-slate-400">{businessName} • Operational Terminal Utilities</p>
          </div>
        </div>

        <button
          onClick={onSwitchToAdmin}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center space-x-2 transition-colors shadow-lg shadow-indigo-600/20"
        >
          <LayoutDashboard size={16} />
          <span>Open Web Backoffice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <Printer size={20} className="text-indigo-400" />
            <h3 className="font-bold text-white">Hardware HAL Diagnostics</h3>
          </div>
          <p className="text-xs text-slate-400">Test thermal receipt printers, pole displays, and serial cash drawer kicks.</p>
          <button
            onClick={() => void testPrinter()}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Send Test Print Pulse
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <Database size={20} className="text-emerald-400" />
            <h3 className="font-bold text-white">Local-First Storage Sync</h3>
          </div>
          <p className="text-xs text-slate-400">Force sync indexed offline transactions and refresh local state snapshots.</p>
          <button
            onClick={() => void auditOutbox()}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Audit Local Outbox
          </button>
          {diagnosticStatus && <p className="text-xs text-emerald-400">{diagnosticStatus}</p>}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <Shield size={20} className="text-purple-400" />
            <h3 className="font-bold text-white">Operator Session</h3>
          </div>
          <p className="text-xs text-slate-400">Current authenticated operator: {currentUser?.name || 'Staff'}</p>
          <button
            onClick={onExitToHub}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Return to POS App Hub
          </button>
        </div>
      </div>
    </div>
  );
};
