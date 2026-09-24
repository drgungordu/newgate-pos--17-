import React from 'react';
import { ArrowLeft, LayoutDashboard, Shield } from 'lucide-react';
import { SettingsSection } from './PosSettingsTypes';
import { Employee } from '../../../types';
import { PermissionService } from '../../../services/permissionService';

interface PosSettingsHeaderProps {
  activeSection: SettingsSection;
  onBack: () => void;
  currentUser: Employee;
  isSuperAdminOrAdmin: boolean;
  onOpenWebAdmin?: () => void;
}

export const PosSettingsHeader: React.FC<PosSettingsHeaderProps> = ({
  activeSection,
  onBack,
  currentUser,
  isSuperAdminOrAdmin,
  onOpenWebAdmin,
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          <span>{activeSection === 'OVERVIEW' ? 'Exit to POS' : 'All Settings'}</span>
        </button>
        <span className="text-slate-600">/</span>
        <h1 className="text-lg font-black text-white tracking-tight uppercase">
          {activeSection === 'OVERVIEW' ? 'Terminal Settings' : activeSection}
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        {isSuperAdminOrAdmin && PermissionService.can(currentUser, 'webadmin.open') && onOpenWebAdmin && (
          <button
            onClick={onOpenWebAdmin}
            className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition-colors"
          >
            <LayoutDashboard size={14} />
            <span>Web Backoffice</span>
          </button>
        )}
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-750">
          <Shield size={12} className="text-indigo-400" />
          <span>{currentUser.name}</span>
          <span className="text-slate-500">•</span>
          <span className="text-indigo-300 font-semibold">{currentUser.role}</span>
        </div>
      </div>
    </header>
  );
};
