export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  size?: string;
  color?: string;
  price: number;
  inventoryCount: number;
}

export interface RetailProduct {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  sku: string;
  barcode: string;
  requiresAgeVerification?: boolean;
  minAge?: number;
  variants?: ProductVariant[];
}

export type ReturnReason = 'DEFECTIVE' | 'WRONG_SIZE' | 'CHANGED_MIND' | 'OTHER';
export type RefundMethod = 'CASH' | 'ORIGINAL_CARD' | 'STORE_CREDIT';

export interface RetailReturnRecord {
  id: string;
  originalOrderId: string;
  date?: string;
  employeeId?: string;
  employeeName?: string;
  reason?: ReturnReason;
  refundMethod?: RefundMethod;
  refundTotal?: number;
  items: any[];
  merchantId?: string;
  isReceiptless?: boolean;
  totalRefundAmount?: number;
  cashierId?: string;
  cashierName?: string;
  timestamp?: string;
}
