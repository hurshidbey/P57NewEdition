import { createClient } from '@supabase/supabase-js';
import { type User, type InsertUser, type Protocol, type InsertProtocol, type Category, type UserProgress, type InsertUserProgress, type Prompt, type InsertPrompt, type Payment, type InsertPayment, type Coupon, type InsertCoupon, type CouponUsage, type InsertCouponUsage } from "@shared/schema";
import { type IStorage } from './storage';

export class SupabaseStorage implements IStorage {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
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
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to get payments:`, error);
      throw error;
    }
    
    // Map database fields to TypeScript interface
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userEmail: item.user_email,
      amount: item.amount,
      status: item.status,
      transactionId: item.transaction_id,
      atmosData: item.atmos_data,
      createdAt: item.created_at
    }));
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to get user payments for ${userId}:`, error);
      throw error;
    }
    
    // Map database fields to TypeScript interface
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userEmail: item.user_email,
      amount: item.amount,
      status: item.status,
      transactionId: item.transaction_id,
      atmosData: item.atmos_data,
      createdAt: item.created_at
    }));
  }
  
  // Coupon methods
  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const { data, error } = await this.supabase
      .from('coupons')
      .insert(coupon)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to create coupon:`, error);
      throw error;
    }
    
    console.log(`✅ [SUPABASE] Coupon created:`, data);
    return data;
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
    
    return data || [];
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
    
    console.log(`🔍 [SUPABASE] getCouponByCode ${code} result:`, data);
    return data || undefined;
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
    
    return data || undefined;
  }

  async updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const { data, error } = await this.supabase
      .from('coupons')
      .update(coupon)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ [SUPABASE] Failed to update coupon ${id}:`, error);
      throw error;
    }
    
    console.log(`✅ [SUPABASE] Coupon ${id} updated`);
    return data;
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
}