
import {
  Business, Role, Employee, Customer, Transaction, DetailedOrder, InventoryItem, Category,
  SalesSummary, DepositLog, TaxReport, DiscountCode, CashLogEntry, Statement, ReportRequest,
  HourlySales, TopItem, AppRecommendation, MLJob, ResourceClass, SalesOverviewReport,
  HourlyBreakdown, OrderTypeExtendedStats, TenderTypeSummary, RevenueItem, RemovedItem,
  GiftCardReportSummary, GiftCardTransaction, EmployeeSalesReportSummary, EmployeeSalesRow,
  Batch, DepositDetail, Dispute, Vendor, Bill, ModifierGroup, PrinterLabel, PrinterDevice,
  Table, Reservation, Schedule, SystemModule, SubscriptionPlan, AuditLog, GlobalAutomationRule,
  BusinessGovernanceProfile, FloorPlan, DiningMetric, DiningAutomationRule, OptimizationRecommendation,
  UserRole, TaxDetail, TenderGroupStats, OrderTypeTrend, PermissionItem, RolePermission, PermissionGroup,
  RoleAssignmentRequest, PasscodeSettings, StockTrackingSettings, BusinessLocation, Director, FraudRule,
  BankAccount, BusinessHours, PeerComparisonData, DiningTable, OrderTypeSummary, TipConfig, KitchenTicket, KitchenMetric, KDSSettings,
  KDSLayoutMode, KDSGroupingMode, KDSColoringMode, KDSRoutingMode
} from './types';

// Mock Businesses
export const MOCK_BUSINESSES: Business[] = [
  { 
    id: 'B001', 
    name: 'LUMI RESTAURANT AND BAR', 
    ownerName: 'Seckin Gungordu', 
    plan: 'Enterprise', 
    status: 'Active', 
    nextBillingDate: '2024-06-01', 
    revenueYTD: 145000,
    varConfig: {
      provider: 'Clover',
      merchantId: '496138300884',
      terminalId: 'LK9921',
      status: 'Active'
    }
  },
];

// --- ROLE & PERMISSION MOCKS ---
export const MOCK_ROLES: Role[] = [
    { id: 'R-ADMIN', name: 'Admin', type: 'Default', isSystem: true, description: 'Full platform control', employeeCount: 2 },
    { id: 'R-EMPLOYEE', name: 'Employee', type: 'Default', isSystem: true, description: 'Basic access', employeeCount: 22 },
    { id: 'R-MANAGER', name: 'Manager', type: 'Default', isSystem: true, description: 'Store operations', employeeCount: 4 },
    { id: 'R-LEAD', name: 'Server Lead', type: 'Custom', isSystem: false, description: 'Shift leader', employeeCount: 0 }
];

