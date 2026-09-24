export interface CashDrawerShift {
  id: string;
  openingFloat: number;
  currentBalance: number;
  currentExpectedCash: number;
  paidIns: number;
  paidOuts: number;
  cashSales: number;
  status: 'OPEN' | 'CLOSED';
}

export class CashDrawerService {
  private static shift: CashDrawerShift = {
    id: 'SHIFT-001',
    openingFloat: 200,
    currentBalance: 200,
    currentExpectedCash: 200,
    paidIns: 0,
    paidOuts: 0,
    cashSales: 0,
    status: 'OPEN'
  };

  static async getCurrentShift(): Promise<CashDrawerShift> {
    return { ...this.shift, currentExpectedCash: this.shift.currentBalance };
  }

  static async paidIn(amount: number, reason: string, employeeId: string, employeeName: string): Promise<CashDrawerShift> {
    this.shift.paidIns += amount;
    this.shift.currentBalance += amount;
    return { ...this.shift, currentExpectedCash: this.shift.currentBalance };
  }

  static async paidOut(amount: number, reason: string, employeeId: string, employeeName: string): Promise<CashDrawerShift> {
    this.shift.paidOuts += amount;
    this.shift.currentBalance -= amount;
    return { ...this.shift, currentExpectedCash: this.shift.currentBalance };
  }

  static async openDrawer(options?: any): Promise<boolean> {
    console.log('[CashDrawerService] Kick drawer open signal', options);
    return true;
  }
}
