export interface CreditCardFeeConfig {
  merchantId: string;
  enabled: boolean;
  ratePercentage: number;
  fixedAmountDollars: number;
  labelOnReceipt: string;
  notes?: string;
  updatedAt?: string;
  updatedBy?: string;
  lastUpdatedBySuperAdminId?: string;
  lastUpdatedDate?: string;
  reviewStatus?: string;
}

export interface ChargeCalculationInput {
  subtotal: number;
  taxRate: number;
  discountAmount?: number;
  autoGratuityRate?: number;
  autoGratuityApplied?: boolean;
  serviceFee?: { type: 'Percentage' | 'Fixed'; value: number; applied: boolean };
  payments?: { amount: number; method: string }[];
  creditCardFee?: CreditCardFeeConfig;
}

export interface ChargeCalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableSubtotal: number;
  tax: number;
  autoGratuityAmount: number;
  serviceFeeAmount: number;
  creditCardFeeAmount: number;
  total: number;
  totalPaidSoFar: number;
  remainingTotal: number;
}

export class ChargesEngine {
  private static configs: Record<string, CreditCardFeeConfig> = {};

  static calculate(input: ChargeCalculationInput): ChargeCalculationResult {
    const subtotal = Math.max(0, input.subtotal);
    const discountAmount = Math.min(subtotal, Math.max(0, input.discountAmount || 0));
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = taxableSubtotal * Math.max(0, input.taxRate || 0) / 100;
    const autoGratuityAmount = input.autoGratuityApplied ? taxableSubtotal * Math.max(0, input.autoGratuityRate || 0) / 100 : 0;
    const serviceFeeAmount = input.serviceFee?.applied
      ? input.serviceFee.type === 'Fixed' ? Math.max(0, input.serviceFee.value) : taxableSubtotal * Math.max(0, input.serviceFee.value) / 100
      : 0;
    const cardPaid = (input.payments || []).filter(payment => /card|visa|master|amex|discover|credit|debit/i.test(payment.method)).reduce((sum, payment) => sum + payment.amount, 0);
    const creditCardFeeAmount = input.creditCardFee?.enabled ? cardPaid * Math.max(0, input.creditCardFee.ratePercentage) / 100 + Math.max(0, input.creditCardFee.fixedAmountDollars) : 0;
    const total = taxableSubtotal + tax + autoGratuityAmount + serviceFeeAmount + creditCardFeeAmount;
    const totalPaidSoFar = (input.payments || []).reduce((sum, payment) => sum + payment.amount, 0);
    return { subtotal, discountAmount, taxableSubtotal, tax, autoGratuityAmount, serviceFeeAmount, creditCardFeeAmount, total, totalPaidSoFar, remainingTotal: Math.max(0, total - totalPaidSoFar) };
  }

  static async getCreditCardFeeConfig(merchantId: string): Promise<CreditCardFeeConfig> {
    return (
      this.configs[merchantId] || {
        merchantId,
        enabled: false,
        ratePercentage: 0,
        fixedAmountDollars: 0,
        labelOnReceipt: 'Card Processing Surcharge'
      }
    );
  }

  static async setCreditCardFeeConfig(
    merchantIdOrConfig: string | CreditCardFeeConfig,
    updates: Partial<CreditCardFeeConfig> = {},
    userId?: string
  ): Promise<CreditCardFeeConfig> {
    const merchantId = typeof merchantIdOrConfig === 'string' ? merchantIdOrConfig : merchantIdOrConfig.merchantId;
    updates = typeof merchantIdOrConfig === 'string' ? updates : merchantIdOrConfig;
    const existing = await this.getCreditCardFeeConfig(merchantId);
    const updated: CreditCardFeeConfig = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };
    this.configs[merchantId] = updated;
    return updated;
  }
}