export const MOCK_PERMISSIONS: PermissionItem[] = [
    { id: 'P1', name: 'Access App Market', key: 'ACCESS_APP_MARKET', category: 'App Access' },
    { id: 'P2', name: 'Access Cash Log', key: 'ACCESS_CASH_LOG', category: 'App Access' },
    { id: 'P3', name: 'Access Closeout', key: 'ACCESS_CLOSEOUT', category: 'App Access' },
    { id: 'P4', name: 'Access Clover Dining', key: 'ACCESS_DINING', category: 'App Access' },
    { id: 'P5', name: 'Access Clover Focus Browser', key: 'ACCESS_FOCUS_BROWSER', category: 'App Access' },
    { id: 'P6', name: 'Access Customers', key: 'ACCESS_CUSTOMERS', category: 'App Access' },
    { id: 'P7', name: 'Access Help', key: 'ACCESS_HELP', category: 'App Access' },
    { id: 'P8', name: 'Access Discounts', key: 'ACCESS_DISCOUNTS', category: 'App Access' },
    { id: 'P9', name: 'Access Gift Cards', key: 'ACCESS_GIFT_CARDS', category: 'App Access' },
    { id: 'P10', name: 'Access Happy Hour', key: 'ACCESS_HAPPY_HOUR', category: 'App Access' },
    { id: 'P11', name: 'Access Inventory app', key: 'ACCESS_INVENTORY', category: 'App Access' },
    { id: 'P12', name: 'Access Invoice Manager', key: 'ACCESS_INVOICES', category: 'App Access' },
    { id: 'P13', name: 'Access Manual Transaction', key: 'ACCESS_MANUAL_TRANS', category: 'App Access' },
    { id: 'P14', name: 'Access Multiple Menus', key: 'ACCESS_MENUS', category: 'App Access' },
    { id: 'P15', name: 'Access Printers', key: 'ACCESS_PRINTERS', category: 'App Access' },
    { id: 'P16', name: 'Access Plan Manager', key: 'ACCESS_PLANS', category: 'App Access' },
    { id: 'P17', name: 'Access Refund', key: 'ACCESS_REFUND', category: 'App Access' },
    { id: 'P18', name: 'Access Register', key: 'ACCESS_REGISTER', category: 'App Access' },
    { id: 'P19', name: 'Access Reporting', key: 'ACCESS_REPORTING', category: 'App Access' },
    { id: 'P20', name: 'Access Setup App', key: 'ACCESS_SETUP', category: 'App Access' },
    { id: 'P21', name: 'Access Shifts', key: 'ACCESS_SHIFTS', category: 'App Access' },
    { id: 'P22', name: 'Access Tips', key: 'ACCESS_TIPS', category: 'App Access' },
    { id: 'P23', name: 'Access Transactions', key: 'ACCESS_TRANSACTIONS', category: 'App Access' },
    { id: 'P24', name: 'Access Virtual Terminal', key: 'ACCESS_VIRTUAL_TERMINAL', category: 'App Access' },
    { id: 'P25', name: 'Access Wireless Manager', key: 'ACCESS_WIRELESS', category: 'App Access' }
];

export const MOCK_ROLE_PERMISSIONS: RolePermission[] = [
    { roleId: 'R-MANAGER', permissionKey: 'ACCESS_REGISTER', access: true },
    { roleId: 'R-EMPLOYEE', permissionKey: 'ACCESS_REGISTER', access: true }
];

export const MOCK_PERMISSION_GROUPS: PermissionGroup[] = [
    { id: 'G1', name: 'Front of House', description: 'Cashier and server permissions', permissions: ['ACCESS_REGISTER', 'ACCESS_DINING'] }
];

export const MOCK_ROLE_ASSIGNMENT_REQUESTS: RoleAssignmentRequest[] = [
    { id: 'REQ1', employeeId: 'E100', employeeName: 'Alice Smith', currentRole: 'Employee', requestedRole: 'Manager', status: 'Pending', requesterName: 'Bob Manager', date: '2024-05-15' }
];

export const MOCK_PASSCODE_SETTINGS: PasscodeSettings = {
    requirePasscode: true,
    minLength: 4,
    requireAlpha: false,
    expirationDays: 90
};

// --- EMPLOYEE MOCKS (10 Servers + Mgmt) ---
export const MOCK_EMPLOYEES: Employee[] = [
    // Management
    { id: 'E101', name: 'Seckin Gungordu', role: 'Admin', email: 'sgungordu@gmail.com', hourlyRate: 50, hoursWorked: 40, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '1234' },
    { id: 'E102', name: 'Sarah Manager', role: 'Manager', email: 'sarah.m@lumi.com', hourlyRate: 35, hoursWorked: 45, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '5678' },
    { id: 'E103', name: 'John Lead', role: 'Server Lead', email: 'john.l@lumi.com', hourlyRate: 25, hoursWorked: 38, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '0000' },
    
    // Servers
    { id: 'E104', name: 'Michael Server', role: 'Server', email: 'michael.s@lumi.com', hourlyRate: 18, hoursWorked: 30, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '1111' },
    { id: 'E107', name: 'Alice Walker', role: 'Server', email: 'alice.w@lumi.com', hourlyRate: 18, hoursWorked: 32, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '4444' },
    { id: 'E108', name: 'David Chen', role: 'Server', email: 'david.c@lumi.com', hourlyRate: 18, hoursWorked: 28, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '5555' },
    { id: 'E109', name: 'Emma Davis', role: 'Server', email: 'emma.d@lumi.com', hourlyRate: 18, hoursWorked: 35, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '6666' },
    { id: 'E110', name: 'Chris Evans', role: 'Server', email: 'chris.e@lumi.com', hourlyRate: 18, hoursWorked: 20, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '7777' },
    { id: 'E111', name: 'Katie Holmes', role: 'Server', email: 'katie.h@lumi.com', hourlyRate: 18, hoursWorked: 40, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '8888' },
    
    // Support Staff
    { id: 'E105', name: 'Jane Host', role: 'Host', email: 'jane.h@lumi.com', hourlyRate: 18, hoursWorked: 25, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '2222' },
    { id: 'E106', name: 'Bob Employee', role: 'Employee', email: 'bob.e@lumi.com', hourlyRate: 15, hoursWorked: 20, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '3333' },
    
    // System
    { id: 'E_SUPER', name: 'System Super', role: UserRole.SUPER_ADMIN, email: 'super@newgatepos.com', hourlyRate: 100, hoursWorked: 0, status: 'Active', businessId: 'B001', deviceAccess: true, passcode: '9999' }
];

