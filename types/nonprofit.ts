export interface CampaignFund {
  id: string;
  name: string;
  description?: string;
  targetAmount?: number;
  raisedAmount?: number;
}

export interface OrganizationProfile {
  legalName: string;
  ein: string;
  acknowledgmentText: string;
  address?: string;
}

export interface Donor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalDonated?: number;
  lastDonationDate?: string;
}

export interface Pledge {
  id: string;
  donorId: string;
  donorName: string;
  amount: number;
  frequency: 'ONE_TIME' | 'MONTHLY' | 'ANNUAL';
  status: 'ACTIVE' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
}
