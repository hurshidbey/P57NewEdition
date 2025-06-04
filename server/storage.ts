import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, protocols, categories, type User, type InsertUser, type Protocol, type InsertProtocol, type Category } from "@shared/schema";
import { eq, ilike, or, desc } from "drizzle-orm";

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

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Create tables if they don't exist
      await this.ensureTablesExist();
      await this.seedInitialData();
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }

  private async ensureTablesExist() {
    // The tables will be created via migrations or SQL commands
    // For now, we'll assume they exist in Supabase
  }

  private async seedInitialData() {
    try {
      // Check if categories exist
      const existingCategories = await db.select().from(categories);
      if (existingCategories.length === 0) {
        await this.seedCategories();
      }

      // Check if protocols exist  
      const existingProtocols = await db.select().from(protocols);
      if (existingProtocols.length === 0) {
        await this.seedProtocols();
      }
    } catch (error) {
      console.log("Seeding data (tables may not exist yet):", error.message);
    }
  }

  private async seedCategories() {
    const defaultCategories = [
      { name: "Audience", description: "Targeting and audience specification" },
      { name: "Creative", description: "Creative and innovative approaches" },
      { name: "Technical", description: "Technical implementation" },
      { name: "Structure", description: "Content structure and formatting" },
      { name: "Evidence", description: "Evidence and validation" },
      { name: "Analysis", description: "Analysis and evaluation" },
    ];

    await db.insert(categories).values(defaultCategories);
  }

  private async seedProtocols() {
    // Load all protocols from the attached file
    const protocolsData = [
      {
        number: 1,
        title: "So'z miqdorini belgilang va hajmni nazorat qiling",
        description: "Aniq so'z soni belgilash javoblar hajmini boshqaradi. Model ko'rsatilgan miqdorga qat'iy rioya qilishga intiladi. Qisqa javoblar uchun kam, chuqur tahlil uchun ko'proq so'z talab qiling. Muhim narsalarni o'sha \"chegaraga\" sig'diradi va ortiqcha narsalar bilan boshingizni og'ritmaydi. Vaqtiz tejaladi.",
        badExample: "Sedana haqida menga ko'proq ma'lumot ber.",
        goodExample: "Sedana haqida 350 ta so'z qatnashgan maqola tayyorlab ber.",
        categoryId: 4,
        notes: null
      },
      {
        number: 2,
        title: "Raqamlangan ro'yxat talab qiling. Oson bo'ladi",
        description: "Raqamlangan ro'yxatlar ma'lumotni oson o'qish va eslab qolish imkonini beradi. Sub (qo'shimcha kichik) bandlar qo'shish strukturani yanada mustahkamlaydi. Murakkab tushunchalarni aniq qadamlarga ajratadi. O'quvchiga har bir nuqtani ketma-ket o'rganish imkonini beradi.",
        badExample: "Marketing strategiyasini tushuntir",
        goodExample: "Marketing strategiyasini 7 ta alohida band shaklida taqdim et, har bir band a, b, c kabi kichik bandlarga bo'linsin.",
        categoryId: 4,
        notes: null
      },
      {
        number: 3,
        title: "Noaniq iboralarni taqiqlang. Kerak emas!",
        description: "Noaniq iboralar javoblarni sust va ishonchsiz qiladi. Ularni taqiqlash modelni aniq pozitsiya egallashiga majbur qiladi. Natijada keskin, aniq va foydalanish uchun qulay ma'lumot olasiz. Munozarali mavzularda ham aniq fikr bildiriladi.",
        badExample: "Bu masala bo'yicha fikringni bilsam bo'ladimi?",
        goodExample: "Bu masala bo'yicha fikringni 200 ta so'z bilan xulosala, \"balki\", \"ehtimol\" kabi noaniq jumlalarni qo'llama.",
        categoryId: 6,
        notes: null
      }
    ];

    await db.insert(protocols).values(protocolsData);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Protocol methods
  async getProtocols(limit = 20, offset = 0): Promise<Protocol[]> {
    try {
      const result = await db.select()
        .from(protocols)
        .orderBy(protocols.number)
        .limit(limit)
        .offset(offset);
      return result;
    } catch (error) {
      console.error("Error getting protocols:", error);
      return [];
    }
  }

  async getProtocol(id: number): Promise<Protocol | undefined> {
    try {
      const result = await db.select().from(protocols).where(eq(protocols.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting protocol:", error);
      return undefined;
    }
  }

  async createProtocol(protocol: InsertProtocol): Promise<Protocol> {
    try {
      const result = await db.insert(protocols).values(protocol).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating protocol:", error);
      throw error;
    }
  }

  async updateProtocol(id: number, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined> {
    try {
      const result = await db.update(protocols)
        .set(protocol)
        .where(eq(protocols.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating protocol:", error);
      return undefined;
    }
  }

  async deleteProtocol(id: number): Promise<boolean> {
    try {
      const result = await db.delete(protocols).where(eq(protocols.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting protocol:", error);
      return false;
    }
  }

  async searchProtocols(query: string): Promise<Protocol[]> {
    try {
      if (!query.trim()) {
        return this.getProtocols();
      }
      
      const result = await db.select()
        .from(protocols)
        .where(
          or(
            ilike(protocols.title, `%${query}%`),
            ilike(protocols.description, `%${query}%`)
          )
        )
        .orderBy(protocols.number);
      
      return result;
    } catch (error) {
      console.error("Error searching protocols:", error);
      return [];
    }
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    try {
      const result = await db.select().from(categories);
      return result;
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  }

  async getCategory(id: number): Promise<Category | undefined> {
    try {
      const result = await db.select().from(categories).where(eq(categories.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting category:", error);
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();