// --- CUSTOMER MOCKS ---
export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'C001', name: 'Alice Wonderland', email: 'alice@example.com', phone: '555-0101', totalSpent: 1250.50, segment: 'VIP', lastVisit: '2024-05-14', ordersCount: 45 },
    { id: 'C002', name: 'Bob Builder', email: 'bob@example.com', phone: '555-0102', totalSpent: 450.00, segment: 'Regular', lastVisit: '2024-05-10', ordersCount: 12 },
    { id: 'C003', name: 'Charlie Chocolate', email: 'charlie@example.com', phone: '555-0103', totalSpent: 50.00, segment: 'New', lastVisit: '2024-05-15', ordersCount: 1 }
];

// --- GENERATED DATA ---
export const MOCK_TRANSACTIONS: Transaction[] = [];
export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
    { id: 'I-1', name: 'Margarita Pizza', price: 18.00, cost: 4.50, category: 'Main Course', modifierGroups: [], inStock: true, showOnPos: true, showOnline: true, printerLabels: ['PL-PIZZA'] },
    { id: 'I-2', name: 'Craft Beer', price: 8.00, cost: 2.50, category: 'Beverages', modifierGroups: [], inStock: true, showOnPos: true, showOnline: true, printerLabels: ['PL-BAR'] },
    { id: 'I-3', name: 'Caesar Salad', price: 12.00, cost: 3.00, category: 'Appetizers', modifierGroups: [], inStock: true, showOnPos: true, showOnline: true, printerLabels: ['PL-COLD'] },
    { id: 'I-4', name: 'Grilled Salmon', price: 24.00, cost: 8.00, category: 'Main Course', modifierGroups: [], inStock: true, showOnPos: true, showOnline: true, printerLabels: ['PL-HOT'] },
    { id: 'I-5', name: 'Cheesecake', price: 9.00, cost: 2.00, category: 'Dessert', modifierGroups: [], inStock: true, showOnPos: true, showOnline: true, printerLabels: ['PL-COLD'] }
];

export const MOCK_ML_JOBS: MLJob[] = [
    { id: 'JOB-001', name: 'Demand Forecast v2', modelType: 'TimeSeries', status: 'Running', accuracy: 0.85, resourceClass: 'GPU-A100', startTime: '2024-05-15 08:00' }
];

export const MOCK_RESOURCES: ResourceClass[] = [
    { id: 'RES-001', name: 'NVIDIA A100 Cluster', type: 'GPU', spec: '80GB VRAM', availability: 4 }
];

export const MOCK_SALES_SUMMARY: SalesSummary[] = [
    { date: '2024-05-14', grossSales: 3100, discounts: 60, netSales: 3040, orderCount: 135 },
    { date: '2024-05-15', grossSales: 1500, discounts: 25, netSales: 1475, orderCount: 65 }
];

export const MOCK_DEPOSITS: DepositLog[] = [
    { id: 'DEP-001', date: '2024-05-14', totalCollected: 3040, fees: 85, netDeposit: 2955, status: 'Completed' }
];

