import React, { useState, useMemo } from 'react';
import { Employee, UserRole } from '../../../types';
import {
  PermissionService,
  ALL_POS_PERMISSIONS,
  ROLE_DEFAULT_PERMISSIONS,
  PermissionDefinition,
} from '../../../services/permissionService';
import {
  Shield,
  Key,
  Search,
  Users,
  Check,
  AlertCircle,
  RefreshCw,
  X,
  ChevronRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface PosSettingsEmployeesSectionProps {
  employees: Employee[];
  currentUser?: Employee;
  onUpdateEmployee?: (updated: Employee) => void;
}

export const PosSettingsEmployeesSection: React.FC<PosSettingsEmployeesSectionProps> = ({
  employees,
  currentUser,
  onUpdateEmployee,
}) => {
  const canManage = currentUser ? PermissionService.can(currentUser, 'roles.permissions.manage') : true;

  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'ROLE_TEMPLATES'>('EMPLOYEES');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [permissionQuery, setPermissionQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  // Employee-specific state
  const [stagedRole, setStagedRole] = useState<UserRole>((selectedEmployee?.role as UserRole) || 'STAFF');
  const [stagedPermissions, setStagedPermissions] = useState<string[]>(() =>
    selectedEmployee ? PermissionService.getEffectivePermissions(selectedEmployee) : []
  );

  // Role Template state
  const [selectedRoleTemplate, setSelectedRoleTemplate] = useState<string>('SERVER');
  const [stagedTemplatePerms, setStagedTemplatePerms] = useState<string[]>(() =>
    PermissionService.getRoleDefaultPermissions('SERVER')
  );

  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [stagedPin, setStagedPin] = useState<string | null>(null);

  // Role change prompt
  const [showRoleDefaultPrompt, setShowRoleDefaultPrompt] = useState(false);

  const actor: Employee = currentUser || {
    id: 'E_ADMIN',
    name: 'Administrator',
    role: 'BUSINESS_ADMIN',
    email: 'admin@pos.internal',
    hourlyRate: 0,
    hoursWorked: 0,
    status: 'Active',
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmpId(emp.id);
    setStagedRole((emp.role as UserRole) || 'STAFF');
    setStagedPermissions(PermissionService.getEffectivePermissions(emp));
    setShowRoleDefaultPrompt(false);
    setShowPinModal(false);
    setPinError(null);
    setStagedPin(null);
    setStatusMessage(null);
  };

  const handleSelectRoleTemplate = (role: string) => {
    setSelectedRoleTemplate(role);
    setStagedTemplatePerms(PermissionService.getRoleDefaultPermissions(role));
    setStatusMessage(null);
  };

  const handleRoleChange = (newRoleVal: string) => {
    setStagedRole(newRoleVal as UserRole);
    if (selectedEmployee && newRoleVal !== selectedEmployee.role) {
      setShowRoleDefaultPrompt(true);
    } else {
      setShowRoleDefaultPrompt(false);
    }
  };

  const handleApplyRoleDefaults = () => {
    const r = (stagedRole || '').toUpperCase();
    const defaults = PermissionService.getRoleDefaultPermissions(r);
    setStagedPermissions([...defaults]);
    setShowRoleDefaultPrompt(false);
    setStatusMessage(`Applied default permission preset for role: ${stagedRole}`);
  };

  const handleDismissRolePrompt = () => {
    setShowRoleDefaultPrompt(false);
  };

  const handleTogglePermission = (permId: string) => {
    if (activeTab === 'ROLE_TEMPLATES') {
      setStagedTemplatePerms((prev) =>
        prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
      );
    } else {
      setStagedPermissions((prev) =>
        prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
      );
    }
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredPermissions.map((p) => p.id);
    if (activeTab === 'ROLE_TEMPLATES') {
      setStagedTemplatePerms((prev) => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      setStagedPermissions((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleDeselectAllVisible = () => {
    const visibleSet = new Set(filteredPermissions.map((p) => p.id));
    if (activeTab === 'ROLE_TEMPLATES') {
      setStagedTemplatePerms((prev) => prev.filter((p) => !visibleSet.has(p)));
    } else {
      setStagedPermissions((prev) => prev.filter((p) => !visibleSet.has(p)));
    }
  };

  const handleResetToDefaults = () => {
    if (activeTab === 'ROLE_TEMPLATES') {
      const r = selectedRoleTemplate.toUpperCase();
      const defaults = PermissionService.getRoleDefaultPermissions(r);
      setStagedTemplatePerms([...defaults]);
      setStatusMessage(`Reset ${selectedRoleTemplate} template to standard preset.`);
    } else {
      if (!selectedEmployee) return;
      const r = (stagedRole || selectedEmployee.role || '').toUpperCase();
      const defaults = PermissionService.getRoleDefaultPermissions(r);
      setStagedPermissions([...defaults]);
      setStatusMessage(`Permissions reset to ${stagedRole} defaults.`);
    }
  };

  const handleSavePin = () => {
    setPinError(null);
    const pin = newPin.trim();
    if (!/^\d{4,6}$/.test(pin)) {
      setPinError('PIN must consist of 4 to 6 numeric digits.');
      return;
    }
    if (pin !== confirmPin.trim()) {
      setPinError('PIN entries do not match. Please re-enter.');
      return;
    }
    setStagedPin(pin);
    setShowPinModal(false);
    setNewPin('');
    setConfirmPin('');
    setStatusMessage('New PIN staged. Click "Save & Audit Profile" below to apply.');
  };

  const handleSaveProfile = async () => {
    if (activeTab === 'ROLE_TEMPLATES') {
      try {
        await PermissionService.updateRolePresetPermissions(
          selectedRoleTemplate,
          stagedTemplatePerms,
          actor
        );
        setStatusMessage(
          `Role Template for "${selectedRoleTemplate}" successfully updated. POS Hub recalculated.`
        );
        setTimeout(() => setStatusMessage(null), 5000);
      } catch (err) {
        console.error('[PosSettingsEmployeesSection] Error saving role template:', err);
        setStatusMessage('Failed to save role template.');
      }
      return;
    }

    if (selectedEmployee) {
      try {
        const res = await PermissionService.saveEmployeeSecurityProfile({
          employeeId: selectedEmployee.id,
          role: stagedRole,
          permissions: stagedPermissions,
          passcode: stagedPin || undefined,
          actor,
        });
        if (res.success && res.employee) {
          const updated: Employee = {
            ...selectedEmployee,
            role: stagedRole,
            permissions: [...stagedPermissions],
            passcode: stagedPin || selectedEmployee.passcode,
          };
          if (onUpdateEmployee) onUpdateEmployee(updated);
          setStagedPin(null);
          setShowRoleDefaultPrompt(false);
          setStatusMessage(
            `Security profile and permissions saved for ${selectedEmployee.name}. POS Hub recalculated.`
          );
          setTimeout(() => setStatusMessage(null), 5000);
        }
      } catch (err) {
        console.error('[PosSettingsEmployeesSection] Error saving employee security profile:', err);
        setStatusMessage('Failed to save security profile.');
      }
    }
  };

  const CATEGORIES = [
    'ALL',
    'App Access',
    'Operations',
    'Dining & Tables',
    'Hardware & Setup',
    'Financial & Cash',
  ];

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.role && e.role.toLowerCase().includes(q)) ||
        (e.email && e.email.toLowerCase().includes(q))
    );
  }, [employees, searchQuery]);

  const filteredPermissions = useMemo(() => {
    return ALL_POS_PERMISSIONS.filter((p) => {
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      if (permissionQuery.trim()) {
        const q = permissionQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [categoryFilter, permissionQuery]);

  const allRoleKeys = Object.keys(ROLE_DEFAULT_PERMISSIONS);

  if (!canManage) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
        <Lock size={36} className="text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Staff Management Restricted</h3>
        <p className="text-xs text-slate-400 mt-1">
          You lack 'roles.permissions.manage' permission to view or configure employee security profiles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="text-indigo-400" size={24} />
              <h3 className="text-xl font-black text-white">Staff Roles & Permissions Governance</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                roles.permissions.manage
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Configure baseline permissions per organizational role template, or set fine-grained overrides and PINs per individual staff member.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <button
                onClick={() => {
                  setActiveTab('EMPLOYEES');
                  setStatusMessage(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'EMPLOYEES'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users size={15} />
                <span>Staff Profiles ({employees.length})</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('ROLE_TEMPLATES');
                  setStatusMessage(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'ROLE_TEMPLATES'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield size={15} />
                <span>Role Templates ({allRoleKeys.length})</span>
              </button>
            </div>

            {statusMessage && (
              <div className="px-4 py-2.5 bg-emerald-950/80 border border-emerald-600/60 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-950/40 animate-fade-in">
                <CheckCircle2 size={16} />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Staff List or Role Template List */}
        <div className="lg:col-span-4 space-y-3">
          {activeTab === 'EMPLOYEES' ? (
            <>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Staff Members ({filteredEmployees.length})
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search staff by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredEmployees.map((emp) => {
                  const isSelected = emp.id === selectedEmployee?.id;
                  const perms =
                    emp.permissions && emp.permissions.length > 0
                      ? emp.permissions
                      : PermissionService.getRoleDefaultPermissions(emp.role || '');
                  const hasPin = !!emp.passcode;

                  return (
                    <button
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-950/40 text-white'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-sm shadow-sm shrink-0 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {emp.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-sm text-white flex items-center gap-2 truncate">
                            <span className="truncate">{emp.name}</span>
                            {isSelected && (
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold shrink-0">
                                Editing
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="font-semibold text-slate-300">{emp.role}</span>
                            <span>•</span>
                            <span>{perms.length} perms</span>
                            <span>•</span>
                            <span className={hasPin ? 'text-emerald-400 font-mono' : 'text-slate-500'}>
                              {hasPin ? 'PIN set' : 'No PIN'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className={`shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`}
                      />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Role Templates ({allRoleKeys.length})
                </span>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {allRoleKeys.map((roleKey) => {
                  const isSelected = roleKey === selectedRoleTemplate;
                  const perms = PermissionService.getRoleDefaultPermissions(roleKey);
                  const assignedCount = employees.filter(
                    (e) => (e.role || '').toUpperCase() === roleKey.toUpperCase()
                  ).length;

                  return (
                    <button
                      key={roleKey}
                      onClick={() => handleSelectRoleTemplate(roleKey)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-950/40 text-white'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-sm shadow-sm shrink-0 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Shield size={18} />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-sm text-white flex items-center gap-2 truncate">
                            <span className="truncate">{roleKey}</span>
                            {isSelected && (
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-semibold shrink-0">
                                Template
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="text-indigo-400 font-mono font-semibold">
                              {perms.length} permissions
                            </span>
                            <span>•</span>
                            <span>{assignedCount} staff assigned</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className={`shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`}
                      />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Security Profile Editor */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            {activeTab === 'EMPLOYEES' ? (
              selectedEmployee && (
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-black text-xl flex items-center justify-center shadow-inner">
                      {selectedEmployee.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white">{selectedEmployee.name}</h4>
                      <p className="text-xs text-slate-400">
                        ID: <span className="font-mono text-slate-300">{selectedEmployee.id}</span> • Email: {selectedEmployee.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                        Assigned Role
                      </span>
                      <select
                        value={stagedRole}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm"
                      >
                        {allRoleKeys.map((rk) => (
                          <option key={rk} value={rk}>
                            {rk}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                        Terminal PIN
                      </span>
                      <button
                        onClick={() => {
                          setShowPinModal(true);
                          setPinError(null);
                          setNewPin('');
                          setConfirmPin('');
                        }}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-mono font-bold text-indigo-300 flex items-center gap-2 transition-all shadow-sm"
                      >
                        <Key size={14} />
                        <span>
                          {stagedPin
                            ? `PIN: ${stagedPin} (Staged)`
                            : selectedEmployee.passcode
                            ? 'PIN Configured'
                            : 'Set PIN'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-black text-xl flex items-center justify-center shadow-inner">
                    <Shield size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-black text-white">Role Template: {selectedRoleTemplate}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                        Baseline Preset
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      New employees assigned to <span className="text-slate-200 font-semibold">{selectedRoleTemplate}</span> inherit these permissions automatically unless custom overrides are specified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Role Change Default Preset Confirmation Prompt */}
            {activeTab === 'EMPLOYEES' && showRoleDefaultPrompt && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-indigo-400 shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-bold text-white">
                      Role changed to <span className="text-indigo-300">{stagedRole}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Would you like to apply the default permission preset for {stagedRole}?
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleApplyRoleDefaults}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Apply {stagedRole} Defaults
                  </button>
                  <button
                    onClick={handleDismissRolePrompt}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    Keep Custom
                  </button>
                </div>
              </div>
            )}

            {/* Permissions Filters & Search Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        categoryFilter === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="text"
                    placeholder="Filter permissions..."
                    value={permissionQuery}
                    onChange={(e) => setPermissionQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <span>Showing {filteredPermissions.length} permissions</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllVisible}
                    className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold"
                  >
                    Select All
                  </button>
                  <span>•</span>
                  <button
                    onClick={handleDeselectAllVisible}
                    className="text-slate-400 hover:text-slate-200 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            </div>

            {/* Permissions Matrix Checklist */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredPermissions.map((perm) => {
                const isEnabled =
                  activeTab === 'ROLE_TEMPLATES'
                    ? stagedTemplatePerms.includes(perm.id)
                    : stagedPermissions.includes(perm.id);

                return (
                  <div
                    key={perm.id}
                    onClick={() => handleTogglePermission(perm.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                      isEnabled
                        ? 'bg-indigo-950/40 border-indigo-500/50 hover:border-indigo-400 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="pr-3 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{perm.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                          {perm.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{perm.description}</p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isEnabled
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-800 border border-slate-700 text-transparent'
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToDefaults}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <RefreshCw size={14} />
                  <span>
                    {activeTab === 'ROLE_TEMPLATES'
                      ? 'Reset to System Default'
                      : `Reset to ${stagedRole} Template`}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveProfile}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {activeTab === 'ROLE_TEMPLATES'
                      ? `Save & Deploy "${selectedRoleTemplate}" Template`
                      : 'Save & Audit Profile'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Set PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <Key size={20} />
                <h4 className="font-bold text-sm text-white">Configure Terminal PIN</h4>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter a 4 to 6-digit numeric passcode for operator authentication on locked terminals.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  New Passcode PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono text-lg text-white tracking-widest focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Confirm Passcode PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center font-mono text-lg text-white tracking-widest focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 font-semibold text-center">{pinError}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePin}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-indigo-600/30"
              >
                Stage PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
