import React, { useState } from 'react';
import { Gift, Plus, Search, CheckCircle2 } from 'lucide-react';

interface GiftCard {
  id: string;
  code: string;
  balance: number;
  initialValue: number;
  customerName?: string;
  status: 'ACTIVE' | 'DEPLETED' | 'EXPIRED';
}

interface GiftCardsSettingsSectionProps {
  businesses?: any[];
  giftCards?: GiftCard[];
  setGiftCards?: React.Dispatch<React.SetStateAction<GiftCard[]>>;
}

export const GiftCardsSettingsSection: React.FC<GiftCardsSettingsSectionProps> = ({
  businesses = [],
  giftCards = [
    { id: 'GC-1', code: 'NEWGATE-8821', balance: 50.0, initialValue: 50.0, customerName: 'Alex Morgan', status: 'ACTIVE' },
    { id: 'GC-2', code: 'NEWGATE-3390', balance: 12.5, initialValue: 25.0, customerName: 'Taylor Swift', status: 'ACTIVE' },
    { id: 'GC-3', code: 'NEWGATE-7104', balance: 0.0, initialValue: 100.0, customerName: 'Chris Evans', status: 'DEPLETED' },
  ],
  setGiftCards,
}) => {
  const [search, setSearch] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newBalance, setNewBalance] = useState('50');
  const [newName, setNewName] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);

  const filtered = giftCards.filter(
    (g) => g.code.toLowerCase().includes(search.toLowerCase()) || (g.customerName && g.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newBalance) || 25;
    const card: GiftCard = {
      id: `GC-${Date.now()}`,
      code: newCode || `NEWGATE-${Math.floor(1000 + Math.random() * 9000)}`,
      balance: val,
      initialValue: val,
      customerName: newName || 'Guest Customer',
      status: 'ACTIVE',
    };
    if (setGiftCards) {
      setGiftCards([...giftCards, card]);
    }
    setShowIssueModal(false);
    setNewCode('');
    setNewName('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Gift size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Digital & Physical Gift Cards</h1>
          </div>
          <p className="text-sm text-slate-500">Issue store credit vouchers, check card balances, and track redemptions.</p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Search code or recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => setShowIssueModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Issue Gift Card</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4">Card Code</th>
              <th className="p-4">Recipient</th>
              <th className="p-4 text-right">Initial Value</th>
              <th className="p-4 text-right">Current Balance</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((card) => (
              <tr key={card.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono font-bold text-indigo-600">{card.code}</td>
                <td className="p-4 text-slate-900 font-medium">{card.customerName || '—'}</td>
                <td className="p-4 text-right font-mono">${card.initialValue.toFixed(2)}</td>
                <td className="p-4 text-right font-mono font-black text-slate-900">${card.balance.toFixed(2)}</td>
                <td className="p-4 text-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      card.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {card.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleIssue} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Issue New Gift Card</h3>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Card Code (optional)</label>
              <input
                type="text"
                placeholder="Leave blank to auto-generate"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Recipient Name</label>
              <input
                type="text"
                placeholder="Guest name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Initial Balance ($)</label>
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm font-mono"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md shadow-indigo-600/30"
              >
                Issue Card
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GiftCardsSettingsSection;
