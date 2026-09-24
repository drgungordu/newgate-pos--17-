import { NativeBridge } from './nativeBridge';

export interface CustomerDisplayState {
  screenMode: 'IDLE' | 'ACTIVE_ORDER' | 'PAYMENT' | 'THANK_YOU';
  merchantName: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  tip?: number;
  customMessage?: string;
  suggestedTips?: number[];
}

export class CustomerDisplayService {
  private static defaultState: CustomerDisplayState = {
    screenMode: 'IDLE',
    merchantName: 'The Newgate POS',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    customMessage: 'Welcome to The Newgate POS',
    suggestedTips: [15, 18, 20, 25]
  };

  private static currentState: CustomerDisplayState = { ...CustomerDisplayService.defaultState };
  private static listeners: ((state: CustomerDisplayState) => void)[] = [];

  static subscribe(callback: (state: CustomerDisplayState) => void): () => void {
    this.listeners.push(callback);
    callback({ ...this.currentState });
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  static updateDisplay(updates: Partial<CustomerDisplayState>): void {
    this.currentState = { ...this.currentState, ...updates };
    this.listeners.forEach((cb) => cb({ ...this.currentState }));
    void NativeBridge.sendCustomerDisplay(
      this.currentState.screenMode === 'IDLE' ? this.currentState.customMessage || 'Welcome' : `Total $${this.currentState.total.toFixed(2)}`,
      this.currentState.screenMode === 'IDLE' ? this.currentState.merchantName : this.currentState.screenMode.replace('_', ' '),
    );
  }

  static resetToIdle(): void {
    this.currentState = { ...this.defaultState };
    this.listeners.forEach((cb) => cb({ ...this.currentState }));
    void NativeBridge.sendCustomerDisplay(this.defaultState.customMessage || 'Welcome', this.defaultState.merchantName);
  }
}
