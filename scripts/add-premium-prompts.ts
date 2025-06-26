#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { prompts } from '../shared/schema';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.production') });

// Create database connection
const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

const premiumPrompts = [
  {
    title: "Nuqtai Nazar Piramidasi",
    content: "[Mavzu/soha]ni besh xil nuqtai nazardan ko'rib chiqing: tanqidiy skeptik, optimist innovator, tarixiy tahlilchi, kelajak bashoratchi va butunlay begona kishi. Har bir nuqtai nazar uchun an'anaviy fikrlashga qarshi turadigan 3 ta noyob tushuncha yarating. Keyin bu qarashlarni bitta qarama-qarshi tezisga sintez qiling.",
    description: "Bitta mavzuni 5 xil nuqtai nazardan ko'rib, yangi tushunchalar yaratish texnikasi",
    category: "Strategik Kontent"
  },
  {
    title: "Muammo-Yechim Ko'prigi",
    content: "[Soha/maydon]da ko'pchilik hali tan olmagan yangi muammoni aniqlang. Muammoni hissiy tafsilotlar va emotsional til yordamida tasvirlang. Keyin har biri turli manfaatdor guruhlarni maqsad qilgan uch xil yechim yo'lini teskari muhandislik qiling. Shoshilinch lekin bosim o'tkazmaydigan harakat chaqiruvi bilan yakunlang.",
    description: "Yangi muammolarni topib, turli auditoriyalar uchun yechimlar yaratish",
    category: "Strategik Kontent"
  },
  {
    title: "Metafora Generatori",
    content: "[Sizning sohangiz]dagi murakkab tushunchani tanlab, uni butunlay bog'liq bo'lmagan uch sohadan metaforalar yordamida tushuntiring: oshpazlik, sport va tabiat. Uch metaforani ham birlashtirib, tushunchani esda qolarli va amaliy qiladigan 500 so'zlik maqola yarating.",
    description: "Murakkab tushunchalarni oddiy metaforalar orqali tushuntirish san'ati",
    category: "Strategik Kontent"
  },
  {
    title: "Zaiflik Ilmoqi",
    content: "[Aniq kontekst]da qilgan kasbiy muvaffaqiyatsizlik yoki xatongizni baham ko'ring. Uni quyidagicha tuzilmada bering: Tayyorgarlik (nima bo'lishini o'ylagansiz), Haqiqat (aslida nima bo'ldi), Anglash (nimani o'rgandingiz) va Inqilob (yondashuvingizni qanday o'zgartirdi). O'quvchi ichki ma'lumot olayotganini his qilsin.",
    description: "Muvaffaqiyatsizliklardan hikoya yaratib, ishonch qozonish texnikasi",
    category: "Hikoya va Voqealar"
  },
  {
    title: "Vaqt Mashinasi Seriyasi",
    content: "'5 Yil Oldingi [Rol] O'zimga Aytmoqchi Bo'lgan Narsalar' sarlavhasi ostida maqola yozing. Ilgari bilishni istagan 7 ta aniq, amaliy tushunchani kiriting. Har bir tushuncha uchun bu bilim nima uchun muhimligini ko'rsatadigan mini-hikoya va o'quvchilar darhol qo'llashi mumkin bo'lgan bitta amaliy qadam bering.",
    description: "O'tmishdagi tajribalardan kelajak uchun qimmatli saboqlar olish",
    category: "Hikoya va Voqealar"
  },
  {
    title: "Hujjatli Film Ramkasi",
    content: "Kontentingizni hujjatli film kabi tuzilmalang: Ochilish Ilmoqi (hayratlanarli statistika yoki savol), Ko'tarilish Harakati (muammo atrofida kuchayib borayotgan taranglik), Avj (asosiy tushuncha yoki yechim) va Hal qilish (bu auditoriya uchun nimani anglatadi). Xayoliy mutaxassislar bilan 'intervyu parchalarini' yoki haqiqiy holat tadqiqotlarini kiriting.",
    description: "Kontentni hujjatli film dramaturrgiyasi asosida qurish",
    category: "Hikoya va Voqealar"
  },
  {
    title: "Cheklov Yaratuvchisi",
    content: "[Mavzu] uchun ushbu uchta tasodifiy cheklov bilan g'oyalar yarating: aynan 7 qadamni o'z ichiga olishi kerak, sarlavhada 'E' harfini ishlatmaslik va 1990-yillardan biror narsaga havola qilish. Ba'zida sun'iy cheklovlar eng ijodiy yechimlarni keltirib chiqaradi.",
    description: "Sun'iy cheklovlar orqali ijodkorlikni oshirish texnikasi",
    category: "Ijodiy G'oyalar"
  },
  {
    title: "Aralashma Usuli",
    content: "[Sizning mutaxassislik sohangiz]ni [tasodifiy bog'liq bo'lmagan soha] bilan birlashtiring. Misol: 'Shaxsiy Moliya Professional Kurashdan Nimani O'rganishi Mumkin' yoki 'O'rta Asr Temirchiligidan Marketing Saboqlari'. 5 ta haqiqiy o'xshashlik toping va ularni amaliy maslahatlarga aylantiring.",
    description: "Ikki bog'liq bo'lmagan sohani birlashtirib yangi g'oyalar yaratish",
    category: "Ijodiy G'oyalar"
  },
  {
    title: "Anti-Maslahat Generatori",
    content: "'[Sizning Sohangizda] Mutlaqo Muvaffaqiyatsiz Bo'lish Usullari' - eng yaxshi amaliyotlarni ularning qarama-qarshiligi orqali ochib beradigan satirik qo'llanma yozing. Kulgili lekin ta'limli qiling, shunda o'quvchilar NIMA QILMASLIK kerakligini haddan tashqari ko'rish orqali NIMA QILISH kerakligini o'rgansinlar.",
    description: "Teskari yondashув orqali to'g'ri yo'lni o'rgatish",
    category: "Ijodiy G'oyalar"
  },
  {
    title: "Maxfiy Jamiyat",
    content: "Sohangizda eksklyuziv ichkilar guruhiga murojaat qilayotgandek yozing. 'Siz allaqachon bilasiz...' va 'Ko'pchilik tushunmaydi...' kabi iboralarni ishlating. O'quvchilarni maxsus bilimga ega elita hamjamiyatning bir qismi ekanligini his qildiradigan kontent yarating.",
    description: "Eksklyuzivlik hissi orqali auditoriyani jalb qilish",
    category: "Auditoriya Jalb Qilish"
  },
  {
    title: "Bahs Boshlovchisi",
    content: "Sohangizda keng qabul qilingan e'tiqodni oling va qarama-qarshi pozitsiyani himoya qiling - lekin buni o'ychanlik bilan va dalillar bilan qiling. Uni quyidagicha tuzilmalang: 'Hamma X deydi, lekin mana nima uchun Y to'g'ri bo'lishi mumkin.' Ishontirishga harakat qilishdan ko'ra muhokamani rag'batlantiradigan savollar bilan yakunlang.",
    description: "Fikr-mulohazalarni qo'zg'atuvchi munozarali kontent yaratish",
    category: "Auditoriya Jalb Qilish"
  },
  {
    title: "O'z Sarguzashtingizni Tanla",
    content: "Ko'p yo'lli kontent yarating: 'Agar siz yangi boshlovchi bo'lsangiz, A bo'limini o'qing. Agar o'rta darajada bo'lsangiz, B bo'limga o'ting. Agar ilg'or bo'lsangiz lekin X bilan kurashayotgan bo'lsangiz, C bo'limga o'ting.' Bu o'quvchilarga kontent ular uchun shaxsiylashtirilgandek his qildiradi.",
    description: "Shaxsiylashtirilgan kontent tajribasi yaratish",
    category: "Auditoriya Jalb Qilish"
  },
  {
    title: "Vaqt Sayohatchisining Hisoboti",
    content: "2030 yildan [hozirgi trend/texnologiya]ga qarab turgan kimsa nuqtai nazaridan yozing. Nimani to'g'ri qildik? Nimani butunlay o'tkazib yubordik? Kechikib ko'rib, hech kim ko'rmaganini aniq nima ko'rinadi? Aniq bashoratlar va vaqt jadvallarini ishlating.",
    description: "Kelajak perspektivasidan hozirgi trendlarni tahlil qilish",
    category: "Innovatsiya va Tushuncha"
  },
  {
    title: "Aysberg Tahlili",
    content: "Hamma gaplashadigan yuzaki mavzuni oling va uning ostida yashiringan 90% chuqurlikka sho'ng'ing. Quyidagicha tuzilmalang: 'Hamma Ko'radigan Narsa' (aniq), 'Ichkilar Biladigan' (chuqurroq qatlam) va 'Hech Kim Gapirmaydigan' (poydevor darajasi).",
    description: "Yuzaki mavzularning chuqur qatlamlarini ochib berish",
    category: "Innovatsiya va Tushuncha"
  },
  {
    title: "Kesishma Changlatish Generatori",
    content: "Bir sohada mukammal ishlaydigan yechimni tanlab, uni o'z sohangiz uchun moslang. Misol: Mehmonxona sanoatining mijozlar tajribasiga yondashuvini B2B dasturiy ta'minot qanday o'zgartirishi mumkin? 5 ta aniq, amalga oshirilishi mumkin bo'lgan moslashtirishlarni bering.",
    description: "Boshqa sohalardan innovatsion yechimlarni ko'chirish",
    category: "Innovatsiya va Tushuncha"
  },
  {
    title: "Bashorat Portfeli",
    content: "Keyingi 18 oy uchun sohangiz haqida 10 ta aniq bashorat qiling. Vaqt jadvallari, ko'rsatkichlar va mantiqni kiriting. Bashoratlaringizni ochiq ko'rib chiqing va baholang - bu to'g'ri yoki noto'g'ri ekanligingizdan qat'i nazar, ishonchlilikni oshiradi, chunki oldinga o'ylayotganingizni ko'rsatadi.",
    description: "Aniq bashoratlar orqali ekspertlik va ishonch qurish",
    category: "Obro' Qurish"
  },
  {
    title: "Afsona Buzuvchisi",
    content: "Sohangizda 5 ta 'umumiy bilim' e'tiqodini aniqlang va ularni ma'lumotlar, misollar yoki mantiq bilan muntazam ravishda rad eting. Har birini quyidagicha tuzilmalang: 'Afsona', 'Nima uchun Odamlar Bunga Ishonishadi', 'Haqiqat' va 'Buning O'rniga Nima Qilish Kerak'. Hamma narsani manbalar bilan tasdiqlang.",
    description: "Noto'g'ri e'tiqodlarni buzib, haqiqatni ochib berish",
    category: "Obro' Qurish"
  },
  {
    title: "Sahna Ortidagi Fosh Qilish",
    content: "Sohangizda oson ko'rinadigan narsaning noqulay haqiqatini fosh qiling. Tartibsiz jarayon, muvaffaqiyatsizliklar, takrorlashlarni ko'rsating. Odamlar haqiqiylikka chanqoq va jilolangan natijalar ortida haqiqatan nima sodir bo'lishidan qiziqishadi.",
    description: "Jarayonning haqiqiy, tartibsiz tomonlarini ko'rsatish orqali ishonch qozonish",
    category: "Obro' Qurish"
  },
  {
    title: "Ramka Fabrikasi",
    content: "[Sohangizda aniq muammo] uchun original ramka yoki tizim yarating. Unga esda qolarli nom bering va uni 3-5 ta aniq qadam yoki komponent bilan tuzilmalang. Siz yoki boshqa kimsa ushbu ramkani muvaffaqiyatli qo'llagan haqiqiy misolni kiriting.",
    description: "Muammolarni hal qilish uchun o'z ramkangizni yaratish",
    category: "Tizimli Fikrlash"
  },
  {
    title: "Resurs Arxeologiyasi",
    content: "'Unutilgan marvaridlar'ni qazib chiqing va yig'ing - sohangizdan 5-10 yil oldin mashhur bo'lgan, lekin e'tibordan chetda qolgan qimmatli resurslar, vositalar yoki g'oyalar. Ular nima uchun hali ham dolzarb ekanligini va ularni joriy muammolarga qanday qo'llash mumkinligini tushuntiring. Ba'zida eng yaxshi 'yangi' g'oyalar qayta kashf etilgan eski g'oyalardir.",
    description: "Eski lekin qimmatli g'oyalarni qayta kashf etish va yangilash",
    category: "Tizimli Fikrlash"
  }
];

async function addPremiumPrompts() {
  try {
    console.log('🚀 Adding premium prompts to database...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const prompt of premiumPrompts) {
      try {
        const newPrompt = {
          title: `Premium: ${prompt.title}`,
          content: prompt.content,
          description: `${prompt.description} (Faqat premium foydalanuvchilar uchun)`,
          category: prompt.category,
          isPremium: true,
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await db.insert(prompts).values(newPrompt);
        console.log(`✅ Added: ${prompt.title}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to add "${prompt.title}":`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully added: ${successCount} prompts`);
    console.log(`❌ Failed: ${errorCount} prompts`);
    console.log(`\n🎉 Premium prompts have been added to the database!`);
    
  } catch (error) {
    console.error('❌ Critical error:', error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

addPremiumPrompts();