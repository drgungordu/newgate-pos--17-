import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      <div className="
        flex-1
        grid
        grid-cols-3
        xl:grid-cols-4
        gap-x-8
        gap-y-7
        content-center
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
                min-h-[120px]
                rounded-xl
                flex flex-col
                items-center
                justify-center
                gap-3
                transition-all
                active:scale-[0.97]

                ${
                  disabled
                    ? 'opacity-35 cursor-not-allowed'
                    : 'hover:bg-white/[0.055]'
                }
              `}
            >
              <div className="
                relative
                w-[64px]
                h-[64px]
                rounded-2xl
                bg-[#2a3037]
                border border-white/5
                flex items-center
                justify-center
                text-indigo-300
                shadow-sm
                group-hover:bg-[#303740]
                group-hover:text-indigo-200
              ">
                {React.cloneElement(tile.icon, {
                  size: 34,
                  strokeWidth: 1.8,
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
              </div>

              <div className="text-center">
                <div className="
                  text-[15px]
                  font-semibold
                  text-slate-100
                  tracking-tight
                ">
                  {tile.label}
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
