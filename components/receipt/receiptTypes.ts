export type ReceiptDeliveryOption = 'PRINT' | 'SMS' | 'EMAIL' | 'NONE';

export interface ReceiptOrderContext {
  orderId?: string;
  orderNumber?: string;
  total: number;
  subtotal?: number;
  tax?: number;
  tip?: number;
  tableTentOrName?: string;
  paymentMethod?: string;
  appName?: string;
  items?: Array<{ name: string; qty: number; price: number }>;
}
