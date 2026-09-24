import React from 'react';
import {
  Users, Utensils, LayoutGrid, ChefHat, Heart, Receipt,
  Wifi, HardDrive, DollarSign, Shield, HelpCircle
} from 'lucide-react';
import { SettingsSection } from './PosSettingsTypes';
import { Employee, DiningTable } from '../../../types';
import { StationConfig } from '../../../services/kitchenRoutingService';

interface PosSettingsOverviewGridProps {
  onSelectSection: (section: SettingsSection) => void;
  tables: DiningTable[];
  stations: StationConfig[];
  batteryLevel: number;
  currentUser: Employee;
}

export const PosSettingsOverviewGrid: React.FC<PosSettingsOverviewGridProps> = ({
  onSelectSection,
  tables,
  stations,
  batteryLevel,
  currentUser,
}) => {
  const sections: { id: SettingsSection; label: string; desc: string; icon: any; color: string }[] = [
    { id: 'EMPLOYEES', label: 'Staff & Permissions', desc: 'Manage operator PINs, roles, and shift rights', icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { id: 'MENU', label: 'Menu & Items', desc: 'Item availability, pricing, and 86 status', icon: Utensils, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'TABLES', label: 'Tables & Dining', desc: `${tables.length} configured dining tables and sections`, icon: LayoutGrid, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 'KITCHEN', label: 'Kitchen & KDS Routing', desc: `${stations.length} active prep stations and expeditor routing`, icon: ChefHat, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { id: 'TIPS', label: 'Tips & Gratuities', desc: 'Tip suggestions, prompt modes, and pooling rules', icon: Heart, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
    { id: 'RECEIPTS', label: 'Receipts & Printing', desc: 'Header branding, footers, and print templates', icon: Receipt, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { id: 'DEVICES', label: 'Hardware & Printers', desc: `Peripherals, thermal printers, cash drawer kicks`, icon: HardDrive, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { id: 'CASH', label: 'Cash Drawer Policies', desc: 'Opening float, blind closeouts, safe drops', icon: DollarSign, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    { id: 'SECURITY', label: 'Terminal Security', desc: 'Auto-lock timeouts, manager void approval', icon: Shield, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { id: 'NETWORK', label: 'Network & Cloud Sync', desc: 'Offline queue status, connectivity diagnostics', icon: Wifi, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { id: 'HELP', label: 'Diagnostics & Support', desc: 'System version, hardware tests, release info', icon: HelpCircle, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {sections.map((sec) => {
        const Icon = sec.icon;
        return (
          <button
            key={sec.id}
            onClick={() => onSelectSection(sec.id)}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition-all duration-200 group flex flex-col justify-between min-h-32"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl border ${sec.color}`}>
                <Icon size={22} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                {sec.label}
              </h3>
              <p className="sr-only">{sec.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
