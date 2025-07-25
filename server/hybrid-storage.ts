import { SupabaseStorage } from './supabase-storage';
import { jsonPromptsStorage } from './json-storage';
import type { Prompt, InsertPrompt } from '@shared/schema';

export class HybridPromptsStorage {
  private supabaseStorage: SupabaseStorage;

  constructor() {
    this.supabaseStorage = new SupabaseStorage();
  }

  // Public API - Fast JSON reads
  async getPrompts(userTier: string): Promise<Prompt[]> {
    return await jsonPromptsStorage.getPrompts(userTier);
  }

  async getPrompt(id: number, userTier: string = 'free'): Promise<Prompt | undefined> {
    const prompt = await jsonPromptsStorage.getPrompt(id);
    
    if (!prompt) return undefined;
    
    // Apply tier-based access control
    if (!prompt.isPublic) return undefined;
    
    if (userTier === 'free') {
      // Free users can only access prompts with ID 25, 26, or 27
      if (prompt.id !== 25 && prompt.id !== 26 && prompt.id !== 27) {
        return undefined;
      }
    }
    
    return prompt;
  }

  // Admin API - Database writes + JSON sync
  async getAllPrompts(): Promise<Prompt[]> {
    // Admin gets fresh data from database
    try {
      return await this.supabaseStorage.getAllPrompts();
    } catch (error) {

      return await jsonPromptsStorage.getAllPrompts();
    }
  }

  async createPrompt(promptData: InsertPrompt): Promise<Prompt> {
    try {
      // 1. Create in database
      const newPrompt = await this.supabaseStorage.createPrompt(promptData);
      
      // 2. Sync to JSON
      await jsonPromptsStorage.addPrompt(newPrompt);
      
      return newPrompt;
    } catch (error) {

      throw error;
    }
  }

  async updatePrompt(id: number, promptData: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    try {
      // 1. Update in database
      const updatedPrompt = await this.supabaseStorage.updatePrompt(id, promptData);
      
      if (!updatedPrompt) return undefined;
      
      // 2. Sync to JSON
      await jsonPromptsStorage.updatePrompt(id, updatedPrompt);
      
      return updatedPrompt;
    } catch (error) {

      throw error;
    }
  }

  async deletePrompt(id: number): Promise<boolean> {
    try {
      // 1. Delete from database
      const success = await this.supabaseStorage.deletePrompt(id);
      
      if (!success) return false;
      
      // 2. Sync to JSON
      await jsonPromptsStorage.deletePrompt(id);
      
      return true;
    } catch (error) {

      throw error;
    }
  }

  // Sync method - Refresh JSON from database
  async syncFromDatabase(): Promise<void> {
    try {
      const databasePrompts = await this.supabaseStorage.getAllPrompts();
      await jsonPromptsStorage.syncFromDatabase(databasePrompts);

    } catch (error) {

    }
  }

  // Initialize - Load JSON and optionally sync from database
  async initialize(): Promise<void> {
    // Always initialize JSON storage
    await jsonPromptsStorage.initialize();
    
    // Try to sync from database on startup
    try {
      await this.syncFromDatabase();
    } catch (error) {

    }
  }

  // Close connections
  async close(): Promise<void> {
    // No specific connections to close for hybrid storage
    // But we can add any cleanup logic here if needed in the future
  }
}

export const hybridPromptsStorage = new HybridPromptsStorage();