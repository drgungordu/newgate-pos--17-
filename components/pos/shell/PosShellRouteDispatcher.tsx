import React, { useState, useEffect } from 'react';
import { PosInternalRoute, PosShellProps, PosShellPropsState } from './PosShellTypes';
import { PermissionService } from '../../../services/permissionService';
import { AuditService } from '../../../services/auditService';
import { ManagerApprovalModal } from '../../modals/ManagerApprovalModal';
import { ROUTING_PERMISSION_MAP } from './PosShellTileConfigs';
import { ShieldAlert, ArrowLeft, KeyRound, RotateCcw } from 'lucide-react';

// Operational Screen Components
import PosRegister from '../PosRegister';
import TableServiceApp from '../../dining/TableServiceApp';
import { KitchenDisplay } from '../KitchenDisplay';
import { PosShellOrdersView } from './PosShellOrdersView';
import { PosSettingsHub } from '../PosSettingsHub';
import ReservationsApp from '../../reservations/ReservationsApp';
import { PosShellCashDrawer } from './PosShellCashDrawer';
import CashierCloseout from '../CashierCloseout';
import { PosShell86Availability } from './PosShell86Availability';
import { PosShellShiftClock } from './PosShellShiftClock';
import { PosShellManagerTools } from './PosShellManagerTools';
import { RetailPOS } from '../RetailPOS';
import { RetailReturnsRoute } from '../RetailReturnsRoute';
import { BusinessDayService } from '../../../services/businessDayService';
import { RetailManagement } from '../../retail/RetailManagement';
import Customers from '../../crm/Customers';
import { NonprofitPOS } from '../../nonprofit/NonprofitPOS';
import { GivingKiosk } from '../../nonprofit/GivingKiosk';
import { NonprofitCRM } from '../../nonprofit/NonprofitCRM';
import { KioskApp } from '../KioskApp';

export interface PosShellRouteDispatcherProps extends PosShellProps, PosShellPropsState {
  onRefreshStatus: () => void;
  onAdminExit: () => void;
  onOpenCfd: () => void;
}

