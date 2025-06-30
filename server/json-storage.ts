import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Prompt, InsertPrompt } from '@shared/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROMPTS_FILE = path.join(__dirname, 'data', 'prompts.json');

export class JsonPromptsStorage {
  private prompts: Prompt[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const data = await fs.readFile(PROMPTS_FILE, 'utf-8');
      this.prompts = JSON.parse(data);

    } catch (error) {

      this.prompts = [];
      await this.saveToFile();
    }
    
    this.initialized = true;
  }

  private async saveToFile(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(PROMPTS_FILE), { recursive: true });
      await fs.writeFile(PROMPTS_FILE, JSON.stringify(this.prompts, null, 2));

    } catch (error) {

    }
  }

  // Public API methods (fast JSON reads)
  async getPrompts(userTier: string): Promise<Prompt[]> {
    await this.initialize();
    
    return this.prompts.filter(prompt => {
      if (!prompt.isPublic) return false;
      
      if (userTier === 'free') {
        // Free users: only prompts with ID 1, 2, or 3
        return prompt.id === 1 || prompt.id === 2 || prompt.id === 3;
      } else {
        return true; // Premium users: all public prompts
      }
    }).sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    await this.initialize();
    return this.prompts.find(p => p.id === id);
  }

  // Admin methods (require database sync)
  async getAllPrompts(): Promise<Prompt[]> {
    await this.initialize();
    return [...this.prompts].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async addPrompt(prompt: Prompt): Promise<void> {
    await this.initialize();
    
    // Remove existing prompt with same ID if it exists
    this.prompts = this.prompts.filter(p => p.id !== prompt.id);
    
    // Add new prompt
    this.prompts.push(prompt);
    
    await this.saveToFile();
  }

  async updatePrompt(id: number, updatedPrompt: Prompt): Promise<void> {
    await this.initialize();
    
    const index = this.prompts.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Prompt with id ${id} not found`);
    }
    
    this.prompts[index] = updatedPrompt;
    await this.saveToFile();
  }

  async deletePrompt(id: number): Promise<void> {
    await this.initialize();
    
    const originalLength = this.prompts.length;
    this.prompts = this.prompts.filter(p => p.id !== id);
    
    if (this.prompts.length === originalLength) {
      throw new Error(`Prompt with id ${id} not found`);
    }
    
    await this.saveToFile();
  }

  // Sync method: Reload from database and update JSON
  async syncFromDatabase(databasePrompts: Prompt[]): Promise<void> {
    this.prompts = [...databasePrompts];
    await this.saveToFile();

    // Note: No need to reset initialized flag since we're updating in memory directly
  }
}

export const jsonPromptsStorage = new JsonPromptsStorage();