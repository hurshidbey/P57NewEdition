import { createClient } from '@supabase/supabase-js';
import { type User, type InsertUser, type Protocol, type InsertProtocol, type Category, type UserProgress, type InsertUserProgress, type Prompt, type InsertPrompt, type Payment, type InsertPayment, type Coupon, type InsertCoupon, type CouponUsage, type InsertCouponUsage } from "@shared/schema";
import { type IStorage } from './storage';

export class SupabaseStorage implements IStorage {
  public supabase: any;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found');
    }

    // Create client without type generation to avoid schema cache issues
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getProtocols(limit: number = 20, offset: number = 0, search?: string, category?: string, difficulty?: string): Promise<Protocol[]> {
    let query = this.supabase
      .from('protocols')
      .select('*');
      
    // Apply difficulty filter based on protocol number
    if (difficulty) {
      if (difficulty === 'BEGINNER') {
        query = query.gte('number', 1).lte('number', 20);
      } else if (difficulty === "O'RTA DARAJA") {
        query = query.gte('number', 21).lte('number', 40);
      } else if (difficulty === 'YUQORI DARAJA') {
        query = query.gte('number', 41).lte('number', 57);
      }
    }
    
    // Apply ordering and pagination
    query = query
      .order('number', { ascending: true })
      .range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map((item: any) => {
      return {
        ...item,
        categoryId: item.category_id,
        badExample: item.bad_example,
        goodExample: item.good_example,
        createdAt: item.created_at,
        isFreeAccess: item.is_free_access || false,
        difficultyLevel: item.difficulty_level
      };
    });
  }

  async getProtocol(id: number): Promise<Protocol | undefined> {
    const { data, error } = await this.supabase
      .from('protocols')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return undefined;
    
    return {
      ...data,
      categoryId: data.category_id,
      badExample: data.bad_example,
      goodExample: data.good_example,
      createdAt: data.created_at,
      isFreeAccess: data.is_free_access || false
    };
  }

  async createProtocol(protocol: InsertProtocol): Promise<Protocol> {
    // Map camelCase fields to snake_case for database
    const dbProtocol = {
      number: protocol.number,
      title: protocol.title,
      description: protocol.description,
      bad_example: protocol.badExample,
      good_example: protocol.goodExample,
      category_id: protocol.categoryId,
      notes: protocol.notes,
      is_free_access: protocol.isFreeAccess || false
    };
    
    const { data, error } = await this.supabase
      .from('protocols')
      .insert(dbProtocol)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      categoryId: data.category_id,
      badExample: data.bad_example,
      goodExample: data.good_example,
      createdAt: data.created_at,
      isFreeAccess: data.is_free_access || false
    };
  }

  async updateProtocol(id: number, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined> {

    // Get current protocol to preserve existing data
    const current = await this.getProtocol(id);
    if (!current) return undefined;
    
    // Map camelCase fields to snake_case for database
    const dbProtocol: any = {};
    if (protocol.number !== undefined) dbProtocol.number = protocol.number;
    if (protocol.title !== undefined) dbProtocol.title = protocol.title;
    if (protocol.description !== undefined) dbProtocol.description = protocol.description;
    if (protocol.badExample !== undefined) dbProtocol.bad_example = protocol.badExample;
    if (protocol.goodExample !== undefined) dbProtocol.good_example = protocol.goodExample;
    if (protocol.categoryId !== undefined) dbProtocol.category_id = protocol.categoryId;
    
    // Handle notes and isFreeAccess properly
    if (protocol.isFreeAccess !== undefined) {
      dbProtocol.is_free_access = protocol.isFreeAccess;
    }
    
    if (protocol.notes !== undefined) {
      dbProtocol.notes = protocol.notes;
    }
    
    // Update the database
    const { data, error } = await this.supabase
      .from('protocols')
      .update(dbProtocol)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {

      throw error;
    }
    
    if (!data) return undefined;
    
    return {
      ...data,
      categoryId: data.category_id,
      badExample: data.bad_example,
      goodExample: data.good_example,
      createdAt: data.created_at,
      isFreeAccess: data.is_free_access || false
    };
  }

  async deleteProtocol(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('protocols')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const { data, error } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return (data || []).map((item: any) => ({
      ...item,
      userId: item.user_id,
      protocolId: item.protocol_id,
      completedAt: item.completed_at,
      practiceCount: item.practice_count,
      lastScore: item.last_score
    }));
  }

  async updateProtocolProgress(userId: string, protocolId: number, score: number): Promise<UserProgress> {
    // Try to update existing record first
    const { data: existing } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('protocol_id', protocolId)
      .single();

    if (existing) {
      // Update existing progress
      const { data, error } = await this.supabase
        .from('user_progress')
        .update({
          practice_count: existing.practice_count + 1,
          last_score: score,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('protocol_id', protocolId)
        .select()
        .single();
      
      if (error) throw error;
      return {
        ...data,
        userId: data.user_id,
        protocolId: data.protocol_id,
        completedAt: data.completed_at,
        practiceCount: data.practice_count,
        lastScore: data.last_score
      };
    } else {
      // Create new progress record
      const { data, error } = await this.supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          protocol_id: protocolId,
          last_score: score,
          practice_count: 1
        })
        .select()
        .single();
      
      if (error) throw error;
      return {
        ...data,
        userId: data.user_id,
        protocolId: data.protocol_id,
        completedAt: data.completed_at,
        practiceCount: data.practice_count,
        lastScore: data.last_score
      };
    }
  }

  async deleteProtocolProgress(userId: string, protocolId: number): Promise<{ success: boolean }> {
    const { error } = await this.supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId)
      .eq('protocol_id', protocolId);
    
    if (error) throw error;
    return { success: true };
  }

  // Prompts methods
  async getPrompts(userTier: string): Promise<Prompt[]> {
    let query = this.supabase.from('prompts').select('*');
    
    if (userTier === 'free') {
      query = query.eq('is_public', true).eq('is_premium', false);
    } else {
      query = query.eq('is_public', true);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    // Map database field names (snake_case) to TypeScript interface (camelCase)
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      description: item.description,
      category: item.category,
      isPremium: item.is_premium,
      isPublic: item.is_public,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getAllPrompts(): Promise<Prompt[]> {
    const { data, error } = await this.supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map database field names (snake_case) to TypeScript interface (camelCase)
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      description: item.description,
      category: item.category,
      isPremium: item.is_premium,
      isPublic: item.is_public,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    const { data, error } = await this.supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const { data, error } = await this.supabase
      .from('prompts')
      .insert({
        title: prompt.title,
        content: prompt.content,
        description: prompt.description,
        category: prompt.category,
        is_premium: prompt.isPremium,
        is_public: prompt.isPublic
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updatePrompt(id: number, prompt: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const updateData: any = {};
    if (prompt.title !== undefined) updateData.title = prompt.title;
    if (prompt.content !== undefined) updateData.content = prompt.content;
    if (prompt.description !== undefined) updateData.description = prompt.description;
    if (prompt.category !== undefined) updateData.category = prompt.category;
    if (prompt.isPremium !== undefined) updateData.is_premium = prompt.isPremium;
    if (prompt.isPublic !== undefined) updateData.is_public = prompt.isPublic;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('prompts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async deletePrompt(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('prompts')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Payment methods
  async storePayment(payment: InsertPayment): Promise<Payment> {
    const { data, error } = await this.supabase
      .from('payments')
      .insert({
        id: payment.id,
        user_id: payment.userId,
        user_email: payment.userEmail,
        amount: payment.amount,
        status: payment.status || 'pending',
        transaction_id: payment.transactionId,
        atmos_data: payment.atmosData
      })
      .select()
      .single();
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to store payment:`, error);
      throw error;
    }
    
    console.log(`💾 [SUPABASE] Payment record stored:`, data);
    
    // Map database fields to TypeScript interface
    return {
      id: data.id,
      userId: data.user_id,
      userEmail: data.user_email,
      amount: data.amount,
      status: data.status,
      transactionId: data.transaction_id,
      atmosData: data.atmos_data,
      createdAt: data.created_at
    };
  }

  async getPayments(): Promise<Payment[]> {
    // Query payment_sessions table instead of payments view
    const { data, error } = await this.supabase
      .from('payment_sessions')
      .select('*')
      .eq('status', 'completed')  // Only show completed payments
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to get payments:`, error);
      throw error;
    }
    
    // Map payment_sessions fields to Payment interface
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userEmail: item.user_email,
      amount: item.amount,  // This is the final amount after discount
      status: item.status,
      transactionId: item.click_trans_id || item.merchant_trans_id,
      atmosData: JSON.stringify({
        paymentMethod: item.payment_method,
        merchantTransId: item.merchant_trans_id,
        clickTransId: item.click_trans_id,
        originalAmount: item.original_amount,
        discountAmount: item.discount_amount,
        couponId: item.coupon_id,
        metadata: item.metadata
      }),
      createdAt: item.created_at,
      // Include coupon info if present
      couponId: item.coupon_id,
      originalAmount: item.original_amount,
      discountAmount: item.discount_amount
    }));
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    // Query payment_sessions table instead of payments view
    const { data, error } = await this.supabase
      .from('payment_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')  // Only show completed payments
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to get user payments for ${userId}:`, error);
      throw error;
    }
    
    // Map payment_sessions fields to Payment interface
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userEmail: item.user_email,
      amount: item.amount,  // This is the final amount after discount
      status: item.status,
      transactionId: item.click_trans_id || item.merchant_trans_id,
      atmosData: JSON.stringify({
        paymentMethod: item.payment_method,
        merchantTransId: item.merchant_trans_id,
        clickTransId: item.click_trans_id,
        originalAmount: item.original_amount,
        discountAmount: item.discount_amount,
        couponId: item.coupon_id,
        metadata: item.metadata
      }),
      createdAt: item.created_at,
      // Include coupon info if present
      couponId: item.coupon_id,
      originalAmount: item.original_amount,
      discountAmount: item.discount_amount
    }));
  }
  
  // Coupon methods
  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    console.log(`🔍 [SUPABASE] Creating coupon with data:`, coupon);
    
    // Map camelCase fields from TypeScript to snake_case for database
    // Only include fields that are not undefined
    const dbCoupon: any = {
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discountType,
      discount_value: coupon.discountValue,
      original_price: coupon.originalPrice || 1425000, // Default price
      is_active: coupon.isActive !== undefined ? coupon.isActive : true, // Default to active
    };
    
    // Only add optional fields if they are defined
    if (coupon.maxUses !== undefined) dbCoupon.max_uses = coupon.maxUses;
    if (coupon.validFrom !== undefined) dbCoupon.valid_from = coupon.validFrom;
    if (coupon.validUntil !== undefined) dbCoupon.valid_until = coupon.validUntil;
    if (coupon.createdBy !== undefined) dbCoupon.created_by = coupon.createdBy;
    
    console.log(`🔍 [SUPABASE] Mapped database object:`, dbCoupon);
    
    const { data, error } = await this.supabase
      .from('coupons')
      .insert(dbCoupon)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to create coupon:`, error);
      console.error(`❌ [SUPABASE] Error details:`, JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log(`✅ [SUPABASE] Coupon created:`, data);
    
    // Map snake_case response back to camelCase
    return {
      id: data.id,
      code: data.code,
      description: data.description,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      originalPrice: data.original_price,
      maxUses: data.max_uses,
      usedCount: data.used_count || 0,
      validFrom: data.valid_from,
      validUntil: data.valid_until,
      isActive: data.is_active,
      createdBy: data.created_by,
      createdAt: data.created_at
    };
  }

  async getCoupons(): Promise<Coupon[]> {
    const { data, error } = await this.supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to get coupons:`, error);
      throw error;
    }
    
    // Map snake_case fields from database to camelCase for TypeScript
    return (data || []).map((item: any) => ({
      id: item.id,
      code: item.code,
      description: item.description,
      discountType: item.discount_type,
      discountValue: item.discount_value,
      originalPrice: item.original_price,
      maxUses: item.max_uses,
      usedCount: item.used_count,
      validFrom: item.valid_from,
      validUntil: item.valid_until,
      isActive: item.is_active,
      createdBy: item.created_by,
      createdAt: item.created_at
    }));
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const { data, error } = await this.supabase
      .from('coupons')
      .select('*')
      .ilike('code', code)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error(`❌ [SUPABASE] Failed to get coupon by code ${code}:`, error);
      throw error;
    }
    
    if (!data) return undefined;
    
    // Map snake_case fields from database to camelCase for TypeScript
    const coupon: Coupon = {
      id: data.id,
      code: data.code,
      description: data.description,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      originalPrice: data.original_price,
      maxUses: data.max_uses,
      usedCount: data.used_count,
      validFrom: data.valid_from,
      validUntil: data.valid_until,
      isActive: data.is_active,
      createdBy: data.created_by,
      createdAt: data.created_at
    };
    
    console.log(`🔍 [SUPABASE] getCouponByCode ${code} result:`, coupon);
    return coupon;
  }

  async getCouponById(id: number): Promise<Coupon | undefined> {
    const { data, error } = await this.supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error(`❌ [SUPABASE] Failed to get coupon by id ${id}:`, error);
      throw error;
    }
    
    if (!data) return undefined;
    
    // Map snake_case fields from database to camelCase for TypeScript
    return {
      id: data.id,
      code: data.code,
      description: data.description,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      originalPrice: data.original_price,
      maxUses: data.max_uses,
      usedCount: data.used_count,
      validFrom: data.valid_from,
      validUntil: data.valid_until,
      isActive: data.is_active,
      createdBy: data.created_by,
      createdAt: data.created_at
    };
  }

  async updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    // Map camelCase fields from TypeScript to snake_case for database
    const dbUpdate: any = {};
    if (coupon.code !== undefined) dbUpdate.code = coupon.code;
    if (coupon.description !== undefined) dbUpdate.description = coupon.description;
    if (coupon.discountType !== undefined) dbUpdate.discount_type = coupon.discountType;
    if (coupon.discountValue !== undefined) dbUpdate.discount_value = coupon.discountValue;
    if (coupon.originalPrice !== undefined) dbUpdate.original_price = coupon.originalPrice;
    if (coupon.maxUses !== undefined) dbUpdate.max_uses = coupon.maxUses;
    if (coupon.validFrom !== undefined) dbUpdate.valid_from = coupon.validFrom;
    if (coupon.validUntil !== undefined) dbUpdate.valid_until = coupon.validUntil;
    if (coupon.isActive !== undefined) dbUpdate.is_active = coupon.isActive;
    if (coupon.createdBy !== undefined) dbUpdate.created_by = coupon.createdBy;
    
    const { data, error } = await this.supabase
      .from('coupons')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to update coupon ${id}:`, error);
      throw error;
    }
    
    console.log(`✅ [SUPABASE] Coupon ${id} updated`);
    
    // Map snake_case response back to camelCase
    return {
      id: data.id,
      code: data.code,
      description: data.description,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      originalPrice: data.original_price,
      maxUses: data.max_uses,
      usedCount: data.used_count,
      validFrom: data.valid_from,
      validUntil: data.valid_until,
      isActive: data.is_active,
      createdBy: data.created_by,
      createdAt: data.created_at
    };
  }

  async deleteCoupon(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to delete coupon ${id}:`, error);
      throw error;
    }
    
    console.log(`✅ [SUPABASE] Coupon ${id} deleted`);
    return true;
  }

  async incrementCouponUsage(id: number): Promise<void> {
    // First get current count
    const { data: current, error: fetchError } = await this.supabase
      .from('coupons')
      .select('used_count')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error(`❌ [SUPABASE] Failed to fetch coupon ${id} for increment:`, fetchError);
      throw fetchError;
    }
    
    // Then update with incremented value
    const { error: updateError } = await this.supabase
      .from('coupons')
      .update({ used_count: (current.used_count || 0) + 1 })
      .eq('id', id);
    
    if (updateError) {
      console.error(`❌ [SUPABASE] Failed to increment coupon usage ${id}:`, updateError);
      throw updateError;
    }
    
    console.log(`✅ [SUPABASE] Coupon ${id} usage incremented`);
  }

  async recordCouponUsage(usage: InsertCouponUsage): Promise<CouponUsage> {
    const { data, error } = await this.supabase
      .from('coupon_usages')
      .insert(usage)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to record coupon usage:`, error);
      throw error;
    }
    
    console.log(`✅ [SUPABASE] Coupon usage recorded:`, data);
    return data;
  }

  async getCouponUsageHistory(couponId: number): Promise<CouponUsage[]> {
    const { data, error } = await this.supabase
      .from('coupon_usages')
      .select('*')
      .eq('coupon_id', couponId)
      .order('used_at', { ascending: false });
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to get coupon usage history for ${couponId}:`, error);
      throw error;
    }
    
    return data || [];
  }

  // Payment session methods
  async createPaymentSession(session: {
    id: string;
    userId: string;
    userEmail: string;
    amount: number;
    originalAmount?: number;
    discountAmount?: number;
    couponId?: number | null;
    merchantTransId: string;
    paymentMethod: string;
    idempotencyKey: string;
    metadata?: any;
    expiresAt: Date;
  }): Promise<any> {
    // First check if idempotency key already exists
    const { data: existing, error: checkError } = await this.supabase
      .from('payment_sessions')
      .select('*')
      .eq('idempotency_key', session.idempotencyKey)
      .single();
    
    if (existing && !checkError) {
      console.log(`🔄 [SUPABASE] Payment session already exists for idempotency key: ${session.idempotencyKey}`);
      return existing;
    }
    
    const { data, error } = await this.supabase
      .from('payment_sessions')
      .insert({
        id: session.id,
        user_id: session.userId,
        user_email: session.userEmail,
        amount: session.amount,
        original_amount: session.originalAmount || session.amount,
        discount_amount: session.discountAmount || 0,
        coupon_id: session.couponId,
        merchant_trans_id: session.merchantTransId,
        payment_method: session.paymentMethod,
        idempotency_key: session.idempotencyKey,
        metadata: session.metadata || {},
        expires_at: session.expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to create payment session:`, error);
      throw error;
    }
    
    console.log(`✅ [SUPABASE] Payment session created:`, data.id);
    return data;
  }

  async getPaymentSessionByMerchantId(merchantTransId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('payment_sessions')
      .select('*')
      .eq('merchant_trans_id', merchantTransId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error(`❌ [SUPABASE] Failed to get payment session:`, error);
      throw error;
    }
    
    return data;
  }

  async getPaymentSessionByClickTransId(clickTransId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('payment_sessions')
      .select('*')
      .eq('click_trans_id', clickTransId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error(`❌ [SUPABASE] Failed to get payment session by click trans id:`, error);
      throw error;
    }
    
    return data;
  }

  async updatePaymentSession(id: string, updates: {
    status?: string;
    clickTransId?: string;
    metadata?: any;
  }): Promise<any> {
    const { data, error } = await this.supabase
      .from('payment_sessions')
      .update({
        status: updates.status,
        click_trans_id: updates.clickTransId,
        metadata: updates.metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to update payment session:`, error);
      throw error;
    }
    
    console.log(`✅ [SUPABASE] Payment session updated:`, data.id);
    return data;
  }

  async cleanupExpiredSessions(): Promise<number> {
    const { data, error } = await this.supabase
      .from('payment_sessions')
      .delete()
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString())
      .select();
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to cleanup expired sessions:`, error);
      throw error;
    }
    
    const count = data?.length || 0;
    if (count > 0) {
      console.log(`🧹 [SUPABASE] Cleaned up ${count} expired payment sessions`);
    }
    return count;
  }

  async close(): Promise<void> {
    console.log('[SUPABASE] Closing connections...');
    // Supabase client doesn't need explicit close
  }

  isConnected(): boolean {
    // Supabase is always "connected" via HTTP
    return true;
  }
}