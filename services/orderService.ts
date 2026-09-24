import { DetailedOrder } from '../types';
import { MOCK_DETAILED_ORDERS } from '../constants';
import { LocalDbService } from './localDbService';
import { SyncService } from './syncService';
import { AuditService } from './auditService';
import { RefundLedgerService } from './refundLedgerService';
import { InventoryLedgerService } from './inventoryLedgerService';
import { PermissionService } from './permissionService';

export class OrderService {
  private static orders: DetailedOrder[] = [...MOCK_DETAILED_ORDERS];

  static async listOrders(): Promise<DetailedOrder[]> {
    const stored = LocalDbService.getOpenOrders() as DetailedOrder[];
    if (stored.length) this.orders = [...stored, ...this.orders.filter(order => !stored.some(item => item.id === order.id))];
    return [...this.orders];
  }

  static async createOrder(order: Partial<DetailedOrder>): Promise<DetailedOrder> {
    const fullOrder: DetailedOrder = {
      id: order.id || `ORD-${Date.now()}`,
      date: order.date || new Date().toLocaleDateString(),
      time: order.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total: order.total || 0,
      status: order.status || 'Paid',
      paymentMethod: order.paymentMethod || 'Card',
      employeeName: order.employeeName || 'Cashier',
      device: order.device || 'Main Register',
      type: order.type || 'Dine-in',
      items: order.items || []
    };
    this.orders.unshift(fullOrder);
    LocalDbService.saveOpenOrders(this.orders);
    SyncService.enqueue('ORDER_CREATE', fullOrder);
    return fullOrder;
  }

  static async updateStatus(id: string, status: string, actor: { id: string; name: string }): Promise<DetailedOrder> {
    if (!PermissionService.can(actor as any, 'pos.orders.access')) throw new Error('Permission denied: order access is required.');
    const order = this.orders.find(item => item.id === id);
    if (!order) throw new Error('Order not found.');
    order.status = status;
    LocalDbService.saveOpenOrders(this.orders);
    SyncService.enqueue('ORDER_UPDATE', { id, status });
    await AuditService.log({ actorId: actor.id, actorName: actor.name, action: 'ORDER_STATUS_UPDATED', targetType: 'ORDER', targetId: id, details: { status }, status: 'SUCCESS' });
    return { ...order };
  }

  static async refund(id: string, actor: { id: string; name: string }): Promise<DetailedOrder> {
    if (!PermissionService.can(actor as any, 'pos.refunds.access')) throw new Error('Permission denied: refund access is required.');
    const order = await this.updateStatus(id, 'Refunded', actor);
    await RefundLedgerService.create({ orderId: id, amount: order.total, actorId: actor.id });
    for (const item of order.items || []) {
      await InventoryLedgerService.record({ itemId: String(item.id), quantity: Number(item.quantity || 1), type: 'RETURN', referenceId: id, actorId: actor.id });
    }
    await AuditService.log({ actorId: actor.id, actorName: actor.name, action: 'ORDER_REFUNDED', targetType: 'ORDER', targetId: id, details: { amount: order.total }, status: 'SUCCESS' });
    return order;
  }
}
