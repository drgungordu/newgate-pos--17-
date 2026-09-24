import React, { useState, useEffect } from 'react';
import { MerchantMode, DeviceRecord, DeviceRole } from '../../types/device';
import { Employee, CartItem } from '../../types';
import { OrderService } from '../../services/orderService';
import { CashDrawerService } from '../../services/cashDrawerService';
import { BusinessDayService } from '../../services/businessDayService';
import { DeviceIdentityService } from '../../services/deviceIdentityService';
import { CustomerFacingDisplayModal } from '../hardware/CustomerFacingDisplayModal';
import { DeviceProvisioningModal } from '../hardware/DeviceProvisioningModal';
import { PosPinLockScreen } from './PosPinLockScreen';
import { PosProvisioningScreen } from './PosProvisioningScreen';
import { LocalDbService } from '../../services/localDbService';
import { NativeBridge } from '../../services/nativeBridge';
import { PosInternalRoute, PosShellProps } from './shell/PosShellTypes';
import { getAppTiles } from './shell/PosShellTileConfigs';
import { PermissionService } from '../../services/permissionService';
import { PosShellHeader } from './shell/PosShellHeader';
import { PosShellHubGrid } from './shell/PosShellHubGrid';
import { PosShellSessionPanel } from './shell/PosShellSessionPanel';
import { PosShellOperationalHeader } from './shell/PosShellOperationalHeader';
import { PosShellRouteDispatcher } from './shell/PosShellRouteDispatcher';

