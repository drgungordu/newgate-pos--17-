import React from 'react';
import { ArrowLeft, Settings, LayoutGrid } from 'lucide-react';

interface TableFloorHeaderProps {
  onExit: () => void;
  floorSections: string[];
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenSettings?: () => void;
  onOpenDesigner?: () => void;
}

export const TableFloorHeader: React.FC<TableFloorHeaderProps> = ({
  onExit,
  floorSections,
  activeSection,
  setActiveSection,
  onOpenSettings,
  onOpenDesigner
}) => {
  return (
    <div className="min-h-[58px] bg-[#20252b] px-4 py-2 border-b border-[#343b44] flex flex-wrap gap-2 justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="min-h-[44px] min-w-[44px] p-2 hover:bg-[#292f36] rounded-lg text-slate-300 transition-colors" title="Back to Home">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-base font-bold text-white">Tables</h2>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveSection('All')}
            className={`min-h-[44px] px-4 rounded-lg text-xs font-bold transition-colors ${
            activeSection === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          All
        </button>
        {floorSections.map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`min-h-[44px] px-4 rounded-lg text-xs font-bold transition-colors ${
            activeSection === sec ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {sec}
          </button>
        ))}

        {onOpenDesigner && (
          <button
            onClick={onOpenDesigner}
            className="min-h-[44px] px-3.5 bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-indigo-800 ml-1"
            title="Open Floor Plan Designer"
          >
            <LayoutGrid size={15} /> Floor Designer
          </button>
        )}

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="min-h-[44px] px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Open Dining & Table Settings"
          >
            <Settings size={15} /> Table Settings
          </button>
        )}
      </div>
    </div>
  );
};
