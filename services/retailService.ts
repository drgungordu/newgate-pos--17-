import { RetailProduct, RetailReturnRecord } from '../types/retail';
import { InventoryLedgerService } from './inventoryLedgerService';
import { RefundLedgerService } from './refundLedgerService';

export class RetailService {
  private static products: RetailProduct[] = [
    {
      id: 'RET-001',
      name: 'Logo Cotton T-Shirt',
      category: 'Apparel',
      basePrice: 25.0,
      sku: 'APP-TSHIRT-01',
      barcode: '100000000001',
      variants: [
        { id: 'VAR-1', sku: 'APP-TSHIRT-S', barcode: '100000000002', size: 'S', price: 25.0, inventoryCount: 15 },
        { id: 'VAR-2', sku: 'APP-TSHIRT-M', barcode: '100000000003', size: 'M', price: 25.0, inventoryCount: 20 },
        { id: 'VAR-3', sku: 'APP-TSHIRT-L', barcode: '100000000004', size: 'L', price: 25.0, inventoryCount: 12 },
      ]
    },
    {
      id: 'RET-002',
      name: 'Artisan Coffee Mug',
      category: 'Merchandise',
      basePrice: 16.5,
      sku: 'MERCH-MUG-01',
      barcode: '100000000005',
    },
    {
      id: 'RET-003',
      name: 'House Roast Whole Beans (12oz)',
      category: 'Coffee',
      basePrice: 18.0,
      sku: 'COF-BEAN-01',
      barcode: '100000000006',
    }
  ];

  static async listProducts(): Promise<RetailProduct[]> {
    return [...this.products];
  }

  static async lookupBarcode(barcode: string): Promise<{ product: RetailProduct; variant?: RetailProduct['variants'][number] } | null> {
    for (const product of this.products) {
      if (product.barcode === barcode) return { product };
      const variant = product.variants?.find(item => item.barcode === barcode);
      if (variant) return { product, variant };
    }
    return null;
  }

  static async processReturn(record: Partial<RetailReturnRecord>): Promise<Partial<RetailReturnRecord> & { success: boolean; returnId: string }> {
    const returnId = `RET-RET-${Date.now()}`;
    for (const item of record.items || []) {
      await InventoryLedgerService.record({
        itemId: String(item.productId),
        quantity: Number(item.quantity || 1),
        type: 'RETURN',
        referenceId: returnId,
        actorId: record.cashierId,
      });
    }
    if (record.originalOrderId && record.totalRefundAmount) {
      await RefundLedgerService.create({ orderId: record.originalOrderId, amount: record.totalRefundAmount, actorId: record.cashierId || 'unknown' });
    }
    return { ...record, success: true, returnId };
  }
}
