import { Employee, InventoryItem, DiningTable } from '../../../types';

export type SettingsSection =
  | 'OVERVIEW'
  | 'EMPLOYEES'
  | 'MENU'
  | 'TABLES'
  | 'KITCHEN'
  | 'TIPS'
  | 'RECEIPTS'
  | 'NETWORK'
  | 'DEVICES'
  | 'CASH'
  | 'SECURITY'
  | 'HELP';

export interface PosSettingsHubProps {
  currentUser: Employee;
  employees: Employee[];
  inventory: InventoryItem[];
  tables: DiningTable[];
  tipConfig?: any;
  taxConfig?: any;
  kdsSettings?: any;
  onExit: () => void;
  onOpenWebAdmin?: () => void;
  onSaveItem: (item: InventoryItem) => void;
  onUpdateTable: (table: DiningTable) => void;
  onUpdateEmployee: (emp: Employee) => void;
}
