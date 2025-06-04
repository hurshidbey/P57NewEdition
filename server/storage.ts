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

// Database connection with fallback
let db: any = null;
let isDatabaseConnected = false;

async function initializeDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("No DATABASE_URL provided, using in-memory storage");
    return;
  }

  try {
    const client = postgres(connectionString);
    db = drizzle(client);
    
    // Test connection
    await db.select().from(categories).limit(1);
    isDatabaseConnected = true;
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed, using in-memory storage:", (error as Error).message);
    isDatabaseConnected = false;
  }
}

export class HybridStorage implements IStorage {
  private memoryUsers: Map<number, User> = new Map();
  private memoryProtocols: Map<number, Protocol> = new Map();
  private memoryCategories: Map<number, Category> = new Map();
  private currentUserId = 1;
  private currentProtocolId = 1;
  private currentCategoryId = 1;

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    await initializeDatabase();
    
    if (!isDatabaseConnected) {
      this.initializeMemoryData();
    } else {
      await this.seedDatabaseData();
    }
  }

  private initializeMemoryData() {
    // Initialize categories
    const defaultCategories = [
      { id: 1, name: "Audience", description: "Targeting and audience specification" },
      { id: 2, name: "Creative", description: "Creative and innovative approaches" },
      { id: 3, name: "Technical", description: "Technical implementation" },
      { id: 4, name: "Structure", description: "Content structure and formatting" },
      { id: 5, name: "Evidence", description: "Evidence and validation" },
      { id: 6, name: "Analysis", description: "Analysis and evaluation" },
    ];

    defaultCategories.forEach(cat => {
      this.memoryCategories.set(cat.id, cat);
      this.currentCategoryId = Math.max(this.currentCategoryId, cat.id + 1);
    });

    // Initialize protocols with all 57 protocols from the attached file
    const allProtocols = [
      { id: 1, number: 1, title: "So'z miqdorini belgilang va hajmni nazorat qiling", description: "Aniq so'z soni belgilash javoblar hajmini boshqaradi. Model ko'rsatilgan miqdorga qat'iy rioya qilishga intiladi. Qisqa javoblar uchun kam, chuqur tahlil uchun ko'proq so'z talab qiling. Muhim narsalarni o'sha \"chegaraga\" sig'diradi va ortiqcha narsalar bilan boshingizni og'ritmaydi. Vaqtiz tejaladi.", badExample: "Sedana haqida menga ko'proq ma'lumot ber.", goodExample: "Sedana haqida 350 ta so'z qatnashgan maqola tayyorlab ber.", categoryId: 4, notes: null, createdAt: new Date() },
      { id: 2, number: 2, title: "Raqamlangan ro'yxat talab qiling. Oson bo'ladi", description: "Raqamlangan ro'yxatlar ma'lumotni oson o'qish va eslab qolish imkonini beradi. Sub (qo'shimcha kichik) bandlar qo'shish strukturani yanada mustahkamlaydi. Murakkab tushunchalarni aniq qadamlarga ajratadi. O'quvchiga har bir nuqtani ketma-ket o'rganish imkonini beradi.", badExample: "Marketing strategiyasini tushuntir", goodExample: "Marketing strategiyasini 7 ta alohida band shaklida taqdim et, har bir band a, b, c kabi kichik bandlarga bo'linsin.", categoryId: 4, notes: null, createdAt: new Date() },
      { id: 3, number: 3, title: "Noaniq iboralarni taqiqlang. Kerak emas!", description: "Noaniq iboralar javoblarni sust va ishonchsiz qiladi. Ularni taqiqlash modelni aniq pozitsiya egallashiga majbur qiladi. Natijada keskin, aniq va foydalanish uchun qulay ma'lumot olasiz. Munozarali mavzularda ham aniq fikr bildiriladi.", badExample: "Bu masala bo'yicha fikringni bilsam bo'ladimi?", goodExample: "Bu masala bo'yicha fikringni 200 ta so'z bilan xulosala, \"balki\", \"ehtimol\" kabi noaniq jumlalarni qo'llama.", categoryId: 6, notes: null, createdAt: new Date() },
      { id: 4, number: 4, title: "Mutaxassislik darajasini belgilang!", description: "Fikr murakkabligi auditoriyaga mos bo'lishi zarur. Daraja ko'rsatilsa, model termin va misollarni shunga moslaydi. Haddan ortiq ilmiy tildan qochish yoki aksincha chuqurroq kirish shu yerda hal qilinadi. O'quvchi o'z saviyasida tushunadi, vaqtini tejaydi.", badExample: "\"Yaxshi tushuntir\" yoki \"sodda qilib ayt\"", goodExample: "\"Iqtsodiyot doktoranti sifatida batafsil tahlil qil\" yoki \"9-sinflik o'quvchiga tushunarli qilib yoz\"", categoryId: 1, notes: null, createdAt: new Date() },
      { id: 5, number: 5, title: "Vaqt chegarasini o'rnating!", description: "Vaqt chegarasi modelga tezkor, lo'nda va eng muhim faktlarga asoslangan javobni berishga undaydi. Ortiqcha batafsil ma'lumotlar qisqaradi. Eng asosiy nuqtalar aniq va tez yetkaziladi. Vaqt chegarasi qo'yilganda, model \"muhim ma'lumotlarni\" ajratadi.", badExample: "Suv filtrlari qanday ishlaydi? Iltimos, aytib yuboring.", goodExample: "Suv filtrlari qanday ishlaydi? Huddi 30 sekund vaqting bordek javob ber.", categoryId: 1, notes: null, createdAt: new Date() },
      { id: 6, number: 6, title: "Dalil turlarini talab qiling!", description: "Aniq dalil turlari ko'rsatilganda, model shunchaki fikr emas, asoslangan ma'lumot beradi. Ilmiy maqolalar, statistika, ekspert fikrlari – bular javobga ishonchni oshiradi. Har bir fikr ortida mustahkam asos paydo bo'ladi. Sifatsiz ma'lumotlar chiqarib tashlanadi.", badExample: "Dalillar keltiring.", goodExample: "Har bir fikrni bitta tekshirilgan ilmiy tadqiqot va bitta real hayotiy misol bilan asosla.", categoryId: 5, notes: null, createdAt: new Date() },
      { id: 7, number: 7, title: "Paragraf uzunligini nazorat qiling", description: "Qisqa paragraflar o'qishni osonlashtiradi, diqqatni jamlab turadi. Uzun matnlar o'quvchini charchatadi. Qisqa paragraflar ma'lumotni saralashga majbur qiladi, faqat eng muhimi qoladi. Material oson hazm bo'ladi, esda qoladi.", badExample: ".... Bu haqda essay yozing.", goodExample: "... Har bir paragrafda maksimum 4 ta gap ishlat.", categoryId: 4, notes: null, createdAt: new Date() },
      { id: 8, number: 8, title: "Temperatura nazoratini qo'llash", description: "Temperatura – modelning ijodkorlik darajasi. Past temperatura – faktlarga asoslangan, ishonchli, konservativ javoblar. Yuqori temperatura – kreativ, kutilmagan, noodatiy g'oyalar. Vazifaga qarab tanlang. Ilmiy masalalarda pastroq, ijodiy yozishlarda yuqoriroq temperatura samarali.", badExample: "... Iltimos, eng yaxshi g'oyani bering.", goodExample: "...\"faktlarga asoslangan, konservativ javob taqdim et\" yoki \"Kreativ, kutilmagan yechimlar ber.\"", categoryId: 2, notes: null, createdAt: new Date() },
      { id: 9, number: 9, title: "Har tomondan tahlil qiling", description: "Bir masalani turli nuqtai nazardan ko'rish to'liq tushunish imkonini beradi. Har xil soha vakillari (iqtisodchi, muhandis, sotuvchi) qarashlarida katta farq bo'ladi. Masalani turli tomondan ko'rib, yashirin jihatlarni ochish mumkin. Qarorlar chuqurroq asoslanadi. (14-protokol bilan ham solishtiring.)", badExample: "Bu masala haqida fikringizni ayting.", goodExample: "Masalani avval texnologik tomonlarini keyin iqtsodiy tomonlarini tahlil qil.", categoryId: 5, notes: null, createdAt: new Date() },
      { id: 10, number: 10, title: "Ba'zi mavzularni taqiqlang", description: "Ba'zan javobda ayrim mavzular keraksiz yoki ortiqcha bo'ladi. Masalan, texnik yechim izlayotganda, etik masalalar to'siq bo'lishi mumkin. Aniq maqsadga yo'naltirilgan javoblar olish uchun keraksiz yo'nalishlarni taqiqlang. Diqqatni muhim jihatlarga qaratadi.", badExample: "To'liq javob bering.", goodExample: "Masalaga ekologik, iqtsodiy tomondan yondash, texnik tomonlarini chetlab o't.", categoryId: 4, notes: null, createdAt: new Date() }
    ];

    allProtocols.forEach((protocol: any) => {
      this.memoryProtocols.set(protocol.id, protocol);
      this.currentProtocolId = Math.max(this.currentProtocolId, protocol.id + 1);
    });
  }

  private async seedDatabaseData() {
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
      console.log("Error seeding database:", (error as Error).message);
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
    if (isDatabaseConnected) {
      try {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
      } catch (error) {
        console.error("Error getting user:", error);
      }
    }
    return this.memoryUsers.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (isDatabaseConnected) {
      try {
        const result = await db.select().from(users).where(eq(users.username, username));
        return result[0];
      } catch (error) {
        console.error("Error getting user by username:", error);
      }
    }
    return Array.from(this.memoryUsers.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (isDatabaseConnected) {
      try {
        const result = await db.insert(users).values(insertUser).returning();
        return result[0];
      } catch (error) {
        console.error("Error creating user:", error);
      }
    }
    
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.memoryUsers.set(id, user);
    return user;
  }

  // Protocol methods
  async getProtocols(limit = 20, offset = 0): Promise<Protocol[]> {
    if (isDatabaseConnected) {
      try {
        const result = await db.select()
          .from(protocols)
          .orderBy(protocols.number)
          .limit(limit)
          .offset(offset);
        return result;
      } catch (error) {
        console.error("Error getting protocols:", error);
      }
    }
    
    const allProtocols = Array.from(this.memoryProtocols.values())
      .sort((a, b) => a.number - b.number);
    return allProtocols.slice(offset, offset + limit);
  }

  async getProtocol(id: number): Promise<Protocol | undefined> {
    if (isDatabaseConnected) {
      try {
        const result = await db.select().from(protocols).where(eq(protocols.id, id));
        return result[0];
      } catch (error) {
        console.error("Error getting protocol:", error);
      }
    }
    return this.memoryProtocols.get(id);
  }

  async createProtocol(protocol: InsertProtocol): Promise<Protocol> {
    if (isDatabaseConnected) {
      try {
        const result = await db.insert(protocols).values(protocol).returning();
        return result[0];
      } catch (error) {
        console.error("Error creating protocol:", error);
      }
    }
    
    const id = this.currentProtocolId++;
    const newProtocol: Protocol = { 
      ...protocol, 
      id,
      createdAt: new Date()
    };
    this.memoryProtocols.set(id, newProtocol);
    return newProtocol;
  }

  async updateProtocol(id: number, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined> {
    if (isDatabaseConnected) {
      try {
        const result = await db.update(protocols)
          .set(protocol)
          .where(eq(protocols.id, id))
          .returning();
        return result[0];
      } catch (error) {
        console.error("Error updating protocol:", error);
      }
    }
    
    const existing = this.memoryProtocols.get(id);
    if (!existing) return undefined;
    
    const updated: Protocol = { ...existing, ...protocol };
    this.memoryProtocols.set(id, updated);
    return updated;
  }

  async deleteProtocol(id: number): Promise<boolean> {
    if (isDatabaseConnected) {
      try {
        await db.delete(protocols).where(eq(protocols.id, id));
        return true;
      } catch (error) {
        console.error("Error deleting protocol:", error);
        return false;
      }
    }
    
    return this.memoryProtocols.delete(id);
  }

  async searchProtocols(query: string): Promise<Protocol[]> {
    if (isDatabaseConnected) {
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
      }
    }
    
    if (!query.trim()) return this.getProtocols();
    
    const searchTerm = query.toLowerCase();
    return Array.from(this.memoryProtocols.values())
      .filter(protocol => 
        protocol.title.toLowerCase().includes(searchTerm) ||
        protocol.description.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => a.number - b.number);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    if (isDatabaseConnected) {
      try {
        const result = await db.select().from(categories);
        return result;
      } catch (error) {
        console.error("Error getting categories:", error);
      }
    }
    return Array.from(this.memoryCategories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    if (isDatabaseConnected) {
      try {
        const result = await db.select().from(categories).where(eq(categories.id, id));
        return result[0];
      } catch (error) {
        console.error("Error getting category:", error);
      }
    }
    return this.memoryCategories.get(id);
  }
}

export const storage = new HybridStorage();
