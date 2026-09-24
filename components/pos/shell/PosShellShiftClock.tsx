import React, { useState, useEffect } from 'react';
import { Clock, Coffee, Play, Pause, CheckCircle2, User } from 'lucide-react';
import { Employee } from '../../../types';

interface PosShellShiftClockProps {
  currentUser?: Employee | null;
  isClockedIn?: boolean;
  setIsClockedIn?: (val: boolean) => void;
  onBreak?: boolean;
  setOnBreak?: (val: boolean) => void;
  clockInTime?: string;
  setClockInTime?: (val: string) => void;
  shiftHours?: number;
}

export const PosShellShiftClock: React.FC<PosShellShiftClockProps> = ({
  currentUser,
  isClockedIn = true,
  setIsClockedIn,
  onBreak = false,
  setOnBreak,
  clockInTime = '08:00 AM',
  setClockInTime,
  shiftHours = 4.5,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 text-center">
        <div className="inline-flex p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
          <Clock size={36} />
        </div>

        <div>
          <div className="font-mono text-4xl font-black tracking-tight text-white mb-1">{currentTime}</div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Official Terminal Time</p>
        </div>

        {currentUser && (
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-750 flex items-center justify-between text-left">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{currentUser.name}</h4>
                <p className="text-xs text-slate-400">{currentUser.role}</p>
              </div>
            </div>
            <span
              className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                isClockedIn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {isClockedIn ? (onBreak ? 'On Break' : 'Clocked In') : 'Off Shift'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (setIsClockedIn) setIsClockedIn(!isClockedIn);
            }}
            className={`py-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
              isClockedIn
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isClockedIn ? <Pause size={18} /> : <Play size={18} />}
            <span>{isClockedIn ? 'Clock Out' : 'Clock In'}</span>
          </button>

          <button
            onClick={() => {
              if (setOnBreak) setOnBreak(!onBreak);
            }}
            disabled={!isClockedIn}
            className={`py-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all border ${
              onBreak
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-750 disabled:opacity-40'
            }`}
          >
            <Coffee size={18} />
            <span>{onBreak ? 'End Break' : 'Start Break'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
