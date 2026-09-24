export interface PaymentRequest {
  amount: number;
  method?: string;
  orderId?: string;
  tip?: number;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'CANCELED';
  transactionId?: string;
  amount: number;
  timestamp: string;
  error?: string;
}

import { PaymentDeviceCapabilities, PaymentProvider, UnsupportedPaymentProvider } from './paymentProviders';

export class PaymentService {
  private static provider: PaymentProvider = new UnsupportedPaymentProvider();
  private static device: PaymentDeviceCapabilities = { hasNfcEmv: false };

  static configure(provider: PaymentProvider, device: PaymentDeviceCapabilities): void {
    if (!provider.supports(device)) throw new Error(`Payment provider ${provider.id} does not support this device.`);
    this.provider = provider;
    this.device = device;
  }

  static async processPayment(req: PaymentRequest): Promise<PaymentResponse> {
    if (!req.amount || req.amount <= 0) {
      return { success: false, status: 'ERROR', amount: req.amount, timestamp: new Date().toISOString(), error: 'Payment amount must be greater than zero.' };
    }

    return this.provider.authorize(req, this.device);
  }
}
