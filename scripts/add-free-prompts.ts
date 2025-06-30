import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.production') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const freePrompts = [
  {
    id: 25, // Next available ID
    title: "Business Performance Optimization",
    category: "Biznes Tahlili",
    description: "Holistic business performance improvement strategies",
    content: `Siz business optimization eksperti sifatida quyidagi business uchun comprehensive performance optimization plan yarating:

BUSINESS: [BUSINESS_NOMI]
SEKTOR: [SEKTOR]
JORIY MUAMMOLAR: [MUAMMOLAR]

Tahlil qiling:
1. Current Performance Metrics
   - Financial indicators
   - Operational efficiency
   - Customer satisfaction
   - Market position

2. Root Cause Analysis
   - Bottlenecks identification
   - Process inefficiencies
   - Resource allocation issues
   - Strategic misalignments

3. Optimization Opportunities
   - Quick wins (0-3 oy)
   - Medium-term improvements (3-6 oy)
   - Long-term transformation (6-12 oy)

4. Implementation Roadmap
   - Priority matrix
   - Resource requirements
   - Timeline and milestones
   - Risk mitigation strategies

5. Performance Monitoring
   - KPI framework
   - Dashboard design
   - Review cycles
   - Continuous improvement process

Plan holistic, data-driven va sustainable bo'lsin.`,
    is_premium: false,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 26,
    title: "Target Auditoriya Tahlilchisi",
    category: "Marketing",
    description: "Chuqur target audience research va persona yaratish",
    content: `Siz audience research eksperti sifatida quyidagi business uchun batafsil target audience tahlili va persona yarating:

BUSINESS/MAHSULOT: [BUSINESS_MAHSULOT]
BOZOR: [BOZOR]
RAQOBATCHILAR: [RAQOBATCHILAR]

Tahlil qiling:
1. Demographic Analysis
   - Yosh guruhlar
   - Gender distribution
   - Geografik joylashuv
   - Daromad darajasi
   - Ta'lim darajasi

2. Psychographic Profiling
   - Qiziqishlar va hobbilar
   - Qadriyatlar va e'tiqodlar
   - Lifestyle preferences
   - Media consumption habits

3. Behavioral Patterns
   - Xarid qilish odatlari
   - Decision-making process
   - Brand loyalligi
   - Online behavior

4. Pain Points & Needs
   - Asosiy muammolar
   - Qondirilmagan ehtiyojlar
   - Motivatsiyalar
   - Barriers to purchase

5. Persona Development
   - 3-5 ta detailed personas
   - User journey mapping
   - Communication preferences
   - Content strategy recommendations

Tahlil data-driven, actionable va comprehensive bo'lsin.`,
    is_premium: false,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 27,
    title: "Content Marketing Strategist",
    category: "Marketing",
    description: "Comprehensive content marketing strategy va calendar",
    content: `Siz content marketing eksperti sifatida quyidagi brand uchun comprehensive content strategy yarating:

BRAND: [BRAND_NOMI]
MAQSAD: [MARKETING_MAQSADLAR]
TARGET AUDIENCE: [AUDITORIYA]
BYUDJET: [OYLIK_BYUDJET]

Strategiya yarating:
1. Content Audit & Analysis
   - Current content performance
   - Competitor content analysis
   - Content gaps identification
   - Opportunity mapping

2. Content Strategy Framework
   - Content pillars (3-5 ta)
   - Content types va formats
   - Distribution channels
   - Tone of voice guidelines

3. Editorial Calendar (3 oylik)
   - Weekly content themes
   - Publishing schedule
   - Seasonal campaigns
   - Key dates integration

4. Content Production Plan
   - Resource allocation
   - Content creation workflow
   - Quality control process
   - Collaboration guidelines

5. Performance Metrics
   - KPIs for each content type
   - Measurement framework
   - Reporting schedule
   - Optimization process

Strategiya scalable, measurable va aligned with business goals bo'lsin.`,
    is_premium: false,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function addFreePrompts() {
  try {
    console.log('Adding free prompts to database...');
    
    for (const prompt of freePrompts) {
      const { data, error } = await supabase
        .from('prompts')
        .upsert(prompt, { onConflict: 'id' })
        .select()
        .single();
      
      if (error) {
        console.error(`Error adding prompt ${prompt.title}:`, error);
      } else {
        console.log(`✓ Added prompt: ${prompt.title}`);
      }
    }
    
    console.log('\nDone! Free prompts have been added.');
  } catch (error) {
    console.error('Error:', error);
  }
}

addFreePrompts();