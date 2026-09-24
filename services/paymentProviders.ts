import { PaymentRequest, PaymentResponse } from './paymentService';

export interface PaymentDeviceCapabilities {
  manufacturer?: string;
  model?: string;
  vendorId?: string;
  hasNfcEmv: boolean;
}

export interface PaymentProvider {
  id: string;
  supports(device: PaymentDeviceCapabilities): boolean;
  authorize(request: PaymentRequest, device: PaymentDeviceCapabilities): Promise<PaymentResponse>;
}

export class UnsupportedPaymentProvider implements PaymentProvider {
  id = 'unconfigured';
  supports(): boolean { return false; }
  async authorize(request: PaymentRequest): Promise<PaymentResponse> {
    return {
      success: false,
      status: 'PENDING',
      amount: request.amount,
      timestamp: new Date().toISOString(),
      error: 'No supported payment provider is configured for this device.',
    };
  }
}
