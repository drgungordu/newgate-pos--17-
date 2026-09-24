import React, { useState, useEffect } from 'react';
import { SalesSummary, DepositLog, TaxReport } from '../../types';
import { MOCK_SALES_OVERVIEW } from '../../constants';
import { CreditCard, DollarSign, Gift, TrendingUp, Calendar } from 'lucide-react';

interface SalesReportsProps {
  salesData?: SalesSummary[];
  deposits?: DepositLog[];
  taxReports?: TaxReport[];
  initialTab?: string;
  orders?: any[];
  onNavigate?: (tab: string) => void;
}

export const SalesReports: React.FC<SalesReportsProps> = ({
  initialTab,
  salesData = [],
  orders = [],
}) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Daily Sales' | 'Tender Types'>('Overview');

  useEffect(() => {
    if (initialTab && ['Overview', 'Daily Sales', 'Tender Types'].includes(initialTab)) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Financial Reports</h1>
          <p className="text-slate-500 font-medium">Platform-wide revenue and terminal analytics</p>
        </div>
      </div>

      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex space-x-8">
          {['Overview', 'Daily Sales', 'Tender Types'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-1 border-b-4 font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
              <h3 className="text-3xl font-black text-slate-900">{MOCK_SALES_OVERVIEW.summary.orders.value}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Sales</p>
              <h3 className="text-3xl font-black text-slate-900">
                ${MOCK_SALES_OVERVIEW.summary.grossSales.value.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Sales</p>
              <h3 className="text-3xl font-black text-indigo-600">
                ${MOCK_SALES_OVERVIEW.summary.netSales.value.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Ticket</p>
              <h3 className="text-3xl font-black text-emerald-600">
                ${MOCK_SALES_OVERVIEW.summary.avgTicketSize.value.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Daily Sales' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-indigo-600" />
              <h3 className="font-bold text-slate-900">Daily Revenue Performance</h3>
            </div>
          </div>
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Orders</th>
                <th className="p-4 text-right">Gross Sales</th>
                <th className="p-4 text-right">Net Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesData.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">{d.date}</td>
                  <td className="p-4 text-right font-mono">{d.orderCount}</td>
                  <td className="p-4 text-right font-mono font-bold">${d.grossSales.toFixed(2)}</td>
                  <td className="p-4 text-right font-mono font-bold text-indigo-600">${d.netSales.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Tender Types' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Credit & Debit</p>
              <h3 className="text-2xl font-black text-slate-900">$18,450.00</h3>
              <p className="text-xs text-emerald-600 font-bold mt-1">78.4% of total volume</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <CreditCard size={28} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cash Tendered</p>
              <h3 className="text-2xl font-black text-slate-900">$4,120.00</h3>
              <p className="text-xs text-slate-500 font-bold mt-1">17.5% of total volume</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <DollarSign size={28} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gift Cards & Other</p>
              <h3 className="text-2xl font-black text-slate-900">$950.00</h3>
              <p className="text-xs text-slate-500 font-bold mt-1">4.1% of total volume</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Gift size={28} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReports;
