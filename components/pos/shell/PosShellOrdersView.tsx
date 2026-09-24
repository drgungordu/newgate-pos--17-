import React from 'react';
import { Order, Employee, DetailedOrder } from '../../../types';
import Orders from '../../orders/Orders';
import { NativeBridge } from '../../../services/nativeBridge';
import { PermissionService } from '../../../services/permissionService';
import { OrderService } from '../../../services/orderService';
import { PrinterService } from '../../../services/printerService';
import { ReceiptEngine } from '../../../services/receiptEngine';

interface PosShellOrdersViewProps {
  orders: Order[];
  currentUser: Employee;
  onOpenManagerPin?: (title: string, onApprove: () => void) => void;
}

export const PosShellOrdersView: React.FC<PosShellOrdersViewProps> = ({
  orders,
  currentUser,
  onOpenManagerPin,
}) => {
  const handleReprintReceipt = async (order: DetailedOrder) => {
    NativeBridge.beep(2000, 100);
     const receiptText = ReceiptEngine.toText(ReceiptEngine.render(order));
    const result = await PrinterService.print({
      rawText: receiptText,
      profile: { id: 'default-network', name: 'Configured Receipt Printer', vendor: 'GENERIC', transport: 'NETWORK_ESCPOS', enabled: true },
    });
    if (result !== 'PRINTED') throw new Error(`Receipt print failed: ${result}`);
  };

  const handleProcessRefund = async (order: DetailedOrder) => {
    const auth = await PermissionService.checkActionPermission(
      currentUser,
      'pos.refunds.access',
      'ORDER_REFUND',
      order.id,
      { amount: order.total, orderId: order.id }
    );
    if (!auth.allowed) {
      if (onOpenManagerPin) {
        onOpenManagerPin(`Authorize Refund ($${order.total.toFixed(2)})`, () => {
          void OrderService.refund(order.id, currentUser);
        });
      } else {
        alert('Permission Denied: User lacks pos.refunds.access permission.');
      }
      return;
    }
    await OrderService.refund(order.id, currentUser);
  };

  return (
    <div className="h-full bg-slate-900 p-6 overflow-y-auto">
      <Orders
        orders={orders as DetailedOrder[]}
        onSelectOrder={(ord) => { window.history.pushState({}, '', `/orders/${ord.id}`); }}
        onReprintReceipt={handleReprintReceipt}
        onProcessRefund={handleProcessRefund}
        onUpdateOrderStatus={(id, status) => { void OrderService.updateStatus(id, status, currentUser); }}
      />
    </div>
  );
};
