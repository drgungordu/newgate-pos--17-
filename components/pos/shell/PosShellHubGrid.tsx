import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PosShellHubGridProps {
  hubPage: number;
  setHubPage: React.Dispatch<React.SetStateAction<number>>;
  appTiles: any[];
  onSelectRoute: (route: any) => void;
  deviceId?: string;
}

export const PosShellHubGrid: React.FC<PosShellHubGridProps> = ({
  hubPage,
  setHubPage,
  appTiles,
  onSelectRoute,
  deviceId
}) => {
  const TILES_PER_PAGE = 12;
  const totalPages = Math.ceil(appTiles.length / TILES_PER_PAGE) || 1;
  const currentTiles = appTiles.slice(hubPage * TILES_PER_PAGE, (hubPage + 1) * TILES_PER_PAGE);

  return (
    <div className="w-full flex flex-col justify-between">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 flex-1">
        {currentTiles.map((tile) => {
          const isBlocked = tile.blocked || tile.disabled;
          return (
            <button
              key={tile.id || tile.route}
              onClick={() => !isBlocked && onSelectRoute(tile.route || tile.id)}
              disabled={isBlocked}
              className={`min-h-[136px] p-5 rounded-2xl flex flex-col justify-between text-left transition-all duration-200 border relative overflow-hidden group ${
                isBlocked
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                  : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500 hover:bg-slate-850 hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <div
                  className={`p-3 rounded-xl ${
                    tile.color || 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  }`}
                >
                  {tile.icon}
                </div>
                {tile.badge && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {tile.badge}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {tile.label || tile.title}
                </h3>
                {tile.sub && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tile.sub}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <button
            onClick={() => setHubPage((p) => Math.max(0, p - 1))}
            disabled={hubPage === 0}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs text-slate-400 font-mono">
            Page {hubPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setHubPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={hubPage >= totalPages - 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
