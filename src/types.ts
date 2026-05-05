export interface User {
  id: string;
  email: string;
  balance: number;
  total_earned: number;
  referral_code: string;
  referred_by?: string;
  created_at: string;
  isAdmin?: boolean;
}

export interface UserBalance {
  current: number;
  totalEarned: number;
  offersCompleted: number;
  updatedAt: any;
}

export interface Withdrawal {
  id: number;
  user_id: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  details: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: string;
  amount_user: number;
  type: 'offer' | 'referral' | 'withdrawal';
  offer_name?: string;
  tracking_id?: string;
  created_at: string;
}