export const MOCK_TAX_REPORTS: TaxReport[] = [
    { period: 'April 2024', taxableSales: 85000, taxRate: 0, estimatedTax: 0, status: 'Paid' }
];

export const MOCK_DISCOUNTS: DiscountCode[] = [
    { id: 'D001', code: 'SUMMER10', value: 10, type: 'Percentage', status: 'Active', usageCount: 45, name: 'Summer Sale', showOnPos: true, showOnline: true, applicability: 'Order' }
];

export const MOCK_CASH_LOGS: CashLogEntry[] = [
    { id: 'CL-001', date: '2024-05-14', openingAmount: 200, cashSales: 450, cashDrops: 400, closingAmount: 250, variance: 0, employeeId: 'Jane Smith' }
];

export const MOCK_STATEMENTS: Statement[] = [
    { id: 'ST-001', period: 'April 2024', year: 2024, type: 'Merchant Processing', amount: 1250.45, status: 'Finalized', downloadUrl: '#' }
];

export const MOCK_REPORT_REQUESTS: ReportRequest[] = [
    { id: 'RR-001', type: 'Sales Summary', dateRange: 'Last 30 Days', status: 'Ready', requestDate: '2024-05-15 09:30', requestedBy: 'Seckin Gungordu' }
];

export const MOCK_HOURLY_SALES: HourlySales[] = [
    { hour: '8am', today: 150, lastPeriod: 120 },
    { hour: '12pm', today: 800, lastPeriod: 750 }
];

export const MOCK_DETAILED_ORDERS: DetailedOrder[] = [];

export const MOCK_CATEGORIES: Category[] = [
    { id: 'CAT1', name: 'Appetizers', itemsCount: 10, modifierGroups: [], showOnPos: true, showOnline: true },
    { id: 'CAT2', name: 'Main Course', itemsCount: 15, modifierGroups: [], showOnPos: true, showOnline: true },
    { id: 'CAT3', name: 'Beverages', itemsCount: 8, modifierGroups: [], showOnPos: true, showOnline: true },
    { id: 'CAT4', name: 'Dessert', itemsCount: 5, modifierGroups: [], showOnPos: true, showOnline: true }
];

export const MOCK_TABLES: Table[] = [
    { id: 'T1', name: 'Table 1', seats: 4, status: 'Available' }
];

