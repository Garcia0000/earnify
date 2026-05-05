export interface User {
  id: string;
  email: string;
  balance: number;
  total_earned: number;
  referral_code: string;
  referred_by?: string;
  created_at: string;
  isAdmin?: boolean;
  role: 'earner' | 'advertiser' | 'admin';
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
  type: 'task' | 'referral' | 'withdrawal';
  task_name?: string;
  tracking_id?: string;
  created_at: string;
}

export interface Campaign {
  id: number;
  advertiser_id: string;
  title: string;
  description: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'telegram';
  action: 'follow' | 'like' | 'comment' | 'view' | 'join';
  target_url: string;
  payout_per_action: number;
  total_budget: number;
  spent: number;
  completions: number;
  max_completions: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
}

export interface Deposit {
  id: number;
  user_id: string;
  amount: number;
  method: 'usdt_trc20';
  tx_hash?: string;
  screenshot_url?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}

export interface TaskAction {
  id: number;
  campaign_id: number;
  earner_id: string;
  status: 'pending' | 'approved' | 'rejected';
  proof_url?: string;
  created_at: string;
}
