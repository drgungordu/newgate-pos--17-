import React, { useState } from 'react';
import { Utensils, Search, CheckCircle2 } from 'lucide-react';
import { InventoryItem } from '../../../types';

interface PosSettingsMenuSectionProps {
  inventory: InventoryItem[];
  onSaveItem: (item: InventoryItem) => void;
}

export const PosSettingsMenuSection: React.FC<PosSettingsMenuSectionProps> = ({ inventory, onSaveItem }) => {
  const [search, setSearch] = useState('');

  const filtered = inventory.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Menu Item Configuration</h2>
        <input
          type="text"
          placeholder="Filter items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        {filtered.slice(0, 15).map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm">{item.name}</h4>
              <p className="text-xs text-slate-400">{item.category} • ${item.price.toFixed(2)}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              item.isAvailable !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {item.isAvailable !== false ? 'Available' : "86'd"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
