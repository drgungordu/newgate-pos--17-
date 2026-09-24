import { DiningOrderItem, KitchenTicket, Employee, DiningTable } from '../../types';
import { ChargesEngine } from '../../services/chargesEngine';

export const buildKitchenTicket = (
  orderItems: DiningOrderItem[],
  activeTable: DiningTable,
  orderType: string,
  currentUser: Employee
): KitchenTicket | null => {
  const unfiredItems = orderItems.filter(i => !i.fired && !i.isVoided);
  if (unfiredItems.length === 0) return null;

  return {
    id: `TKT-${Date.now()}`,
    orderId: activeTable.orderId || `ORD-${Date.now()}`,
    type: orderType === 'To Go' ? 'Takeout' : 'Dine-in',
    status: 'Pending',
    timeIn: new Date().toISOString(),
    table: `Table ${activeTable.name}`,
    server: currentUser?.name || 'System',
    serverEmployeeId: currentUser?.id || 'system',
    items: unfiredItems.map(i => ({
      name: i.name,
      qty: i.quantity,
      modifiers: i.modifiers || [],
      seatNumber: i.seatNumber,
      guestName: i.seatNumber === 0 ? 'Shared' : `Guest ${i.seatNumber}`,
      stationIds: Array.isArray((i as any).stationIds) ? (i as any).stationIds : []
    }))
  };
};

export const calculateOrderTotals = (
  orderItems: DiningOrderItem[],
  billDiscount: { type: 'Percentage' | 'Fixed'; value: number; name: string } | null,
  payments: { amount: number; method: string }[] = [],
  autoGratuityApplied: boolean = false,
  autoGratuityRate: number = 18,
  serviceFeeApplied: boolean = false,
  serviceFeeConfig?: { name?: string; type?: 'Percentage' | 'Fixed'; value?: number },
  taxRate: number = 0
) => {
  const subtotal = orderItems.reduce((acc, i) => i.isVoided ? acc : acc + (i.price * i.quantity), 0);
  let discountAmount = 0;
  if (billDiscount) {
    if (billDiscount.type === 'Percentage') discountAmount = subtotal * (billDiscount.value / 100);
    else discountAmount = billDiscount.value;
  }
  const charges = ChargesEngine.calculate({
    subtotal,
    taxRate,
    discountAmount,
    autoGratuityApplied,
    autoGratuityRate,
    serviceFee: { applied: serviceFeeApplied, type: serviceFeeConfig?.type || 'Percentage', value: serviceFeeConfig?.value || 0 },
    payments,
  });

  return { 
    ...charges,
  };
};
