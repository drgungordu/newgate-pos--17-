import React from 'react';
import {
  ShoppingBag, FileText, RotateCcw, DollarSign, Clock, Coffee, BarChart3,
  Settings, LayoutGrid, Users, Wrench, Heart, Monitor, CreditCard,
  Utensils, Flame, EyeOff
} from 'lucide-react';
import { MerchantMode, DeviceRole } from '../../../types/device';
import { Employee } from '../../../types';
import { PermissionService } from '../../../services/permissionService';
import { PosInternalRoute } from './PosShellTypes';

export const ROUTE_PERMISSION_MAP: Record<PosInternalRoute, string> = {
  HUB: '',
  REGISTER: 'pos.register.access',
  TABLES: 'pos.tables.access',
  KDS: 'pos.kds.access',
  ORDERS: 'pos.orders.access',
  RESERVATIONS: 'pos.reservations.access',
  CASH_DRAWER: 'pos.cash_drawer.access',
  END_OF_DAY: 'pos.closeout.access',
  '86_AVAILABILITY': 'pos.86.access',
  SHIFT_CLOCK: 'pos.shifts.access',
  POS_SETTINGS: 'pos.settings.access',
  REPORTS: 'pos.reports.view',
  CUSTOMERS: 'pos.customers.access',
  KIOSK: 'pos.kiosk.access',
  MANAGER_TOOLS: 'pos.diagnostics.access',
  RETAIL_REGISTER: 'pos.register.access',
  RETAIL_INVENTORY: 'pos.inventory.access',
  RETAIL_RETURNS: 'pos.refunds.access',
  GIVING_REGISTER: 'pos.register.access',
  GIVING_KIOSK: 'pos.kiosk.access',
  DONOR_CRM: 'pos.customers.access',
};

export const ROUTING_PERMISSION_MAP = ROUTE_PERMISSION_MAP;

// Explicit route allowlists per physical device appliance role
const ROLE_ROUTE_ALLOWLIST: Partial<Record<DeviceRole, PosInternalRoute[]>> = {
  KDS: ['KDS', '86_AVAILABILITY', 'SHIFT_CLOCK', 'MANAGER_TOOLS', 'POS_SETTINGS'],
  EXPO: ['KDS', 'ORDERS', '86_AVAILABILITY', 'SHIFT_CLOCK', 'MANAGER_TOOLS', 'POS_SETTINGS'],
  HOST: ['RESERVATIONS', 'TABLES', 'CUSTOMERS', 'ORDERS', 'SHIFT_CLOCK', 'MANAGER_TOOLS', 'POS_SETTINGS'],
  KIOSK: ['KIOSK', 'GIVING_KIOSK', 'SHIFT_CLOCK', 'POS_SETTINGS', 'MANAGER_TOOLS'],
  SELF_SERVICE_KIOSK: ['KIOSK', 'GIVING_KIOSK', 'SHIFT_CLOCK', 'POS_SETTINGS', 'MANAGER_TOOLS'],
  DONATION_KIOSK: ['GIVING_KIOSK', 'SHIFT_CLOCK', 'POS_SETTINGS', 'MANAGER_TOOLS'],
  HANDHELD: ['TABLES', 'REGISTER', 'RETAIL_REGISTER', 'GIVING_REGISTER', 'ORDERS', '86_AVAILABILITY', 'CUSTOMERS', 'SHIFT_CLOCK', 'MANAGER_TOOLS'],
  SCANNER: ['RETAIL_INVENTORY', 'ORDERS', '86_AVAILABILITY', 'SHIFT_CLOCK', 'MANAGER_TOOLS', 'POS_SETTINGS'],
  MEMBERSHIP_DESK: ['CUSTOMERS', 'DONOR_CRM', 'REGISTER', 'RETAIL_REGISTER', 'GIVING_REGISTER', 'ORDERS', 'SHIFT_CLOCK', 'CASH_DRAWER', 'MANAGER_TOOLS', 'POS_SETTINGS'],
  MANAGER_STATION: ['REGISTER', 'RETAIL_REGISTER', 'GIVING_REGISTER', 'ORDERS', 'TABLES', 'KDS', 'CASH_DRAWER', 'END_OF_DAY', 'RETAIL_RETURNS', 'RETAIL_INVENTORY', 'CUSTOMERS', 'DONOR_CRM', '86_AVAILABILITY', 'SHIFT_CLOCK', 'MANAGER_TOOLS', 'POS_SETTINGS'],
  REGISTER: undefined, // Standard registers have access to all routes defined for their merchant mode
};

