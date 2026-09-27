export type UserRole = 'company' | 'cashier' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  company_id: string | null;
  qr_code_token: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export type StampIconType = 'star' | 'coffee' | 'gift' | 'award' | 'sparkles' | 'heart' | 'building' | 'car';

export interface LoyaltyProgram {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  target_stamps: number;
  reward_title: string;
  reward_description: string | null;
  card_bg_color: string;
  card_accent_color: string;
  stamp_icon: StampIconType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface LoyaltyCard {
  id: string;
  user_id: string;
  program_id: string;
  company_id: string;
  current_stamps: number;
  lifetime_stamps: number;
  rewards_earned: number;
  rewards_redeemed: number;
  status: 'active' | 'reward_ready';
  last_visit_at: string | null;
  created_at: string;
  updated_at: string;
  program?: LoyaltyProgram;
  company?: Company;
  user?: UserProfile;
}

export interface StampLog {
  id: string;
  card_id: string;
  user_id: string;
  cashier_id: string | null;
  company_id: string;
  program_id: string;
  stamps_added: number;
  notes: string | null;
  created_at: string;
  program?: LoyaltyProgram;
  cashier?: UserProfile;
  user?: UserProfile;
  company?: Company;
}

export interface RewardRedemption {
  id: string;
  card_id: string;
  user_id: string;
  cashier_id: string | null;
  company_id: string;
  program_id: string;
  reward_title: string;
  redemption_code: string;
  stamps_spent: number;
  created_at: string;
  program?: LoyaltyProgram;
  cashier?: UserProfile;
  user?: UserProfile;
  company?: Company;
}

export interface CompanyAnalytics {
  totalCustomers: number;
  totalVisits: number;
  totalStampsGiven: number;
  totalRewardsRedeemed: number;
  activeCardsCount: number;
  todayVisits: number;
  redemptionRate: number;
  recentActivity: Array<{
    id: string;
    type: 'visit' | 'reward';
    customerName: string;
    programTitle: string;
    cashierName: string;
    timestamp: string;
    details: string;
  }>;
  visitsByDay: Array<{
    date: string;
    visits: number;
    rewards: number;
  }>;
}

export interface CashierScanResult {
  customer: UserProfile;
  activeCards: Array<LoyaltyCard & {
    program: LoyaltyProgram;
    progressPercentage: number;
    canRedeem: boolean;
  }>;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PickupType = 'in_store' | 'curbside' | 'dine_in';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  notes?: string;
}

export interface CompanyOrder {
  id: string;
  user_id: string;
  company_id: string;
  program_id?: string | null;
  card_id?: string | null;
  order_number: string;
  items: OrderItem[];
  total_amount: number;
  stamps_earned: number;
  status: OrderStatus;
  pickup_type: PickupType;
  special_instructions?: string | null;
  created_at: string;
  updated_at: string;
  company?: Company;
  program?: LoyaltyProgram;
  user?: UserProfile;
}

export interface CompanyProduct {
  id: string;
  company_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  popular?: boolean;
}

