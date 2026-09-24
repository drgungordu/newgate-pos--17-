import React from 'react';
import { CheckCircle2, CircleAlert, Server, Users, Smartphone } from 'lucide-react';

interface PlatformModuleSectionProps {
  title: string;
  description: string;
  items: string[];
  icon?: 'health' | 'users' | 'devices' | 'default';
}

const ICONS = {
  health: Server,
  users: Users,
  devices: Smartphone,
  default: CheckCircle2,
};

export const PlatformModuleSection: React.FC<PlatformModuleSectionProps> = ({ title, description, items, icon = 'default' }) => {
  const Icon = ICONS[icon];
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{title}</h3>
        <p className="text-slate-500 font-medium text-sm">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600"><Icon size={22} /></div>
            <div className="flex-1">
              <div className="font-bold text-slate-900">{item}</div>
              <div className="text-xs text-slate-500 mt-1">Platform control surface ready</div>
            </div>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800 flex items-center gap-2">
          <CircleAlert size={18} /> No platform records available.
        </div>
      )}
    </div>
  );
};
