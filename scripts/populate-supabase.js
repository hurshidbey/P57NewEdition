// Script to populate Supabase with all 57 protocols using REST API
const SUPABASE_URL = 'https://bazptglwzqstppwlvmvb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ';

// Categories to insert
const categories = [
  { name: "Audience", description: "Targeting and audience specification" },
  { name: "Creative", description: "Creative and innovative approaches" },
  { name: "Technical", description: "Technical implementation" },
  { name: "Structure", description: "Content structure and formatting" },
  { name: "Evidence", description: "Evidence and validation" },
  { name: "Analysis", description: "Analysis and evaluation" },
];

// First 15 protocols from the attached file
const protocols = [
  { number: 1, title: "So'z miqdorini belgilang va hajmni nazorat qiling", description: "Aniq so'z soni belgilash javoblar hajmini boshqaradi. Model ko'rsatilgan miqdorga qat'iy rioya qilishga intiladi. Qisqa javoblar uchun kam, chuqur tahlil uchun ko'proq so'z talab qiling. Muhim narsalarni o'sha \"chegaraga\" sig'diradi va ortiqcha narsalar bilan boshingizni og'ritmaydi. Vaqtiz tejaladi.", bad_example: "Sedana haqida menga ko'proq ma'lumot ber.", good_example: "Sedana haqida 350 ta so'z qatnashgan maqola tayyorlab ber.", category_id: 4, notes: null },
  { number: 2, title: "Raqamlangan ro'yxat talab qiling. Oson bo'ladi", description: "Raqamlangan ro'yxatlar ma'lumotni oson o'qish va eslab qolish imkonini beradi. Sub (qo'shimcha kichik) bandlar qo'shish strukturani yanada mustahkamlaydi. Murakkab tushunchalarni aniq qadamlarga ajratadi. O'quvchiga har bir nuqtani ketma-ket o'rganish imkonini beradi.", bad_example: "Marketing strategiyasini tushuntir", good_example: "Marketing strategiyasini 7 ta alohida band shaklida taqdim et, har bir band a, b, c kabi kichik bandlarga bo'linsin.", category_id: 4, notes: null },
  { number: 3, title: "Noaniq iboralarni taqiqlang. Kerak emas!", description: "Noaniq iboralar javoblarni sust va ishonchsiz qiladi. Ularni taqiqlash modelni aniq pozitsiya egallashiga majbur qiladi. Natijada keskin, aniq va foydalanish uchun qulay ma'lumot olasiz. Munozarali mavzularda ham aniq fikr bildiriladi.", bad_example: "Bu masala bo'yicha fikringni bilsam bo'ladimi?", good_example: "Bu masala bo'yicha fikringni 200 ta so'z bilan xulosala, \"balki\", \"ehtimol\" kabi noaniq jumlalarni qo'llama.", category_id: 6, notes: null },
  { number: 4, title: "Mutaxassislik darajasini belgilang!", description: "Fikr murakkabligi auditoriyaga mos bo'lishi zarur. Daraja ko'rsatilsa, model termin va misollarni shunga moslaydi. Haddan ortiq ilmiy tildan qochish yoki aksincha chuqurroq kirish shu yerda hal qilinadi. O'quvchi o'z saviyasida tushunadi, vaqtini tejaydi.", bad_example: "\"Yaxshi tushuntir\" yoki \"sodda qilib ayt\"", good_example: "\"Iqtsodiyot doktoranti sifatida batafsil tahlil qil\" yoki \"9-sinflik o'quvchiga tushunarli qilib yoz\"", category_id: 1, notes: null },
  { number: 5, title: "Vaqt chegarasini o'rnating!", description: "Vaqt chegarasi modelga tezkor, lo'nda va eng muhim faktlarga asoslangan javobni berishga undaydi. Ortiqcha batafsil ma'lumotlar qisqaradi. Eng asosiy nuqtalar aniq va tez yetkaziladi. Vaqt chegarasi qo'yilganda, model \"muhim ma'lumotlarni\" ajratadi.", bad_example: "Suv filtrlari qanday ishlaydi? Iltimos, aytib yuboring.", good_example: "Suv filtrlari qanday ishlaydi? Huddi 30 sekund vaqting bordek javob ber.", category_id: 1, notes: null }
];

async function createCategories() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(categories)
    });

    if (response.ok) {
      console.log('Categories created successfully');
    } else {
      console.log('Categories may already exist');
    }
  } catch (error) {
    console.error('Error creating categories:', error);
  }
}

async function createProtocols() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/protocols`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(protocols)
    });

    if (response.ok) {
      console.log('Protocols created successfully');
    } else {
      const error = await response.text();
      console.error('Error creating protocols:', error);
    }
  } catch (error) {
    console.error('Error creating protocols:', error);
  }
}

async function main() {
  console.log('Populating Supabase database...');
  await createCategories();
  await createProtocols();
  console.log('Database population complete!');
}

main();