import React from 'react';
import { ChevronLeft, ChevronRight, Lock, Sparkles } from 'lucide-react';
interface PosShellHubGridProps {
  hubPage: number;
  setHubPage: React.Dispatch<React.SetStateAction<number>>;
  appTiles: any[];
  onSelectRoute: (route: any) => void;
}

export const PosShellHubGrid: React.FC<PosShellHubGridProps> = ({
  hubPage,
  setHubPage,
  appTiles,
  onSelectRoute,
}) => {
  const TILES_PER_PAGE = 12;

  const totalPages =
    Math.max(1, Math.ceil(appTiles.length / TILES_PER_PAGE));

  const currentTiles = appTiles.slice(
    hubPage * TILES_PER_PAGE,
    hubPage * TILES_PER_PAGE + TILES_PER_PAGE
  );

  return (
    <section className="h-full w-full flex flex-col">
      <div className="mb-4 flex items-end justify-between px-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Applications</div>
          <div className="mt-1 text-xl font-black tracking-tight text-white">Choose an app</div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
          <Sparkles size={14} className="text-amber-400" />
          <span>{appTiles.length} apps on this terminal</span>
        </div>
      </div>

      <div className="
        flex-1
        grid
        grid-cols-2
        md:grid-cols-3
        xl:grid-cols-4
        gap-4
        content-start
        overflow-y-auto
        pb-4
      ">
        {currentTiles.map((tile) => {
          const disabled = tile.blocked || tile.disabled;

          return (
            <button
              key={tile.id}
              disabled={disabled}
              onClick={() => !disabled && onSelectRoute(tile.id)}
              className={`
                group
                min-h-[172px]
                rounded-2xl
                border border-white/[0.06]
                bg-[#20262d]
                p-4
                flex flex-col
                items-start
                justify-between
                transition-all
                active:scale-[0.97]

                ${
                  disabled
                    ? 'opacity-55 cursor-not-allowed'
                    : 'hover:-translate-y-0.5 hover:border-white/15 hover:bg-[#293139] hover:shadow-xl hover:shadow-black/20'
                }
              `}
            >
              <div className="
                relative
                w-[76px]
                h-[76px]
                rounded-[22px]
                ${tile.color || 'bg-slate-700 text-white'}
                flex items-center
                justify-center
                shadow-inner
                group-hover:scale-105
                transition-transform
              ">
                {React.cloneElement(tile.icon, {
                  size: 48,
                  strokeWidth: 1.7,
                })}

                {tile.badge && (
                  <span className="
                    absolute
                    -top-2
                    -right-3
                    min-w-[22px]
                    h-[22px]
                    px-1.5
                    rounded-full
                    bg-rose-500
                    text-white
                    text-[10px]
                    font-bold
                    flex
                    items-center
                    justify-center
                  ">
                    {tile.badge}
                  </span>
                )}
                {disabled && (
                  <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#20262d] bg-slate-700 text-slate-300">
                    <Lock size={13} />
                  </span>
                )}
              </div>

              <div className="text-left">
                <div className="
                  text-[16px]
                  font-extrabold
                  text-slate-100
                  tracking-tight
                ">
                  {tile.label}
                </div>
                <div className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
                  {tile.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="
          h-12
          flex
          items-center
          justify-center
          gap-5
        ">
          <button
            disabled={hubPage === 0}
            onClick={() => setHubPage(p => Math.max(0, p - 1))}
            className="p-2 text-slate-400 disabled:opacity-20"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setHubPage(i)}
                className={`
                  rounded-full transition-all
                  ${
                    i === hubPage
                      ? 'w-6 h-2 bg-indigo-500'
                      : 'w-2 h-2 bg-slate-600'
                  }
                `}
              />
            ))}
          </div>

          <button
            disabled={hubPage >= totalPages - 1}
            onClick={() =>
              setHubPage(p => Math.min(totalPages - 1, p + 1))
            }
            className="p-2 text-slate-400 disabled:opacity-20"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </section>
  );
};