// --- 20 TABLE FLOOR PLAN ---
export const MOCK_FLOOR_TABLES: DiningTable[] = [
    // Dining Room (10 Tables)
    { id: 'T1', name: '1', type: 'BOOTH_DOUBLE', section: 'Dining Room', x: 50, y: 50, width: 100, height: 80, seats: 4, status: 'Occupied', assignedToName: 'Michael Server', employeeId: 'E104', timeSeated: new Date(Date.now() - 1000 * 60 * 15).toISOString(), isSeatable: true, rotation: 0 },
    { id: 'T2', name: '2', type: 'BOOTH_DOUBLE', section: 'Dining Room', x: 50, y: 150, width: 100, height: 80, seats: 4, status: 'Available', isSeatable: true, rotation: 0 },
    { id: 'T3', name: '3', type: 'BOOTH_DOUBLE', section: 'Dining Room', x: 50, y: 250, width: 100, height: 80, seats: 4, status: 'Available', isSeatable: true, rotation: 0 },
    { id: 'T4', name: '4', type: 'TABLE_RECT', section: 'Dining Room', x: 200, y: 50, width: 80, height: 120, seats: 6, status: 'Occupied', assignedToName: 'Alice Walker', employeeId: 'E107', timeSeated: new Date(Date.now() - 1000 * 60 * 45).toISOString(), isSeatable: true, rotation: 0 },
    { id: 'T5', name: '5', type: 'TABLE_RECT', section: 'Dining Room', x: 200, y: 200, width: 80, height: 120, seats: 6, status: 'Dirty', assignedToName: 'Alice Walker', employeeId: 'E107', isSeatable: true, rotation: 0 },
    { id: 'T6', name: '6', type: 'TABLE_ROUND', section: 'Dining Room', x: 350, y: 50, width: 90, height: 90, seats: 4, status: 'Available', isSeatable: true, rotation: 0 },
    { id: 'T7', name: '7', type: 'TABLE_ROUND', section: 'Dining Room', x: 350, y: 160, width: 90, height: 90, seats: 4, status: 'Occupied', assignedToName: 'David Chen', employeeId: 'E108', timeSeated: new Date(Date.now() - 1000 * 60 * 5).toISOString(), isSeatable: true, rotation: 0 },
    { id: 'T8', name: '8', type: 'TABLE_ROUND', section: 'Dining Room', x: 350, y: 270, width: 90, height: 90, seats: 4, status: 'Available', isSeatable: true, rotation: 0 },
    { id: 'T9', name: '9', type: 'TABLE_SQUARE', section: 'Dining Room', x: 500, y: 50, width: 70, height: 70, seats: 2, status: 'Available', isSeatable: true, rotation: 0 },
    { id: 'T10', name: '10', type: 'TABLE_SQUARE', section: 'Dining Room', x: 500, y: 150, width: 70, height: 70, seats: 2, status: 'Available', isSeatable: true, rotation: 0 },

    // Patio (5 Tables)
    { id: 'P1', name: 'P1', type: 'TABLE_ROUND', section: 'Patio', x: 100, y: 100, width: 100, height: 100, seats: 4, status: 'Available', isSeatable: true, rotation: 0 },
    { id: 'P2', name: 'P2', type: 'TABLE_ROUND', section: 'Patio', x: 250, y: 100, width: 100, height: 100, seats: 4, status: 'Occupied', assignedToName: 'Emma Davis', employeeId: 'E109', timeSeated: new Date(Date.now() - 1000 * 60 * 25).toISOString(), isSeatable: true, rotation: 0 },
    { id: 'P3', name: 'P3', type: 'TABLE_ROUND', section: 'Patio', x: 400, y: 100, width: 100, height: 100, seats: 4, status: 'Available', isSeatable: true, rotation: 0 },
    { id: 'P4', name: 'P4', type: 'TABLE_SQUARE', section: 'Patio', x: 150, y: 250, width: 70, height: 70, seats: 2, status: 'Available', isSeatable: true, rotation: 0 },
    { id: 'P5', name: 'P5', type: 'TABLE_SQUARE', section: 'Patio', x: 300, y: 250, width: 70, height: 70, seats: 2, status: 'Available', isSeatable: true, rotation: 0 },

    // Bar (5 Tables)
    { id: 'B1', name: 'B1', type: 'TABLE_RECT', section: 'Bar', x: 50, y: 50, width: 60, height: 80, seats: 2, status: 'Available', isSeatable: true, rotation: 0 },
    { id: 'B2', name: 'B2', type: 'TABLE_RECT', section: 'Bar', x: 130, y: 50, width: 60, height: 80, seats: 2, status: 'Occupied', assignedToName: 'Chris Evans', employeeId: 'E110', timeSeated: new Date(Date.now() - 1000 * 60 * 55).toISOString(), isSeatable: true, rotation: 0 },
    { id: 'B3', name: 'B3', type: 'TABLE_RECT', section: 'Bar', x: 210, y: 50, width: 60, height: 80, seats: 2, status: 'Available', isSeatable: true, rotation: 0 },
    { id: 'B4', name: 'B4', type: 'TABLE_RECT', section: 'Bar', x: 290, y: 50, width: 60, height: 80, seats: 2, status: 'Available', isSeatable: true, rotation: 0 },
    { id: 'B5', name: 'B5', type: 'TABLE_RECT', section: 'Bar', x: 370, y: 50, width: 60, height: 80, seats: 2, status: 'Dirty', assignedToName: 'Chris Evans', employeeId: 'E110', isSeatable: true, rotation: 0 },
    // Decor
    { id: 'D1', name: 'Decor', type: 'PLANT_MONSTERA', section: 'Dining Room', x: 500, y: 300, width: 60, height: 60, seats: 0, status: 'Available', isSeatable: false, rotation: 0 },
    { id: 'D2', name: 'Wall', type: 'DECOR_WALL', section: 'Bar', x: 20, y: 150, width: 450, height: 10, seats: 0, status: 'Available', isSeatable: false, rotation: 0 },
];