export const PosShell: React.FC<PosShellProps> = (props) => {
  const {
    currentUser,
    merchantMode: initialMode = 'RESTAURANT',
    inventory = [],
    categories = [],
    modifierGroups = [],
    filteredEmployees = [],
    businesses = [],
  } = props;

  const [posRoute, setPosRoute] = useState<PosInternalRoute>('HUB');
  const [currentMode, setCurrentMode] = useState<MerchantMode>(initialMode);
  const [openOrdersCount, setOpenOrdersCount] = useState(0);
  const [drawerBalance, setDrawerBalance] = useState('$200.00');
  const [businessDate, setBusinessDate] = useState('Today');
  const [showCfd, setShowCfd] = useState(false);
  const [showProvisioning, setShowProvisioning] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [hubPage, setHubPage] = useState<0 | 1>(0);
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [onBreak, setOnBreak] = useState(false);
  const [clockInTime, setClockInTime] = useState('08:00 AM');
  const [shiftHours] = useState('4.5 hrs');
  const [registerCart, setRegisterCart] = useState<CartItem[]>([]);
  const [isProvisioned, setIsProvisioned] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<DeviceRecord | null>(() => {
    const saved = LocalDbService.getDeviceConfig();
    if (saved && saved.isEnrolled) return saved;
    return null;
  });
  const [isLocked, setIsLocked] = useState(false);
  const [hasInitializedSecurity, setHasInitializedSecurity] = useState(false);
  const [activeUser, setActiveUser] = useState<Employee>(currentUser);

  const isDevMode = DeviceIdentityService.isDevOrDemoMode();

  const handleDevChangeMode = (newMode: MerchantMode) => {
    if (!isDevMode) return;
    setCurrentMode(newMode);
    if (currentDevice) {
      const updated: DeviceRecord = { ...currentDevice, merchantMode: newMode };
      setCurrentDevice(updated);
      LocalDbService.saveDeviceConfig(updated);
    }
  };

  const handleDevChangeRole = (newRole: DeviceRole) => {
    if (!isDevMode) return;
    if (currentDevice) {
      const updated: DeviceRecord = { ...currentDevice, role: newRole };
      setCurrentDevice(updated);
      LocalDbService.saveDeviceConfig(updated);

      const activeBiz = businesses.find(b => b.id === (activeUser?.businessId || currentUser.businessId));
      const pinRequired = DeviceIdentityService.isPinRequired(newRole, activeBiz, updated);
      setIsLocked(pinRequired);

      const targetRoute = DeviceIdentityService.getInitialRouteForRole(newRole, currentMode);
      setPosRoute(targetRoute);
    }
  };

  // Authoritative Mode Resolution: Strictly derived from provisioned hardware appliance or merchant business account config
  useEffect(() => {
    let cancelled = false;
    const resolveAuthoritativeMode = async () => {
      try {
        let dev = await DeviceIdentityService.getCurrentDevice();
        if (cancelled) return;

        if (dev && !dev.isRevoked) {
          setCurrentDevice(dev);
          setIsProvisioned(true);
          if (dev.merchantMode) {
            setCurrentMode(dev.merchantMode);
          }

          if (!hasInitializedSecurity) {
            const activeBiz = businesses.find(b => b.id === (activeUser?.businessId || currentUser.businessId));
            const pinRequired = DeviceIdentityService.isPinRequired(dev.role, activeBiz, dev);
            setIsLocked(pinRequired);
            setHasInitializedSecurity(true);

            // If PIN is not required (e.g. DONATION_KIOSK, SELF_SERVICE_KIOSK, KDS), open the relevant app directly
            if (!pinRequired) {
              const initialRoute = DeviceIdentityService.getInitialRouteForRole(dev.role, dev.merchantMode || currentMode);
              if (initialRoute !== 'HUB') {
                setPosRoute(initialRoute);
              }
            }
          }
          return;
        } else {
          setCurrentDevice(null);
          setIsProvisioned(false);
        }
      } catch {
        // Fall back to business account config
        if (!cancelled) {
          setCurrentDevice(null);
          setIsProvisioned(false);
        }
      }

      if (cancelled) return;
      const activeMerchant = businesses.find(b => b.id === (activeUser?.businessId || currentUser.businessId));
      const authoritativeMode = activeMerchant?.merchantMode || initialMode || 'RESTAURANT';
      setCurrentMode(authoritativeMode);
    };

    resolveAuthoritativeMode();
    return () => { cancelled = true; };
  }, [initialMode, activeUser?.businessId, currentUser.businessId, businesses, isDevMode]);

  const [shellEmployees, setShellEmployees] = useState<Employee[]>(
    filteredEmployees.length > 0 ? filteredEmployees : [currentUser]
  );
  const [, setPermRevision] = useState(0);

  useEffect(() => {
    if (filteredEmployees.length > 0) {
      setShellEmployees(filteredEmployees);
      PermissionService.registerEmployees(filteredEmployees);
    } else {
      PermissionService.registerEmployees([currentUser]);
    }
  }, [filteredEmployees, currentUser]);

  useEffect(() => {
    return PermissionService.subscribe(() => {
      setPermRevision(r => r + 1);
    });
  }, []);

  const handleEmployeeUpdate = (updatedEmp: Employee) => {
    setShellEmployees(prev => prev.map(e => e.id === updatedEmp.id ? { ...e, ...updatedEmp } : e));
    if (activeUser && activeUser.id === updatedEmp.id) {
      setActiveUser(prev => prev ? { ...prev, ...updatedEmp } : updatedEmp);
    }
    if (currentUser && currentUser.id === updatedEmp.id) {
      currentUser.role = updatedEmp.role;
      currentUser.passcode = updatedEmp.passcode;
      currentUser.permissions = updatedEmp.permissions;
    }
    props.onUpdateEmployee?.(updatedEmp);
  };

  useEffect(() => {
    LocalDbService.restoreOperationalState();
    LocalDbService.cacheCatalog({ inventory, categories, modifierGroups });
    LocalDbService.cacheEmployeeSnapshot(shellEmployees);
    DeviceIdentityService.getCurrentDevice()
      .then(dev => {
        setCurrentDevice(dev);
        setIsProvisioned(Boolean(dev && !dev.isRevoked));
      })
      .catch(() => {
        setCurrentDevice(null);
        setIsProvisioned(false);
      });
  }, []);

  const loadStatus = async () => {
    try {
      const allOrders = await OrderService.listOrders();
      const open = allOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'PAID' && o.status !== 'VOIDED' && o.status !== 'REFUNDED');
      setOpenOrdersCount(open.length);
      LocalDbService.saveOpenOrders(open);

      const drawer = await CashDrawerService.getCurrentShift();
      if (drawer) setDrawerBalance(`$${drawer.currentExpectedCash.toFixed(2)}`);
      const bday = await BusinessDayService.getCurrentBusinessDay();
      if (bday) {
        setBusinessDate(bday.businessDate);
        LocalDbService.saveBusinessDay({
          businessDate: bday.businessDate,
          isOpen: bday.status === 'OPEN',
          drawerFloat: drawer?.currentExpectedCash || 250,
        });
      }
      const batt = await NativeBridge.getBatteryLevel();
      setBatteryLevel(batt);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStatus();
  }, [posRoute]);

  const handleAdminExit = () => {
    if (props.onSwitchToAdmin) props.onSwitchToAdmin();
    else if (props.onExit) props.onExit();
    else if (props.onNavigate) props.onNavigate('Home');
  };

  const activeMerchant = businesses.find(b => b.id === (activeUser?.businessId || currentUser.businessId));

  if (!isProvisioned || showProvisioning) {
    return (
      <PosProvisioningScreen
        merchantId={activeMerchant?.id || currentUser.businessId}
        merchantName={activeMerchant?.name}
        merchantMode={currentMode}
        onProvisionComplete={(device) => {
          setCurrentDevice(device);
          setIsProvisioned(true);
          setShowProvisioning(false);
          if (device?.merchantMode) {
            setCurrentMode(device.merchantMode);
          }
          const activeBiz = businesses.find(b => b.id === (activeUser?.businessId || currentUser.businessId));
          const pinRequired = DeviceIdentityService.isPinRequired(device.role, activeBiz, device);
          setIsLocked(pinRequired);
          if (!pinRequired) {
            const initialRoute = DeviceIdentityService.getInitialRouteForRole(device.role, device.merchantMode || currentMode);
            if (initialRoute !== 'HUB') {
              setPosRoute(initialRoute);
            }
          }
        }}
        onProvisioned={(device) => {
          setCurrentDevice(device);
          setIsProvisioned(true);
          setShowProvisioning(false);
          if (device?.merchantMode) {
            setCurrentMode(device.merchantMode);
          }
          const activeBiz = businesses.find(b => b.id === (activeUser?.businessId || currentUser.businessId));
          const pinRequired = DeviceIdentityService.isPinRequired(device.role, activeBiz, device);
          setIsLocked(pinRequired);
          if (!pinRequired) {
            const initialRoute = DeviceIdentityService.getInitialRouteForRole(device.role, device.merchantMode || currentMode);
            if (initialRoute !== 'HUB') {
              setPosRoute(initialRoute);
            }
          }
        }}
        onCancel={() => setShowProvisioning(false)}
      />
    );
  }

  if (isLocked) {
    return (
      <PosPinLockScreen
        employees={filteredEmployees.length > 0 ? filteredEmployees : [currentUser]}
        merchantName={activeMerchant?.name || 'Lumi Restaurant & Bar'}
        terminalName={currentDevice?.name ? `${currentDevice.name} (${currentDevice.id})` : 'Front Register'}
        onUnlock={(emp) => {
          setActiveUser(emp);
          setIsLocked(false);
          if (currentDevice?.role === 'HANDHELD') {
            setPosRoute('TABLES');
          } else if (currentDevice?.role === 'KDS' || currentDevice?.role === 'EXPO') {
            setPosRoute('KDS');
          }
        }}
        onResetDevice={() => {
          setCurrentDevice(null);
          setIsProvisioned(false);
        }}
      />
    );
  }

  const appTiles = getAppTiles({
    mode: currentMode,
    deviceRole: currentDevice?.role || 'REGISTER',
    openOrdersCount,
    drawerBalance,
    isClockedIn,
    clockInTime,
    activeTicketsCount: (props.activeTickets || []).length,
    effectiveUser: activeUser || currentUser,
  });

  const dispatcherState = {
    posRoute, setPosRoute, registerCart, setRegisterCart, currentMode,
    drawerBalance, businessDate, isClockedIn, setIsClockedIn,
    onBreak, setOnBreak, clockInTime, setClockInTime, shiftHours,
    activeUser
  };

  if (posRoute !== 'HUB') {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
        <PosShellOperationalHeader posRoute={posRoute} currentUser={activeUser || currentUser} onBackToHub={() => setPosRoute('HUB')} />
        <div className="flex-1 overflow-hidden relative">
          <PosShellRouteDispatcher
            {...props}
            {...dispatcherState}
            filteredEmployees={shellEmployees}
            onUpdateEmployee={handleEmployeeUpdate}
            onRefreshStatus={loadStatus}
            onAdminExit={handleAdminExit}
            onOpenCfd={() => setShowCfd(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#171b20] text-slate-100 flex flex-col overflow-hidden selection:bg-indigo-500 selection:text-white select-none">
      <PosShellHeader
        currentMode={currentMode}
        deviceRole={currentDevice?.role || 'REGISTER'}
        businessDate={businessDate}
        currentUser={currentUser}
        activeUser={activeUser}
        onOpenGlobalSearch={props.onOpenGlobalSearch}
        onOpenCfd={() => setShowCfd(true)}
        onOpenProvisioning={() => setShowProvisioning(true)}
        onAdminExit={handleAdminExit}
        onLockTerminal={() => setIsLocked(true)}
        onDevChangeMode={isDevMode ? handleDevChangeMode : undefined}
        onDevChangeRole={isDevMode ? handleDevChangeRole : undefined}
      />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <main className="flex-1 min-w-0 px-4 py-4 flex items-center overflow-y-auto">
        <PosShellHubGrid
          hubPage={hubPage}
          setHubPage={setHubPage}
          appTiles={appTiles}
          onSelectRoute={setPosRoute}
        />
        </main>
        <PosShellSessionPanel
          businessName={activeMerchant?.name || 'Lumi Restaurant & Bar'}
          activeUser={activeUser || currentUser}
          businessDate={businessDate}
          drawerBalance={drawerBalance}
          batteryLevel={batteryLevel}
          terminalName={currentDevice?.name}
          deviceId={currentDevice?.id}
          deviceRole={currentDevice?.role}
          onLockTerminal={() => setIsLocked(true)}
        />
      </div>

      <CustomerFacingDisplayModal isOpen={showCfd} onClose={() => setShowCfd(false)} />
      <DeviceProvisioningModal
        isOpen={showProvisioning}
        onClose={() => setShowProvisioning(false)}
        merchantId={activeMerchant?.id || currentUser.businessId}
        initialMerchantMode={currentMode}
      />
    </div>
  );
};

export default PosShell;
