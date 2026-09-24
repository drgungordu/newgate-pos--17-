import React, { useState } from 'react';
import { Ban, Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import { InventoryItem, Category } from '../../../types';

interface PosShell86AvailabilityProps {
  inventory: InventoryItem[];
  categories: Category[];
  onSaveItem: (item: InventoryItem) => void;
}

export const PosShell86Availability: React.FC<PosShell86AvailabilityProps> = ({
  inventory,
  categories,
  onSaveItem,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const filtered = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || item.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const toggle86 = (item: InventoryItem) => {
    const isCurrentlyOut = item.inStock === false || item.isAvailable === false;
    const updated: InventoryItem = {
      ...item,
      inStock: !isCurrentlyOut,
      isAvailable: isCurrentlyOut,
    };
    onSaveItem(updated);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
            <Ban size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">86 List & Item Availability</h2>
            <p className="text-xs text-slate-400">Instantly toggle out-of-stock items across all registers and kiosks.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const is86 = item.inStock === 0 || item.isAvailable === false;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                is86
                  ? 'bg-rose-950/20 border-rose-900/60 shadow-lg shadow-rose-950/20'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {item.category}
                  </span>
                  {is86 && (
                    <span className="text-xs font-black uppercase tracking-wider text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30">
                      86'd (Out of Stock)
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-white">{item.name}</h3>
                <p className="text-sm font-black text-slate-400 mt-1">${item.price.toFixed(2)}</p>
              </div>

              <button
                onClick={() => toggle86(item)}
                className={`mt-4 w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  is86
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {is86 ? 'Restore (Make Available)' : "86 Item (Mark Out)"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
