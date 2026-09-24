
import React, { useState } from 'react';
import { Employee, UserRole, Role, RolePermission, PermissionItem, PermissionGroup, RoleAssignmentRequest, PasscodeSettings } from '../../types';
import { Plus, Search, MoreVertical, Edit2, Trash2, X, User, Shield, DollarSign, Lock, Calendar, CheckCircle, AlertTriangle, Settings, Users, ToggleLeft, ToggleRight, Key, Grid, Briefcase, Check, XCircle, Phone, Mail, BadgeAlert, ChevronDown } from 'lucide-react';
import { MOCK_ROLES, MOCK_PERMISSIONS, MOCK_ROLE_PERMISSIONS, MOCK_PERMISSION_GROUPS, MOCK_ROLE_ASSIGNMENT_REQUESTS, MOCK_PASSCODE_SETTINGS } from '../../constants';
import { PermissionService } from '../../services/permissionService';

interface EmployeesProps {
  employees: Employee[];
  onAddEmployee?: (employee: Employee) => void;
  onUpdateEmployee?: (employee: Employee) => void;
  onDeleteEmployee?: (id: string) => void;
    currentUser?: Employee;
}

const Employees: React.FC<EmployeesProps> = ({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee, currentUser }) => {
  const [viewMode, setViewMode] = useState<'Employees' | 'Roles' | 'Matrix' | 'Assignments' | 'Security'>('Employees');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Profile' | 'Role' | 'Payroll' | 'Security'>('Profile');
  
  // State for Roles & Permissions
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(MOCK_ROLE_PERMISSIONS);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<Role | null>(null);
  const [showRoleEditModal, setShowRoleEditModal] = useState(false);

  // State for New Role Creation Workflow
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [cloneRoleId, setCloneRoleId] = useState('R-ADMIN');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [viewSelectedOnly, setViewSelectedOnly] = useState(false);

  // State for Assignments Workflow
  const [assignments, setAssignments] = useState<RoleAssignmentRequest[]>(MOCK_ROLE_ASSIGNMENT_REQUESTS);

  // State for Security Policy
  const [passcodeSettings, setPasscodeSettings] = useState<PasscodeSettings>(MOCK_PASSCODE_SETTINGS);

  // Form State
  const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({
      role: UserRole.STAFF,
      status: 'Active',
      payType: 'Hourly',
      hourlyRate: 0,
      hoursWorked: 0,
      permissions: [],
      deviceAccess: true
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Validation
  const isPasscodeUnique = (code: string, excludeId?: string) => {
    return !employees.some(emp => emp.passcode === code && emp.id !== excludeId);
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentEmployee({
      role: UserRole.STAFF,
      status: 'Active',
      payType: 'Hourly',
      hourlyRate: 0,
      hoursWorked: 0,
      permissions: [],
      deviceAccess: true
    });
    setFormError(null);
    setActiveTab('Profile');
    setShowModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setIsEditing(true);
    setCurrentEmployee({ ...emp });
    setFormError(null);
    setActiveTab('Profile');
    setShowModal(true);
  };

  const handleSaveEmployee = () => {
      setFormError(null);
      if (!currentEmployee.name || !currentEmployee.email || !currentEmployee.passcode) {
          setFormError("Name, Email, and Passcode are required.");
          return;
      }

      if (currentEmployee.passcode.length < passcodeSettings.minLength) {
          setFormError(`Passcode must be at least ${passcodeSettings.minLength} digits.`);
          return;
      }

      if (!isPasscodeUnique(currentEmployee.passcode, currentEmployee.id)) {
          setFormError("This passcode is already assigned to another employee. Please choose a unique code.");
          return;
      }

      if (isEditing && onUpdateEmployee) {
          onUpdateEmployee(currentEmployee as Employee);
      } else if (!isEditing && onAddEmployee) {
          const employee: Employee = {
              id: `E-${Date.now()}`,
              ...currentEmployee
          } as Employee;
          onAddEmployee(employee);
      }
      setShowModal(false);
  };

  // Permission Logic
  const isPermissionEnabled = (roleId: string, key: string) => {
      if (roleId === 'R-ADMIN') return true;
      const perm = rolePermissions.find(p => p.roleId === roleId && p.permissionKey === key);
      return perm ? perm.access : false;
  };

  const togglePermission = (roleId: string, key: string) => {
      setRolePermissions(prev => {
          const exists = prev.find(p => p.roleId === roleId && p.permissionKey === key);
          const next = exists
            ? prev.map(p => p.roleId === roleId && p.permissionKey === key ? { ...p, access: !p.access } : p)
            : [...prev, { roleId, permissionKey: key, access: true }];
          const permissions = next.filter(p => p.roleId === roleId && p.access).map(p => p.permissionKey);
          const actor = currentUser || employees.find(employee => employee.role === UserRole.SUPER_ADMIN);
          if (actor) void PermissionService.updateRolePresetPermissions(roleId, permissions, actor);
          return next;
      });
  };

  const handleAddRole = () => {
      setNewRoleName('');
      setCloneRoleId(roles[0]?.id || '');
      setSelectedEmployeeIds([]);
      setEmployeeSearch('');
      setViewSelectedOnly(false);
      setShowNewRoleModal(true);
  };

  const handleSaveNewRole = () => {
      if (!newRoleName.trim()) return;

      const newRoleId = `R-${Date.now()}`;
      const newRole: Role = {
          id: newRoleId,
          name: newRoleName,
          type: 'Custom',
          isSystem: false,
          description: 'Custom role',
          employeeCount: selectedEmployeeIds.length
      };

      // 1. Add Role
      setRoles([...roles, newRole]);

      // 2. Clone Permissions
      const permissionsToClone = rolePermissions.filter(rp => rp.roleId === cloneRoleId);
      const newPermissions = permissionsToClone.map(rp => ({ ...rp, roleId: newRoleId }));
      setRolePermissions([...rolePermissions, ...newPermissions]);

      // 3. Assign Employees (if any)
      if (selectedEmployeeIds.length > 0 && onUpdateEmployee) {
          selectedEmployeeIds.forEach(empId => {
              const emp = employees.find(e => e.id === empId);
              if (emp) {
                  onUpdateEmployee({ ...emp, role: newRoleName });
              }
          });
      }

      setShowNewRoleModal(false);
  };

  const openRoleSettings = (role: Role) => {
      setSelectedRoleForEdit(role);
      setShowRoleEditModal(true);
  }

  const handleAssignmentDecision = (id: string, status: 'Approved' | 'Denied') => {
      setAssignments(prev => prev.map(req => req.id === id ? { ...req, status } : req));
  };

  const permissionsByCategory = MOCK_PERMISSIONS.reduce((acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
  }, {} as Record<string, PermissionItem[]>);

  // New Role Modal Helper
  const toggleEmployeeSelection = (id: string) => {
      setSelectedEmployeeIds(prev => 
          prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
      );
  };

  const toggleSelectAll = () => {
      // Filter visible first to only select what's searchable/visible
      const visible = employees.filter(e => e.name.toLowerCase().includes(employeeSearch.toLowerCase())).map(e => e.id);
      
      const allSelected = visible.every(id => selectedEmployeeIds.includes(id));
      
      if (allSelected) {
          // Deselect visible
          setSelectedEmployeeIds(prev => prev.filter(id => !visible.includes(id)));
      } else {
          // Select all visible
          const newIds = new Set([...selectedEmployeeIds, ...visible]);
          setSelectedEmployeeIds(Array.from(newIds));
      }
  };

  // Render Modals
  const renderNewRoleModal = () => {
      const filteredEmployees = employees.filter(e => {
          const matchesSearch = e.name.toLowerCase().includes(employeeSearch.toLowerCase());
          const matchesView = viewSelectedOnly ? selectedEmployeeIds.includes(e.id) : true;
          return matchesSearch && matchesView;
      });

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-scale-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-black text-2xl text-slate-800 tracking-tight">New role</h3>
                    <button onClick={() => setShowNewRoleModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Role Details Section */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Role details</h4>
                        <p className="text-xs text-slate-500 italic">*Indicates a required field.</p>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Role name*</label>
                            <input 
                                type="text" 
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                placeholder="e.g. Senior Server"
                            />
                            <p className="text-xs text-slate-500 mt-2">Examples: Accountant, bartender, host, server</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">By default, this role will have the same permissions as:</label>
                            <div className="relative">
                                <select 
                                    value={cloneRoleId}
                                    onChange={(e) => setCloneRoleId(e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium bg-white appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Employees Section */}
                    <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-2">
                            <h4 className="font-bold text-lg text-slate-800">Employees</h4>
                            <p className="text-sm text-slate-500 mt-1">Select employees to be assigned to this role</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{employees.length} options are available.</span>
                            <div className="flex gap-4 text-sm font-bold">
                                <button 
                                    onClick={() => setViewSelectedOnly(false)}
                                    className={`${!viewSelectedOnly ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    View all ({employees.length})
                                </button>
                                <button 
                                    onClick={() => setViewSelectedOnly(true)}
                                    className={`${viewSelectedOnly ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    View selected ({selectedEmployeeIds.length})
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={employeeSearch}
                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                placeholder="Search employee" 
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    checked={filteredEmployees.length > 0 && filteredEmployees.every(e => selectedEmployeeIds.includes(e.id))}
                                    onChange={toggleSelectAll}
                                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className="text-sm font-bold text-slate-700">Select all</span>
                            </div>
                            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 bg-white">
                                {filteredEmployees.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm italic">No employees found.</div>
                                ) : (
                                    filteredEmployees.map(emp => (
                                        <label key={emp.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedEmployeeIds.includes(emp.id)}
                                                onChange={() => toggleEmployeeSelection(emp.id)}
                                                className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                                                    <p className="text-xs text-slate-500">{emp.email}</p>
                                                </div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
                    <button 
                        onClick={() => setShowNewRoleModal(false)}
                        className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSaveNewRole}
                        disabled={!newRoleName}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:shadow-none"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
      );
  }

  const renderEmployeeModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-scale-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-800">{isEditing ? 'Edit Team Member' : 'Add New Team Member'}</h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={24} />
                  </button>
              </div>
              
              <div className="flex border-b border-slate-200">
                  {['Profile', 'Role', 'Payroll', 'Security'].map((tab) => (
                      <button 
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2
                              ${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                      >
                          {tab === 'Profile' && <User size={16} />}
                          {tab === 'Role' && <Shield size={16} />}
                          {tab === 'Payroll' && <DollarSign size={16} />}
                          {tab === 'Security' && <Lock size={16} />}
                          {tab}
                      </button>
                  ))}
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                  {formError && (
                      <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-800 text-sm animate-shake">
                          <BadgeAlert size={20} className="shrink-0" />
                          <p className="font-medium">{formError}</p>
                      </div>
                  )}

                  {activeTab === 'Profile' && (
                      <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                  <input type="text" value={currentEmployee.name || ''} onChange={e => setCurrentEmployee({...currentEmployee, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="John Doe" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Nickname</label>
                                  <input type="text" value={currentEmployee.nickname || ''} onChange={e => setCurrentEmployee({...currentEmployee, nickname: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Johnny" />
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                                <input type="email" value={currentEmployee.email || ''} onChange={e => setCurrentEmployee({...currentEmployee, email: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input type="tel" value={currentEmployee.phone || ''} onChange={e => setCurrentEmployee({...currentEmployee, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="555-0199" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select value={currentEmployee.status} onChange={e => setCurrentEmployee({...currentEmployee, status: e.target.value as any})} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white">
                                <option value="Active">Active</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Terminated">Terminated</option>
                            </select>
                          </div>
                      </div>
                  )}
                  {activeTab === 'Role' && (
                      <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Role Assignment *</label>
                            <select value={currentEmployee.role} onChange={e => setCurrentEmployee({...currentEmployee, role: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                          </div>
                          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                              <Shield size={18} className="text-blue-600 mt-0.5 shrink-0" />
                              <p className="text-xs text-blue-700 leading-relaxed">
                                  Permissions for this employee are inherited from their assigned role. Managers can override role-based permissions in the 'Matrix' view.
                              </p>
                          </div>
                      </div>
                  )}
                  {activeTab === 'Payroll' && (
                      <div className="space-y-4 animate-fade-in">
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Pay Type</label>
                                  <select value={currentEmployee.payType} onChange={e => setCurrentEmployee({...currentEmployee, payType: e.target.value as any})} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white">
                                      <option value="Hourly">Hourly</option>
                                      <option value="Salary">Salary</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">{currentEmployee.payType === 'Salary' ? 'Annual Salary' : 'Hourly Rate ($)'}</label>
                                  <div className="relative">
                                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                      <input type="number" value={currentEmployee.hourlyRate || ''} onChange={e => setCurrentEmployee({...currentEmployee, hourlyRate: parseFloat(e.target.value)})} className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}
                  {activeTab === 'Security' && (
                      <div className="space-y-6 animate-fade-in">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Device Access Passcode *</label>
                              <div className="relative">
                                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input 
                                    type="text" 
                                    maxLength={8}
                                    value={currentEmployee.passcode || ''} 
                                    onChange={e => setCurrentEmployee({...currentEmployee, passcode: e.target.value.replace(/\D/g, '')})} 
                                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest text-lg" 
                                    placeholder="----"
                                  />
                              </div>
                              <p className="text-xs text-slate-500 mt-2">Passcodes must be unique across all employees.</p>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Allow Device Login</h4>
                                    <p className="text-xs text-slate-500">Enable this user to log into registers.</p>
                                </div>
                                <button 
                                    onClick={() => setCurrentEmployee({...currentEmployee, deviceAccess: !currentEmployee.deviceAccess})}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${currentEmployee.deviceAccess ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${currentEmployee.deviceAccess ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                          </div>
                      </div>
                  )}
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
                  <button onClick={handleSaveEmployee} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all active:scale-95">
                      {isEditing ? 'Update Employee' : 'Create Employee'}
                  </button>
              </div>
          </div>
      </div>
  );

  const renderRoleEditModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-scale-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-800">Edit Role: {selectedRoleForEdit?.name}</h3>
                  <button onClick={() => setShowRoleEditModal(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={24} />
                  </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                      <h4 className="font-bold text-slate-800 mb-4">Role Details</h4>
                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                              <input type="text" defaultValue={selectedRoleForEdit?.name} disabled={selectedRoleForEdit?.isSystem} className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 disabled:text-slate-500" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                              <input type="text" defaultValue={selectedRoleForEdit?.description} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                          </div>
                      </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                          <h4 className="font-bold text-slate-800">Permissions</h4>
                          <div className="text-xs text-slate-500">Toggle features for this role</div>
                      </div>
                      <div className="p-6 space-y-8">
                          {Object.entries(permissionsByCategory).map(([category, items]: [string, PermissionItem[]]) => (
                              <div key={category}>
                                  <h5 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-1">{category}</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {items.map(perm => {
                                          const enabled = isPermissionEnabled(selectedRoleForEdit?.id || '', perm.key);
                                          return (
                                              <div key={perm.key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                                                  <button 
                                                      onClick={() => selectedRoleForEdit && togglePermission(selectedRoleForEdit.id, perm.key)}
                                                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                                  >
                                                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                                  </button>
                                                  <div>
                                                      <p className="text-sm font-medium text-slate-900">{perm.name}</p>
                                                      {perm.description && <p className="text-xs text-slate-500">{perm.description}</p>}
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => setShowRoleEditModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Close</button>
                  <button onClick={() => setShowRoleEditModal(false)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm">Save Changes</button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="space-y-6 relative">
      {showModal && renderEmployeeModal()}
      {showRoleEditModal && renderRoleEditModal()}
      {showNewRoleModal && renderNewRoleModal()}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
              {viewMode === 'Employees' ? 'Employee Management' : 
               viewMode === 'Assignments' ? 'Role Assignments' :
               viewMode === 'Security' ? 'Security Policies' : 'Roles & Permissions'}
          </h1>
          <p className="text-slate-500">
              {viewMode === 'Employees' ? 'Manage staff roles, hours, and performance' : 
               viewMode === 'Assignments' ? 'Approve or deny pending role changes' :
               viewMode === 'Security' ? 'Configure device access and passcodes' :
               'Configure granular access control and security'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
            <div className="bg-white border border-slate-300 rounded-lg p-1 flex">
                <button 
                    onClick={() => setViewMode('Employees')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'Employees' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    List
                </button>
                <button 
                    onClick={() => setViewMode('Roles')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'Roles' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Roles
                </button>
                <button 
                    onClick={() => setViewMode('Matrix')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'Matrix' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Matrix
                </button>
                <button 
                    onClick={() => setViewMode('Assignments')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${viewMode === 'Assignments' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Approvals
                    {assignments.filter(a => a.status === 'Pending').length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                            {assignments.filter(a => a.status === 'Pending').length}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => setViewMode('Security')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'Security' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Security
                </button>
            </div>
            {viewMode === 'Employees' ? (
                <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                    <Plus size={18} /> Add Employee
                </button>
            ) : viewMode === 'Roles' ? (
                <button onClick={handleAddRole} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                    <Plus size={18} /> Add Role
                </button>
            ) : null}
        </div>
      </div>

      {/* --- EMPLOYEES VIEW --- */}
      {viewMode === 'Employees' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search employees..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Passcode</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3 border border-indigo-200">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{emp.name}</div>
                            <div className="text-sm text-slate-500">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm ${emp.status === 'Active' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono tracking-widest">
                        {emp.passcode || '****'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => handleOpenEdit(emp)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => onDeleteEmployee && onDeleteEmployee(emp.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      )}

      {/* --- ROLES TABLE VIEW --- */}
      {viewMode === 'Roles' && (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                          <tr>
                              <th className="px-6 py-4">Role Name</th>
                              <th className="px-6 py-4">Type</th>
                              <th className="px-6 py-4">Employees</th>
                              <th className="px-6 py-4">Description</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {roles.map(role => (
                              <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 font-bold text-slate-900">{role.name}</td>
                                  <td className="px-6 py-4">
                                      <span className={`text-xs px-2 py-1 rounded font-medium border ${role.type === 'Default' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                                          {role.type}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-slate-600">
                                      <div className="flex items-center gap-2">
                                          <Users size={16} /> {role.employeeCount || 0}
                                      </div>
                                  </td>
                                  <td className="px-6 py-4 text-slate-500 text-sm">{role.description}</td>
                                  <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-2">
                                          <button 
                                              onClick={() => openRoleSettings(role)}
                                              className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                                          >
                                              Manage
                                          </button>
                                          {!role.isSystem && (
                                              <button className="p-1 text-red-500 hover:bg-red-50 rounded border border-transparent hover:border-red-100">
                                                  <Trash2 size={16} />
                                              </button>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>

              {/* Permission Groups Section */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Permission Groups</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {MOCK_PERMISSION_GROUPS.map(group => (
                          <div key={group.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-slate-900">{group.name}</h4>
                                  <Settings size={16} className="text-slate-400 cursor-pointer hover:text-indigo-600" />
                              </div>
                              <p className="text-sm text-slate-500 mb-3">{group.description}</p>
                              <div className="flex gap-2 flex-wrap">
                                  {group.permissions.slice(0, 3).map(p => (
                                      <span key={p} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                          {p.replace('ACCESS_', '')}
                                      </span>
                                  ))}
                                  {group.permissions.length > 3 && <span className="text-[10px] text-slate-400 px-1">+{group.permissions.length - 3} more</span>}
                              </div>
                          </div>
                      ))}
                      <button className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                          <Plus size={24} className="mb-1" />
                          <span className="font-medium text-sm">Create Group</span>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- PERMISSIONS MATRIX VIEW --- */}
      {viewMode === 'Matrix' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Grid size={18} /> Role Permission Matrix
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Toggle access across all roles globally.</p>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-slate-100 text-xs uppercase text-slate-600 font-bold sticky top-0 z-10">
                              <th className="px-4 py-4 border-r border-slate-200 bg-slate-100 w-64 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                  Permission Module
                              </th>
                              {roles.map(role => (
                                  <th key={role.id} className="px-4 py-4 text-center border-r border-slate-200 min-w-[100px]">
                                      {role.name}
                                  </th>
                              ))}
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                          {Object.entries(permissionsByCategory).map(([category, items]: [string, PermissionItem[]]) => (
                              <React.Fragment key={category}>
                                  <tr className="bg-slate-50">
                                      <td colSpan={roles.length + 1} className="px-4 py-2 font-bold text-slate-500 text-xs uppercase tracking-wider border-y border-slate-200 sticky left-0 z-10">
                                          {category}
                                      </td>
                                  </tr>
                                  {items.map(perm => (
                                      <tr key={perm.key} className="hover:bg-indigo-50/30 transition-colors">
                                          <td className="px-4 py-3 font-medium text-slate-900 border-r border-slate-200 bg-white sticky left-0 z-10">
                                              {perm.name}
                                          </td>
                                          {roles.map(role => {
                                              const enabled = isPermissionEnabled(role.id, perm.key);
                                              return (
                                                  <td key={`${role.id}-${perm.key}`} className="px-4 py-3 text-center border-r border-slate-200">
                                                      <button 
                                                          onClick={() => togglePermission(role.id, perm.key)}
                                                          disabled={role.id === 'R-ADMIN'} // Admin always has access
                                                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none 
                                                              ${role.id === 'R-ADMIN' ? 'cursor-not-allowed opacity-70 bg-emerald-500' : enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                                      >
                                                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                                                      </button>
                                                  </td>
                                              );
                                          })}
                                      </tr>
                                  ))}
                              </React.Fragment>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* --- ASSIGNMENTS WORKFLOW --- */}
      {viewMode === 'Assignments' && (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                          <Briefcase size={20} /> Pending Role Assignments
                      </h3>
                      <p className="text-sm text-slate-500">Approve or deny role changes requested by managers.</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {assignments.filter(a => a.status === 'Pending').length === 0 ? (
                          <div className="p-12 text-center text-slate-500 italic">
                              No pending assignment requests.
                          </div>
                      ) : (
                          assignments.filter(a => a.status === 'Pending').map(req => (
                              <div key={req.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                  <div className="flex gap-4 items-center">
                                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                          {req.employeeName.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="font-bold text-slate-900">{req.employeeName} <span className="font-normal text-slate-500">({req.employeeId})</span></p>
                                          <div className="flex items-center gap-2 text-sm mt-1">
                                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{req.currentRole}</span>
                                              <span className="text-slate-400">→</span>
                                              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-medium">{req.requestedRole}</span>
                                          </div>
                                          <p className="text-xs text-slate-400 mt-2">Requested by {req.requesterName} on {req.date}</p>
                                      </div>
                                  </div>
                                  <div className="flex gap-3">
                                      <button 
                                          onClick={() => handleAssignmentDecision(req.id, 'Denied')}
                                          className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 font-medium flex items-center gap-2 transition-colors"
                                      >
                                          <XCircle size={16} /> Deny
                                      </button>
                                      <button 
                                          onClick={() => handleAssignmentDecision(req.id, 'Approved')}
                                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 shadow-sm transition-colors"
                                      >
                                          <Check size={16} /> Approve
                                      </button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <h4 className="font-bold text-slate-800 mb-4">Recent History</h4>
                  <div className="space-y-3">
                      {assignments.filter(a => a.status !== 'Pending').map(req => (
                          <div key={req.id} className="flex items-center justify-between text-sm bg-white p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-700">
                                  <strong>{req.employeeName}</strong>: {req.currentRole} → {req.requestedRole}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {req.status}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- SECURITY / PASSCODE SETTINGS --- */}
      {viewMode === 'Security' && (
          <div className="space-y-6 max-w-3xl animate-fade-in">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                          <Lock size={20} /> Device Passcode Policy
                      </h3>
                      <p className="text-sm text-slate-500">Enforce security standards for POS access.</p>
                  </div>
                  <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                              <h4 className="font-bold text-slate-900">Require Passcode</h4>
                              <p className="text-sm text-slate-500">Employees must enter a code to unlock the register.</p>
                          </div>
                          <button 
                              onClick={() => setPasscodeSettings(prev => ({...prev, requirePasscode: !prev.requirePasscode}))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${passcodeSettings.requirePasscode ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${passcodeSettings.requirePasscode ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Length</label>
                              <select 
                                  value={passcodeSettings.minLength}
                                  onChange={(e) => setPasscodeSettings(prev => ({...prev, minLength: parseInt(e.target.value)}))}
                                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                  <option value={4}>4 Digits (Standard)</option>
                                  <option value={6}>6 Digits (Secure)</option>
                                  <option value={8}>8 Digits (High Security)</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Passcode Expiration</label>
                              <select 
                                  value={passcodeSettings.expirationDays}
                                  onChange={(e) => setPasscodeSettings(prev => ({...prev, expirationDays: parseInt(e.target.value)}))}
                                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                  <option value={0}>Never</option>
                                  <option value={30}>Every 30 Days</option>
                                  <option value={90}>Every 90 Days</option>
                                  <option value={180}>Every 6 Months</option>
                              </select>
                          </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                          <input 
                              type="checkbox" 
                              id="complexity" 
                              checked={passcodeSettings.requireAlpha}
                              onChange={(e) => setPasscodeSettings(prev => ({...prev, requireAlpha: e.target.checked}))}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="complexity" className="text-sm text-slate-700 font-medium">Require complex passcodes (letters + numbers)</label>
                      </div>
                  </div>
                  <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
                      <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors">
                          Update Policy
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Employees;
