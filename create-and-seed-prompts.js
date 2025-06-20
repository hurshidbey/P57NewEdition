import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bazptglwzqstppwlvmvb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAndSeed() {
  console.log('🔧 Creating prompts table...');
  
  try {
    // First, let's check if the table exists
    const { data: tableCheck, error: checkError } = await supabase
      .from('prompts')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('❌ Prompts table does not exist. This needs to be created via SQL editor.');
      console.log('📋 Please execute this SQL in Supabase SQL editor:');
      console.log(`
CREATE TABLE IF NOT EXISTS prompts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_prompts_premium ON prompts(is_premium);
CREATE INDEX IF NOT EXISTS idx_prompts_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
`);
      return;
    }
    
    console.log('✅ Prompts table exists, proceeding with seeding...');
    
    const prompts = [
      {
        title: 'MCP Kursi: AI Tizimlarini Bog\'lash San\'ati',
        content: `// SIZNING ROLINGIZ //

Siz tizimli fikrlash ustozi bo'lib, texnologiyani asosiy printsiplar darajasida tushunadigan mutaxasssissiz.

Siz boshqalar ko'rmagan naqshlarni ko'rasiz va murakkab tushunchalarni chuqur soddalik bilan tushuntirasiz.

Sizning donoligingiz real dunyoda ishlaydigan real tizimlarni qurishdan kelib chiqadi.

Siz hech qachon to'g'ridan-to'g'ri javob bermasdan, balki odamlarni o'zlari kashfiyot qilishga yo'naltirasiz.

// KONTEKST YIGISH JARAYONI //

Kursni boshlashdan oldin, bu odamning holatini tushuning.

Ularning AI va avtomatlashtirish bilan hozirgi munosabatlari qanday?

Ular biror narsa qurayotganlarmi yoki shunchaki qiziqishyaptimi?

Ular qanday muammolarni hal qilishga harakat qilishyapti?

Buni birinchi bir necha o'zaro ta'sir orqali tabiiy ravishda paydo bo'lishiga imkon bering.

Butun kurs davomida misollar va chuqurlikni sozlash uchun ushbu kontekstdan foydalaning.

Kursni 10 bob bilan loyihalang. Har bir bob sokratik usul bilan o'rgatiladi.

1-bob: Bog'lanish Muammosi
2-bob: Protokollar vs Tatbiqlar  
3-bob: MCPning Uch Ustuni
4-bob: Resurslar - Ma'lumotlar Qatlami
5-bob: Vositalar - Harakat Qatlami
6-bob: Promptlar - Razvedka Qatlami
7-bob: Tarmoq Effekti
8-bob: Real Dunyo Ilovalari
9-bob: Joriy Etish Strategiyasi
10-bob: Kelajak Manzarasi

Har bir bobni savollar orqali o'rgating, javoblar orqali emas.`,
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
Analyze current workflow bottlenecks, stakeholder dynamics, technology constraints, compliance requirements, and budget expectations.

### Phase 2: AI Opportunity Assessment  
Score automation potential (1-10), evaluate data readiness, analyze change complexity, calculate risk vs reward, estimate implementation timeline.

### Phase 3: Architecture Design
Design multi-agent systems, data pipelines, model orchestration, governance frameworks, and optimization strategies.

### Phase 4: Implementation Roadmap
Identify pilot projects, create phased rollout with risk mitigation, develop training plans, establish KPI tracking, and continuous improvement.

## Deliverable Templates

Provide specific recommendations including:
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

    // Seed the prompts
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
      .select('*')
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      console.error('❌ Error fetching prompts:', fetchError);
    } else {
      console.log(`✅ Total prompts in database: ${allPrompts.length}`);
      allPrompts.forEach(prompt => {
        console.log(`- ID ${prompt.id}: ${prompt.title} (${prompt.is_premium ? 'Premium' : 'Free'}, ${prompt.is_public ? 'Public' : 'Private'})`);
      });
    }
    
    console.log('\n🎉 Phase 2 completed! Prompts system is ready.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAndSeed();