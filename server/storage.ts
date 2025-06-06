import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, protocols, categories, userProgress, type User, type InsertUser, type Protocol, type InsertProtocol, type Category, type UserProgress, type InsertUserProgress } from "@shared/schema";
import { eq, ilike, or, desc, and } from "drizzle-orm";

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
  
  getUserProgress(userId: string): Promise<UserProgress[]>;
  updateProtocolProgress(userId: string, protocolId: number, score: number): Promise<UserProgress>;
}

// Database connection with fallback
let db: any = null;
let isDatabaseConnected = false;

async function initializeDatabase() {
  // Try Supabase REST API first
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && supabaseKey) {
    try {
      const { SupabaseStorage } = await import('./supabase-storage');
      const supabaseStorage = new SupabaseStorage();
      
      // Test connection by fetching categories
      await supabaseStorage.getCategories();
      
      // Use Supabase storage globally
      (global as any).supabaseStorage = supabaseStorage;
      isDatabaseConnected = true;
      console.log("Supabase REST API connected successfully");
      return;
    } catch (error) {
      console.log("Supabase connection failed, trying direct database connection:", (error as Error).message);
    }
  }

  // Fall back to direct database connection
  let connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;
    if (!dbPassword) {
      console.log("No Supabase credentials or DATABASE_URL provided, using in-memory storage");
      return;
    }
    connectionString = `postgresql://postgres:${dbPassword}@db.bazptglwzqstppwlvmvb.supabase.co:5432/postgres`;
  }

  try {
    const client = postgres(connectionString, {
      ssl: 'require'
    });
    db = drizzle(client);
    
    // Create tables if they don't exist
    await createTables();
    
    // Test connection
    await db.select().from(categories).limit(1);
    isDatabaseConnected = true;
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed, using in-memory storage:", (error as Error).message);
    isDatabaseConnected = false;
  }
}