export const MOCK_RESERVATIONS: Reservation[] = [];
export const MOCK_SCHEDULES: Schedule[] = [];
export const MOCK_ORDER_TYPES: OrderTypeSummary[] = [];
export const MOCK_TENDER_TYPES: TenderTypeSummary[] = [];

export const MOCK_SALES_OVERVIEW: SalesOverviewReport = {
    summary: {
        orders: { value: 320, previousValue: 300, percentageChange: 6.6 },
        grossSales: { value: 10000, previousValue: 9500, percentageChange: 5.2 },
        netSales: { value: 9800, previousValue: 9200, percentageChange: 6.5 },
        avgTicketSize: { value: 31.25, previousValue: 31.66, percentageChange: -1.3 },
        amountCollected: { value: 10500, previousValue: 10000, percentageChange: 5.0 },
        laborCost: { total: 2500, percentage: 25 }
    },
    chartData: [],
    topTenderTypes: [],
    topRevenueClasses: [],
    topCardTypes: [],
    topCategories: [],
    topItems: []
};

export const MOCK_HOURLY_BREAKDOWN: HourlyBreakdown[] = [];
export const MOCK_TENDER_REPORT_DETAILED: TenderGroupStats[] = [];
export const MOCK_ORDER_TYPES_EXTENDED: OrderTypeExtendedStats[] = [];
export const MOCK_ORDER_TYPE_TRENDS: OrderTypeTrend[] = [];
export const MOCK_TAX_DETAILS: TaxDetail[] = [];
export const MOCK_DEFAULT_DISCOUNTS: DiscountCode[] = [];
export const MOCK_LOCATIONS: BusinessLocation[] = [];
export const MOCK_DIRECTORS: Director[] = [];
export const MOCK_FRAUD_RULES: FraudRule[] = [];
export const MOCK_BANK_ACCOUNTS: BankAccount[] = [];
export const MOCK_BUSINESS_HOURS: BusinessHours[] = [];
export const MOCK_STOCK_SETTINGS: StockTrackingSettings = { trackStock: true, autoUpdateCounts: true, allowNegativeCounts: false };

export const MOCK_KDS_SETTINGS: KDSSettings = {
    isEnabled: true,
    routingMode: 'KDS_ONLY',
    autoReleaseTable: true,
    stations: [],
    itemRouting: [],
    warningThresholdMinutes: 10,
    criticalThresholdMinutes: 20,
    layoutMode: 'GRID',
    ticketGrouping: 'TABLE',
    colorCoding: 'TIME_BASED',
    showCompletedHistory: true,
    ticketSize: 'COMPACT',
    showTimers: true,
    fontSize: 'MEDIUM',
    contrastMode: 'NORMAL',
    enableItemStatusTracking: true,
    allowBumpRecall: true,
    groupItemsByGuest: true,
    enablePriorityHighlighting: true,
    soundAlerts: true,
    visualAlerts: true,
    printerBackup: false,
    errorLogging: true,
    allowedEditRoles: [UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN],
    auditLogChanges: true,
    realtimeSync: true,
    maintenanceMode: false,
};

export const MOCK_PEER_METRICS: PeerComparisonData = {
    grossSales: { metric: 'Gross Sales', you: 10000, peerAverage: 8500, percentageDiff: 17.6, format: 'currency' },
    avgMonthlySales: { metric: 'Avg Monthly Sales', you: 40000, peerAverage: 35000, percentageDiff: 14.3, format: 'currency' },
    avgTransactions: { metric: 'Avg Transactions', you: 1200, peerAverage: 1000, percentageDiff: 20, format: 'number' },
    avgTransactionSize: { metric: 'Avg Ticket', you: 33.33, peerAverage: 35.00, percentageDiff: -4.8, format: 'currency' },
    chartData: [],
    transactionSizeChartData: []
};

