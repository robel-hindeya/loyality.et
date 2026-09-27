import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { fallbackStorage } from '@/lib/fallback-storage';
import { CompanyOrder, OrderItem, OrderStatus, PickupType, CompanyProduct } from '@/types';

export interface CreateOrderParams {
  userId: string;
  companyId: string;
  programId?: string;
  cardId?: string;
  items: OrderItem[];
  totalAmount: number;
  pickupType?: PickupType;
  specialInstructions?: string;
  stampsEarned?: number;
}

export const orderService = {
  /**
   * Get all products/services offered by a company
   */
  async getCompanyProducts(companyId: string): Promise<CompanyProduct[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('company_id', companyId);

        if (!error && data && data.length > 0) {
          return data as CompanyProduct[];
        }
      } catch (err) {
        console.warn('Supabase getCompanyProducts note:', err);
      }
    }
    return fallbackStorage.getProducts(companyId);
  },

  /**
   * Get all orders placed by a specific user
   */
  async getUserOrders(userId: string): Promise<CompanyOrder[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('orders')
          .select('*, company:companies(*), program:loyalty_programs(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as CompanyOrder[];
        }
      } catch (err) {
        console.warn('Supabase getUserOrders note:', err);
      }
    }
    return fallbackStorage.getUserOrders(userId);
  },

  /**
   * Get all orders for a specific company
   */
  async getCompanyOrders(companyId: string): Promise<CompanyOrder[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('orders')
          .select('*, user:profiles(id, full_name, email, phone)')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as CompanyOrder[];
        }
      } catch (err) {
        console.warn('Supabase getCompanyOrders note:', err);
      }
    }
    return fallbackStorage.getCompanyOrders(companyId);
  },

  /**
   * Create and place a new company order
   */
  async createOrder(params: CreateOrderParams): Promise<CompanyOrder> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

        const { data, error } = await supabase
          .from('orders')
          .insert([
            {
              user_id: params.userId,
              company_id: params.companyId,
              program_id: params.programId || null,
              card_id: params.cardId || null,
              order_number: orderNumber,
              items: params.items,
              total_amount: params.totalAmount,
              stamps_earned: params.stampsEarned ?? 1,
              status: 'pending',
              pickup_type: params.pickupType || 'in_store',
              special_instructions: params.specialInstructions || null,
            },
          ])
          .select('*, company:companies(*), program:loyalty_programs(*)')
          .single();

        if (!error && data) {
          // Keep local storage in sync as well
          fallbackStorage.createOrder(params);
          return data as CompanyOrder;
        }
      } catch (err) {
        console.warn('Supabase createOrder note:', err);
      }
    }

    return fallbackStorage.createOrder(params);
  },

  /**
   * Update order status (e.g. pending -> preparing -> ready -> completed)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<CompanyOrder> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', orderId)
          .select('*, company:companies(*), program:loyalty_programs(*)')
          .single();

        if (!error && data) {
          fallbackStorage.updateOrderStatus(orderId, status);
          return data as CompanyOrder;
        }
      } catch (err) {
        console.warn('Supabase updateOrderStatus note:', err);
      }
    }

    return fallbackStorage.updateOrderStatus(orderId, status);
  },
};
