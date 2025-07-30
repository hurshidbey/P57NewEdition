import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.production') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const enhancedDescriptions = [
  { id: 1, description: "OpenAI kompaniyasining eng mashhur AI chatboti. Savollaringizga javob beradi, matn yozadi, kod yaratadi, tarjima qiladi va ko'plab boshqa vazifalarni bajaradi. GPT-4 modeli bilan ishlaydi." },
  { id: 2, description: "Anthropic kompaniyasining kuchli AI assistenti. Katta hajmli hujjatlar bilan ishlash, murakkab tahlillar va uzoq muloqotlar uchun juda mos. 100K tokengacha kontekstni eslaydi." },
  { id: 3, description: "Discord orqali ishlaydigan san'at yaratuvchi AI. Matnli tavsiflardan professional darajadagi rasmlar, illyustratsiyalar va san'at asarlarini yaratadi. Kreativ loyihalar uchun ajoyib." },
  { id: 4, description: "OpenAI'ning rasm generatsiya qiluvchi modeli. Oddiy matndan fotorealistik rasmlar, logotiplar, illyustratsiyalar yaratadi. DALL-E 3 versiyasi ChatGPT Plus'da mavjud." },
  { id: 5, description: "Ochiq kodli rasm generatsiya modeli. Bepul va kompyuteringizda o'rnatib ishlatish mumkin. Turli xil uslublar va imkoniyatlarga ega. Professional dizaynerlar ko'p foydalanadi." },
  { id: 6, description: "Google'ning multimodal AI modeli. Matn, rasm, video va audio bilan ishlaydi. Turli formatdagi ma'lumotlarni tahlil qilish va kontent yaratish uchun kuchli vosita." },
  { id: 7, description: "Dasturchilar uchun AI juftlik dasturchisi. Kodingizni avtomatik to'ldiradi, xatolarni topadi, funksiyalar yozadi. VS Code, JetBrains va boshqa IDE'larda ishlaydi." },
  { id: 8, description: "Marketing kontent yaratish uchun maxsus AI. Blog postlar, reklama matnlari, email kampaniyalar, ijtimoiy tarmoq postlarini professional darajada yozadi." },
  { id: 9, description: "AI avatarlar bilan professional videolar yaratish. 140+ tilda, 160+ AI avatar bilan. Korporativ treninglar, marketing videolari va ta'lim kontenti uchun ideal." },
  { id: 10, description: "Matn yoki rasmdan kinematik sifatli videolar yaratuvchi AI. Reklama roliklari, qisqa filmlar va kreativ videolar uchun. Professional video editorlar foydalanadigan vosita." },
  { id: 11, description: "Tez va oson animatsion videolar yaratish uchun. Ijtimoiy tarmoqlar uchun qisqa videolar, meme'lar va kreativ kontent yaratishda juda qulay. Discord orqali ishlaydi." },
  { id: 12, description: "Eng tabiiy ovozli TTS (text-to-speech) servisi. Kitoblar, podkastlar, videolar uchun professional ovoz yaratish. O'zbek tilidagi ovozlar ham mavjud." },
  { id: 13, description: "Uchrashuvlarni avtomatik yozib oladi va transkript qiladi. Zoom, Google Meet, Teams bilan integratsiya. Muhim fikrlarni ajratib beradi, xulosa chiqaradi." },
  { id: 14, description: "Real vaqtda transkriptsiya va yozuvlarni boshqarish. Talabalar, jurnalistlar va biznes uchrashuvlari uchun juda foydali. Mobil ilovasi ham bor." },
  { id: 15, description: "Notion ilovasiga o'rnatilgan AI yordamchi. Matn yozish, xulosa chiqarish, g'oyalar generatsiya qilish, ma'lumotlarni tartibga solishda yordam beradi." },
  { id: 16, description: "AI yordamida professional taqdimotlar yaratish. Bir necha daqiqada to'liq dizayn qilingan slaydlar tayyorlaydi. Startaplar va biznes taqdimotlari uchun ajoyib." },
  { id: 17, description: "Canva'ning AI funksiyalari to'plami. Bir necha soniyada dizaynlar, bannerlar, postlar yaratadi. Shablonlar asosida professional natijalar beradi." },
  { id: 18, description: "Grammatika va imlo xatolarini tekshiruvchi AI. Ingliz tilida yozishda yordam beradi, uslubni yaxshilaydi. Premium versiyada plagiat tekshiruvi ham bor." },
  { id: 19, description: "Matnlarni qayta yozish va parafraz qilish uchun. Akademik ishlar, maqolalar va turli matnlarni o'zgartirish, qisqartirish yoki kengaytirishda foydali." },
  { id: 20, description: "Professional darajadagi tarjimon AI. 30+ tilni qo'llab-quvvatlaydi. Google Translate'dan aniqroq, ayniqsa murakkab matnlar va texnik hujjatlar uchun." },
  { id: 21, description: "Internet qidiruv + AI chatbot kombinatsiyasi. Har bir javobga manbalar ko'rsatiladi. Dolzarb ma'lumotlar va yangiliklar bo'yicha savollar uchun eng yaxshi tanlov." },
  { id: 22, description: "Replit kod muharriri ichidagi AI yordamchi. Kod yozish, debug qilish, tushuntirish va o'rgatishda yordam beradi. Yangi boshlovchilar uchun juda foydali." },
  { id: 23, description: "Figma dizayn dasturining AI imkoniyatlari. Avtomatik layout, rang sxemalari, komponentlar yaratish. UI/UX dizaynerlar uchun vaqtni tejovchi vosita." },
  { id: 24, description: "No-code veb-sayt yaratish + AI dizayner. Professional ko'rinishdagi saytlarni kod yozmasdan yaratish. Startup va shaxsiy loyihalar uchun ideal." },
  { id: 25, description: "Adobe Creative Cloud'ning AI vositalari. Photoshop, Illustrator va boshqa dasturlarda AI yordamida kontent yaratish va tahrirlash imkoniyatlari." },
  { id: 26, description: "Microsoft'ning bepul dizayn vositasi. PowerPoint taqdimotlari, ijtimoiy media postlari, flyerlar va boshqa vizual kontent yaratish uchun AI yordamchi." },
  { id: 27, description: "Stable Diffusion'ning rasmiy web interfeysi. Professional sifatli rasmlar yaratish, har xil uslublar va sozlamalar. Kredit tizimi bilan ishlaydi." },
  { id: 28, description: "O'yin va konsept art uchun maxsus AI. Karakterlar, landshaftlar, teksturalar yaratish. Game developerlar va 3D artistlar uchun mo'ljallangan." },
  { id: 29, description: "Past sifatli rasmlarni yuqori sifatga o'tkazish. Eski fotosuratlar, kichik rasmlarni 8x gacha kattalashtirish. E-commerce va media uchun foydali." },
  { id: 30, description: "Bir klikda rasm fonini professional tarzda o'chirish. Mahsulot fotosuratlari, profil rasmlari va dizayn ishlari uchun. API ham mavjud." },
  { id: 31, description: "Rasmdagi keraksiz obyektlarni olib tashlash. Fotosuratlardagi odamlar, matn, logo va boshqa elementlarni toza o'chirish. Bepul va tez." },
  { id: 32, description: "No-code web scraping va monitoring vositasi. Veb-saytlardan avtomatik ma'lumot yig'ish, narxlarni kuzatish, yangilanishlarni tekshirish uchun." },
  { id: 33, description: "Uzun videolardan eng yaxshi momentlarni ajratib, qisqa kliplar yaratish. YouTube, TikTok, Instagram Reels uchun kontent optimizatsiyasi." },
  { id: 34, description: "Podkast va uzun videolardan viralga chiqadigan qisqa kliplar yaratish. Avtomatik subtitrlash, emoji va effektlar qo'shish imkoniyatlari." },
  { id: 35, description: "Matndan to'liq musiqiy asarlar yaratuvchi AI. Har xil janr va uslublarda original musiqa generatsiya qiladi. Mualliflik huquqi muammosiz." },
  { id: 36, description: "Professional sifatli vokal va musiqalar yaratish. Qo'shiq so'zlari kiritib, to'liq tayyorlangan trek olish mumkin. Tijorat maqsadlarida foydalanish mumkin." },
  { id: 37, description: "Royalty-free fon musiqalari yaratish. Video, podkast va prezentatsiyalar uchun moslashtirilgan musiqalar. Export qilish va tahrirlash imkoniyatlari." },
  { id: 38, description: "Professional ovoz yozish va dublyaj uchun AI. 120+ ovoz, 20+ til. E-learning, audiokitoblar va marketing videolari uchun ideal." },
  { id: 39, description: "Oddiy va arzon narxdagi text-to-speech vositasi. Bir martalik to'lov, cheksiz foydalanish. YouTube videolari va oddiy loyihalar uchun mos." },
  { id: 40, description: "PDF fayllar bilan chat qilish imkoniyati. Kitoblar, ilmiy maqolalar, hisobotlarni yuklang va savol bering. Talabalar va tadqiqotchilar uchun foydali." },
  { id: 41, description: "Ilmiy maqolalar bilan ishlash uchun maxsus AI. Maqolalarni tushuntirish, taqqoslash, xulosa chiqarish. Akademik tadqiqotlar uchun kuchli vosita." },
  { id: 42, description: "Ilmiy adabiyotlarni qidirish va tahlil qilish. Tadqiqot savollari asosida tegishli maqolalarni topish va xulosa chiqarish. PhD va magistrlar uchun." },
  { id: 43, description: "Professional mahsulot fotosuratlari yaratish. Fon o'zgartirish, rang sozlash, brending qo'shish. E-commerce va marketing uchun vaqt tejovchi." },
  { id: 44, description: "Real vaqtda ovoz o'zgartirish va klonlash. O'yin, streaming va kontent yaratish uchun. Mashhur personajlar ovozlari ham mavjud." },
  { id: 45, description: "AI bilan professional ko'rinishdagi taqdimotlar. Kontent asosida avtomatik dizayn tanlaydi. Korporativ va ta'lim taqdimotlari uchun ideal." },
  { id: 46, description: "Yangi formatdagi taqdimot va hujjatlar yaratish. AI yordamida interaktiv, web-based prezentatsiyalar. Notion va Google Docs o'rtasidagi gibrid." },
  { id: 47, description: "Kompaniya ichki bilimlarini boshqarish uchun AI. Hujjatlar, wiki va ma'lumotlar bazasidan tez qidiruv. Jamoaviy ish uchun optimallashtirilgan." },
  { id: 48, description: "Vizual chatbot va ovozli assistent yaratish platformasi. Kod yozmasdan murakkab dialog tizimlarini qurish. Customer support avtomatlashtirish uchun." },
  { id: 49, description: "Biznes jarayonlarini avtomatlashtirish + AI integratsiyasi. 400+ xizmat bilan bog'lanish, ChatGPT va boshqa AI'larni workflow'ga qo'shish mumkin." },
  { id: 50, description: "Google'ning eksperimental AI tadqiqot vositasi. Sizning hujjatlaringiz asosida o'rgangan shaxsiy AI assistent. Audio suhbatlar ham qo'llab-quvvatlanadi." }
];

async function updateDescriptions() {
  console.log('🔄 Updating AI tool descriptions...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const tool of enhancedDescriptions) {
    try {
      const { data, error } = await supabase
        .from('ai_tools')
        .update({ description: tool.description })
        .eq('id', tool.id);
      
      if (error) {
        console.error(`❌ Failed to update tool ${tool.id}:`, error);
        errorCount++;
      } else {
        console.log(`✅ Updated tool ${tool.id}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error updating tool ${tool.id}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Update complete:`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
}

updateDescriptions().catch(console.error);