export const PosShellRouteDispatcher: React.FC<PosShellRouteDispatcherProps> = (props) => {
  const {
    posRoute,
    setPosRoute,
    currentUser,
    activeUser,
    filteredEmployees = [],
  } = props;

  const operator = activeUser || currentUser;
  const [overriddenRoute, setOverriddenRoute] = useState<string | null>(null);
  const [showManagerModal, setShowManagerModal] = useState(false);

  const requiredPermission = ROUTING_PERMISSION_MAP[posRoute];
  const isAuthorized =
    !requiredPermission ||
    PermissionService.can(operator, requiredPermission) ||
    overriddenRoute === posRoute;

  useEffect(() => {
    if (!isAuthorized && requiredPermission) {
      AuditService.log({
        actorId: operator.id,
        actorName: operator.name,
        action: 'UNAUTHORIZED_DIRECT_ROUTE_BLOCKED',
        targetType: 'ROUTE',
        targetId: posRoute,
        details: {
          attemptedRoute: posRoute,
          requiredPermission,
          employeeRolePreset: operator.role,
        },
        status: 'REJECTED',
        merchantId: operator.businessId,
      }).catch((err) =>
        console.error('[AuditService] Failed to log unauthorized route attempt:', err)
      );
    }
  }, [posRoute, isAuthorized, requiredPermission, operator]);

  if (!isAuthorized && requiredPermission) {
    return (
      <div className="h-full bg-slate-950 flex items-center justify-center p-6 select-none animate-fade-in">
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={36} />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tight">Access Restricted</h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold">
              <span>Required: {requiredPermission}</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2">
              Operator <span className="text-white font-bold">{operator.name}</span> ({operator.role}) does not have permission to access the <span className="text-white font-bold">{posRoute}</span> application.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => setShowManagerModal(true)}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20 active:scale-95"
            >
              <KeyRound size={16} />
              <span>Request Manager PIN Override</span>
            </button>
            <button
              onClick={() => setPosRoute('HUB')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 active:scale-95"
            >
              <ArrowLeft size={16} />
              <span>Return to POS Hub</span>
            </button>
          </div>
        </div>

        <ManagerApprovalModal
          isOpen={showManagerModal}
          actionTitle={`ROUTE_ACCESS_${posRoute}`}
          actionKey={`pos.route.${posRoute.toLowerCase()}`}
          context={{
            employeeId: operator.id,
            employeeName: operator.name,
            role: operator.role,
            merchantId: operator.businessId,
          }}
          details={`Manager override authorization for operator ${operator.name} to access ${posRoute} (requires ${requiredPermission})`}
          onApproved={() => {
            setOverriddenRoute(posRoute);
            setShowManagerModal(false);
          }}
          onClose={() => setShowManagerModal(false)}
        />
      </div>
    );
  }

  switch (posRoute) {
    case 'REGISTER':
      return (
        <PosRegister
          inventory={props.inventory || []}
          categories={props.categories || []}
          modifierGroups={props.modifierGroups || []}
          discounts={props.discounts || []}
          activeCart={props.registerCart || []}
          onUpdateCart={props.setRegisterCart}
          currentUser={operator}
          taxConfig={props.taxConfig}
          tipConfig={props.tipConfig}
          onFireToKitchen={props.onFireToKitchen}
          onAddCustomer={props.onAddCustomer}
          onSaveItem={props.onSaveItem}
          onFinish={(cart, total, payments, tip, discount) => {
            props.onProcessSale?.(cart, total, payments[0]?.method || 'Card', undefined, tip, discount);
            props.setRegisterCart([]);
          }}
        />
      );

    case 'TABLES':
      return (
        <TableServiceApp
          tables={props.floorPlanTables || []}
          inventory={props.inventory}
          categories={props.categories}
          currentUser={operator}
          onBackToAdmin={() => setPosRoute('HUB')}
          onExit={() => setPosRoute('HUB')}
          onFireToKitchen={props.onFireToKitchen}
          taxConfig={props.taxConfig}
          tipConfig={props.tipConfig}
          onProcessSale={props.onProcessSale}
          onUpdateReservation={props.onUpdateReservation}
          reservations={props.reservations}
          activeTableOrders={props.activeTableOrders}
          onUpdateTableOrder={props.onUpdateTableOrder}
          onUpdateTableStatus={props.onUpdateTableStatus}
        />
      );

    case 'KDS':
      return (
        <KitchenDisplay
          tickets={props.activeTickets || []}
          liveTickets={props.activeTickets || []}
          onStatusChange={props.onTicketStatusChange}
          onUpdateStatus={props.onTicketStatusChange}
          printerLabels={props.printerLabels}
          kdsSettings={props.kdsSettings}
          settings={props.kdsSettings}
          onExit={() => setPosRoute('HUB')}
          currentUser={operator}
        />
      );

    case 'ORDERS':
      return (
        <PosShellOrdersView
          orders={props.orders || []}
          currentUser={operator}
          onOpenManagerPin={props.onOpenManagerPin}
        />
      );

    case 'POS_SETTINGS':
      return (
        <PosSettingsHub
          currentUser={operator}
          employees={filteredEmployees.length > 0 ? filteredEmployees : [operator]}
          inventory={props.inventory || []}
          tables={props.floorPlanTables || []}
          tipConfig={props.tipConfig}
          taxConfig={props.taxConfig}
          kdsSettings={props.kdsSettings}
          onExit={() => setPosRoute('HUB')}
          onOpenWebAdmin={props.onAdminExit}
          onSaveItem={props.onSaveItem}
          onUpdateEmployee={props.onUpdateEmployee}
        />
      );

    case 'RESERVATIONS':
      return (
        <div className="h-full bg-slate-900 overflow-y-auto">
          <ReservationsApp
            reservations={props.reservations || []}
            onUpdateReservation={props.onUpdateReservation}
          />
        </div>
      );

    case 'CASH_DRAWER':
      return (
        <PosShellCashDrawer
          drawerBalance={props.drawerBalance}
          businessDate={props.businessDate}
          currentUser={operator}
          onRefreshStatus={props.onRefreshStatus}
          onExitToHub={() => setPosRoute('HUB')}
        />
      );

    case 'END_OF_DAY':
      return (
        <div className="h-full bg-slate-900 overflow-y-auto">
          <CashierCloseout
            currentUser={operator}
            onCloseout={({ actual, variance }) => {
              void BusinessDayService.closeBusinessDay(actual, variance, operator).then(() => setPosRoute('HUB'));
            }}
          />
        </div>
      );

    case '86_AVAILABILITY':
      return (
        <PosShell86Availability
          inventory={props.inventory || []}
          categories={props.categories || []}
          onSaveItem={props.onSaveItem}
        />
      );

    case 'SHIFT_CLOCK':
      return (
        <PosShellShiftClock
          currentUser={operator}
          isClockedIn={props.isClockedIn}
          setIsClockedIn={props.setIsClockedIn}
          onBreak={props.onBreak}
          setOnBreak={props.setOnBreak}
          clockInTime={props.clockInTime}
          setClockInTime={props.setClockInTime}
          shiftHours={props.shiftHours}
          onExitToHub={() => setPosRoute('HUB')}
        />
      );

    case 'MANAGER_TOOLS': {
      const activeBiz = (props.businesses || []).find((b) => b.id === operator?.businessId);
      return (
        <PosShellManagerTools
          currentMode={props.currentMode}
          currentUser={operator}
          businessName={activeBiz?.name}
          onExitToHub={() => setPosRoute('HUB')}
          onSwitchToAdmin={props.onAdminExit}
          onOpenCfd={props.onOpenCfd}
        />
      );
    }

    case 'RETAIL_REGISTER':
      return <RetailPOS currentUser={operator} onExit={() => setPosRoute('HUB')} />;

    case 'RETAIL_INVENTORY':
      return (
        <div className="h-full bg-slate-900 overflow-y-auto">
          <RetailManagement />
        </div>
      );

    case 'RETAIL_RETURNS':
      return <RetailReturnsRoute currentUser={operator} onExit={() => setPosRoute('HUB')} />;

    case 'CUSTOMERS':
      return (
        <div className="h-full bg-slate-900 overflow-y-auto">
          <Customers
            customers={props.customers || []}
            onAddCustomer={props.onAddCustomer}
            onUpdateCustomer={props.onUpdateCustomer}
            onDeleteCustomer={props.onDeleteCustomer}
          />
        </div>
      );

    case 'GIVING_REGISTER':
      return <NonprofitPOS currentUser={operator} onExit={() => setPosRoute('HUB')} />;

    case 'GIVING_KIOSK':
      return <GivingKiosk onExitKiosk={() => setPosRoute('HUB')} />;

    case 'DONOR_CRM':
      return (
        <div className="h-full bg-slate-900 overflow-y-auto">
          <NonprofitCRM />
        </div>
      );

    case 'KIOSK':
      return <KioskApp onExit={() => setPosRoute('HUB')} />;

    default:
      return null;
  }
};
