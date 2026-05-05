export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  country: string;
  device: string;
  language: string;
  referralCode: string;
  referredBy?: string;
  createdAt: any;
  isAdmin: boolean;
}

export interface UserBalance {
  current: number;
  totalEarned: number;
  offersCompleted: number;
  updatedAt: any;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: 'paypal' | 'bank_transfer';
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  details: string;
  requestedAt: any;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'offer' | 'referral';
  description: string;
  timestamp: any;
}
