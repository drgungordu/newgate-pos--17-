import React from 'react';
import { HardDrive, Printer } from 'lucide-react';
import { Employee } from '../../../types';

interface PosSettingsDevicesSectionProps {
  currentUser: Employee;
  printerIp: string;
  setPrinterIp: (ip: string) => void;
  printerPort: number;
  setPrinterPort: (port: number) => void;
}

export const PosSettingsDevicesSection: React.FC<PosSettingsDevicesSectionProps> = ({
  currentUser,
  printerIp,
  setPrinterIp,
  printerPort,
  setPrinterPort,
}) => {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white">Hardware Peripherals</h2>
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
