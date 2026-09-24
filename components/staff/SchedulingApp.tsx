import React, { useState } from 'react';
import { Calendar, Clock, Plus, Users, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Schedule, Employee } from '../../types';

interface SchedulingAppProps {
  schedules?: Schedule[];
  employees?: Employee[];
  onAddSchedule?: (schedule: Schedule) => void;
  onSyncSchedules?: (schedules: Schedule[]) => void;
  initialTab?: string;
}

export const SchedulingApp: React.FC<SchedulingAppProps> = ({
  schedules = [],
  employees = [],
  onAddSchedule,
  onSyncSchedules,
  initialTab = 'Schedule',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              {activeTab === 'Time Clock' ? <Clock size={24} /> : <Calendar size={24} />}
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {activeTab === 'Time Clock' ? 'Staff Time Clock & Punches' : 'Employee Scheduling'}
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            {activeTab === 'Time Clock'
              ? 'Real-time clock-in records, meal breaks, and shift audit logs.'
              : 'Weekly roster, shift assignments, and labor coverage planning.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('Schedule')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                activeTab === 'Schedule' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('Time Clock')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                activeTab === 'Time Clock' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Time Clock
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'Schedule' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-slate-800">Roster Calendar</span>
              <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1 rounded-full">
                {schedules.length} Assigned Shifts
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {schedules.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No shifts scheduled for this period.</div>
            ) : (
              schedules.map((sch) => {
                const emp = employees.find((e) => e.id === sch.employeeId);
                return (
                  <div key={sch.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center">
                        {(emp?.name || sch.employeeId || 'E').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{emp?.name || sch.employeeId}</h4>
                        <p className="text-xs text-slate-500">
                          {sch.role || emp?.role || 'Staff'} • {sch.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block font-mono text-sm font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700">
                        {sch.startTime} - {sch.endTime}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Active Shift Clocks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div key={emp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">{emp.name}</h4>
                  <p className="text-xs text-slate-500">{emp.role}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                  Clocked In
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulingApp;
