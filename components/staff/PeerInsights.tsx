import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, Award, ArrowUpRight, BarChart3, Sparkles } from 'lucide-react';

interface PeerInsightsProps {
  salesSummary?: any[];
}

export const PeerInsights: React.FC<PeerInsightsProps> = ({ salesSummary = [] }) => {
  const [timeRange, setTimeRange] = useState('This Month');
  const [peerGroup, setPeerGroup] = useState('Similar Volume & Format (Local)');

  const metrics = [
    { label: 'Avg Ticket Size', yourVal: '$42.80', peerVal: '$38.20', diff: '+12.0%', positive: true },
    { label: 'Table Turn Time', yourVal: '46 min', peerVal: '52 min', diff: '-11.5%', positive: true },
    { label: 'Beverage Attach Rate', yourVal: '68%', peerVal: '54%', diff: '+25.9%', positive: true },
    { label: 'Tip Average', yourVal: '21.4%', peerVal: '19.8%', diff: '+8.1%', positive: true },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Peer Insights & Benchmarks</h1>
          </div>
          <p className="text-sm text-slate-500">
            Anonymized comparative intelligence comparing your location against regional peers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Last 90 Days</option>
          </select>
          <select
            value={peerGroup}
            onChange={(e) => setPeerGroup(e.target.value)}
            className="text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option>Similar Volume & Format (Local)</option>
            <option>Metro Area Restaurants</option>
            <option>National Top Quartile</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{m.label}</span>
            <div className="my-3 flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900">{m.yourVal}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                m.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                <ArrowUpRight size={12} />
                {m.diff}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex justify-between pt-3 border-t border-slate-100">
              <span>Peer Benchmark:</span>
              <span className="font-bold text-slate-700">{m.peerVal}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-300">
            <Sparkles size={14} /> AI Copilot Recommendation
          </div>
          <h2 className="text-xl font-bold">Menu Engineering Opportunity</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your dessert and beverage attachment rate outpaces your peer set by 25.9%. Consider bundling signature beverages with lunch combos to boost weekday gross margin by an estimated 4.2%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PeerInsights;