// Priority route ranking to elevate essential functions for specialized appliance hardware
const ROLE_ROUTE_PRIORITY: Partial<Record<DeviceRole, PosInternalRoute[]>> = {
  KDS: ['KDS', '86_AVAILABILITY', 'SHIFT_CLOCK', 'POS_SETTINGS', 'MANAGER_TOOLS'],
  EXPO: ['KDS', 'ORDERS', '86_AVAILABILITY', 'SHIFT_CLOCK', 'MANAGER_TOOLS'],
  HOST: ['RESERVATIONS', 'TABLES', 'CUSTOMERS', 'ORDERS', 'SHIFT_CLOCK'],
  KIOSK: ['KIOSK', 'GIVING_KIOSK', 'SHIFT_CLOCK'],
  SELF_SERVICE_KIOSK: ['KIOSK', 'GIVING_KIOSK', 'SHIFT_CLOCK'],
  DONATION_KIOSK: ['GIVING_KIOSK', 'SHIFT_CLOCK'],
  HANDHELD: ['TABLES', 'REGISTER', 'RETAIL_REGISTER', 'ORDERS', '86_AVAILABILITY'],
  SCANNER: ['RETAIL_INVENTORY', '86_AVAILABILITY', 'ORDERS'],
  MEMBERSHIP_DESK: ['CUSTOMERS', 'DONOR_CRM', 'REGISTER'],
  MANAGER_STATION: ['MANAGER_TOOLS', 'END_OF_DAY', 'CASH_DRAWER', 'REGISTER', 'ORDERS'],
};

export interface AppTileConfig {
  id: PosInternalRoute;
  label: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
  badge: string | null;
  permissionRequired: string;
  blocked?: boolean;
}

export interface TileContext {
  mode: MerchantMode;
  deviceRole?: DeviceRole;
  openOrdersCount: number;
  drawerBalance: string;
  isClockedIn: boolean;
  clockInTime: string;
  activeTicketsCount: number;
  effectiveUser: Employee;
  featureFlags?: Record<string, boolean>;
}

export interface PosAppDefinition {
  id: PosInternalRoute;
  label: string;
  sub: string | ((ctx: TileContext) => string);
  icon: React.ReactNode;
  color: string;
  badge?: (ctx: TileContext) => string | null;
  merchantModes: MerchantMode[];
  deviceRoles: (DeviceRole | 'ALL')[];
  requiredPermission: string;
  featureFlag?: string;
}

/**
 * Canonical POS Application Registry
 * Every operational application defines its supported Merchant Modes, Device Hardware Roles,
 * required permission key, and optional feature flag.
 */
