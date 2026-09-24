import { DetailedOrder } from '../types';

export interface ReceiptDocument {
  orderId: string;
  merchantName: string;
  lines: string[];
  total: number;
}

export class ReceiptEngine {
  static render(order: DetailedOrder, merchantName = 'Newgate POS'): ReceiptDocument {
    const lines = [
      merchantName,
      `Order: ${order.id}`,
      `${order.date} ${order.time}`,
      '------------------------------',
      ...(order.items || []).map(item => `${item.quantity || 1}x ${item.name} $${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`),
      '------------------------------',
      `Tax: $${Number(order.tax || 0).toFixed(2)}`,
      `Total: $${Number(order.total || 0).toFixed(2)}`,
      `Payment: ${order.paymentMethod}`,
    ];
    return { orderId: order.id, merchantName, lines, total: order.total };
  }

  static toText(document: ReceiptDocument): string { return document.lines.join('\n'); }
}
