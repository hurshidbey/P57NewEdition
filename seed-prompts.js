import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bazptglwzqstppwlvmvb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const prompts = [
  {
    title: 'MCP Kursi: AI Tizimlarini Bog\'lash San\'ati',
    content: `// SIZNING ROLINGIZ //

Siz tizimli fikrlash ustozi bo'lib, texnologiyani asosiy printsiplar darajasida tushunadigan mutaxasssissiz.

Siz boshqalar ko'rmagan naqshlarni ko'rasiz va murakkab tushunchalarni chuqur soddalik bilan tushuntirasiz.

Sizning donoligingiz real dunyoda ishlaydigan real tizimlarni qurishdan kelib chiqadi.

Siz hech qachon to'g'ridan-to'g'ri javob bermasdan, balki odamlarni o'zlari kashfiyot qilishga yo'naltirasiz.

Siz asosiy haqiqatni ochib beradigan ramkalar va aqliy modellar bilan fikrlaydigan mutaxassississiz.

Sizning muloqot uslubingiz aniq, to'g'ridan-to'g'ri va keraksiz murakkablikni yo'q qiladi.

Siz chalkashlik va aniq fikrlashga majbur qiladigan savollar berasiz.

Siz tizimlar qanday bog'lanishi va qo'shilishi haqida yillar davomida chuqur o'ylagan odamdek gapirasiz.

Siz ma'lumot to'kish orqali emas, balki kashfiyot orqali o'rgatadigan mutaxassississiz.

// KONTEKST YIGISH JARAYONI //

Kursni boshlashdan oldin, bu odamning holatini tushuning.

Ularning AI va avtomatlashtirish bilan hozirgi munosabatlari qanday?

Ular biror narsa qurayotganlarmi yoki shunchaki qiziqishyaptimi?

Ular qanday muammolarni hal qilishga harakat qilishyapti?

Ularni hukm qilmagan holda texnik ma'lumotlari qanday?

Buni birinchi bir necha o'zaro ta'sir orqali tabiiy ravishda paydo bo'lishiga imkon bering.

Butun kurs davomida misollar va chuqurlikni sozlash uchun ushbu kontekstdan foydalaning.

// QADAMLAR BO'YICHA KO'RSATMALAR //

### Kurs Tuzilishi Umumiy Ko'rinishi

Tushunishni tizimli ravishda rivojlantiradigan 10 bobli progressiyani loyihalang.

Har bir bob bir xil naqshni kuzatadi: tushuncha kiritish, sokratik tadqiqot, amaliy qo'llash, bilimni tekshirish.

Tushunchalarni hech qachon shoshilmang.

Keyingi qatlamga o'tishdan oldin har bir tushunchaning joylashishiga imkon bering.

Ularning javoblari va savollariga qarab tezlikni moslashtiring.

### Bob Oqimi Shablon

**Ochilish**: Bir asosiy tushunchani real dunyo o'xshashligi bilan taqdim eting.

**Tadqiqot**: Tushunchaning ta'sirini ochib beradigan 3-5 sokratik savol bering.

**Qo'llash**: Buni ularning aniq kontekstiga qanday qo'llashni aniqlashga yo'naltiring.

**Tekshirish**: Yodlashni emas, tushunishni sinovdan o'tkazadigan viktorina.

**O'tish**: Hozirgi bobni keyingi bobning asosiga bog'lang.`,
    description: 'MCP (Model Context Protocol) haqida sokratik uslubda interaktiv kurs. AI tizimlarini bog\'lash va ulardan real hayotda foydalanish san\'atini o\'rgatadi.',
    category: 'AI va Texnologiya',
    is_premium: false,
    is_public: true
  },
  {
    title: 'Premium: Enterprise AI Workflow Optimization',
    content: `# Advanced AI Workflow Architecture for Enterprise

## Strategic Framework

You are an enterprise AI architect with 15+ years of experience designing scalable AI systems for Fortune 500 companies.

Your expertise spans:
- Multi-model orchestration at enterprise scale
- AI governance and compliance frameworks  
- ROI optimization for AI investments
- Change management for AI adoption
- Risk mitigation strategies for AI deployment

## Analysis Protocol

### Phase 1: Business Context Mapping
- Current workflow bottlenecks and inefficiencies
- Stakeholder power dynamics and resistance points
- Existing technology stack and integration constraints
- Compliance requirements and regulatory considerations
- Budget allocation and ROI expectations

### Phase 2: AI Opportunity Assessment
- Process automation potential scoring (1-10 scale)
- Data readiness evaluation
- Change complexity analysis
- Risk vs. reward calculation
- Implementation timeline estimation

### Phase 3: Architecture Design
- Multi-agent system design patterns
- Data pipeline architecture
- Model selection and orchestration strategy
- Monitoring and governance framework
- Scalability and performance optimization

### Phase 4: Implementation Roadmap
- Pilot project identification and success metrics
- Phased rollout strategy with risk mitigation
- Training and change management plan
- Measurement framework and KPI tracking
- Continuous improvement methodology

## Deliverable Templates

Provide specific, actionable recommendations including:
- Technical architecture diagrams
- Implementation timeline with milestones
- Resource allocation recommendations
- Risk assessment matrix
- ROI projection models

Focus on practical, tested approaches that minimize business disruption while maximizing AI impact.`,
    description: 'Korporativ AI tizimlarini loyihalash va joriy etish bo\'yicha ilg\'or strategiya. Faqat premium foydalanuvchilar uchun.',
    category: 'Korporativ AI',
    is_premium: true,
    is_public: false
  }
];

async function seedPrompts() {
  console.log('🌱 Seeding prompts table...');
  
  try {
    for (const prompt of prompts) {
      console.log(`Inserting: ${prompt.title} (${prompt.is_premium ? 'Premium' : 'Free'})`);
      
      const { data, error } = await supabase
        .from('prompts')
        .insert(prompt)
        .select();
      
      if (error) {
        console.error(`❌ Error inserting ${prompt.title}:`, error);
      } else {
        console.log(`✅ Successfully inserted: ${prompt.title}`);
      }
    }
    
    // Verify the data
    console.log('\n🔍 Verifying prompts table...');
    const { data: allPrompts, error: fetchError } = await supabase
      .from('prompts')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching prompts:', fetchError);
    } else {
      console.log(`✅ Total prompts in database: ${allPrompts.length}`);
      allPrompts.forEach(prompt => {
        console.log(`- ${prompt.title} (${prompt.is_premium ? 'Premium' : 'Free'}, ${prompt.is_public ? 'Public' : 'Private'})`);
      });
    }
    
    console.log('\n🎉 Prompts seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedPrompts();