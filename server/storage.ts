import { users, protocols, categories, type User, type InsertUser, type Protocol, type InsertProtocol, type Category } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProtocols(limit?: number, offset?: number): Promise<Protocol[]>;
  getProtocol(id: number): Promise<Protocol | undefined>;
  createProtocol(protocol: InsertProtocol): Promise<Protocol>;
  updateProtocol(id: number, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined>;
  deleteProtocol(id: number): Promise<boolean>;
  searchProtocols(query: string): Promise<Protocol[]>;
  
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private protocols: Map<number, Protocol>;
  private categories: Map<number, Category>;
  private currentUserId: number;
  private currentProtocolId: number;
  private currentCategoryId: number;

  constructor() {
    this.users = new Map();
    this.protocols = new Map();
    this.categories = new Map();
    this.currentUserId = 1;
    this.currentProtocolId = 1;
    this.currentCategoryId = 1;
    
    // Initialize with default categories
    this.initializeCategories();
    this.initializeProtocols();
  }

  private initializeCategories() {
    const defaultCategories = [
      { id: 1, name: "Audience", description: "Targeting and audience specification" },
      { id: 2, name: "Creative", description: "Creative and innovative approaches" },
      { id: 3, name: "Technical", description: "Technical implementation" },
      { id: 4, name: "Structure", description: "Content structure and formatting" },
      { id: 5, name: "Evidence", description: "Evidence and validation" },
      { id: 6, name: "Analysis", description: "Analysis and evaluation" },
    ];

    defaultCategories.forEach(cat => {
      this.categories.set(cat.id, cat);
      this.currentCategoryId = Math.max(this.currentCategoryId, cat.id + 1);
    });
  }

  private initializeProtocols() {
    // Sample protocols from the provided data
    const sampleProtocols = [
      {
        id: 1,
        number: 1,
        title: "So'z miqdorini belgilang va hajmni nazorat qiling",
        description: "Aniq so'z soni belgilash javoblar hajmini boshqaradi. Model ko'rsatilgan miqdorga qat'iy rioya qilishga intiladi. Qisqa javoblar uchun kam, chuqur tahlil uchun ko'proq so'z talab qiling. Muhim narsalarni o'sha \"chegaraga\" sig'diradi va ortiqcha narsalar bilan boshingizni og'ritmaydi. Vaqtiz tejaladi.",
        badExample: "Sedana haqida menga ko'proq ma'lumot ber.",
        goodExample: "Sedana haqida 350 ta so'z qatnashgan maqola tayyorlab ber.",
        categoryId: 4,
        notes: null,
        createdAt: new Date()
      },
      {
        id: 2,
        number: 2,
        title: "Raqamlangan ro'yxat talab qiling. Oson bo'ladi",
        description: "Raqamlangan ro'yxatlar ma'lumotni oson o'qish va eslab qolish imkonini beradi. Sub (qo'shimcha kichik) bandlar qo'shish strukturani yanada mustahkamlaydi. Murakkab tushunchalarni aniq qadamlarga ajratadi. O'quvchiga har bir nuqtani ketma-ket o'rganish imkonini beradi.",
        badExample: "Marketing strategiyasini tushuntir",
        goodExample: "Marketing strategiyasini 7 ta alohida band shaklida taqdim et, har bir band a, b, c kabi kichik bandlarga bo'linsin.",
        categoryId: 4,
        notes: null,
        createdAt: new Date()
      },
      {
        id: 3,
        number: 3,
        title: "Noaniq iboralarni taqiqlang. Kerak emas!",
        description: "Noaniq iboralar javoblarni sust va ishonchsiz qiladi. Ularni taqiqlash modelni aniq pozitsiya egallashiga majbur qiladi. Natijada keskin, aniq va foydalanish uchun qulay ma'lumot olasiz. Munozarali mavzularda ham aniq fikr bildiriladi.",
        badExample: "Bu masala bo'yicha fikringni bilsam bo'ladimi?",
        goodExample: "Bu masala bo'yicha fikringni 200 ta so'z bilan xulosala, \"balki\", \"ehtimol\" kabi noaniq jumlalarni qo'llama.",
        categoryId: 6,
        notes: null,
        createdAt: new Date()
      }
    ];

    sampleProtocols.forEach(protocol => {
      this.protocols.set(protocol.id, protocol);
      this.currentProtocolId = Math.max(this.currentProtocolId, protocol.id + 1);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Protocol methods
  async getProtocols(limit = 20, offset = 0): Promise<Protocol[]> {
    const allProtocols = Array.from(this.protocols.values())
      .sort((a, b) => a.number - b.number);
    return allProtocols.slice(offset, offset + limit);
  }

  async getProtocol(id: number): Promise<Protocol | undefined> {
    return this.protocols.get(id);
  }

  async createProtocol(protocol: InsertProtocol): Promise<Protocol> {
    const id = this.currentProtocolId++;
    const newProtocol: Protocol = { 
      ...protocol, 
      id,
      createdAt: new Date()
    };
    this.protocols.set(id, newProtocol);
    return newProtocol;
  }

  async updateProtocol(id: number, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined> {
    const existing = this.protocols.get(id);
    if (!existing) return undefined;
    
    const updated: Protocol = { ...existing, ...protocol };
    this.protocols.set(id, updated);
    return updated;
  }

  async deleteProtocol(id: number): Promise<boolean> {
    return this.protocols.delete(id);
  }

  async searchProtocols(query: string): Promise<Protocol[]> {
    if (!query.trim()) return this.getProtocols();
    
    const searchTerm = query.toLowerCase();
    return Array.from(this.protocols.values())
      .filter(protocol => 
        protocol.title.toLowerCase().includes(searchTerm) ||
        protocol.description.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => a.number - b.number);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
}

export const storage = new MemStorage();