export const POS_APP_REGISTRY: PosAppDefinition[] = [
  // Restaurant Register
  {
    id: 'REGISTER',
    label: 'Register',
    sub: 'Quick order entry & bar counter',
    icon: <CreditCard size={32} />,
    color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    merchantModes: ['RESTAURANT'],
    deviceRoles: ['REGISTER', 'HANDHELD', 'MANAGER_STATION'],
    requiredPermission: 'pos.register.access',
  },
  // Table Service
  {
    id: 'TABLES',
    label: 'Tables',
    sub: 'Floor plan, seat courses & checks',
    icon: <Utensils size={32} />,
    color: 'bg-orange-600 hover:bg-orange-700 text-white',
    badge: () => 'Floors',
    merchantModes: ['RESTAURANT'],
    deviceRoles: ['REGISTER', 'HANDHELD', 'HOST', 'MANAGER_STATION'],
    requiredPermission: 'pos.tables.access',
    featureFlag: 'tableServiceEnabled',
  },
  // Kitchen Display System
  {
    id: 'KDS',
    label: 'KDS',
    sub: 'Station routing, line prep & Expo',
    icon: <Flame size={32} />,
    color: 'bg-amber-600 hover:bg-amber-700 text-white',
    badge: (ctx) => ctx.activeTicketsCount > 0 ? `${ctx.activeTicketsCount} active` : null,
    merchantModes: ['RESTAURANT'],
    deviceRoles: ['KDS', 'EXPO', 'REGISTER', 'MANAGER_STATION'],
    requiredPermission: 'pos.kds.access',
    featureFlag: 'kdsEnabled',
  },
  // Orders & Receipts (All modes)
  {
    id: 'ORDERS',
    label: 'Orders',
    sub: (ctx) => ctx.mode === 'NONPROFIT' ? 'Reprint receipts & deductible reports' : 'Open checks, takeout & order lookups',
    icon: <FileText size={32} />,
    color: 'bg-slate-800 hover:bg-slate-700 text-white',
    badge: (ctx) => ctx.openOrdersCount > 0 ? `${ctx.openOrdersCount} open` : null,
    merchantModes: ['RESTAURANT', 'RETAIL', 'NONPROFIT'],
    deviceRoles: ['REGISTER', 'HANDHELD', 'HOST', 'EXPO', 'SCANNER', 'MEMBERSHIP_DESK', 'MANAGER_STATION'],
    requiredPermission: 'pos.orders.access',
  },
  // Reservations & Host
  {
    id: 'RESERVATIONS',
    label: 'Host',
    sub: 'Guest reservations & seating queue',
    icon: <Users size={32} />,
    color: 'bg-teal-700 hover:bg-teal-800 text-white',
    merchantModes: ['RESTAURANT'],
    deviceRoles: ['HOST', 'REGISTER', 'MANAGER_STATION'],
    requiredPermission: 'pos.reservations.access',
    featureFlag: 'reservationsEnabled',
  },
  // Cash Drawer (All modes)
  {
    id: 'CASH_DRAWER',
    label: 'Cash',
    sub: (ctx) => `Current float: ${ctx.drawerBalance}`,
    icon: <DollarSign size={32} />,
    color: 'bg-emerald-800 hover:bg-emerald-700 text-white',
    merchantModes: ['RESTAURANT', 'RETAIL', 'NONPROFIT'],
    deviceRoles: ['REGISTER', 'MEMBERSHIP_DESK', 'MANAGER_STATION'],
    requiredPermission: 'pos.cash_drawer.access',
  },
  // End of Day Closeout (All modes)
  {
    id: 'END_OF_DAY',
    label: 'EOD',
    sub: 'Close business day & Z-Report',
    icon: <Clock size={32} />,
    color: 'bg-rose-700 hover:bg-rose-800 text-white',
    merchantModes: ['RESTAURANT', 'RETAIL', 'NONPROFIT'],
    deviceRoles: ['REGISTER', 'MANAGER_STATION'],
    requiredPermission: 'pos.closeout.access',
  },
  // 86 Availability (Food & Bar items)
  {
    id: '86_AVAILABILITY',
    label: '86 / Availability',
    sub: 'Quick item out-of-stock toggle',
    icon: <EyeOff size={32} />,
    color: 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30',
    merchantModes: ['RESTAURANT'],
    deviceRoles: ['REGISTER', 'KDS', 'EXPO', 'HANDHELD', 'SCANNER', 'MANAGER_STATION'],
    requiredPermission: 'pos.86.access',
  },
  // Shift Clock (Universal)
  {
    id: 'SHIFT_CLOCK',
    label: 'Shift Clock',
    sub: (ctx) => ctx.isClockedIn ? `In since ${ctx.clockInTime}` : 'Clocked Out',
    icon: <Coffee size={32} />,
    color: 'bg-blue-800 hover:bg-blue-700 text-white',
    badge: (ctx) => ctx.isClockedIn ? 'ACTIVE' : null,
    merchantModes: ['RESTAURANT', 'RETAIL', 'NONPROFIT'],
    deviceRoles: ['ALL'],
    requiredPermission: 'pos.shifts.access',
  },
  // POS Settings
  {
    id: 'POS_SETTINGS',
    label: 'Settings',
    sub: 'Appliance config, stations & rules',
    icon: <Settings size={32} />,
    color: 'bg-indigo-900 hover:bg-indigo-800 text-indigo-100',
    merchantModes: ['RESTAURANT', 'RETAIL', 'NONPROFIT'],
    deviceRoles: ['REGISTER', 'KDS', 'EXPO', 'HOST', 'SCANNER', 'MEMBERSHIP_DESK', 'MANAGER_STATION'],
    requiredPermission: 'pos.settings.access',
  },
  // Sales and tax reports
  {
    id: 'REPORTS',
    label: 'Reports',
    sub: 'Sales, tax and closeout reports',
    icon: <BarChart3 size={32} />,
    color: 'bg-cyan-700 hover:bg-cyan-800 text-white',
    merchantModes: ['RESTAURANT', 'RETAIL', 'NONPROFIT'],
    deviceRoles: ['REGISTER', 'MANAGER_STATION'],
    requiredPermission: 'pos.reports.view',
  },
  // Customer CRM (Restaurant & Retail)
  {
    id: 'CUSTOMERS',
    label: 'Customers',
    sub: 'Guest profiles, loyalty & history',
    icon: <Users size={32} />,
    color: 'bg-teal-700 hover:bg-teal-800 text-white',
    merchantModes: ['RESTAURANT', 'RETAIL'],
    deviceRoles: ['REGISTER', 'HANDHELD', 'HOST', 'MEMBERSHIP_DESK', 'MANAGER_STATION'],
    requiredPermission: 'pos.customers.access',
  },
  // Retail Register
  {
    id: 'RETAIL_REGISTER',
    label: 'Retail Register',
    sub: 'Scan barcodes, cart & fast checkout',
    icon: <ShoppingBag size={32} />,
    color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    merchantModes: ['RETAIL'],
    deviceRoles: ['REGISTER', 'HANDHELD', 'SCANNER', 'MANAGER_STATION'],
    requiredPermission: 'pos.register.access',
  },
  // Retail Inventory
  {
    id: 'RETAIL_INVENTORY',
    label: 'Inventory',
    sub: 'Stock counts, shelf labels & POs',
    icon: <LayoutGrid size={32} />,
    color: 'bg-sky-700 hover:bg-sky-800 text-white',
    merchantModes: ['RESTAURANT', 'RETAIL'],
    deviceRoles: ['REGISTER', 'SCANNER', 'MANAGER_STATION'],
    requiredPermission: 'pos.inventory.access',
  },
  // Retail Returns / Refunds
  {
    id: 'RETAIL_RETURNS',
    label: 'Refund',
    sub: 'Process returns, restock & store credit',
    icon: <RotateCcw size={32} />,
    color: 'bg-amber-600 hover:bg-amber-700 text-white',
    merchantModes: ['RETAIL', 'RESTAURANT'],
    deviceRoles: ['REGISTER', 'MANAGER_STATION'],
    requiredPermission: 'pos.refunds.access',
  },
  // Giving Register (Nonprofit)
  {
    id: 'GIVING_REGISTER',
    label: 'Giving Register',
    sub: 'Sale + Charitable gift checkout',
    icon: <Heart size={32} />,
    color: 'bg-rose-600 hover:bg-rose-700 text-white',
    merchantModes: ['NONPROFIT'],
    deviceRoles: ['REGISTER', 'MEMBERSHIP_DESK', 'HANDHELD', 'MANAGER_STATION'],
    requiredPermission: 'pos.register.access',
  },
  // Giving Kiosk (Nonprofit)
  {
    id: 'GIVING_KIOSK',
    label: 'Donation Kiosk',
    sub: 'Unattended donor giving station',
    icon: <Monitor size={32} />,
    color: 'bg-indigo-700 hover:bg-indigo-800 text-white',
    merchantModes: ['NONPROFIT'],
    deviceRoles: ['DONATION_KIOSK', 'KIOSK', 'SELF_SERVICE_KIOSK', 'REGISTER', 'MEMBERSHIP_DESK', 'MANAGER_STATION'],
    requiredPermission: 'pos.kiosk.access',
  },
  // Donor CRM (Nonprofit)
  {
    id: 'DONOR_CRM',
    label: 'Donor CRM',
    sub: 'Constituent profiles & giving records',
    icon: <Users size={32} />,
    color: 'bg-teal-700 hover:bg-teal-800 text-white',
    merchantModes: ['NONPROFIT'],
    deviceRoles: ['REGISTER', 'MEMBERSHIP_DESK', 'MANAGER_STATION'],
    requiredPermission: 'pos.customers.access',
  },
  // Self-Service Kiosk (Restaurant / Retail)
  {
    id: 'KIOSK',
    label: 'Customer Kiosk',
    sub: 'Self-order touch screen mode',
    icon: <Monitor size={32} />,
    color: 'bg-indigo-800 hover:bg-indigo-700 text-white',
    merchantModes: ['RESTAURANT', 'RETAIL'],
    deviceRoles: ['KIOSK', 'SELF_SERVICE_KIOSK', 'REGISTER', 'MANAGER_STATION'],
    requiredPermission: 'pos.kiosk.access',
  },
  // Hardware & Diagnostic Tools
  {
    id: 'MANAGER_TOOLS',
    label: 'Hardware Diagnostics',
    sub: 'Thermal ESC/POS & cash drawer tests',
    icon: <Wrench size={32} />,
    color: 'bg-purple-900 hover:bg-purple-800 text-purple-100',
    merchantModes: ['RESTAURANT', 'RETAIL', 'NONPROFIT'],
    deviceRoles: ['REGISTER', 'KDS', 'EXPO', 'HOST', 'HANDHELD', 'SCANNER', 'MEMBERSHIP_DESK', 'MANAGER_STATION'],
    requiredPermission: 'pos.diagnostics.access',
  },
];

