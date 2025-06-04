import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://bazptglwzqstppwlvmvb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ";

const supabase = createClient(supabaseUrl, supabaseKey);

// Complete protocol data with full descriptions
const completeProtocols = [
  {
    number: 1,
    title: "So'z miqdorini belgilang va hajmni nazorat qiling",
    description: "Aniq so'z soni belgilash javoblar hajmini boshqaradi. Model ko'rsatilgan miqdorga qat'iy rioya qilishga intiladi. Qisqa javoblar uchun kam, chuqur tahlil uchun ko'proq so'z talab qiling. Muhim narsalarni o'sha \"chegaraga\" sig'diradi va ortiqcha narsalar bilan boshingizni og'ritmaydi. Vaqtiz tejaladi."
  },
  {
    number: 5,
    title: "Vaqt chegarasini o'rnating!",
    description: "Vaqt chegarasi modelga tezkor, lo'nda va eng muhim faktlarga asoslangan javobni berishga undaydi. Ortiqcha batafsil ma'lumotlar qisqaradi. Eng asosiy nuqtalar aniq va tez yetkaziladi. Vaqt chegarasi qo'yilganda, model \"muhim ma'lumotlarni\" ajratadi."
  },
  {
    number: 14,
    title: "Turli kasblarni birlashtiring!",
    description: "Turli soha vakillari bir muammoni ko'rishda o'ziga xos nuqtai nazarga ega. Ularni birlashtirish super yechimlar beradi. Masalan, \"harbiy strateg sifatida\" va \"psixolog sifatida\" ko'rish. Ikkala soha bilimlarini birlashtirib, yangi yondashuvlar paydo bo'ladi. (9-protokol bilan solishtiring)"
  },
  {
    number: 27,
    title: "Qarama-qarshi fikr (Devil's Advocate) metodini qo'llang",
    description: "Har qanday g'oyaga qarshi argumentlarni topish g'oyani mustahkamlaydi yoki zaifliklarini ochadi. Model sizning fikringa qarshi turishi mumkin bo'lgan eng kuchli argumentlarni keltiradi. Bu bir tomonlama qarashdan qochishga yordam beradi, qarorlarni chuqurroq asoslaydi."
  },
  {
    number: 30,
    title: "Javoblardan darrov qoniqmang",
    description: "Birinchi javob ko'pincha eng yaxshi javob emas. \"Yaxshi, endi boshqa yondashuv ham bor\" degan so'z bilan modelni yangi g'oyalar izlashga undash mumkin. Bu takrorlashlardan qochadi, yangi perspektivalar ochadi. Ijodiy yechimlar paydo bo'ladi."
  },
  {
    number: 35,
    title: "Rol almashtirishni qo'llang",
    description: "Muammoni turli odamlar nuqtai nazaridan ko'rish yangi yechimlar beradi. \"Men mijoz bo'lsam\", \"Men raqib bo'lsam\", \"Men yangi xodim bo'lsam\" kabi iboralar bilan boshqa pozitsiyalarni sinab ko'ring. Har xil qarashlar yangi g'oyalar beradi."
  },
  {
    number: 37,
    title: "Super-Kreativlikni yoqing",
    description: "Ba'zan oddiy yechimlar yetarli emas, g'ayrioddiy g'oyalar kerak. \"Eng noodatiy\", \"eng ajoyib\", \"eng kulgili\" kabi so'zlar modelni ijodiy fikrlashga undaydi. Shunday qilib, odatiy doiradan chiqib, yangi imkoniyatlar ochiladi. Innovatsion yechimlar paydo bo'ladi."
  },
  {
    number: 49,
    title: "O'zlik nisbatidan foydalaning",
    description: "\"Men o'zimni [rol]da tasavvur qilaman\" yoki \"Men o'zimga [savol] so'rayman\" kabi iboralar modelni shaxsiy tajriba bilan bog'lashga undaydi. Bu javoblarni yanada real va amaliy qiladi. Shaxsiy yondashuv chuqurroq tahlil beradi."
  },
  {
    number: 56,
    title: "Ehtimollikni % da so'rang",
    description: "Taxminlar va bashoratlar uchun aniq foizli raqamlar so'rang. \"Bu g'oyaning muvaffaqiyat ehtimoli qancha %?\" yoki \"Bu voqea sodir bo'lish imkoniyati necha %?\" Raqamli baholash muammolarni aniqroq ko'rishga yordam beradi. Qarorlar ishonchli asoslarga ega bo'ladi."
  }
];

async function restoreCompleteData() {
  console.log('Restoring complete protocol data...');
  
  for (const protocol of completeProtocols) {
    try {
      const { error } = await supabase
        .from('protocols')
        .update({
          title: protocol.title,
          description: protocol.description
        })
        .eq('number', protocol.number);
        
      if (error) {
        console.error(`Error updating protocol ${protocol.number}:`, error);
      } else {
        console.log(`✓ Restored protocol ${protocol.number}: ${protocol.title}`);
      }
    } catch (err) {
      console.error(`Exception updating protocol ${protocol.number}:`, err);
    }
  }
  
  console.log('Data restoration completed!');
}

restoreCompleteData();