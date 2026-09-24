import { Employee } from '../../../types';

export type PosInternalRoute =
  | 'HUB' | 'REGISTER' | 'TABLES' | 'KDS' | 'ORDERS' | 'RESERVATIONS'
  | 'CASH_DRAWER' | 'END_OF_DAY' | '86_AVAILABILITY' | 'SHIFT_CLOCK'
  | 'POS_SETTINGS' | 'CUSTOMERS' | 'KIOSK' | 'MANAGER_TOOLS'
  | 'RETAIL_REGISTER' | 'RETAIL_INVENTORY' | 'RETAIL_RETURNS'
  | 'GIVING_REGISTER' | 'GIVING_KIOSK' | 'DONOR_CRM';

export interface PosShellProps {
  currentUser: Employee;
  [key: string]: any;
}

export interface PosShellPropsState {
  posRoute: PosInternalRoute;
  setPosRoute: (route: PosInternalRoute) => void;
  activeUser?: Employee | null;
  currentUser: Employee;
  [key: string]: any;
}
