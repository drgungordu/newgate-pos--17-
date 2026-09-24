import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { DiningTable, Employee } from '../../../types';

interface PosSettingsTablesSectionProps {
  tables: DiningTable[];
  currentUser: Employee;
  onUpdateTable: (table: DiningTable) => void;
}

export const PosSettingsTablesSection: React.FC<PosSettingsTablesSectionProps> = ({
  tables,
  currentUser,
  onUpdateTable,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Dining Tables & Sections</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((tbl) => (
          <div key={tbl.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-lg">{tbl.name}</span>
              <span className="text-xs text-slate-400">{tbl.seats} Seats</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Section: {tbl.section || 'Main'}</p>
            <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-indigo-400">{tbl.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