export const MOCK_SYSTEM_MODULES: SystemModule[] = [];
export const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [];
export const MOCK_AUDIT_LOGS: AuditLog[] = [];
export const MOCK_GLOBAL_RULES: GlobalAutomationRule[] = [];
export const MOCK_GOVERNANCE_PROFILES: BusinessGovernanceProfile[] = [];
export const MOCK_INVOICES: any[] = [];
export const MOCK_RECURRING_PLANS: any[] = [];
export const MOCK_REVENUE_ITEMS: RevenueItem[] = [];
export const MOCK_REMOVED_ITEMS: RemovedItem[] = [];
export const MOCK_GIFT_CARD_DATA: { summary: GiftCardReportSummary, transactions: GiftCardTransaction[] } = {
    summary: { totalLoaded: 5000, paidLoaded: 4500, complimentaryLoaded: 500, countIssued: 100, totalRedeemed: 1200 },
    transactions: []
};
export const MOCK_EMPLOYEES_SALES_DATA: { summary: EmployeeSalesReportSummary, rows: EmployeeSalesRow[] } = {
    summary: { netSales: 15000, avgTicketSize: 45, tips: 2500, laborCost: 4000, laborCostPercentage: 26.6 },
    rows: []
};
export const MOCK_BATCHES: Batch[] = [];
export const MOCK_DETAILED_DEPOSITS: DepositDetail[] = [];
export const MOCK_DISPUTES: Dispute[] = [];
export const MOCK_VENDORS: Vendor[] = [];
export const MOCK_BILLS: Bill[] = [];
export const MOCK_MODIFIER_GROUPS: ModifierGroup[] = [];
export const MOCK_PRINTER_LABELS: PrinterLabel[] = [
    { id: 'PL-HOT', name: 'Hot Line', itemsCount: 15, assignedPrinter: 'Kitchen 1', isActive: true },
    { id: 'PL-COLD', name: 'Cold Station', itemsCount: 8, assignedPrinter: 'Kitchen 2', isActive: true },
    { id: 'PL-BAR', name: 'Bar', itemsCount: 12, assignedPrinter: 'Bar Printer', isActive: true },
    { id: 'PL-PIZZA', name: 'Pizza Oven', itemsCount: 5, assignedPrinter: 'Oven Printer', isActive: true }
];
export const MOCK_PRINTER_DEVICES: PrinterDevice[] = [];
export const MOCK_FLOOR_PLAN: FloorPlan = { id: 'FP1', name: 'Main Layout', sections: ['Dining Room'] };
export const MOCK_DINING_ANALYTICS: DiningMetric[] = [];
export const MOCK_DINING_RULES: DiningAutomationRule[] = [];
export const MOCK_OPTIMIZATIONS: OptimizationRecommendation[] = [];
export const MOCK_TOP_ITEMS: TopItem[] = [];
export const MOCK_RECOMMENDED_APPS: AppRecommendation[] = [];
export const MOCK_TIP_CONFIG: TipConfig = { enabled: true, defaultPercentage: 20, suggestedPercentages: [15, 18, 20, 25], allowCustom: true };
export const MOCK_KITCHEN_TICKETS: KitchenTicket[] = [
    {
        id: 'TKT-101',
        orderId: 'ORD-101',
        type: 'Dine-in',
        status: 'Pending',
        timeIn: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        table: 'Table 4',
        server: 'Alice W.',
        items: [
            { name: 'Margarita Pizza', qty: 1, modifiers: ['Extra Cheese'], printerLabels: ['PL-PIZZA'] },
            { name: 'Craft Beer', qty: 2, modifiers: [], printerLabels: ['PL-BAR'] }
        ]
    },
    {
        id: 'TKT-102',
        orderId: 'ORD-102',
        type: 'Dine-in',
        status: 'Prep',
        timeIn: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        table: 'Table 7',
        server: 'David C.',
        items: [
            { name: 'Grilled Salmon', qty: 2, modifiers: ['Medium'], printerLabels: ['PL-HOT'] },
            { name: 'Caesar Salad', qty: 1, modifiers: [], printerLabels: ['PL-COLD'] }
        ]
    }
];
export const MOCK_KITCHEN_METRICS: KitchenMetric[] = [];
export const MOCK_RECEIPT_SETTINGS: { showTax: boolean } = { showTax: true };