/**
 * Dynamic Hub App Calculator:
 * Formula:
 *   Merchant Mode
 * + Device Role
 * + Effective Permissions
 * + Feature Flags
 * = Visible POS Apps.
 */
export const getAppTiles = (ctx: TileContext): AppTileConfig[] => {
  const currentMode = ctx.mode || 'RESTAURANT';
  const deviceRole = ctx.deviceRole || 'REGISTER';

  // Strict Evaluation Formula:
  const registerRoute: PosInternalRoute = currentMode === 'RETAIL'
    ? 'RETAIL_REGISTER'
    : currentMode === 'NONPROFIT'
    ? 'GIVING_REGISTER'
    : 'REGISTER';
  const hubRouteOrder: PosInternalRoute[] = [
    registerRoute, 'ORDERS', 'TABLES', 'RETAIL_RETURNS',
    'KDS', 'RESERVATIONS', 'CUSTOMERS', 'RETAIL_INVENTORY',
    'CASH_DRAWER', 'END_OF_DAY', 'REPORTS', 'POS_SETTINGS',
  ];

  const visibleApps = POS_APP_REGISTRY.filter(app => {
    if (!hubRouteOrder.includes(app.id)) return false;
    // 1. Merchant Mode Filter
    const matchesMode = app.merchantModes.includes(currentMode);
    if (!matchesMode) return false;

    // 2. Device Role Filter
    const matchesRole = app.deviceRoles.includes('ALL') || app.deviceRoles.includes(deviceRole);
    if (!matchesRole) return false;

    return true;
  });

  visibleApps.sort((a, b) => hubRouteOrder.indexOf(a.id) - hubRouteOrder.indexOf(b.id));

  return visibleApps.map((app) => ({
    id: app.id,
    label: app.label,
    sub: typeof app.sub === 'function' ? app.sub(ctx) : app.sub,
    icon: app.icon,
    color: app.color,
    badge: app.badge ? app.badge(ctx) : null,
    permissionRequired: app.requiredPermission,
    blocked: !PermissionService.can(ctx.effectiveUser, app.requiredPermission)
      || Boolean(app.featureFlag && ctx.featureFlags && ctx.featureFlags[app.featureFlag] === false),
  }));
};
