import React from 'react';
import { ChefHat, ArrowLeft, Plus, Layers, Flame, Lock, ShieldCheck } from 'lucide-react';
import { StationConfig } from '../../../services/kitchenRoutingService';

interface StationSelectionViewProps {
  onExit?: () => void;
  onOpenAddStationModal: () => void;
  stations: StationConfig[];
  getTicketCountForStation: (id: string) => number;
  onSelectStation: (id: string) => void;
  isStationAuthorized?: (id: string) => boolean;
}

export const StationSelectionView: React.FC<StationSelectionViewProps> = ({
  onExit,
  onOpenAddStationModal,
  stations,
  getTicketCountForStation,
  onSelectStation,
  isStationAuthorized,
}) => {
  return (
    <div className="h-full flex flex-col bg-[#161a1f] text-white select-none">
      {/* Top Header */}
      <header className="h-[58px] px-4 bg-[#20252b] border-b border-[#343b44] flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center space-x-4">
          {onExit && (
            <button
              onClick={onExit}
              className="min-h-[44px] px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors shadow-sm"
            >
              <ArrowLeft size={18} />
              <span>Back to POS Hub</span>
            </button>
          )}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-600/20 text-orange-400 rounded-xl border border-orange-500/30">
              <ChefHat size={20} />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                KDS
                <span className="text-xs bg-indigo-600/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Station Routing
                </span>
              </h1>
              <p className="hidden md:block text-[10px] text-slate-400">Select station</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {stations.some(st => isStationAuthorized ? isStationAuthorized(st.id) : true) && (
            <button
              onClick={onOpenAddStationModal}
              className="min-h-[44px] px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg transition-colors"
            >
              <Plus size={16} />
              <span>Add Custom Station</span>
            </button>
          )}
        </div>
      </header>

      {/* Station Selection Grid */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col justify-center">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Select Station</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Station-level permission checks active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {stations.filter(st => isStationAuthorized ? isStationAuthorized(st.id) : true).map(st => {
            const count = getTicketCountForStation(st.id);
            const isExpo = st.id.toLowerCase() === 'expo';
            const authorized = true;

            return (
              <button
                key={st.id}
                onClick={() => onSelectStation(st.id)}
                className={`min-h-[160px] p-4 rounded-xl shadow-xl transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 text-left relative flex flex-col justify-between border group ${
                  !authorized
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-70 hover:border-rose-900/60'
                    : isExpo
                    ? 'bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border-indigo-500/50 hover:border-indigo-400'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className={`p-3 rounded-xl ${
                    !authorized
                      ? 'bg-slate-800 text-slate-500'
                      : isExpo ? 'bg-indigo-500/30 text-indigo-200' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {!authorized ? <Lock size={26} className="text-slate-400" /> : isExpo ? <Layers size={28} /> : <Flame size={28} />}
                  </div>

                  <div className="flex items-center gap-2">
                    {!authorized ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-1">
                        <Lock size={10} />
                        <span>Locked</span>
                      </span>
                    ) : (
                      <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        st.deliveryMode === 'BOTH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {st.deliveryMode === 'BOTH' ? 'KDS & Printer' : 'KDS Only'}
                      </span>
                    )}

                    {count > 0 && authorized && (
                      <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full animate-pulse shadow-md">
                        {count}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className={`text-2xl font-black tracking-tight transition-colors ${
                    !authorized ? 'text-slate-400 group-hover:text-slate-300' : 'text-white group-hover:text-indigo-200'
                  }`}>
                    {st.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {!authorized
                      ? `Requires kds.station.${st.id.toLowerCase()}.view`
                      : isExpo
                      ? 'Master expediter • Multi-station readiness aggregation'
                      : `${st.name} production line orders & modifiers`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
