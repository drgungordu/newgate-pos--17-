import { Donor, CampaignFund, OrganizationProfile } from '../types/nonprofit';

export class NonprofitService {
  private static organization: OrganizationProfile = { legalName: 'Newgate Community Foundation', ein: '', acknowledgmentText: 'Thank you for supporting our mission.' };

  static async getOrganizationProfile(): Promise<OrganizationProfile> { return { ...this.organization }; }
  static async updateOrganizationProfile(profile: OrganizationProfile): Promise<void> { this.organization = { ...profile }; }
  private static donors: Donor[] = [
    { id: 'DON-1', name: 'Eleanor Vance', email: 'eleanor@example.org', phone: '555-0192', totalDonated: 2450 },
    { id: 'DON-2', name: 'Marcus Sterling', email: 'marcus@example.org', phone: '555-0144', totalDonated: 1200 },
    { id: 'DON-3', name: 'Sophia Chen', email: 'sophia@example.org', phone: '555-0188', totalDonated: 850 }
  ];

  private static funds: CampaignFund[] = [
    { id: 'FUND-1', name: 'General Community Outreach', targetAmount: 50000, raisedAmount: 32400 },
    { id: 'FUND-2', name: 'Youth Summer Enrichment Camp', targetAmount: 20000, raisedAmount: 14200 },
    { id: 'FUND-3', name: 'Emergency Winter Relief', targetAmount: 15000, raisedAmount: 11950 }
  ];

  static async listDonors(): Promise<Donor[]> {
    return [...this.donors];
  }

  static async listFunds(): Promise<CampaignFund[]> {
    return [...this.funds];
  }

  static async processDonation(payload: any): Promise<{ success: boolean; transactionId: string; taxReceiptNumber: string; saleAmount: number; donationAmount: number; totalPaid: number }> {
    const donationAmount = Number(payload.amountDollars || 0);
    return {
      success: true,
      transactionId: `DON-TRX-${Date.now()}`,
      taxReceiptNumber: `TAX-${Date.now()}`,
      saleAmount: 0,
      donationAmount,
      totalPaid: donationAmount,
    };
  }

  static async processCombinedSaleAndDonation(payload: any) {
    return this.processDonation(payload);
  }
}