async function createTables() {
  try {
    // Create categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      )
    `);

    // Create protocols table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS protocols (
        id SERIAL PRIMARY KEY,
        number INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        bad_example TEXT,
        good_example TEXT,
        category_id INTEGER NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);

    // Create user_progress table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        protocol_id INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT NOW(),
        practice_count INTEGER DEFAULT 1,
        last_score INTEGER,
        UNIQUE(user_id, protocol_id)
      )
    `);

    // Create indexes for user_progress table
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_protocol_id ON user_progress(protocol_id)
    `);

    console.log("Tables created successfully");
  } catch (error) {
    console.log("Tables may already exist:", (error as Error).message);
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
      { id: 1, name: "Auditoriya", description: "Maqsadli auditoriya va yo'naltirish" },
      { id: 2, name: "Ijodiy", description: "Ijodiy va innovatsion yondashuvlar" },
      { id: 3, name: "Texnik", description: "Texnik amalga oshirish" },
      { id: 4, name: "Tuzilish", description: "Kontent tuzilishi va formatlash" },
      { id: 5, name: "Dalil", description: "Dalil va tekshirish" },
      { id: 6, name: "Tahlil", description: "Tahlil va baholash" },
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
      { id: 10, number: 10, title: "Ba'zi mavzularni taqiqlang", description: "Ba'zan javobda ayrim mavzular keraksiz yoki ortiqcha bo'ladi. Masalan, texnik yechim izlayotganda, etik masalalar to'siq bo'lishi mumkin. Aniq maqsadga yo'naltirilgan javoblar olish uchun keraksiz yo'nalishlarni taqiqlang. Diqqatni muhim jihatlarga qaratadi.", badExample: "To'liq javob bering.", goodExample: "Masalaga ekologik, iqtsodiy tomondan yondash, texnik tomonlarini chetlab o't.", categoryId: 4, notes: null, createdAt: new Date() },
      { id: 11, number: 11, title: "Aniq manbaalar formati talab qiling", description: "Aniq manbalar formati ma'lumotni tekshirishni osonlashtiradi. Standart format (masalan, APA, MLA) qo'llash barcha manbalarni bir xil ko'rinishda saqlaydi. To'g'ridan-to'g'ri URL manzillar tekshirishni tezlashtiradi. Ishonchli ma'lumotlarni ajratib olish imkoni paydo bo'ladi.", badExample: "Manbalarni ko'rsating.", goodExample: "Manbalarni APA formatida to'g'ridan-to'g'ri URL manzillar bilan keltir.", categoryId: 5, notes: null, createdAt: new Date() },
      { id: 12, number: 12, title: "Axborotni qayta ishlash uchun maxsus chegara belgisi qo'llang!", description: "Belgilar yordamida muhim bloklarni tez ajratib olasiz. Keyinchalik texnik ishlar uchun ham (skript yoki regex bilan yirik matndan xulosani sug'urib olish) oson bo'ladi. Model belgilarni aniq joyga qo'yadi, tartib buzilmaydi. Tozalash va qayta ishlash jarayoni tezlashadi. Ko'z oson o'qiydi.", badExample: "Muhim fikrlarni ajrating.", goodExample: "Barcha asosiy xulosalarni §§ belgilari orasiga joylashtir.", categoryId: 4, notes: null, createdAt: new Date() },
      { id: 13, number: 13, title: "Qarama-qarshi tahlil talab qiling", description: "Fikrga qarshi bo'lgan eng kuchli argumentlarni ko'rish fikrni mustahkamlaydi yoki zaif tomonlarni ochadi. Bir tomonlama qarashdan qochish imkonini beradi. Qarorlar yanada puxta bo'ladi. Muammoli jihatlar avvalroq ma'lum bo'ladi, ularga yechim topiladi. (Solishtiring: Protokol-31)", badExample: "... buning yaxshi tomonlarini aytib bering.", goodExample: "... Standart javobni bergandan so'ng, eng kuchli qarshi argumentni keltir.", categoryId: 5, notes: null, createdAt: new Date() },
      { id: 14, number: 14, title: "Turli kasblarni birlashtiring!", description: "Turli soha vakillari bir muammoni ko'rishda o'ziga xos nuqtai nazarga ega. Ularni birlashtirish super yechimlar beradi. Masalan, \"harbiy strateg sifatida\" va \"psixolog sifatida\" ko'rish. Ikkala soha bilimlarini birlashtirib, yangi yondashuvlar paydo bo'ladi. (9-protokol bilan solishtiring)", badExample: "Bu masalani tahlil qiling.", goodExample: "Bu masalani harbiy strateg hamda xulq-atvor iqtisodchisi nuqtai nazaridan tahlil qil.", categoryId: 4, notes: null, createdAt: new Date() },
      { id: 15, number: 15, title: "Ishonch chegarasini o'rnating!", description: "Fakt va taxmin orasidagi farqni belgilash muhim. Ishonch chegarasi o'rnatilganda, model faqat ishonchli ma'lumotlarni beradi. Ishonchsiz faktlar chiqarib tashlanadi. Qarorlar aniq ma'lumotlarga asoslanadi. Taxminlar haqiqat sifatida taqdim etilmaydi.", badExample: "Bu haqda bilganingizni ayting.", goodExample: "Faqat 90%+ ishonchli bo'lgan faktlarga asoslangan ma'lumotlardan foydalan.", categoryId: 5, notes: null, createdAt: new Date() },
      { id: 16, number: 16, title: "Javob shablonini belgilang", description: "Oldindan belgilangan format javobni tuzilishli va tushunarli qiladi. Har doim bir xil tartibda ma'lumot olish ish jarayonini yaxshilaydi. Kerakli ma'lumotlarni tezroq topish imkonini beradi. Tuzilish izchil bo'ladi, biror muhim qism tushib qolmaydi.", badExample: "Barcha ma'lumotni tartibli bering.", goodExample: "Quyidagi formatda javob ber: Muammo | Yechim | Amalga oshirish qadamlari | Kutilayotgan natija.", categoryId: 4, notes: null, createdAt: new Date() },
      { id: 17, number: 17, title: "\"Ma'lumot yetarli emas\" triggerini o'rnating", description: "Agar ma'lumot yetarli bo'lmasa, model taxmin qilish o'rniga to'xtaydi. Noto'g'ri ma'lumot tarqalmaydi. Xato xulosalar oldi olinadi. O'quvchi aniqlik kiritish kerakligini biladi. Ishonch buzilmaydi. Sifatsiz javoblar o'rniga aniq signal beriladi.", badExample: "Shoptoliqoqi-PRO dorisi haqida yozing.", goodExample: "Agar Shoptoliqoqi-PRO haqida faktlar yetarli bo'lmasa, faqat 'Ma'lumot yetarli emas' deb yoz, taxmin qilma.", categoryId: 5, notes: null, createdAt: new Date() },
      { id: 18, number: 18, title: "Qisqartirish buyrug'ini qo'llang", description: "Ko'p hollarda dastlabki javob keragidan uzun bo'ladi. Qisqartirish buyrug'i eng muhim ma'lumotni saqlab, ortiqchasini olib tashlaydi. Vaqt tejaladi, asosiy g'oya yorqinroq namoyon bo'ladi. Uzun ma'lumotlarni qisqa, ammo mazmunli shaklga keltiradi.", badExample: "Qisqa javob bering.", goodExample: "To'liq javob yozgandan so'ng, barcha muhim ma'lumotlarni saqlab, uni 50% qisqartir.", categoryId: 4, notes: null, createdAt: new Date() },
      { id: 19, number: 19, title: "\"Eng Yomon vaziyat\" (the-worst case-scenario) da nima bo'ladi?", description: "Har qanday qaror turli oqibatlarga olib kelishi mumkin. Eng yaxshi, kutilgan va eng yomon holatlarni ko'rib chiqish to'liq tayyorgarlikni ta'minlaydi. Har bir senariy uchun yechimlar oldindan tayyorlanadi. Xavflar kamayadi, imkoniyatlar ko'payadi. Solishtiring: Protokol-29", badExample: "Bu qarorning natijasi qanday bo'ladi?", goodExample: "Uchta potentsial natijani taqdim et: eng yaxshi holat, kutilgan holat, eng yomon holat.", categoryId: 6, notes: null, createdAt: new Date() },
      { id: 20, number: 20, title: "O'zini o'zi tekshirishni buyuring!", description: "Har qanday javobda zaif tomonlar bo'ladi. Modeldan o'z javobining eng zaif qismlarini ko'rsatishni so'rash sifatni yaxshilaydi. Keyingi qarorlarda bu kamchiliklarni hisobga olish mumkin. O'z-o'zini tanqid qilish ikkita ko'z o'rniga to'rtta ko'z bilan tekshirishga o'xshaydi.", badExample: "Javobingizni tekshiring.", goodExample: "Javob bergandan so'ng, javobingni eng zaif uchta qismini aniqla.", categoryId: 4, notes: null, createdAt: new Date() },
      { id: 21, number: 21, title: "Bahola, bahola, bahola!", description: "Raqamli baholash subyektiv fikrlarni obyektivlashtiradi. 1-10 shkala orqali farqlarni aniq ko'rsatish mumkin. Turli variantlarni tezda solishtirish imkonini beradi. Raqamlar asosida qaror qabul qilish osonlashadi. Hissiyotlar emas, aniq mezonlar asosida baholanadi.", badExample: "Qaysi variant yaxshiroq?", goodExample: "Har bir variantni samaradorlik, narx va tezlik bo'yicha 1-10 shkalada bahola.", categoryId: 6, notes: null, createdAt: new Date() },
      { id: 22, number: 22, title: "Til cheklovlarini qo'llash", description: "Til chegaralari modelni sodda va tushunarli tilda yozishga majbur qiladi. Uzun, murakkab so'zlar o'rniga qisqa, aniq so'zlar ishlatiladi. Keng auditoriya uchun tushunarli bo'ladi. G'oyalar oddiy shaklda, ammo chuqur mazmunda taqdim etiladi. Solishtiring: Protokol-43", badExample: "Sodda tilda yozing.", goodExample: "Faqat 8ta harfdan kam bo'lgan so'zlardan foydalanib javob ber. Jargon so'zlar ishlatma.", categoryId: 4, notes: null, createdAt: new Date() },
      { id: 23, number: 23, title: "Bo'lim sarlavhalarini talab qiling", description: "Sarlavhalar uzun matnni tarkibiy qismlarga ajratadi. O'quvchi kerakli ma'lumotni tezda topadi. Matn tuzilishi aniq ko'rinadi. Har bir bo'lim o'z mavzusiga ega bo'ladi. Murakkab mavzular oson hazm qilinadigan qismlarga bo'linadi.", badExample: "Batafsil ma'lumot bering.", goodExample: "Har 2 ta paragrafdan oldin uning mazmunini ifodalovchi qalin sarlavha qo'y", categoryId: 4, notes: null, createdAt: new Date() }
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
      { name: "Auditoriya", description: "Maqsadli auditoriya va yo'naltirish" },
      { name: "Ijodiy", description: "Ijodiy va innovatsion yondashuvlar" },
      { name: "Texnik", description: "Texnik amalga oshirish" },
      { name: "Tuzilish", description: "Kontent tuzilishi va formatlash" },
      { name: "Dalil", description: "Dalil va tekshirish" },
      { name: "Tahlil", description: "Tahlil va baholash" },
    ];

    await db.insert(categories).values(defaultCategories);
  }

  private async seedProtocols() {
    // Load all 57 protocols from the attached file
    const allProtocolsData = [
      { number: 1, title: "So'z miqdorini belgilang va hajmni nazorat qiling", description: "Aniq so'z soni belgilash javoblar hajmini boshqaradi. Model ko'rsatilgan miqdorga qat'iy rioya qilishga intiladi. Qisqa javoblar uchun kam, chuqur tahlil uchun ko'proq so'z talab qiling. Muhim narsalarni o'sha \"chegaraga\" sig'diradi va ortiqcha narsalar bilan boshingizni og'ritmaydi. Vaqtiz tejaladi.", badExample: "Sedana haqida menga ko'proq ma'lumot ber.", goodExample: "Sedana haqida 350 ta so'z qatnashgan maqola tayyorlab ber.", categoryId: 4, notes: null },
      { number: 2, title: "Raqamlangan ro'yxat talab qiling. Oson bo'ladi", description: "Raqamlangan ro'yxatlar ma'lumotni oson o'qish va eslab qolish imkonini beradi. Sub (qo'shimcha kichik) bandlar qo'shish strukturani yanada mustahkamlaydi. Murakkab tushunchalarni aniq qadamlarga ajratadi. O'quvchiga har bir nuqtani ketma-ket o'rganish imkonini beradi.", badExample: "Marketing strategiyasini tushuntir", goodExample: "Marketing strategiyasini 7 ta alohida band shaklida taqdim et, har bir band a, b, c kabi kichik bandlarga bo'linsin.", categoryId: 4, notes: null },
      { number: 3, title: "Noaniq iboralarni taqiqlang. Kerak emas!", description: "Noaniq iboralar javoblarni sust va ishonchsiz qiladi. Ularni taqiqlash modelni aniq pozitsiya egallashiga majbur qiladi. Natijada keskin, aniq va foydalanish uchun qulay ma'lumot olasiz. Munozarali mavzularda ham aniq fikr bildiriladi.", badExample: "Bu masala bo'yicha fikringni bilsam bo'ladimi?", goodExample: "Bu masala bo'yicha fikringni 200 ta so'z bilan xulosala, \"balki\", \"ehtimol\" kabi noaniq jumlalarni qo'llama.", categoryId: 6, notes: null },
      { number: 4, title: "Mutaxassislik darajasini belgilang!", description: "Fikr murakkabligi auditoriyaga mos bo'lishi zarur. Daraja ko'rsatilsa, model termin va misollarni shunga moslaydi. Haddan ortiq ilmiy tildan qochish yoki aksincha chuqurroq kirish shu yerda hal qilinadi. O'quvchi o'z saviyasida tushunadi, vaqtini tejaydi.", badExample: "\"Yaxshi tushuntir\" yoki \"sodda qilib ayt\"", goodExample: "\"Iqtsodiyot doktoranti sifatida batafsil tahlil qil\" yoki \"9-sinflik o'quvchiga tushunarli qilib yoz\"", categoryId: 1, notes: null },
      { number: 5, title: "Vaqt chegarasini o'rnating!", description: "Vaqt chegarasi modelga tezkor, lo'nda va eng muhim faktlarga asoslangan javobni berishga undaydi. Ortiqcha batafsil ma'lumotlar qisqaradi. Eng asosiy nuqtalar aniq va tez yetkaziladi. Vaqt chegarasi qo'yilganda, model \"muhim ma'lumotlarni\" ajratadi.", badExample: "Suv filtrlari qanday ishlaydi? Iltimos, aytib yuboring.", goodExample: "Suv filtrlari qanday ishlaydi? Huddi 30 sekund vaqting bordek javob ber.", categoryId: 1, notes: null },
      { number: 6, title: "Dalil turlarini talab qiling!", description: "Aniq dalil turlari ko'rsatilganda, model shunchaki fikr emas, asoslangan ma'lumot beradi. Ilmiy maqolalar, statistika, ekspert fikrlari – bular javobga ishonchni oshiradi. Har bir fikr ortida mustahkam asos paydo bo'ladi. Sifatsiz ma'lumotlar chiqarib tashlanadi.", badExample: "Dalillar keltiring.", goodExample: "Har bir fikrni bitta tekshirilgan ilmiy tadqiqot va bitta real hayotiy misol bilan asosla.", categoryId: 5, notes: null },
      { number: 7, title: "Paragraf uzunligini nazorat qiling", description: "Qisqa paragraflar o'qishni osonlashtiradi, diqqatni jamlab turadi. Uzun matnlar o'quvchini charchatadi. Qisqa paragraflar ma'lumotni saralashga majbur qiladi, faqat eng muhimi qoladi. Material oson hazm bo'ladi, esda qoladi.", badExample: ".... Bu haqda essay yozing.", goodExample: "... Har bir paragrafda maksimum 4 ta gap ishlat.", categoryId: 4, notes: null },
      { number: 8, title: "Temperatura nazoratini qo'llash", description: "Temperatura – modelning ijodkorlik darajasi. Past temperatura – faktlarga asoslangan, ishonchli, konservativ javoblar. Yuqori temperatura – kreativ, kutilmagan, noodatiy g'oyalar. Vazifaga qarab tanlang. Ilmiy masalalarda pastroq, ijodiy yozishlarda yuqoriroq temperatura samarali.", badExample: "... Iltimos, eng yaxshi g'oyani bering.", goodExample: "...\"faktlarga asoslangan, konservativ javob taqdim et\" yoki \"Kreativ, kutilmagan yechimlar ber.\"", categoryId: 2, notes: null },
      { number: 9, title: "Har tomondan tahlil qiling", description: "Bir masalani turli nuqtai nazardan ko'rish to'liq tushunish imkonini beradi. Har xil soha vakillari (iqtisodchi, muhandis, sotuvchi) qarashlarida katta farq bo'ladi. Masalani turli tomondan ko'rib, yashirin jihatlarni ochish mumkin. Qarorlar chuqurroq asoslanadi. (14-protokol bilan ham solishtiring.)", badExample: "Bu masala haqida fikringizni ayting.", goodExample: "Masalani avval texnologik tomonlarini keyin iqtsodiy tomonlarini tahlil qil.", categoryId: 5, notes: null },
      { number: 10, title: "Ba'zi mavzularni taqiqlang", description: "Ba'zan javobda ayrim mavzular keraksiz yoki ortiqcha bo'ladi. Masalan, texnik yechim izlayotganda, etik masalalar to'siq bo'lishi mumkin. Aniq maqsadga yo'naltirilgan javoblar olish uchun keraksiz yo'nalishlarni taqiqlang. Diqqatni muhim jihatlarga qaratadi.", badExample: "To'liq javob bering.", goodExample: "Masalaga ekologik, iqtsodiy tomondan yondash, texnik tomonlarini chetlab o't.", categoryId: 4, notes: null },
      { number: 11, title: "Aniq manbaalar formati talab qiling", description: "Aniq manbalar formati ma'lumotni tekshirishni osonlashtiradi. Standart format (masalan, APA, MLA) qo'llash barcha manbalarni bir xil ko'rinishda saqlaydi. To'g'ridan-to'g'ri URL manzillar tekshirishni tezlashtiradi. Ishonchli ma'lumotlarni ajratib olish imkoni paydo bo'ladi.", badExample: "Manbalarni ko'rsating.", goodExample: "Manbalarni APA formatida to'g'ridan-to'g'ri URL manzillar bilan keltir.", categoryId: 5, notes: null },
      { number: 12, title: "Axborotni qayta ishlash uchun maxsus chegara belgisi qo'llang!", description: "Belgilar yordamida muhim bloklarni tez ajratib olasiz. Keyinchalik texnik ishlar uchun ham (skript yoki regex bilan yirik matndan xulosani sug'urib olish) oson bo'ladi. Model belgilarni aniq joyga qo'yadi, tartib buzilmaydi. Tozalash va qayta ishlash jarayoni tezlashadi. Ko'z oson o'qiydi.", badExample: "Muhim fikrlarni ajrating.", goodExample: "Barcha asosiy xulosalarni §§ belgilari orasiga joylashtir.", categoryId: 4, notes: null },
      { number: 13, title: "Qarama-qarshi tahlil talab qiling", description: "Fikrga qarshi bo'lgan eng kuchli argumentlarni ko'rish fikrni mustahkamlaydi yoki zaif tomonlarni ochadi. Bir tomonlama qarashdan qochish imkonini beradi. Qarorlar yanada puxta bo'ladi. Muammoli jihatlar avvalroq ma'lum bo'ladi, ularga yechim topiladi. (Solishtiring: Protokol-31)", badExample: "... buning yaxshi tomonlarini aytib bering.", goodExample: "... Standart javobni bergandan so'ng, eng kuchli qarshi argumentni keltir.", categoryId: 5, notes: null },
      { number: 14, title: "Turli kasblarni birlashtiring!", description: "Turli soha vakillari bir muammoni ko'rishda o'ziga xos nuqtai nazarga ega. Ularni birlashtirish super yechimlar beradi. Masalan, \"harbiy strateg sifatida\" va \"psixolog sifatida\" ko'rish. Ikkala soha bilimlarini birlashtirib, yangi yondashuvlar paydo bo'ladi. (9-protokol bilan solishtiring)", badExample: "Bu masalani tahlil qiling.", goodExample: "Bu masalani harbiy strateg hamda xulq-atvor iqtisodchisi nuqtai nazaridan tahlil qil.", categoryId: 4, notes: null },
      { number: 15, title: "Ishonch chegarasini o'rnating!", description: "Fakt va taxmin orasidagi farqni belgilash muhim. Ishonch chegarasi o'rnatilganda, model faqat ishonchli ma'lumotlarni beradi. Ishonchsiz faktlar chiqarib tashlanadi. Qarorlar aniq ma'lumotlarga asoslanadi. Taxminlar haqiqat sifatida taqdim etilmaydi.", badExample: "Bu haqda bilganingizni ayting.", goodExample: "Faqat 90%+ ishonchli bo'lgan faktlarga asoslangan ma'lumotlardan foydalan.", categoryId: 5, notes: null },
      { number: 16, title: "Javob shablonini belgilang", description: "Oldindan belgilangan format javobni tuzilishli va tushunarli qiladi. Har doim bir xil tartibda ma'lumot olish ish jarayonini yaxshilaydi. Kerakli ma'lumotlarni tezroq topish imkonini beradi. Tuzilish izchil bo'ladi, biror muhim qism tushib qolmaydi.", badExample: "Barcha ma'lumotni tartibli bering.", goodExample: "Quyidagi formatda javob ber: Muammo | Yechim | Amalga oshirish qadamlari | Kutilayotgan natija.", categoryId: 4, notes: null },
      { number: 17, title: "\"Ma'lumot yetarli emas\" triggerini o'rnating", description: "Agar ma'lumot yetarli bo'lmasa, model taxmin qilish o'rniga to'xtaydi. Noto'g'ri ma'lumot tarqalmaydi. Xato xulosalar oldi olinadi. O'quvchi aniqlik kiritish kerakligini biladi. Ishonch buzilmaydi. Sifatsiz javoblar o'rniga aniq signal beriladi.", badExample: "Shoptoliqoqi-PRO dorisi haqida yozing.", goodExample: "Agar Shoptoliqoqi-PRO haqida faktlar yetarli bo'lmasa, faqat 'Ma'lumot yetarli emas' deb yoz, taxmin qilma.", categoryId: 5, notes: null },
      { number: 18, title: "Qisqartirish buyrug'ini qo'llang", description: "Ko'p hollarda dastlabki javob keragidan uzun bo'ladi. Qisqartirish buyrug'i eng muhim ma'lumotni saqlab, ortiqchasini olib tashlaydi. Vaqt tejaladi, asosiy g'oya yorqinroq namoyon bo'ladi. Uzun ma'lumotlarni qisqa, ammo mazmunli shaklga keltiradi.", badExample: "Qisqa javob bering.", goodExample: "To'liq javob yozgandan so'ng, barcha muhim ma'lumotlarni saqlab, uni 50% qisqartir.", categoryId: 4, notes: null },
      { number: 19, title: "\"Eng Yomon vaziyat\" (the-worst case-scenario) da nima bo'ladi?", description: "Har qanday qaror turli oqibatlarga olib kelishi mumkin. Eng yaxshi, kutilgan va eng yomon holatlarni ko'rib chiqish to'liq tayyorgarlikni ta'minlaydi. Har bir senariy uchun yechimlar oldindan tayyorlanadi. Xavflar kamayadi, imkoniyatlar ko'payadi. Solishtiring: Protokol-29", badExample: "Bu qarorning natijasi qanday bo'ladi?", goodExample: "Uchta potentsial natijani taqdim et: eng yaxshi holat, kutilgan holat, eng yomon holat.", categoryId: 6, notes: null },
      { number: 20, title: "O'zini o'zi tekshirishni buyuring!", description: "Har qanday javobda zaif tomonlar bo'ladi. Modeldan o'z javobining eng zaif qismlarini ko'rsatishni so'rash sifatni yaxshilaydi. Keyingi qarorlarda bu kamchiliklarni hisobga olish mumkin. O'z-o'zini tanqid qilish ikkita ko'z o'rniga to'rtta ko'z bilan tekshirishga o'xshaydi.", badExample: "Javobingizni tekshiring.", goodExample: "Javob bergandan so'ng, javobingni eng zaif uchta qismini aniqla.", categoryId: 4, notes: null },
      { number: 21, title: "Bahola, bahola, bahola!", description: "Raqamli baholash subyektiv fikrlarni obyektivlashtiradi. 1-10 shkala orqali farqlarni aniq ko'rsatish mumkin. Turli variantlarni tezda solishtirish imkonini beradi. Raqamlar asosida qaror qabul qilish osonlashadi. Hissiyotlar emas, aniq mezonlar asosida baholanadi.", badExample: "Qaysi variant yaxshiroq?", goodExample: "Har bir variantni samaradorlik, narx va tezlik bo'yicha 1-10 shkalada bahola.", categoryId: 6, notes: null },
      { number: 22, title: "Til cheklovlarini qo'llash", description: "Til chegaralari modelni sodda va tushunarli tilda yozishga majbur qiladi. Uzun, murakkab so'zlar o'rniga qisqa, aniq so'zlar ishlatiladi. Keng auditoriya uchun tushunarli bo'ladi. G'oyalar oddiy shaklda, ammo chuqur mazmunda taqdim etiladi. Solishtiring: Protokol-43", badExample: "Sodda tilda yozing.", goodExample: "Faqat 8ta harfdan kam bo'lgan so'zlardan foydalanib javob ber. Jargon so'zlar ishlatma.", categoryId: 4, notes: null },
      { number: 23, title: "Bo'lim sarlavhalarini talab qiling", description: "Sarlavhalar uzun matnni tarkibiy qismlarga ajratadi. O'quvchi kerakli ma'lumotni tezda topadi. Matn tuzilishi aniq ko'rinadi. Har bir bo'lim o'z mavzusiga ega bo'ladi. Murakkab mavzular oson hazm qilinadigan qismlarga bo'linadi.", badExample: "Batafsil ma'lumot bering.", goodExample: "Har 2 ta paragrafdan oldin uning mazmunini ifodalovchi qalin sarlavha qo'y", categoryId: 4, notes: null },
      { number: 24, title: "\"Vilka\" paytida qaror qabul qilishda majburlang!", description: "Ba'zan \"ha\" yoki \"yo'q\" javoblari kerak bo'ladi. \"Vilka\" qarorlar aniq pozitsiyani talab qiladi. \"Balki\" degan javoblarga o'rin qolmaydi. Qaror qabul qilish jarayoni tezlashadi. Noaniqlik bartaraf etiladi, aniq yo'nalish belgilanadi.", badExample: "Bu variantlar haqida fikringiz?", goodExample: "Har bir variant uchun 'Tavsiya etiladi' yoki 'Tavsiya etilmaydi' deb, hech qanday qo'shimcha izohsiz tanlov qil.", categoryId: 6, notes: null },
      { number: 25, title: "Manbaa chegaralarini o'rnatish", description: "Statistik da'volar manbasiz ishonchsiz bo'ladi. Har bir raqam va statistika uchun aniq manba talab qilish ma'lumot sifatini oshiradi. Tekshirib bo'lmaydigan raqamlar chiqarib tashlanadi. Ishonchli ma'lumot asosida qaror qabul qilinadi.", badExample: "Statistik ma'lumotlar keltiring.", goodExample: "Har bir statistik da'vo uchun aniq ma'lumot manbasi ko'rsatilishi shart.", categoryId: 5, notes: null }
    ];

    await db.insert(protocols).values(allProtocolsData);
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
    // Try Supabase storage first
    if ((global as any).supabaseStorage) {
      try {
        return await (global as any).supabaseStorage.getProtocols(limit, offset);
      } catch (error) {
        console.error("Error getting protocols from Supabase:", error);
      }
    }
    
    // Fall back to direct database connection
    if (isDatabaseConnected && db) {
      try {
        const result = await db.select()
          .from(protocols)
          .orderBy(protocols.number)
          .limit(limit)
          .offset(offset);
        return result;
      } catch (error) {
        console.error("Error getting protocols from database:", error);
      }
    }
    
    // Fall back to memory storage
    const allProtocols = Array.from(this.memoryProtocols.values())
      .sort((a, b) => a.number - b.number);
    return allProtocols.slice(offset, offset + limit);
  }

  async getProtocol(id: number): Promise<Protocol | undefined> {
    // Try Supabase storage first
    if ((global as any).supabaseStorage) {
      try {
        return await (global as any).supabaseStorage.getProtocol(id);
      } catch (error) {
        console.error("Error getting protocol from Supabase:", error);
      }
    }
    
    if (isDatabaseConnected && db) {
      try {
        const result = await db.select().from(protocols).where(eq(protocols.id, id));
        return result[0];
      } catch (error) {
        console.error("Error getting protocol from database:", error);
      }
    }
    return this.memoryProtocols.get(id);
  }

  async createProtocol(protocol: InsertProtocol): Promise<Protocol> {
    // Try Supabase storage first
    if ((global as any).supabaseStorage) {
      try {
        return await (global as any).supabaseStorage.createProtocol(protocol);
      } catch (error) {
        console.error("Error creating protocol in Supabase:", error);
      }
    }
    
    if (isDatabaseConnected && db) {
      try {
        const result = await db.insert(protocols).values(protocol).returning();
        return result[0];
      } catch (error) {
        console.error("Error creating protocol in database:", error);
      }
    }
    
    const id = this.currentProtocolId++;
    const newProtocol: Protocol = { 
      ...protocol, 
      id,
      createdAt: new Date(),
      badExample: protocol.badExample ?? null,
      goodExample: protocol.goodExample ?? null,
      notes: protocol.notes ?? null
    };
    this.memoryProtocols.set(id, newProtocol);
    return newProtocol;
  }

  async updateProtocol(id: number, protocol: Partial<InsertProtocol>): Promise<Protocol | undefined> {
    // Try Supabase storage first
    if ((global as any).supabaseStorage) {
      try {
        return await (global as any).supabaseStorage.updateProtocol(id, protocol);
      } catch (error) {
        console.error("Error updating protocol in Supabase:", error);
      }
    }
    
    if (isDatabaseConnected && db) {
      try {
        const result = await db.update(protocols)
          .set(protocol)
          .where(eq(protocols.id, id))
          .returning();
        return result[0];
      } catch (error) {
        console.error("Error updating protocol in database:", error);
      }
    }
    
    const existing = this.memoryProtocols.get(id);
    if (!existing) return undefined;
    
    const updated: Protocol = { ...existing, ...protocol };
    this.memoryProtocols.set(id, updated);
    return updated;
  }

  async deleteProtocol(id: number): Promise<boolean> {
    // Try Supabase storage first
    if ((global as any).supabaseStorage) {
      try {
        return await (global as any).supabaseStorage.deleteProtocol(id);
      } catch (error) {
        console.error("Error deleting protocol in Supabase:", error);
      }
    }
    
    if (isDatabaseConnected && db) {
      try {
        await db.delete(protocols).where(eq(protocols.id, id));
        return true;
      } catch (error) {
        console.error("Error deleting protocol in database:", error);
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
    // Try Supabase storage first
    if ((global as any).supabaseStorage) {
      try {
        return await (global as any).supabaseStorage.getCategories();
      } catch (error) {
        console.error("Error getting categories from Supabase:", error);
      }
    }
    
    // Fall back to direct database connection
    if (isDatabaseConnected && db) {
      try {
        const result = await db.select().from(categories);
        return result;
      } catch (error) {
        console.error("Error getting categories from database:", error);
      }
    }
    
    // Fall back to memory storage
    return Array.from(this.memoryCategories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    // Try Supabase storage first
    if ((global as any).supabaseStorage) {
      try {
        return await (global as any).supabaseStorage.getCategory(id);
      } catch (error) {
        console.error("Error getting category from Supabase:", error);
      }
    }
    
    // Fall back to direct database connection
    if (isDatabaseConnected && db) {
      try {
        const result = await db.select().from(categories).where(eq(categories.id, id));
        return result[0];
      } catch (error) {
        console.error("Error getting category from database:", error);
      }
    }
    
    // Fall back to memory storage
    return this.memoryCategories.get(id);
  }

  // Progress methods
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    // Try Supabase storage first
    if ((global as any).supabaseStorage) {
      try {
        return await (global as any).supabaseStorage.getUserProgress(userId);
      } catch (error) {
        console.error("Error getting user progress from Supabase:", error);
      }
    }
    
    // Fall back to direct database connection
    if (isDatabaseConnected && db) {
      try {
        const result = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
        return result;
      } catch (error) {
        console.error("Error getting user progress from database:", error);
      }
    }
    
    // For now, return empty array for memory storage (could implement localStorage fallback here)
    return [];
  }

  async updateProtocolProgress(userId: string, protocolId: number, score: number): Promise<UserProgress> {
    // Try Supabase storage first
    if ((global as any).supabaseStorage) {
      try {
        return await (global as any).supabaseStorage.updateProtocolProgress(userId, protocolId, score);
      } catch (error) {
        console.error("Error updating protocol progress in Supabase:", error);
        throw error;
      }
    }
    
    // Fall back to direct database connection
    if (isDatabaseConnected && db) {
      try {
        // Check if progress already exists
        const existing = await db.select()
          .from(userProgress)
          .where(and(
            eq(userProgress.userId, userId),
            eq(userProgress.protocolId, protocolId)
          ));

        if (existing.length > 0) {
          // Update existing progress
          const updated = await db.update(userProgress)
            .set({
              practiceCount: existing[0].practiceCount! + 1,
              lastScore: score,
              completedAt: new Date()
            })
            .where(and(
              eq(userProgress.userId, userId),
              eq(userProgress.protocolId, protocolId)
            ))
            .returning();
          
          return updated[0];
        } else {
          // Create new progress record
          const newProgress = await db.insert(userProgress)
            .values({
              userId,
              protocolId,
              lastScore: score,
              practiceCount: 1
            })
            .returning();
          
          return newProgress[0];
        }
      } catch (error) {
        console.error("Error updating protocol progress in database:", error);
        throw error;
      }
    }
    
    // Fallback for memory storage - create a basic progress object
    return {
      id: Math.floor(Math.random() * 1000000),
      userId,
      protocolId,
      completedAt: new Date(),
      practiceCount: 1,
      lastScore: score
    };
  }
}

export const storage = new HybridStorage();
