import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, QrCode, ArrowRight, ShieldCheck, RefreshCw, KeyRound, CheckCircle2, AlertCircle, Camera, Check, Settings2 } from 'lucide-react';
import { DeviceIdentityService } from '../../services/deviceIdentityService';
import { DeviceRecord, DeviceRole, MerchantMode, ProvisioningPayload } from '../../types/device';
import { Employee } from '../../types';
import { PosDemoRegistrationService } from '../../services/posDemoRegistrationService';

interface PosProvisioningScreenProps {
  merchantId?: string;
  merchantName?: string;
  merchantMode?: MerchantMode;
  onProvisioned?: (device: DeviceRecord) => void;
  onProvisionComplete?: (device: DeviceRecord) => void;
  onQuickDemoProvision?: () => void;
  onMockEmployeesCreated?: (employees: Employee[]) => void;
  onDemoSuperAdmin?: () => void;
  onCancel?: () => void;
}

export const PosProvisioningScreen: React.FC<PosProvisioningScreenProps> = ({
  merchantId = '',
  merchantName,
  merchantMode = 'RESTAURANT',
  onProvisioned,
  onProvisionComplete,
  onQuickDemoProvision,
  onMockEmployeesCreated,
  onDemoSuperAdmin,
  onCancel,
}) => {
  const demoEntryEnabled = DeviceIdentityService.isDemoEntryEnabled();
  const [activeTab, setActiveTab] = useState<'CODE' | 'QR' | 'MANUAL'>('CODE');
  const [setupCode, setSetupCode] = useState('');
  const [qrRawInput, setQrRawInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [demoMode, setDemoMode] = useState<Exclude<MerchantMode, 'HYBRID'>>(
    merchantMode === 'HYBRID' ? 'RESTAURANT' : merchantMode
  );
  const [showDemoRegistration, setShowDemoRegistration] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Manual configuration form state
  const [manualConfig, setManualConfig] = useState<ProvisioningPayload>({
    merchantId: merchantId,
    locationId: '',
    deviceId: `DEV-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    deviceRole: 'REGISTER',
    merchantMode: merchantMode as MerchantMode,
    apiBaseUrl: 'https://api.newgatepos.com',
    wsUrl: 'wss://ws.newgatepos.com',
    terminalName: 'Register 01',
    requireEmployeeLogin: true,
  });

  const notifyComplete = (device: DeviceRecord) => {
    if (onProvisioned) onProvisioned(device);
    if (onProvisionComplete) onProvisionComplete(device);
  };

  const executeProvisionWithToken = async (tokenString: string) => {
    setLoading(true);
    setError(null);
    try {
      const fingerprint = {
        manufacturer: 'Newgate Appliance Hardware',
        model: 'NG-Terminal-Pro-15',
        buildNumber: 'NG-OS-2026.9',
        firmwareVersion: '1.4.2',
        installIdentity: `inst-${Math.random().toString(36).substring(2, 8)}`,
        capabilities: {
          hasBuiltInPrinter: true,
          hasBuiltInScanner: true,
          hasCashDrawerPort: true,
          hasCustomerDisplay: true,
          hasNfcEmv: true,
          screenSizeInches: 15.6,
        },
      };

      const device = await DeviceIdentityService.redeemProvisioningToken(tokenString.trim().toUpperCase(), fingerprint);
      notifyComplete(device);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired setup token. Please check Web Admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupCode.trim()) return;
    await executeProvisionWithToken(setupCode);
  };

  const handleQrPayloadSubmit = async (payloadStr: string) => {
    if (!payloadStr.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Check if it's a JSON string representing canonical ProvisioningPayload
      if (payloadStr.trim().startsWith('{') && payloadStr.trim().endsWith('}')) {
        const parsed = JSON.parse(payloadStr.trim());
        if (parsed.merchantId && parsed.deviceId && parsed.deviceRole) {
          const canonicalPayload: ProvisioningPayload = {
            merchantId: parsed.merchantId,
            locationId: parsed.locationId || '',
            deviceId: parsed.deviceId,
            deviceRole: parsed.deviceRole,
            merchantMode: parsed.merchantMode || merchantMode,
            apiBaseUrl: parsed.apiBaseUrl,
            wsUrl: parsed.wsUrl,
            terminalName: parsed.terminalName || `Terminal ${parsed.deviceId}`,
            requireEmployeeLogin: parsed.requireEmployeeLogin ?? true,
            initialSyncAt: parsed.initialSyncAt || new Date().toISOString(),
            token: parsed.token,
          };
          const device = await DeviceIdentityService.provisionDeviceFromPayload(canonicalPayload);
          notifyComplete(device);
          return;
        } else if (parsed.token) {
          await executeProvisionWithToken(parsed.token);
          return;
        }
      }
      // If it's a raw token string:
      await executeProvisionWithToken(payloadStr.trim());
    } catch (err: any) {
      setError(err.message || 'Invalid QR provisioning payload format.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const device = await DeviceIdentityService.provisionDeviceFromPayload({
        ...manualConfig,
        initialSyncAt: new Date().toISOString(),
      });
      notifyComplete(device);
    } catch (err: any) {
      setError(err.message || 'Manual device provisioning failed.');
    } finally {
      setLoading(false);
    }
  };

  // Camera start / stop effect
  useEffect(() => {
    if (activeTab === 'QR' && cameraActive) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((_err) => {
          setCameraActive(false);
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [activeTab, cameraActive]);

  const handleAutoEnroll = async () => {
    if (!demoEntryEnabled) {
      setError('Development bypass is disabled in production. Please scan a Setup QR code or enter a Setup Code.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const modeToEnroll: MerchantMode = (merchantMode as MerchantMode) || 'RESTAURANT';
      const dev = await DeviceIdentityService.enrollDefaultDevice(modeToEnroll, merchantId);
      notifyComplete(dev);
    } catch (err: any) {
      setError(err.message || 'Quick enrollment failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoRegistrationForMode = async (mode: Exclude<MerchantMode, 'HYBRID'>) => {
    if (!demoEntryEnabled) {
      setError('Demo registration is disabled outside development mode.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await PosDemoRegistrationService.register(
        mode,
        `DEMO-${mode}`,
        `Newgate Demo ${mode}`
      );
      onMockEmployeesCreated?.(result.employees);
      notifyComplete(result.device);
    } catch (err: any) {
      setError(err.message || 'Demo registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoRegistration = () => handleDemoRegistrationForMode(demoMode);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Terminal Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-950/50">
            <Smartphone size={32} />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-extrabold">
              NEWGATE ANDROID APPLIANCE
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Terminal Setup
            </h1>
            <p className="text-xs text-slate-400">
              Provision this device to bind it securely to your store & location
            </p>
          </div>
        </div>

        {demoEntryEnabled && !showDemoRegistration ? (
          <div className="space-y-3">
            <div className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">Newgate Demo</div>
            <div className="grid grid-cols-3 gap-3">
              {(['RESTAURANT', 'RETAIL', 'NONPROFIT'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setDemoMode(mode);
                    void handleDemoRegistrationForMode(mode);
                  }}
                  className="min-h-[84px] rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-white text-xs font-black transition-colors"
                >
                  {mode === 'NONPROFIT' ? 'Nonprofit' : mode.charAt(0) + mode.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onDemoSuperAdmin}
              className="w-full min-h-[52px] rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 text-sm font-bold hover:bg-amber-500/20"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => setShowDemoRegistration(true)}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-300"
            >
              Use real Setup Code / QR
            </button>
          </div>
        ) : (
        <>
        {/* Tab switch between Setup Code, QR Code, and Manual Config */}
        <div className="grid grid-cols-3 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('CODE')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'CODE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound size={14} />
            <span>Setup Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('QR')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'QR'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode size={14} />
            <span>Setup QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MANUAL')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'MANUAL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 size={14} />
            <span>Manual Config</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Setup Code Tab */}
        {activeTab === 'CODE' && (
          <form onSubmit={handleSubmitCode} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Enter One-Time Setup Code
              </label>
              <input
                type="text"
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value.toUpperCase())}
                placeholder="e.g. NG-AB3X9Q-1029"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-center text-lg text-white font-bold tracking-widest focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none uppercase placeholder:text-slate-700"
              />
              <p className="text-[11px] text-slate-500 mt-1 text-center">
                Generated in Web Admin under <span className="text-slate-400 font-bold">Devices → Provision New Device</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !setupCode.trim()}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 transition-all disabled:opacity-40"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  <KeyRound size={18} />
                  <span>Pair & Provision Terminal</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Setup QR Tab */}
        {activeTab === 'QR' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="text-xs text-slate-400">
                Hold the device camera or scanner up to the provisioning QR code displayed on the Web Admin portal.
              </div>

              {cameraActive ? (
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-36 h-36 border-2 border-indigo-500 rounded-xl animate-pulse" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCameraActive(false)}
                    className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 text-[10px] text-white rounded border border-slate-700 font-bold"
                  >
                    Close Camera
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCameraActive(true)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-all"
                >
                  <Camera size={16} />
                  <span>Start Camera Scanner</span>
                </button>
              )}

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] uppercase font-mono text-slate-600">or paste scanned payload</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <textarea
                value={qrRawInput}
                onChange={(e) => setQrRawInput(e.target.value)}
                placeholder='Scan QR or paste a provisioned setup payload'
                rows={3}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-white focus:border-indigo-500 outline-none placeholder:text-slate-700 resize-none"
              />

              <button
                type="button"
                onClick={() => handleQrPayloadSubmit(qrRawInput)}
                disabled={loading || !qrRawInput.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {loading ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />}
                <span>Redeem Scanned QR</span>
              </button>
            </div>
          </div>
        )}

        {/* Manual Config Tab */}
        {activeTab === 'MANUAL' && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Merchant ID</label>
                <input
                  type="text"
                  value={manualConfig.merchantId}
                  onChange={(e) => setManualConfig({ ...manualConfig, merchantId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Location ID</label>
                <input
                  type="text"
                  value={manualConfig.locationId}
                  onChange={(e) => setManualConfig({ ...manualConfig, locationId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Device ID</label>
                <input
                  type="text"
                  value={manualConfig.deviceId}
                  onChange={(e) => setManualConfig({ ...manualConfig, deviceId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Terminal Name</label>
                <input
                  type="text"
                  value={manualConfig.terminalName}
                  onChange={(e) => setManualConfig({ ...manualConfig, terminalName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Device Role</label>
                <select
                  value={manualConfig.deviceRole}
                  onChange={(e) => setManualConfig({ ...manualConfig, deviceRole: e.target.value as DeviceRole })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="REGISTER">REGISTER</option>
                  <option value="KDS">KDS</option>
                  <option value="HOST">HOST</option>
                  <option value="KIOSK">KIOSK</option>
                  <option value="HANDHELD">HANDHELD</option>
                  <option value="MANAGER_STATION">MANAGER_STATION</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Merchant Mode</label>
                <select
                  value={manualConfig.merchantMode}
                  onChange={(e) => setManualConfig({ ...manualConfig, merchantMode: e.target.value as MerchantMode })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value="RESTAURANT">RESTAURANT</option>
                  <option value="RETAIL">RETAIL</option>
                  <option value="NONPROFIT">NONPROFIT</option>
                  <option value="HYBRID">HYBRID</option>
                </select>
              </div>
            </div>

            <div className="text-left">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">API Base URL</label>
              <input
                type="text"
                value={manualConfig.apiBaseUrl}
                onChange={(e) => setManualConfig({ ...manualConfig, apiBaseUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 text-left">
              <input
                type="checkbox"
                id="requireLogin"
                checked={manualConfig.requireEmployeeLogin}
                onChange={(e) => setManualConfig({ ...manualConfig, requireEmployeeLogin: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="requireLogin" className="text-xs text-slate-300 font-medium">
                Require staff PIN passcode login before checkout
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Save & Bind Appliance</span>
            </button>
          </form>
        )}
        </>
        )}

        {/* Mock registration is deliberately DEV-only and uses real persisted entities. */}
        {demoEntryEnabled && (
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold">
              <span>DEMO MODE ONLY</span>
            </div>
            <p className="text-[11px] text-slate-400">Register a demo POS and continue to the employee PIN screen.</p>
            <div className="grid grid-cols-3 gap-2">
              {(['RESTAURANT', 'RETAIL', 'NONPROFIT'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDemoMode(mode)}
                  className={`min-h-[44px] rounded-lg text-[10px] font-black tracking-wider transition-colors border ${
                    demoMode === mode
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {mode === 'NONPROFIT' ? 'NONPROFIT' : mode}
                </button>
              ))}
            </div>
            <button
              onClick={handleDemoRegistration}
              disabled={loading}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700/60 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Register Demo POS & Continue to PIN</span>
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all"
              >
                Back to POS Hub
              </button>
            )}
          </div>
        )}

        {/* Hardware Status Tag */}
        <div className="text-center">
          <span className="text-[10px] font-mono text-slate-600">
            Runtime: Android Kotlin HAL • Security: Encrypted Attestation
          </span>
        </div>
      </div>
    </div>
  );
};
