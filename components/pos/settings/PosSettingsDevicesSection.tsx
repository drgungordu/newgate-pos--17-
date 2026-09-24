import React from 'react';
import { HardDrive, Printer } from 'lucide-react';
import { Employee } from '../../../types';

interface PosSettingsDevicesSectionProps {
  currentUser: Employee;
  currentMode?: string;
  deviceRole?: string;
  printerIp: string;
  setPrinterIp: (ip: string) => void;
  printerPort: number;
  setPrinterPort: (port: number) => void;
}

export const PosSettingsDevicesSection: React.FC<PosSettingsDevicesSectionProps> = ({
  currentUser,
  currentMode,
  deviceRole,
  printerIp,
  setPrinterIp,
  printerPort,
  setPrinterPort,
}) => {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white">Device Info</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Merchant Mode</div>
          <div className="mt-1 text-sm font-bold text-white">{currentMode || 'RESTAURANT'}</div>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Device Role</div>
          <div className="mt-1 text-sm font-bold text-white">{deviceRole || 'REGISTER'}</div>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Thermal Receipt Printer IP</label>
          <input
            type="text"
            value={printerIp}
            onChange={(e) => setPrinterIp(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Printer Raw Port (e.g. 9100)</label>
          <input
            type="number"
            value={printerPort}
            onChange={(e) => setPrinterPort(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white"
          />
        </div>
      </div>
    </div>
  );
};
