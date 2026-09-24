import React, { useState } from 'react';
import { Lock, Delete, ArrowRight, Shield, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';
import { Employee } from '../../types';
import { NativeBridge } from '../../services/nativeBridge';
import { AuthService, AuthSession } from '../../services/authService';
import { DeviceIdentityService } from '../../services/deviceIdentityService';

interface PosPinLockScreenProps {
  employees: Employee[];
  merchantId: string;
  deviceId: string;
  terminalName?: string;
  merchantName?: string;
  onUnlock: (employee: Employee) => void;
  onResetDevice?: () => void;
  demoAccounts?: Employee[];
  onAuthenticated?: (session: AuthSession) => void;
}

export const PosPinLockScreen: React.FC<PosPinLockScreenProps> = ({
  employees,
  merchantId,
  deviceId,
  terminalName = 'Front Register 1 (DEV-POS-01)',
  merchantName = 'Lumi Restaurant & Bar',
  onUnlock,
  onResetDevice,
  demoAccounts = [],
  onAuthenticated,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length >= 6 || isVerifying) return;
    NativeBridge.beep(2200, 40);
    setError(null);
    const newPin = pin + num;
    setPin(newPin);

    // Auto-check if 4 digits
    if (newPin.length === 4) {
      void verifyPin(newPin);
    }
  };

  const handleBackspace = () => {
    NativeBridge.beep(1800, 40);
    setError(null);
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    NativeBridge.beep(1600, 50);
    setError(null);
    setPin('');
  };

  const verifyPin = async (candidatePin: string) => {
    setIsVerifying(true);
    try {
      const session = await AuthService.loginWithPin({ merchantId, deviceId, pin: candidatePin });
      NativeBridge.beep(2800, 80);
      onAuthenticated?.(session);
      onUnlock(session.employee);
    } catch {
      NativeBridge.beep(800, 200);
      setError('Invalid PIN.');
      setTimeout(() => setPin(''), 600);
    } finally {
      setIsVerifying(false);
    }
  };

  const showDemoAccounts = Boolean(DeviceIdentityService.isDemoEntryEnabled() && demoAccounts.length > 0);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-6 select-none text-white">
      {/* Top Terminal Info */}
      <header className="w-full max-w-md flex items-center justify-between text-xs text-slate-400 font-mono pt-4">
        <div>
          <div className="text-white font-bold text-sm tracking-tight">{merchantName}</div>
          <div className="text-indigo-400">{terminalName}</div>
        </div>
        <div className="text-right">
          <div>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          <div className="text-slate-500 font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </header>

      {/* Main PIN Pad Area */}
      <div className="w-full max-w-sm flex flex-col items-center space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-950/50">
            <Lock size={26} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Employee PIN Login
          </h2>
          <p className="text-xs text-slate-400">
            Enter your 4-digit staff PIN to unlock terminal session
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center gap-4 py-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-indigo-400 scale-125 shadow-lg shadow-indigo-500/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="p-2.5 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2 animate-shake">
            <AlertCircle size={15} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {showDemoAccounts && (
          <div className="w-full space-y-2">
            <div className="text-[10px] text-amber-300 uppercase tracking-wider font-bold text-center">Demo Accounts</div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(account => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => account.passcode && void verifyPin(account.passcode)}
                  className="min-h-[44px] rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 text-left text-xs text-amber-100 hover:bg-amber-500/20"
                >
                  <span className="block font-bold">{account.role} {account.passcode}</span>
                  <span className="block text-[10px] text-amber-300/70">{account.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-3.5 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-indigo-600 active:text-white border border-slate-800/80 text-2xl font-black text-white shadow-md transition-all transform active:scale-95 flex items-center justify-center"
            >
              {digit}
            </button>
          ))}

          <button
            onClick={handleClear}
            className="h-16 rounded-2xl bg-slate-900/40 hover:bg-slate-850 border border-slate-800/60 text-xs font-bold text-slate-400 active:text-white uppercase transition-all flex items-center justify-center"
          >
            Clear
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 active:bg-indigo-600 active:text-white border border-slate-800/80 text-2xl font-black text-white shadow-md transition-all transform active:scale-95 flex items-center justify-center"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="h-16 rounded-2xl bg-slate-900/40 hover:bg-slate-850 border border-slate-800/60 text-slate-400 active:text-white transition-all flex items-center justify-center"
            title="Backspace"
          >
            <Delete size={22} />
          </button>
        </div>

      </div>

      {/* Footer / Reset Action */}
      <footer className="w-full max-w-md flex items-center justify-between text-[11px] text-slate-600 py-3 border-t border-slate-900">
        <span>Security: Local PIN Auth • Device Bound</span>
        {onResetDevice && (
          <button
            onClick={onResetDevice}
            className="text-slate-500 hover:text-rose-400 transition-colors"
          >
            Re-provision Terminal
          </button>
        )}
      </footer>
    </div>
  );
};
