import React, { useState } from 'react';
import { Plus, CheckCircle, ExternalLink, ArrowLeft, Smartphone, Users, Flag } from 'lucide-react';
import { AppIntegrationConfig, Business, Employee } from '../../types';
import { NewProvisionModal } from './NewProvisionModal';
import { DeviceIdentityService } from '../../services/deviceIdentityService';
import { DeviceRecord } from '../../types/device';

interface MerchantsSectionProps {
  businesses?: Business[];
  onAddBusiness?: (business: Business, owner: Partial<Employee>) => void;
  onSwitchMerchant?: (business: Business) => void;
  employees?: Employee[];
  integrationConfig?: AppIntegrationConfig;
}

const MerchantsSection: React.FC<MerchantsSectionProps> = ({ businesses = [], onAddBusiness, onSwitchMerchant, employees = [], integrationConfig }) => {
  const [selectedMerchant, setSelectedMerchant] = useState<Business | null>(null);
  const [merchantDevices, setMerchantDevices] = useState<DeviceRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newBizName, setNewBizName] = useState('');
  const [newBizPlan, setNewBizPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [newBizMode, setNewBizMode] = useState<'RESTAURANT' | 'RETAIL' | 'NONPROFIT'>('RESTAURANT');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPasscode, setOwnerPasscode] = useState('');

  const handleCreate = () => {
    if (!newBizName || !ownerName || !ownerEmail || !ownerPasscode) return;
    
    const newBusiness: Business = {
      id: '',
      name: newBizName,
      ownerName: ownerName,
      plan: newBizPlan,
      status: 'Active',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenueYTD: 0,
      merchantMode: newBizMode,
      varConfig: {
        provider: 'None',
        merchantId: 'PENDING',
        status: 'Not Configured'
      }
    };

    const newOwner: Partial<Employee> = {
      name: ownerName,
      email: ownerEmail,
      passcode: ownerPasscode
    };

    if (onAddBusiness) {
      onAddBusiness(newBusiness, newOwner);
    }

    setNewBizName('');
    setNewBizMode('RESTAURANT');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPasscode('');
    setShowAddModal(false);
  };

  React.useEffect(() => {
    if (!selectedMerchant) {
      setMerchantDevices([]);
      return;
    }
    void DeviceIdentityService.listDevices(selectedMerchant.id).then(devices => {
      setMerchantDevices(devices.filter(device => device.merchantId === selectedMerchant.id));
    });
  }, [selectedMerchant]);

  const merchantEmployees = selectedMerchant
    ? employees.filter(employee => employee.businessId === selectedMerchant.id)
    : [];

  return (
    <div className="space-y-6 animate-fade-in relative">
      <NewProvisionModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newBizName={newBizName}
        setNewBizName={setNewBizName}
        newBizPlan={newBizPlan}
        setNewBizPlan={setNewBizPlan}
        newBizMode={newBizMode}
        setNewBizMode={setNewBizMode}
        ownerName={ownerName}
        setOwnerName={setOwnerName}
        ownerEmail={ownerEmail}
        setOwnerEmail={setOwnerEmail}
        ownerPasscode={ownerPasscode}
        setOwnerPasscode={setOwnerPasscode}
        handleCreate={handleCreate}
      />

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Merchant Ecosystem</h3>
          <p className="text-slate-500 font-medium">Provision and supervise gateway connectivity</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-indigo-700 shadow-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
        >
          <Plus size={18} /> NEW PROVISION
        </button>
      </div>

      {selectedMerchant && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedMerchant(null)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"><ArrowLeft size={18} /></button>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-indigo-300">Merchant Detail</div>
                <h4 className="text-xl font-black">{selectedMerchant.name}</h4>
              </div>
            </div>
            {onSwitchMerchant && <button onClick={() => onSwitchMerchant(selectedMerchant)} className="px-3 py-2 rounded-lg bg-indigo-600 text-xs font-bold">Open Merchant</button>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800 rounded-xl p-3"><span className="text-slate-400 block">Mode</span><strong>{selectedMerchant.merchantMode || 'Unknown'}</strong></div>
            <div className="bg-slate-800 rounded-xl p-3"><span className="text-slate-400 block">Plan</span><strong>{selectedMerchant.plan}</strong></div>
            <div className="bg-slate-800 rounded-xl p-3"><span className="text-slate-400 block">Subscription Status</span><strong>{selectedMerchant.status}</strong></div>
            <div className="bg-slate-800 rounded-xl p-3"><span className="text-slate-400 block">Next Billing</span><strong>{selectedMerchant.nextBillingDate}</strong></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div><div className="flex items-center gap-2 font-bold mb-2"><Users size={15} /> Employees ({merchantEmployees.length})</div>{merchantEmployees.map(employee => <div key={employee.id} className="text-slate-300 py-1">{employee.name} · {employee.role}</div>)}</div>
            <div><div className="flex items-center gap-2 font-bold mb-2"><Smartphone size={15} /> Devices ({merchantDevices.length})</div>{merchantDevices.map(device => <div key={device.id} className="text-slate-300 py-1">{device.name} · {device.status}</div>)}</div>
            <div><div className="flex items-center gap-2 font-bold mb-2"><Flag size={15} /> Feature Flags</div>{Object.entries(integrationConfig || {}).map(([key, enabled]) => <div key={key} className="flex justify-between text-slate-300 py-1"><span>{key}</span><span className={enabled ? 'text-emerald-400' : 'text-slate-500'}>{enabled ? 'ON' : 'OFF'}</span></div>)}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
            <tr>
              <th className="px-8 py-6">Merchant Identity</th>
              <th className="px-8 py-6">Owner</th>
              <th className="px-8 py-6">Subscription</th>
              <th className="px-8 py-6">Gateway Status</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {businesses.map(biz => (
              <tr key={biz.id} onClick={() => setSelectedMerchant(biz)} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                      {biz.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">{biz.name}</p>
                      <p className="text-xs text-slate-400 font-mono">ID: {biz.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold text-slate-700 text-sm">{biz.ownerName}</p>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold uppercase">
                    {biz.plan}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-700">{biz.varConfig?.status || 'Active'}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  {onSwitchMerchant && (
                    <button
                      onClick={() => onSwitchMerchant(biz)}
                      className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 ml-auto transition-colors"
                    >
                      Impersonate <ExternalLink size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MerchantsSection;
