import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  Percent,
  Sliders,
  Shield,
  CreditCard,
  Printer,
  CheckCircle2,
  Save,
  Globe,
  Lock,
  FileText
} from 'lucide-react';
import { GlobalTaxConfig, TipConfig, Role, RolePermission } from '../../types';
import { RolePermissionMatrixState } from '../staff/permissions/types';

interface SettingsProps {
  kioskConfig?: any;
  businesses?: any;
  giftCards?: any;
  setGiftCards?: any;
  setKioskConfig?: any;
  taxConfig?: GlobalTaxConfig;
  setTaxConfig?: React.Dispatch<React.SetStateAction<GlobalTaxConfig>>;
  tipConfig?: TipConfig;
  setTipConfig?: React.Dispatch<React.SetStateAction<TipConfig>>;
  removalReasons?: string[];
  setRemovalReasons?: React.Dispatch<React.SetStateAction<string[]>>;
  onNavigate?: (tab: string) => void;
  roles?: Role[];
  setRoles?: React.Dispatch<React.SetStateAction<Role[]>>;
  rolePermissions?: RolePermission[];
  setRolePermissions?: React.Dispatch<React.SetStateAction<RolePermission[]>>;
  matrixState?: RolePermissionMatrixState;
  setMatrixState?: React.Dispatch<React.SetStateAction<RolePermissionMatrixState>>;
}

export const Settings: React.FC<SettingsProps> = ({
  taxConfig = { enabled: true, defaultRate: 0, rates: [] },
  setTaxConfig,
  tipConfig = { enabled: true, defaultPercentages: [15, 18, 20, 25], allowCustom: true },
  setTipConfig,
  businesses = [],
  removalReasons = ['Customer Changed Mind', 'Item Spilled/Damaged', 'Input Error', 'Comp / Promo'],
  setRemovalReasons,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'TAXES' | 'TIPS' | 'HARDWARE' | 'REASONS'>('GENERAL');
  const [businessName, setBusinessName] = useState(businesses[0]?.name || 'Newgate Flagship');
  const [taxRate, setTaxRate] = useState(taxConfig.defaultRate || 0);
  const [printerIp, setPrinterIp] = useState('192.168.1.200');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    if (setTaxConfig) {
      setTaxConfig({ ...taxConfig, defaultRate: Number(taxRate) });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sliders size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Backoffice Settings</h1>
          </div>
          <p className="text-sm text-slate-500">Configure global business rules, tax rates, tips, and POS terminal hardware.</p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          {savedSuccess ? <CheckCircle2 size={16} /> : <Save size={16} />}
          <span>{savedSuccess ? 'Settings Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-sm font-semibold max-w-2xl">
        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'GENERAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Business Info
        </button>
        <button
          onClick={() => setActiveTab('TAXES')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'TAXES' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Taxes & Rates
        </button>
        <button
          onClick={() => setActiveTab('TIPS')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'TIPS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Gratuity & Tips
        </button>
        <button
          onClick={() => setActiveTab('HARDWARE')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'HARDWARE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Hardware & Peripherals
        </button>
      </div>

      {activeTab === 'GENERAL' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-900">Location & Legal Entity</h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Merchant Currency</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'TAXES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-900">Global Sales Tax Rate</h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Default Percentage (%)</label>
            <input
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {activeTab === 'TIPS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-900">Tip Suggestions</h3>
          <p className="text-sm text-slate-500">Customer-facing suggestions displayed on CFD and mobile checkout:</p>
          <div className="grid grid-cols-4 gap-3">
            {[15, 18, 20, 25].map((pct) => (
              <div key={pct} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center font-black text-indigo-600 text-lg">
                {pct}%
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'HARDWARE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-900">LAN Receipt Printer</h3>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Raw TCP/IP Address</label>
            <input
              type="text"
              value={printerIp}
              onChange={(e) => setPrinterIp(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
