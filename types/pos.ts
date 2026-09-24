import { Customer, Employee, GlobalTaxConfig, Reservation, Schedule, UserRole } from './business';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
  printerLabels?: string[];
  [key: string]: unknown;
}

export interface DetailedOrder {
  id: string;
  date: string;
  time: string;
  total: number;
  status: string;
  paymentMethod: string;
  employeeName: string;
  device: string;
  type: string;
  items: any[];
  cardLast4?: string;
  tip?: number;
  fees?: number;
  discount?: number;
  tax?: number;
  businessId?: string;
  [key: string]: any;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: string;
  method: string;
  employeeId: string;
  businessId?: string;
  [key: string]: unknown;
}

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  modifierGroups: string[] | any[];
  inStock: boolean;
  showOnPos: boolean;
  showOnline: boolean;
  sku?: string;
  barcode?: string;
  quantity?: number;
  stockCount?: number;
  printerLabels?: string[];
  stationIds?: string[];
  [key: string]: any;
}

export interface Category {
  id: string;
  name: string;
  itemsCount: number;
  modifierGroups: string[] | any[];
  showOnPos: boolean;
  showOnline: boolean;
  [key: string]: unknown;
}

export interface ModifierOption { id: string; name: string; price: number; [key: string]: unknown; }
export interface ModifierGroup { id: string; name: string; options?: ModifierOption[]; modifiers?: ModifierOption[]; [key: string]: unknown; }
export interface PrinterLabel { id: string; name: string; color?: string; [key: string]: unknown; }
export interface FloorPlan { id: string; name: string; sections: string[]; }
export interface PrinterDevice { id: string; name: string; type?: string; status?: string; [key: string]: unknown; }

export type FloorItemType = string;
export interface DiningTable {
  id: string;
  name: string;
  type: FloorItemType;
  section: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  seats: number;
  status: string;
  employeeId?: string;
  assignedToName?: string;
  timeSeated?: string;
  expectedDuration?: number;
  reservationId?: string;
  highlight?: boolean;
  isSeatable: boolean;
  orderId?: string;
  [key: string]: unknown;
}
export interface Table { id: string; name: string; seats: number; status: string; [key: string]: any; }

export interface DiningOrderItem extends OrderItem { seatId?: number; seatNumber?: number; course?: string; isFired?: boolean; fired?: boolean; prepStations?: string[]; color?: string; }
export interface CartItem extends InventoryItem {
  cartId?: string;
  quantity: number;
  modifiers?: string[];
  discount?: { type: string; value: number; name: string };
  specialRequest?: string;
  seatId?: number;
  course?: string;
  isFired?: boolean;
  isVoided?: boolean;
  voidReason?: string;
}
export interface PaymentSplit { method: string; amount: number; status: string; tip?: number; [key: string]: unknown; }
export interface Order extends DetailedOrder {}
export type PosAppType = string;

export interface KitchenTicket { id: string; orderId?: string; status: string; items: any[]; station?: string; [key: string]: unknown; }
export interface KitchenMetric { station: string; pending: number; prep: number; ready: number; [key: string]: unknown; }
export type KDSLayoutMode = string;
export type KDSGroupingMode = string;
export type KDSColoringMode = string;
export type KDSRoutingMode = string;
export interface KDSSettings { isEnabled: boolean; layout?: string; grouping?: string; coloring?: string; routing?: string; soundAlerts?: boolean; showServer?: boolean; showTable?: boolean; [key: string]: unknown; }
export type OperatingMode = 'POS' | 'KIOSK' | 'KDS' | 'EXPO' | 'HOST';
export interface TipConfig { enabled: boolean; suggestedPercentages: number[]; [key: string]: any; }

export interface DiscountCode { id: string; code?: string; name?: string; type: string; value: number; status: string; usageCount?: number; showOnPos?: boolean; showOnline?: boolean; applicability?: string; [key: string]: unknown; }
export interface CashLogEntry { id: string; date: string; openingAmount: number; cashSales: number; cashDrops: number; closingAmount: number; variance: number; employeeId: string; [key: string]: unknown; }
export interface Invoice { id: string; customerName: string; dateIssued: string; dueDate: string; status: string; amount: number; [key: string]: unknown; }
export interface RecurringPlan { id: string; name: string; customerName: string; frequency: string; nextRun: string; status: string; amount: number; [key: string]: unknown; }
export interface Feedback { rating: number; comment: string; tags?: string[]; timestamp: string; [key: string]: unknown; }
export interface FeedbackSettings { allowFeedback?: boolean; showOnReceipt?: boolean; promptFrequency?: string; customQuestions?: string[]; enabled?: boolean; publicReviewUrl?: string; minRatingForPublic?: number; autoSendSms?: boolean; fiveStarMessage?: string; googleReviewUrl?: string; lowStarMessage?: string; [key: string]: unknown; }
export interface GiftCard { id: string; code?: string; balance: number; status?: string; [key: string]: unknown; }
export interface RemovedItem { id: string; itemName: string; price: number; removedAt: string; employeeName: string; reason: string; orderId: string; [key: string]: unknown; }

export interface SalesSummary { date: string; grossSales: number; discounts: number; netSales: number; orderCount: number; [key: string]: unknown; }
export interface DepositLog { id: string; date: string; totalCollected: number; fees: number; netDeposit: number; status: string; [key: string]: unknown; }
export interface TaxReport { period: string; taxableSales: number; taxRate: number; estimatedTax: number; status: string; [key: string]: unknown; }
export interface Statement { id: string; period: string; year: number; type: string; amount?: number; status: string; downloadUrl: string; [key: string]: unknown; }
export interface ReportRequest { id: string; type: string; dateRange: string; status: string; requestDate: string; requestedBy?: string; [key: string]: unknown; }
export interface HourlySales { hour: string; today: number; lastPeriod: number; [key: string]: unknown; }
export interface TopItem { name: string; quantity: number; revenue: number; [key: string]: unknown; }
export interface AppRecommendation { id: string; name: string; description: string; [key: string]: unknown; }
export interface MLJob { id: string; name: string; modelType: string; status: string; accuracy: number; resourceClass: string; startTime: string; [key: string]: unknown; }
export interface ResourceClass { id: string; name: string; type: string; spec: string; availability: number; [key: string]: unknown; }
export interface SalesOverviewReport { [key: string]: any; }
export interface DiningMetric { section: string; occupancy: number; avgDiningTime: number; revenue: number; }
export interface DiningAutomationRule { id: string; name: string; condition: string; action: string; isEnabled: boolean; riskLevel: string; }
export interface OptimizationRecommendation { id: string; type: string; suggestion: string; [key: string]: any; }
export interface TaxDetail { id: string; taxRate: number; name: string; applicableSales: number; taxesCollected: number; taxesRefunded: number; netTaxes: number; }
export interface TenderGroupStats { group: string; totalAmount: number; totalCount: number; networks?: any[]; }
export interface OrderTypeTrend { date: string; [key: string]: string | number; }
export interface HourlyBreakdown { hour: string; [key: string]: number | string; }
export interface OrderTypeExtendedStats { type: string; ordersCount: number; grossSales: number; netSales: number; avgTicketSize: number; }
export interface TenderTypeSummary { type: string; amount: number; count: number; }
export interface RevenueItem { id: string; name: string; category: string; [key: string]: any; }
export interface GiftCardReportSummary { [key: string]: number; }
export interface GiftCardTransaction { id: string; amount: number; date: string; [key: string]: any; }
export interface EmployeeSalesReportSummary { [key: string]: number; }
export interface EmployeeSalesRow { employeeId: string; employeeName: string; [key: string]: any; }
export interface Batch { id: string; date: string; time: string; status: string; type: string; transactionCount: number; amount: number; }
export interface DepositDetail { id: string; date: string; [key: string]: any; }
export interface Dispute { id: string; date: string; transactionId: string; reason: string; status: string; amount: number; dueDate: string; }
export interface Vendor { id: string; name: string; email: string; paymentMethod: string; outstandingBalance: number; lastPaidDate: string; }
export interface Bill { id: string; vendorId: string; amount: number; dueDate: string; status: string; invoiceNumber: string; }
export interface OrderTypeSummary { type: string; grossSales: number; orderCount: number; }
export interface PeerComparisonData { [key: string]: any; }
export interface StockTrackingSettings { trackStock: boolean; autoUpdateCounts: boolean; allowNegativeCounts: boolean; }
export interface Payment { id: string; amount: number; status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'CANCELED'; method: string; [key: string]: any; }

export type { Customer, Employee, GlobalTaxConfig, Reservation, Schedule, UserRole };
