import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bazptglwzqstppwlvmvb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenB0Z2x3enFzdHBwd2x2bXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAxNzU5MCwiZXhwIjoyMDY0NTkzNTkwfQ.GdDEVx5CRy1NC_2e5QbtCKcXZmoEL1z2RU7SlHA_-oQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Professional prompts - 50 total (10 per category)
const professionalPrompts = [
  // CATEGORY 1: CODING (Dasturlash) - 10 prompts
  {
    title: "Kod Tekshirish Mutaxassisi",
    category: "Dasturlash",
    description: "Kodlarni professional darajada tekshirish va takomillashtirish",
    content: `Siz tajribali senior dasturchi sifatida quyidagi kodni batafsil tekshiring:

KOD:
[KOD_MAZMUNI]

DASTURLASH TILI: [DASTURLASH_TILI]

Quyidagilarni tahlil qiling va batafsil javob bering:

1. **KOD SIFATI VA OQILISHI**
   - O'qish qulayligi va tushunarligi
   - O'zgaruvchilar va funksiyalar nomlari
   - Kod tuzilishi va mantiqiy ketma-ketlik

2. **XAVFSIZLIK MASALALARI**
   - Potentsial zaifliklar
   - Input validatsiyasi
   - Ma'lumotlar xavfsizligi

3. **PERFORMANCE (SAMARADORLIK)**
   - Tezlik muammolari
   - Xotira ishlatilishi
   - Optimallashtirishlar

4. **BEST PRACTICES**
   - Qabul qilingan standartlarga muvofiqlik
   - Clean Code tamoyillari
   - SOLID printsiplari

5. **TAKOMILLASHTIRISH TAKLIFLARI**
   - Aniq kodlar bilan takomillashtirilgan variant
   - Qo'shimcha xususiyatlar
   - Texnik qarzdorlikni kamaytirish

Har bir masala uchun aniq misol va yechim taklif qiling.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Bug Topish Eksperti",
    category: "Dasturlash", 
    description: "Kodlardagi xatolarni tez va samarali topish",
    content: `Siz debugging eksperti sifatida quyidagi muammoli kodda xatolarni toping:

MUAMMOLI KOD:
[MUAMMOLI_KOD]

KUTILGAN NATIJA: [KUTILGAN_NATIJA]
HOZIRGI NATIJA: [HOZIRGI_NATIJA]
XATO XABARI (agar bo'lsa): [XATO_XABARI]

Quyidagi ketma-ketlikda tahlil qiling:

1. **XATONI ANIQLASH**
   - Aniq xato joyi
   - Xato sababi
   - Xato turi (syntax, logic, runtime)

2. **DEBUGGING STRATEGIYASI**
   - Qaysi qismni birinchi tekshirish kerak
   - Test qilish usullari
   - Ma'lumotlarni kuzatish

3. **YECHIM**
   - To'g'rilangan kod
   - Izohlar bilan tushuntirish
   - Alternative yechimlar

4. **OLDINI OLISH**
   - Bunday xatolarning oldini olish usullari
   - Test yozish
   - Monitoring qo'shish

Qadam-baqadam yechim bering va kelajakda bunday xatolarning oldini olish bo'yicha maslahat bering.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Arxitektura Dizayneri",
    category: "Dasturlash",
    description: "Dasturiy ta'minot arxitekturasini loyihalash",
    content: `Siz software architect sifatida quyidagi loyiha uchun arxitektura dizayn qiling:

LOYIHA TAVSIFI: [LOYIHA_TAVSIFI]
FOYDALANUVCHILAR SONI: [FOYDALANUVCHILAR_SONI]
ASOSIY FUNKSIYALAR: [ASOSIY_FUNKSIYALAR]
TEXNIK TALABLAR: [TEXNIK_TALABLAR]

Quyidagi komponentlarni ishlab chiqing:

1. **UMUMIY ARXITEKTURA**
   - System overview diagrammasi
   - High-level komponentlar
   - Ma'lumotlar oqimi

2. **TEXNOLOGIYALAR TANLASH**
   - Frontend texnologiyalari
   - Backend texnologiyalari
   - Ma'lumotlar bazasi
   - Hosting va infratuzilma

3. **SCALABILITY STRATEGIYASI**
   - Horizontal/vertical scaling
   - Load balancing
   - Caching strategiyasi
   - Database sharding

4. **XAVFSIZLIK ARXITEKTURASI**
   - Authentication/Authorization
   - Data encryption
   - API security
   - Security best practices

5. **DEPLOYMENT VA MONITORING**
   - CI/CD pipeline
   - Monitoring va logging
   - Backup strategiyasi
   - Disaster recovery

Har bir qaror uchun sabab-sabablarni tushuntiring va alternative variantlarni ham ko'rsating.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "API Dizayn Eksperti",
    category: "Dasturlash",
    description: "RESTful API va GraphQL API dizayn qilish",
    content: `Siz API dizayn eksperti sifatida quyidagi loyiha uchun API yarating:

LOYIHA: [LOYIHA_NOMI]
ASOSIY OBYEKTLAR: [ASOSIY_OBYEKTLAR]
FOYDALANUVCHI ROLLARI: [FOYDALANUVCHI_ROLLARI]
API TURI: [REST/GraphQL]

Quyidagilarni ishlab chiqing:

1. **API ENDPOINTS**
   - CRUD operatsiyalari
   - Authentication endpoints
   - Business logic endpoints
   - HTTP methodlar va URL pattern

2. **DATA MODELS**
   - Request/Response strukturalari
   - Validation rules
   - Error response formatlar
   - Pagination

3. **AUTHENTICATION VA AUTHORIZATION**
   - JWT/OAuth strategiyasi
   - Role-based access control
   - Rate limiting
   - API keys management

4. **DOCUMENTATION**
   - OpenAPI/Swagger specification
   - Endpoint ta'vsifi
   - Example requests/responses
   - Error codes documentation

5. **TESTING VA MONITORING**
   - Unit testing strategy
   - Integration testing
   - Performance monitoring
   - Error tracking

6. **VERSIONING STRATEGIYASI**
   - Version numbering
   - Backward compatibility
   - Deprecation policy

Har bir endpoint uchun batafsil misollar va foydalanish stsenarilari bering.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Ma'lumotlar Bazasi Optimizatori",
    category: "Dasturlash",
    description: "Database performance va strukturasini yaxshilash",
    content: `Siz database eksperti sifatida quyidagi ma'lumotlar bazasini optimallashtiring:

DATABASE TURI: [DATABASE_TURI]
ASOSIY JADVALLAR: [ASOSIY_JADVALLAR]
MUAMMO: [PERFORMANCE_MUAMMO]
MA'LUMOTLAR HAJMI: [MA'LUMOTLAR_HAJMI]

Quyidagi jihatlarni tahlil qiling:

1. **PERFORMANCE TAHLILI**
   - Sekin so'rovlarni aniqlash
   - Query execution plan
   - Bottleneck larni topish
   - Resource utilization

2. **INDEXING STRATEGIYASI**
   - Kerakli indexlar
   - Composite indexlar
   - Partial indexlar
   - Index maintenance

3. **QUERY OPTIMIZATION**
   - So'rovlarni qayta yozish
   - JOIN optimizatsiyasi
   - Subquery vs JOIN
   - Aggregation optimizatsiyasi

4. **SCHEMA OPTIMIZATION**
   - Normalization/Denormalization
   - Data types optimization
   - Table partitioning
   - Archiving strategy

5. **CACHING STRATEGIYASI**
   - Query result caching
   - Application-level caching
   - Redis/Memcached integration
   - Cache invalidation

6. **MONITORING VA MAINTENANCE**
   - Performance metrics
   - Regular maintenance tasks
   - Backup optimization
   - Statistics update

Har bir taklif uchun implementation misollar va kutilgan natijalarni ko'rsating.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Test Strategiyasi Yaratuvchi",
    category: "Dasturlash",
    description: "Comprehensive testing strategiyasi ishlab chiqish",
    content: `Siz QA eksperti sifatida quyidagi loyiha uchun test strategiyasi yarating:

LOYIHA: [LOYIHA_TAVSIFI]
TEXNOLOGIYALAR: [TEXNOLOGIYALAR]
TIMELINE: [TIMELINE]
JAMOA HAJMI: [JAMOA_HAJMI]

Quyidagi test darajalarini ishlab chiqing:

1. **UNIT TESTING**
   - Test framework tanlash
   - Code coverage maqsadlari
   - Mocking strategiyasi
   - Assertion patterns

2. **INTEGRATION TESTING**
   - API testing
   - Database integration
   - Third-party services
   - Contract testing

3. **END-TO-END TESTING**
   - User journey testing
   - Cross-browser testing
   - Mobile responsive testing
   - Performance testing

4. **TEST AUTOMATION**
   - CI/CD integration
   - Test data management
   - Environment setup
   - Parallel execution

5. **MANUAL TESTING**
   - Exploratory testing
   - Usability testing
   - Security testing
   - Accessibility testing

6. **PERFORMANCE TESTING**
   - Load testing strategy
   - Stress testing
   - Volume testing
   - Scalability testing

Har bir test turi uchun test case misollar va success criteria bering.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Kod Refaktoring Mutaxassisi",
    category: "Dasturlash",
    description: "Legacy kodlarni zamonaviy standartlarga o'tkazish",
    content: `Siz refactoring eksperti sifatida quyidagi legacy kodni zamonlashtiring:

MAVJUD KOD: [MAVJUD_KOD]
DASTURLASH TILI: [DASTURLASH_TILI]
MAQSAD: [REFACTORING_MAQSADI]
CHEKLOVLAR: [CHEKLOVLAR]

Quyidagi qadam-baqadam refactoring rejasini yarating:

1. **KOD TAHLILI**
   - Code smells aniqlash
   - Complexity metrics
   - Dependencies mapping
   - Risk assessment

2. **REFACTORING STRATEGIYASI**
   - Step-by-step plan
   - Priority order
   - Safe refactoring techniques
   - Rollback strategies

3. **PATTERN IMPLEMENTATION**
   - Design patterns qo'llash
   - SOLID principles
   - DRY principle
   - Clean architecture

4. **TEST COVERAGE**
   - Existing tests analysis
   - New tests creation
   - Regression testing
   - Safety nets

5. **PERFORMANCE IMPROVEMENTS**
   - Algorithm optimization
   - Memory usage
   - I/O operations
   - Caching strategies

6. **MODERNIZATION**
   - New language features
   - Modern frameworks
   - Better libraries
   - Security improvements

Har bir qadam uchun before/after kod misollar va test strategiyasi bering.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "DevOps Pipeline Yaratuvchi",
    category: "Dasturlash", 
    description: "CI/CD pipeline va deployment strategiyasini yaratish",
    content: `Siz DevOps engineer sifatida quyidagi loyiha uchun CI/CD pipeline yarating:

LOYIHA: [LOYIHA_NOMI]
TEXNOLOGIYALAR: [TEXNOLOGIYALAR]
ENVIRONMENT: [DEV/STAGING/PROD]
TEAM SIZE: [JAMOA_HAJMI]

Quyidagi pipeline komponentlarini yarating:

1. **SOURCE CONTROL WORKFLOW**
   - Git branching strategy
   - Code review process
   - Merge policies
   - Branch protection rules

2. **BUILD PIPELINE**
   - Build automation
   - Dependency management
   - Artifact creation
   - Build optimization

3. **TESTING AUTOMATION**
   - Unit test execution
   - Integration tests
   - Security scanning
   - Quality gates

4. **DEPLOYMENT STRATEGY**
   - Environment management
   - Blue-green deployment
   - Rolling updates
   - Rollback procedures

5. **MONITORING VA ALERTING**
   - Application monitoring
   - Infrastructure monitoring
   - Log aggregation
   - Alert rules

6. **SECURITY VA COMPLIANCE**
   - Vulnerability scanning
   - Secret management
   - Compliance checks
   - Access control

Pipeline configuration files va step-by-step implementation guide bering.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Mikrotizim Arxitektori",
    category: "Dasturlash",
    description: "Microservices arxitekturasini loyihalash",
    content: `Siz microservices arxitektori sifatida quyidagi monolitik ilovani microservices ga o'tkazing:

MAVJUD TIZIM: [MAVJUD_TIZIM_TAVSIFI]
BUSINESS DOMAIN: [BUSINESS_DOMAIN]
TRAFFIC LOAD: [TRAFFIC_LOAD]
TEAM STRUCTURE: [TEAM_STRUCTURE]

Quyidagi strategiyani ishlab chiqing:

1. **DOMAIN DECOMPOSITION**
   - Business capabilities mapping
   - Bounded contexts identification
   - Service boundaries
   - Data ownership

2. **SERVICE DESIGN**
   - Service responsibilities
   - API contracts
   - Communication patterns
   - Data consistency strategies

3. **COMMUNICATION STRATEGY**
   - Synchronous vs Asynchronous
   - Message queues
   - Event-driven architecture
   - API gateway

4. **DATA MANAGEMENT**
   - Database per service
   - Data synchronization
   - Transaction management
   - Event sourcing

5. **INFRASTRUCTURE**
   - Container orchestration
   - Service discovery
   - Load balancing
   - Circuit breakers

6. **OBSERVABILITY**
   - Distributed tracing
   - Metrics collection
   - Log correlation
   - Health checks

7. **MIGRATION STRATEGY**
   - Strangler fig pattern
   - Database decomposition
   - Gradual migration plan
   - Risk mitigation

Har bir mikroservis uchun batafsil specification va implementation plan bering.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Xavfsizlik Tahlilchisi",
    category: "Dasturlash",
    description: "Kod va tizim xavfsizligini tahlil qilish",
    content: `Siz cybersecurity eksperti sifatida quyidagi tizimning xavfsizligini tahlil qiling:

TIZIM TAVSIFI: [TIZIM_TAVSIFI]
TEXNOLOGIYALAR: [TEXNOLOGIYALAR]
FOYDALANUVCHI MA'LUMOTLARI: [FOYDALANUVCHI_MALUMOTLARI]
COMPLIANCE TALABLARI: [COMPLIANCE_TALABLARI]

Quyidagilarni batafsil tahlil qiling:

1. **VULNERABILITY ASSESSMENT**
   - Common vulnerabilities (OWASP Top 10)
   - Code-level vulnerabilities
   - Infrastructure vulnerabilities
   - Third-party dependencies

2. **AUTHENTICATION VA AUTHORIZATION**
   - Password policies
   - Multi-factor authentication
   - Session management
   - Role-based access control

3. **DATA PROTECTION**
   - Data encryption (at rest/in transit)
   - PII handling
   - Data backup security
   - Data retention policies

4. **API SECURITY**
   - Input validation
   - Rate limiting
   - API authentication
   - CORS policies

5. **INFRASTRUCTURE SECURITY**
   - Network security
   - Server hardening
   - Container security
   - Cloud security

6. **INCIDENT RESPONSE**
   - Security monitoring
   - Incident detection
   - Response procedures
   - Recovery planning

7. **COMPLIANCE**
   - GDPR/CCPA requirements
   - Industry standards
   - Audit trails
   - Documentation

Har bir xavfsizlik muammosi uchun aniq yechim va implementation plan bering.`,
    is_premium: true,
    is_public: true
  },

  // CATEGORY 2: CONTENT CREATION (Kontent Yaratish) - 10 prompts
  {
    title: "Professional Blog Yozuvchisi",
    category: "Kontent Yaratish",
    description: "SEO optimallashtirilgan blog postlar yaratish",
    content: `Siz tajribali kontent yozuvchi sifatida quyidagi mavzu bo'yicha professional blog post yozing:

MAVZU: [MAVZU]
MAQSADLI AUDITORIYA: [MAQSADLI_AUDITORIYA]
KALIT SO'ZLAR: [KALIT_SOZLAR]
MAQSAD: [MAQSAD]

Blog post quyidagi tuzilishda bo'lsin:

1. **JOZIBADOR SARLAVHA**
   - Attention-grabbing title
   - Kalit so'zlar bilan optimallashtirilgan
   - 60 belgidan kam

2. **KIRISH QISMI** (150-200 so'z)
   - Hook bilan boshlanish
   - Muammoni aniqlash
   - Blogdagi yechimni e'lon qilish

3. **ASOSIY MAZMUN** (800-1000 so'z)
   - 4-5 ta asosiy bo'lim
   - Har bir bo'lim aniq sub-heading bilan
   - Practical misollar va case studies
   - Actionable advice

4. **XULOSA** (100-150 so'z)
   - Asosiy nuqtalarni takrorlash
   - Clear call-to-action
   - Keyingi qadamlar

5. **SEO ELEMENTLAR**
   - Meta description
   - Alt text lar uchun tavsiyalar
   - Internal linking imkoniyatlari
   - Featured snippet uchun optimizatsiya

Matn o'quvchini jalb qiluvchi, ma'lumotga boy va amaliy ahamiyatga ega bo'lsin.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Ijtimoiy Tarmoq Kontenti Yaratuvchi",
    category: "Kontent Yaratish",
    description: "Turli ijtimoiy tarmoqlar uchun engaging kontent",
    content: `Siz social media eksperti sifatida quyidagi brand uchun ijtimoiy tarmoq kontenti yarating:

BRAND: [BRAND_NOMI]
SOHA: [SOHA]
MAQSADLI AUDITORIYA: [MAQSADLI_AUDITORIYA]
PLATFORM: [PLATFORM]
MAQSAD: [MAQSAD]

Quyidagi format bo'yicha kontent yarating:

1. **INSTAGRAM POSTLAR** (5 ta)
   - Engaging captions (150-200 so'z)
   - Relevant hashtags (#10-15)
   - Story ideas
   - Visual content tavsiyalari

2. **FACEBOOK POSTLAR** (3 ta)
   - Longer-form content (200-300 so'z)
   - Community-building elements
   - Engagement-driving questions
   - Link sharing strategy

3. **LINKEDIN KONTENTI** (3 ta)
   - Professional thought leadership
   - Industry insights
   - Company updates format
   - Professional networking approach

4. **TWITTER/X THREAD** (1 ta)
   - 7-10 tweet thread
   - Valuable industry insights
   - Retweet-worthy content
   - Hashtag strategy

5. **CONTENT CALENDAR**
   - Optimal posting times
   - Content mix strategy
   - Seasonal considerations
   - Cross-platform synergy

Har bir post uchun engagement metrics va success indicators ham ko'rsating.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Email Marketing Kampaniyasi Yaratuvchi",
    category: "Kontent Yaratish",
    description: "Samarali email marketing kampaniyalari yaratish",
    content: `Siz email marketing eksperti sifatida quyidagi maqsad uchun email kampaniyasi yarating:

MAQSAD: [KAMPANIYA_MAQSADI]
AUDITORIYA SEGMENTI: [AUDITORIYA_SEGMENTI]
MAHSULOT/XIZMAT: [MAHSULOT_XIZMAT]
TIMELINE: [TIMELINE]

Quyidagi email ketma-ketligini yarating:

1. **WELCOME EMAIL SERIES** (3 ta email)
   - Onboarding sequence
   - Brand introduction
   - Value proposition
   - Next steps guidance

2. **NURTURING SEQUENCE** (5 ta email)
   - Educational content
   - Case studies/testimonials
   - Problem-solution alignment
   - Trust building

3. **PROMOTIONAL EMAILS** (3 ta)
   - Product/service promotion
   - Limited-time offers
   - Social proof integration
   - Clear CTAs

4. **RE-ENGAGEMENT SEQUENCE** (2 ta)
   - Win-back campaigns
   - Preference center options
   - Last-chance messaging
   - Feedback requests

Har bir email uchun:
- Subject line options (3 ta)
- Preview text
- Email body (HTML structure bilan)
- Call-to-action buttons
- A/B testing elements
- Success metrics

Personalization va segmentation strategiyasini ham qo'shing.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Video Script Yozuvchisi",
    category: "Kontent Yaratish",
    description: "Engaging video script va storyboard yaratish",
    content: `Siz video content eksperti sifatida quyidagi video uchun script yozing:

VIDEO TURI: [VIDEO_TURI]
DAVOMIYLIGI: [DAVOMIYLIGI]
MAQSAD: [MAQSAD]
AUDITORIYA: [AUDITORIYA]
PLATFORM: [PLATFORM]

Quyidagi formatda script yarating:

1. **OPENING HOOK** (0-5 soniya)
   - Attention grabber
   - Problem statement
   - Promise of solution

2. **INTRODUCTION** (5-15 soniya)
   - Speaker introduction
   - Video agenda
   - Viewer benefits

3. **MAIN CONTENT** (60-80% vaqt)
   - Key points breakdown
   - Visual elements description
   - Transition phrases
   - Engagement elements

4. **CALL TO ACTION** (oxirgi 10-15 soniya)
   - Clear next steps
   - Multiple CTA options
   - Contact information

5. **VISUAL STORYBOARD**
   - Scene descriptions
   - Camera angles
   - Graphics/animations
   - Background music suggestions

6. **PRODUCTION NOTES**
   - Equipment requirements
   - Location suggestions
   - Talent requirements
   - Post-production notes

Script professional, engaging va platform-specific bo'lsin. Har bir scene uchun timing va visual elements ham ko'rsating.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Technical Documentation Yozuvchisi",
    category: "Kontent Yaratish", 
    description: "Aniq va tushunarli texnik hujjatlar yaratish",
    content: `Siz technical writer sifatida quyidagi texnik hujjatni yarating:

TEXNOLOGIYA/MAHSULOT: [TEXNOLOGIYA_MAHSULOT]
AUDITORIYA DARAJASI: [AUDITORIYA_DARAJASI]
HUJJAT TURI: [HUJJAT_TURI]
MAQSAD: [MAQSAD]

Quyidagi tuzilishda hujjat yarating:

1. **EXECUTIVE SUMMARY**
   - Qisqacha umumiy ko'rinish
   - Asosiy benefits
   - Target audience
   - Document scope

2. **INTRODUCTION**
   - Context va background
   - Prerequisites
   - Assumptions
   - Terminology

3. **STEP-BY-STEP GUIDE**
   - Aniq qadam-baqadam yo'riqnoma
   - Screenshots/diagrams tavsiyalari
   - Code examples (agar kerak bo'lsa)
   - Best practices

4. **TROUBLESHOOTING**
   - Common issues
   - Error messages va yechinlar
   - FAQ section
   - Support resources

5. **REFERENCE SECTION**
   - API documentation (agar kerak)
   - Configuration options
   - Command references
   - Links va additional resources

6. **APPENDICES**
   - Glossary
   - Version history
   - Related documents
   - Contact information

Hujjat aniq, tushunarli va actionable bo'lsin. Technical jargon larni minimumga keltirib, beginners ham tushuna oladigan qilib yozing.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Case Study Yozuvchisi",
    category: "Kontent Yaratish",
    description: "Impressive customer success case study yaratish",
    content: `Siz case study eksperti sifatida quyidagi customer success story ni professional case study ga aylantiring:

MIJOZ: [MIJOZ_NOMI]
SOHA: [SOHA]
MUAMMO: [MUAMMO_TAVSIFI]
YECHIM: [YECHIM_TAVSIFI]
NATIJALAR: [NATIJALAR]

Quyidagi struktura bo'yicha case study yozing:

1. **EXECUTIVE SUMMARY** (100-150 so'z)
   - Client background
   - Challenge overview
   - Solution summary
   - Key results

2. **CLIENT PROFILE** (150-200 so'z)
   - Company description
   - Industry context
   - Size va market position
   - Previous challenges

3. **CHALLENGE SECTION** (200-300 so'z)
   - Specific problems
   - Impact on business
   - Previous solutions tried
   - Why they chose you

4. **SOLUTION IMPLEMENTATION** (300-400 so'z)
   - Approach explanation
   - Implementation timeline
   - Team collaboration
   - Key milestones

5. **RESULTS VA BENEFITS** (200-300 so'z)
   - Quantifiable results
   - ROI calculations
   - Qualitative benefits
   - Client testimonials

6. **KEY TAKEAWAYS** (100-150 so'z)
   - Lessons learned
   - Best practices
   - Scalability potential
   - Future opportunities

7. **SUPPORTING ELEMENTS**
   - Relevant quotes
   - Data visualizations
   - Before/after comparisons
   - Call-to-action

Case study credible, compelling va results-driven bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Taqdimot Kontenti Yaratuvchi",
    category: "Kontent Yaratish",
    description: "Professional presentation content va design",
    content: `Siz presentation eksperti sifatida quyidagi mavzu bo'yicha taqdimot yarating:

MAVZU: [MAVZU]
AUDITORIYA: [AUDITORIYA]
DAVOMIYLIGI: [DAVOMIYLIGI]
MAQSAD: [MAQSAD]
FORMAT: [FORMAT]

Quyidagi slide strukturasini yarating:

1. **TITLE SLIDE**
   - Engaging title
   - Subtitle
   - Speaker information
   - Date va event

2. **AGENDA SLIDE**
   - Clear outline
   - Time allocations
   - Key takeaways preview

3. **INTRODUCTION SLIDES** (2-3 ta)
   - Hook/attention grabber
   - Problem statement
   - Why this matters

4. **MAIN CONTENT SLIDES** (8-12 ta)
   - Key points breakdown
   - Supporting data/statistics
   - Visual elements description
   - Real examples/case studies

5. **CONCLUSION SLIDES** (2-3 ta)
   - Key takeaways summary
   - Call to action
   - Next steps

6. **Q&A PREPARATION**
   - Anticipated questions
   - Supporting data
   - Backup slides

Har bir slide uchun:
- Slide title
- Key points (3-5 ta max)
- Visual elements tavsiyalari
- Speaker notes
- Transition phrases

Taqdimot engaging, informative va action-oriented bo'lsin.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Mahsulot Tavsifi Yozuvchisi",
    category: "Kontent Yaratish",
    description: "Sotuvga yo'naltirilgan mahsulot tavsiflari yaratish",
    content: `Siz copywriting eksperti sifatida quyidagi mahsulot uchun sotuvga yo'naltirilgan tavsif yozing:

MAHSULOT: [MAHSULOT_NOMI]
KATEGORIYA: [KATEGORIYA]
MAQSADLI MIJOZLAR: [MAQSADLI_MIJOZLAR]
ASOSIY BENEFITS: [ASOSIY_BENEFITS]
NARX DIAPAZONI: [NARX_DIAPAZONI]

Quyidagi formatda mahsulot tavsifi yarating:

1. **CATCHY HEADLINE**
   - Benefit-focused title
   - Emotional appeal
   - USP integration

2. **OPENING PARAGRAPH** (50-75 so'z)
   - Problem identification
   - Solution introduction
   - Primary benefit

3. **KEY FEATURES** (150-200 so'z)
   - 5-7 ta asosiy xususiyat
   - Har birini benefit ga bog'lash
   - Technical specs (kerak bo'lsa)

4. **BENEFITS SECTION** (100-150 so'z)
   - Emotional benefits
   - Practical benefits
   - Long-term value

5. **SOCIAL PROOF** (75-100 so'z)
   - Customer testimonials
   - Reviews/ratings
   - Awards/certifications

6. **CALL TO ACTION**
   - Urgency creation
   - Risk reversal
   - Clear next steps

7. **SEO ELEMENTS**
   - Primary keywords integration
   - Alt text suggestions
   - Meta description

Matn persuasive, benefits-focused va conversion-optimized bo'lsin. Customer pain points ga to'g'ridan-to'g'ri murojaat qiling.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Newsletter Editor",
    category: "Kontent Yaratish",
    description: "Engaging va informative newsletter yaratish",
    content: `Siz newsletter eksperti sifatida quyidagi company uchun haftalik newsletter yarating:

COMPANY: [COMPANY_NOMI]
SOHA: [SOHA]
AUDITORIYA: [AUDITORIYA]
NEWSLETTER MAQSADI: [NEWSLETTER_MAQSADI]

Quyidagi sections bilan newsletter yarating:

1. **HEADER SECTION**
   - Newsletter name
   - Issue number va date
   - Brief welcome message

2. **INTRO MESSAGE** (50-75 so'z)
   - Week overview
   - Key highlights preview
   - Personal touch

3. **MAIN CONTENT SECTIONS**
   
   **A. INDUSTRY NEWS** (150-200 so'z)
   - 3-4 ta relevant news items
   - Brief commentary
   - Impact analysis

   **B. COMPANY UPDATES** (100-150 so'z)
   - Product/service updates
   - Team news
   - Upcoming events

   **C. EDUCATIONAL CONTENT** (200-250 so'z)
   - How-to tips
   - Best practices
   - Industry insights

   **D. SPOTLIGHT SECTION** (100-150 so'z)
   - Customer spotlight
   - Employee highlight
   - Partner feature

4. **INTERACTIVE ELEMENTS**
   - Poll/survey questions
   - Feedback requests
   - Community challenges

5. **RESOURCE SECTION**
   - Useful links
   - Free downloads
   - Upcoming webinars

6. **FOOTER**
   - Contact information
   - Social media links
   - Unsubscribe options

Newsletter engaging, value-packed va brand-consistent bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "White Paper Yozuvchisi",
    category: "Kontent Yaratish",
    description: "Authoritative white paper va research content",
    content: `Siz research writer sifatida quyidagi mavzu bo'yicha authoritative white paper yozing:

MAVZU: [MAVZU]
TARGET AUDIENCE: [TARGET_AUDIENCE]
RESEARCH MAQSADI: [RESEARCH_MAQSADI]
COMPANY POSITIONING: [COMPANY_POSITIONING]

Quyidagi akademik strukturada white paper yarating:

1. **ABSTRACT** (150-200 so'z)
   - Research summary
   - Key findings
   - Methodology overview
   - Conclusions

2. **INTRODUCTION** (300-400 so'z)
   - Background context
   - Problem statement
   - Research questions
   - Paper scope

3. **LITERATURE REVIEW** (400-500 so'z)
   - Current state analysis
   - Existing solutions review
   - Knowledge gaps identification
   - Research justification

4. **METHODOLOGY** (200-300 so'z)
   - Research approach
   - Data collection methods
   - Analysis framework
   - Limitations

5. **FINDINGS VA ANALYSIS** (800-1000 so'z)
   - Key discoveries
   - Data interpretation
   - Trend analysis
   - Statistical insights

6. **IMPLICATIONS** (300-400 so'z)
   - Industry implications
   - Business impact
   - Strategic recommendations
   - Future considerations

7. **CONCLUSION** (200-300 so'z)
   - Summary of findings
   - Key takeaways
   - Call to action
   - Next steps

8. **REFERENCES VA APPENDICES**
   - Sources list
   - Supporting data
   - Methodology details

White paper authoritative, well-researched va actionable bo'lsin.`,
    is_premium: true,
    is_public: true
  },

  // CATEGORY 3: IDEA GENERATION (G'oya Yaratish) - 10 prompts
  {
    title: "Startup G'oyalari Generatori",
    category: "G'oya Yaratish",
    description: "Innovatsion startup g'oyalarini yaratish va baholash",
    content: `Siz serial entrepreneur sifatida quyidagi parametrlar asosida startup g'oyalarini yarating:

SOHA: [SOHA]
MAQSADLI BOZOR: [MAQSADLI_BOZOR]
BUDJET: [BUDJET]
VAQT ORALIG'I: [VAQT_ORALIQI]
TEXNOLOGIK DARAJANGIZ: [TEXNOLOGIK_DARAJA]

Quyidagi formatda 5 ta startup g'oyasi yarating:

**HAR BIR G'OYA UCHUN:**

1. **G'OYA NOMI VA TAVSIFI**
   - Qisqacha nom
   - 2-3 jumlada tavsif
   - Asosiy value proposition

2. **MUAMMO VA YECHIM**
   - Aniq muammo identification
   - Mavjud yechimlarning kamchiliklari
   - Sizning unique yechimingiz

3. **MAQSADLI AUDITORIYA**
   - Primary target market
   - Secondary markets
   - Customer personas

4. **BIZNES MODEL**
   - Revenue streams
   - Pricing strategy
   - Cost structure
   - Monetization approach

5. **COMPETITIVE ADVANTAGE**
   - Unique differentiators
   - Barriers to entry
   - Scalability potential

6. **TECHNICAL REQUIREMENTS**
   - Technology stack
   - Development timeline
   - Required skills
   - MVP features

7. **MARKET POTENTIAL**
   - Market size estimation
   - Growth projections
   - Revenue forecasts
   - Risk assessment

8. **NEXT STEPS**
   - Immediate actions
   - Validation strategy
   - Prototype plan
   - Launch timeline

Har bir g'oya realistic, innovative va market-driven bo'lsin.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Mahsulot Innovatsiya Eksperti",
    category: "G'oya Yaratish",
    description: "Mavjud mahsulotlarni innovatsion yaxshilash g'oyalari",
    content: `Siz product innovation eksperti sifatida quyidagi mahsulotni yaxshilash g'oyalarini yarating:

MAVJUD MAHSULOT: [MAVJUD_MAHSULOT]
KOMPANIYA: [KOMPANIYA]
MAQSADLI SEGMENT: [MAQSADLI_SEGMENT]
MUAMMOLAR: [MAVJUD_MUAMMOLAR]
BUDJET: [BUDJET]

Quyidagi innovation kategoriyalari bo'yicha g'oyalar yarating:

1. **FEATURE IMPROVEMENTS** (3 ta g'oya)
   - Yangi funksiyalar
   - Mavjud features optimization
   - User experience enhancements
   - Performance improvements

2. **DESIGN INNOVATIONS** (3 ta g'oya)
   - UI/UX redesign
   - Physical design changes
   - Aesthetic improvements
   - Accessibility enhancements

3. **TECHNOLOGY UPGRADES** (2 ta g'oya)
   - New technology integration
   - Platform modernization
   - Automation opportunities
   - AI/ML integration

4. **BUSINESS MODEL INNOVATIONS** (2 ta g'oya)
   - New revenue streams
   - Pricing model changes
   - Service delivery improvements
   - Partnership opportunities

**HAR BIR G'OYA UCHUN:**
- Implementation complexity (1-10)
- Expected impact (1-10)
- Timeline estimate
- Resource requirements
- ROI projection
- Customer benefit
- Risk factors

5. **PRIORITIZATION MATRIX**
   - High impact, low effort
   - High impact, high effort
   - Low impact, low effort
   - Implementation roadmap

G'oyalar customer-centric, feasible va measurable bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Ijodiy Muammo Yechuvchi",
    category: "G'oya Yaratish",
    description: "Creative problem solving va out-of-the-box yechimlar",
    content: `Siz creative problem solver sifatida quyidagi muammoga innovatsion yechimlar toping:

MUAMMO TAVSIFI: [MUAMMO_TAVSIFI]
CONTEXT: [CONTEXT]
CHEKLOVLAR: [CHEKLOVLAR]
STAKEHOLDERS: [STAKEHOLDERS]
SUCCESS CRITERIA: [SUCCESS_CRITERIA]

Quyidagi creative thinking metodlarini qo'llab yechimlar yarating:

1. **TRADITIONAL YECHIMLAR TAHLILI**
   - Mavjud yechimlar ro'yxati
   - Ularning kamchiliklari
   - Nima uchun ishlamayapti
   - Improvement opportunities

2. **BRAINSTORMING SESSION**
   - Crazy ideas welcome
   - No judgment zone
   - Quantity over quality
   - Build on others' ideas

3. **ANALOGICAL THINKING**
   - Boshqa sohalardagi similar problems
   - Nature-inspired solutions
   - Historical precedents
   - Cross-industry examples

4. **REVERSE THINKING**
   - Muammoni oshirishning usullari
   - Worst-case scenarios
   - Opposite approach
   - Constraint removal

5. **SYSTEMATIC INNOVATION**
   - Root cause analysis
   - System thinking
   - Process redesign
   - Technology solutions

6. **TOP 5 CREATIVE SOLUTIONS**
   - Solution description
   - Implementation approach
   - Pros va cons
   - Resource requirements
   - Risk assessment
   - Innovation level (1-10)

7. **IMPLEMENTATION ROADMAP**
   - Pilot testing strategy
   - Scale-up plan
   - Success metrics
   - Feedback mechanisms

Yechimlar innovative, practical va measurable bo'lsin.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Trend Tahlilchi va Future Predictor",
    category: "G'oya Yaratish",
    description: "Emerging trends va future opportunities identification",
    content: `Siz trend analyst sifatida quyidagi soha bo'yicha future trends va opportunities aniqlang:

SOHA: [SOHA]
VAQT ORALIG'I: [VAQT_ORALIQI]
GEOGRAFIK HUDUD: [GEOGRAFIK_HUDUD]
FOCUS AREA: [FOCUS_AREA]

Quyidagi trend kategoriyalari bo'yicha tahlil qiling:

1. **TECHNOLOGY TRENDS**
   - Emerging technologies
   - Adoption timelines
   - Impact assessment
   - Disruption potential

2. **CONSUMER BEHAVIOR TRENDS**
   - Changing preferences
   - New consumption patterns
   - Generational shifts
   - Cultural influences

3. **BUSINESS MODEL TRENDS**
   - New revenue models
   - Platform economy
   - Subscription economy
   - Sharing economy

4. **SOCIAL VA ENVIRONMENTAL TRENDS**
   - Sustainability focus
   - Social responsibility
   - Remote work impact
   - Health consciousness

5. **ECONOMIC TRENDS**
   - Market shifts
   - Investment patterns
   - Global economic factors
   - Regional developments

**HAR BIR TREND UCHUN:**

6. **TREND ANALYSIS**
   - Current state
   - Growth trajectory
   - Key drivers
   - Timeline predictions

7. **OPPORTUNITY IDENTIFICATION**
   - Business opportunities
   - Investment opportunities
   - Career opportunities
   - Innovation gaps

8. **STRATEGIC IMPLICATIONS**
   - Industry impact
   - Competitive landscape changes
   - Required adaptations
   - First-mover advantages

9. **ACTION RECOMMENDATIONS**
   - Immediate actions
   - Medium-term strategies
   - Long-term preparations
   - Risk mitigation

Tahlil data-driven, forward-thinking va actionable bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Biznes Process Innovatori",
    category: "G'oya Yaratish",
    description: "Biznes jarayonlarini optimallashtirishga g'oyalar",
    content: `Siz process improvement eksperti sifatida quyidagi biznes jarayonini optimallashtirishga g'oyalar yarating:

JARAYON NOMI: [JARAYON_NOMI]
HOZIRGI HOLAT: [HOZIRGI_HOLAT]
MUAMMOLAR: [MUAMMOLAR]
MAQSADLAR: [MAQSADLAR]
RESURSAL CHEKLOVLAR: [RESURSAL_CHEKLOVLAR]

Quyidagi optimization yondashuvlari bo'yicha g'oyalar yarating:

1. **CURRENT STATE ANALYSIS**
   - Process mapping
   - Bottleneck identification
   - Waste elimination opportunities
   - Time va cost analysis

2. **AUTOMATION OPPORTUNITIES**
   - Repetitive tasks automation
   - Workflow automation
   - AI/ML integration
   - Tool recommendations

3. **PROCESS REDESIGN**
   - Simplified workflows
   - Parallel processing
   - Responsibility redistribution
   - Quality checkpoints

4. **TECHNOLOGY SOLUTIONS**
   - Software recommendations
   - Integration opportunities
   - Digital transformation
   - Data analytics

5. **ORGANIZATIONAL CHANGES**
   - Team structure optimization
   - Skill development needs
   - Communication improvements
   - Decision-making processes

6. **PERFORMANCE METRICS**
   - KPI definitions
   - Measurement systems
   - Feedback mechanisms
   - Continuous improvement

**OPTIMIZATION G'OYALARI:**

7. **QUICK WINS** (3 ta)
   - Immediate implementations
   - Low cost, high impact
   - 30-60 kun implementation

8. **MEDIUM-TERM IMPROVEMENTS** (3 ta)
   - 3-6 oy implementation
   - Moderate investment
   - Significant impact

9. **LONG-TERM TRANSFORMATIONS** (2 ta)
   - Strategic changes
   - High investment
   - Transformational impact

Har bir g'oya uchun ROI calculation va risk assessment qo'shing.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Creative Content G'oyalari Yaratuvchi",
    category: "G'oya Yaratish",
    description: "Original va viral content g'oyalarini yaratish",
    content: `Siz creative content strategist sifatida quyidagi brand uchun original content g'oyalari yarating:

BRAND: [BRAND_NOMI]
AUDITORIYA: [AUDITORIYA]
PLATFORM: [PLATFORM]
MAQSAD: [MAQSAD]
BRAND VOICE: [BRAND_VOICE]

Quyidagi content kategoriyalari bo'yicha g'oyalar yarating:

1. **VIRAL CONTENT IDEAS** (5 ta)
   - Trend-jacking opportunities
   - Meme-worthy concepts
   - Challenge creation
   - User-generated content

2. **EDUCATIONAL CONTENT** (5 ta)
   - How-to series
   - Industry insights
   - Behind-the-scenes
   - Expert interviews

3. **ENTERTAINMENT CONTENT** (5 ta)
   - Storytelling concepts
   - Interactive content
   - Gamification ideas
   - Community building

4. **PROMOTIONAL CONTENT** (3 ta)
   - Product showcases
   - Customer testimonials
   - Before/after stories
   - Limited-time campaigns

5. **SEASONAL VA EVENT-BASED** (2 ta)
   - Holiday campaigns
   - Industry events
   - Trending topics
   - Real-time marketing

**HAR BIR G'OYA UCHUN:**

6. **CONTENT DETAILS**
   - Format (video, image, text, etc.)
   - Platform optimization
   - Hashtag strategy
   - Visual elements

7. **ENGAGEMENT STRATEGY**
   - Call-to-action
   - Interaction encouragement
   - Community building
   - Conversation starters

8. **PRODUCTION REQUIREMENTS**
   - Resources needed
   - Timeline estimate
   - Skill requirements
   - Budget considerations

9. **SUCCESS METRICS**
   - KPI definitions
   - Measurement methods
   - Success thresholds
   - Optimization opportunities

G'oyalar original, brand-aligned va engagement-focused bo'lsin.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Partnership va Collaboration G'oyalari",
    category: "G'oya Yaratish",
    description: "Strategic partnership va collaboration opportunities",
    content: `Siz partnership strategist sifatida quyidagi company uchun strategic partnership g'oyalarini yarating:

COMPANY: [COMPANY_NOMI]
SOHA: [SOHA]
MAQSADLAR: [MAQSADLAR]
KOMPANIYA HAJMI: [KOMPANIYA_HAJMI]
CURRENT PARTNERSHIPS: [MAVJUD_PARTNERSHIPS]

Quyidagi partnership turlari bo'yicha g'oyalar yarating:

1. **STRATEGIC ALLIANCES** (3 ta)
   - Complementary businesses
   - Market expansion opportunities
   - Technology partnerships
   - Co-innovation projects

2. **CHANNEL PARTNERSHIPS** (3 ta)
   - Distribution partners
   - Reseller programs
   - Affiliate networks
   - Marketplace integrations

3. **CONTENT COLLABORATIONS** (2 ta)
   - Co-created content
   - Guest posting exchanges
   - Webinar partnerships
   - Joint research projects

4. **EVENT PARTNERSHIPS** (2 ta)
   - Conference collaborations
   - Workshop partnerships
   - Trade show sharing
   - Community events

**HAR BIR PARTNERSHIP G'OYASI UCHUN:**

5. **POTENTIAL PARTNERS**
   - Specific company suggestions
   - Partner profile criteria
   - Why they'd be interested
   - Mutual benefits

6. **VALUE PROPOSITION**
   - What you bring
   - What they bring
   - Synergy opportunities
   - Competitive advantages

7. **PARTNERSHIP STRUCTURE**
   - Partnership type
   - Revenue sharing model
   - Responsibilities division
   - Success metrics

8. **IMPLEMENTATION PLAN**
   - Approach strategy
   - Timeline
   - Key milestones
   - Risk mitigation

9. **SUCCESS CRITERIA**
   - KPI definitions
   - Measurement methods
   - Review processes
   - Exit strategies

Partnerships mutually beneficial, strategic va measurable bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Customer Experience Innovatori",
    category: "G'oya Yaratish",
    description: "Mijozlar tajribasini yaxshilash g'oyalari",
    content: `Siz customer experience eksperti sifatida quyidagi company uchun CX innovation g'oyalarini yarating:

COMPANY: [COMPANY_NOMI]
INDUSTRY: [INDUSTRY]
CURRENT CX CHALLENGES: [CX_CHALLENGES]
CUSTOMER SEGMENTS: [CUSTOMER_SEGMENTS]
TOUCHPOINTS: [TOUCHPOINTS]

Quyidagi customer journey bosqichlari bo'yicha innovation g'oyalari yarating:

1. **AWARENESS STAGE INNOVATIONS** (2 ta)
   - Brand discovery improvements
   - First impression optimization
   - Referral program enhancements
   - Educational content strategies

2. **CONSIDERATION STAGE INNOVATIONS** (2 ta)
   - Decision-making support tools
   - Personalized recommendations
   - Interactive demos
   - Comparison tools

3. **PURCHASE STAGE INNOVATIONS** (2 ta)
   - Checkout optimization
   - Payment experience improvements
   - Instant gratification elements
   - Support during purchase

4. **ONBOARDING INNOVATIONS** (2 ta)
   - Welcome experience redesign
   - Quick value demonstration
   - Guided setup processes
   - Success milestone celebrations

5. **RETENTION VA LOYALTY INNOVATIONS** (2 ta)
   - Personalization programs
   - Community building
   - Exclusive benefits
   - Surprise and delight moments

**HAR BIR INNOVATION UCHUN:**

6. **CUSTOMER IMPACT**
   - Pain point addressed
   - Emotional benefit
   - Functional improvement
   - Differentiation factor

7. **IMPLEMENTATION DETAILS**
   - Technology requirements
   - Process changes needed
   - Staff training requirements
   - Timeline estimate

8. **MEASUREMENT STRATEGY**
   - Success metrics
   - Customer feedback collection
   - A/B testing opportunities
   - ROI calculation

9. **RISK ASSESSMENT**
   - Implementation risks
   - Customer adoption risks
   - Mitigation strategies
   - Rollback plans

CX innovations customer-centric, memorable va measurable bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Revenue Stream Diversifikatori",
    category: "G'oya Yaratish",
    description: "Yangi revenue stream larni yaratish g'oyalari",
    content: `Siz revenue strategist sifatida quyidagi business uchun yangi revenue stream g'oyalarini yarating:

CURRENT BUSINESS: [CURRENT_BUSINESS]
MAIN REVENUE SOURCE: [MAIN_REVENUE_SOURCE]
CUSTOMER BASE: [CUSTOMER_BASE]
CORE COMPETENCIES: [CORE_COMPETENCIES]
AVAILABLE RESOURCES: [AVAILABLE_RESOURCES]

Quyidagi revenue model kategoriyalari bo'yicha g'oyalar yarating:

1. **PRODUCT-BASED REVENUE** (3 ta)
   - New product lines
   - Product variations
   - Premium versions
   - Complementary products

2. **SERVICE-BASED REVENUE** (3 ta)
   - Consulting services
   - Maintenance services
   - Training programs
   - Support packages

3. **SUBSCRIPTION REVENUE** (2 ta)
   - Recurring service models
   - Membership programs
   - SaaS offerings
   - Content subscriptions

4. **LICENSING VA IP REVENUE** (2 ta)
   - Intellectual property licensing
   - Franchise models
   - White-label solutions
   - Technology licensing

**HAR BIR REVENUE STREAM UCHUN:**

5. **BUSINESS MODEL DESIGN**
   - Revenue structure
   - Pricing strategy
   - Customer segments
   - Value proposition

6. **MARKET OPPORTUNITY**
   - Market size estimation
   - Competition analysis
   - Customer demand validation
   - Growth potential

7. **IMPLEMENTATION REQUIREMENTS**
   - Resource needs
   - Skill requirements
   - Technology needs
   - Timeline estimate

8. **FINANCIAL PROJECTIONS**
   - Revenue forecasts
   - Cost structure
   - Profitability timeline
   - Break-even analysis

9. **RISK VA MITIGATION**
   - Market risks
   - Operational risks
   - Financial risks
   - Mitigation strategies

Revenue streams diversified, scalable va profitable bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Workplace Innovation Eksperti",
    category: "G'oya Yaratish",
    description: "Ish joyi va jamoa samaradorligini oshirish g'oyalari",
    content: `Siz workplace innovation eksperti sifatida quyidagi organization uchun innovation g'oyalarini yarating:

ORGANIZATION: [ORGANIZATION_NOMI]
TEAM SIZE: [TEAM_SIZE]
WORK MODEL: [WORK_MODEL]
CURRENT CHALLENGES: [CURRENT_CHALLENGES]
GOALS: [GOALS]

Quyidagi innovation areas bo'yicha g'oyalar yarating:

1. **PRODUCTIVITY INNOVATIONS** (3 ta)
   - Workflow optimization
   - Tool integration
   - Time management systems
   - Distraction elimination

2. **COLLABORATION IMPROVEMENTS** (3 ta)
   - Team communication tools
   - Knowledge sharing systems
   - Cross-department collaboration
   - Remote work optimization

3. **EMPLOYEE ENGAGEMENT** (2 ta)
   - Recognition programs
   - Skill development opportunities
   - Wellness initiatives
   - Feedback systems

4. **WORKSPACE DESIGN** (2 ta)
   - Physical space optimization
   - Technology integration
   - Flexibility improvements
   - Comfort enhancements

**HAR BIR INNOVATION UCHUN:**

5. **IMPLEMENTATION STRATEGY**
   - Rollout approach
   - Change management
   - Training requirements
   - Success metrics

6. **EXPECTED BENEFITS**
   - Productivity improvements
   - Employee satisfaction
   - Cost savings
   - Quality enhancements

7. **RESOURCE REQUIREMENTS**
   - Budget estimates
   - Technology needs
   - Human resources
   - Timeline

8. **MEASUREMENT PLAN**
   - KPI definitions
   - Data collection methods
   - Review frequency
   - Adjustment mechanisms

9. **CHANGE MANAGEMENT**
   - Stakeholder buy-in
   - Communication strategy
   - Training programs
   - Support systems

Innovations employee-focused, practical va sustainable bo'lsin.`,
    is_premium: false,
    is_public: true
  },

  // CATEGORY 4: MARKETING (Marketing) - 10 prompts
  {
    title: "360° Marketing Strategiyasi Yaratuvchi",
    category: "Marketing",
    description: "Comprehensive marketing strategy va implementation plan",
    content: `Siz marketing strategist sifatida quyidagi business uchun 360° marketing strategiyasi yarating:

BUSINESS: [BUSINESS_NOMI]
SOHA: [SOHA]
MAQSADLI AUDITORIYA: [MAQSADLI_AUDITORIYA]
BUDJET: [BUDJET]
MAQSADLAR: [MAQSADLAR]
TIMELINE: [TIMELINE]

Quyidagi comprehensive strategy yarating:

1. **MARKET ANALYSIS**
   - Target market segmentation
   - Buyer personas (3-5 ta)
   - Competitor analysis
   - Market trends va opportunities

2. **BRAND POSITIONING**
   - Unique value proposition
   - Brand differentiation
   - Brand messaging hierarchy
   - Competitive positioning

3. **MARKETING MIX STRATEGY**
   
   **DIGITAL MARKETING:**
   - SEO/SEM strategy
   - Social media strategy
   - Content marketing plan
   - Email marketing approach
   - Influencer partnerships

   **TRADITIONAL MARKETING:**
   - PR strategy
   - Events marketing
   - Print advertising
   - Direct mail campaigns

4. **CHANNEL STRATEGY**
   - Channel prioritization
   - Budget allocation (%)
   - Cross-channel integration
   - Attribution modeling

5. **CONTENT STRATEGY**
   - Content pillars (5-7 ta)
   - Content calendar framework
   - Content types va formats
   - Distribution strategy

6. **CUSTOMER JOURNEY MAPPING**
   - Awareness stage tactics
   - Consideration stage nurturing
   - Decision stage conversion
   - Retention va advocacy

7. **IMPLEMENTATION ROADMAP**
   - Phase 1: Quick wins (0-90 kun)
   - Phase 2: Foundation building (3-6 oy)
   - Phase 3: Scale va optimize (6-12 oy)

8. **MEASUREMENT FRAMEWORK**
   - KPI dashboard
   - Attribution models
   - ROI calculation methods
   - Optimization processes

Strategy holistic, data-driven va results-focused bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Target Auditoriya Tahlilchisi",
    category: "Marketing",
    description: "Chuqur target audience research va persona yaratish",
    content: `Siz audience research eksperti sifatida quyidagi business uchun batafsil target audience tahlili va persona yarating:

BUSINESS/MAHSULOT: [BUSINESS_MAHSULOT]
INDUSTRY: [INDUSTRY]
GEOGRAFIK HUDUD: [GEOGRAFIK_HUDUD]
PRICE POINT: [PRICE_POINT]

Quyidagi comprehensive audience analysis yarating:

1. **PRIMARY RESEARCH PLAN**
   - Survey questions (10-15 ta)
   - Interview guide
   - Focus group topics
   - Observation methods

2. **DEMOGRAPHIC ANALYSIS**
   - Age ranges
   - Gender distribution
   - Income levels
   - Education background
   - Geographic distribution

3. **PSYCHOGRAPHIC PROFILE**
   - Values va beliefs
   - Interests va hobbies
   - Lifestyle preferences
   - Personality traits
   - Aspirations va goals

4. **BEHAVIORAL PATTERNS**
   - Purchase behavior
   - Media consumption habits
   - Online activity patterns
   - Decision-making process
   - Brand loyalty factors

5. **BUYER PERSONAS** (3-4 ta detailed persona)
   
   **HAR BIR PERSONA UCHUN:**
   - Name va photo
   - Demographic details
   - Background story
   - Goals va motivations
   - Pain points va challenges
   - Preferred communication channels
   - Buying triggers
   - Objections va barriers

6. **CUSTOMER JOURNEY MAPPING**
   - Awareness stage behavior
   - Research process
   - Evaluation criteria
   - Purchase decision factors
   - Post-purchase experience

7. **MESSAGING STRATEGY**
   - Key messages for each persona
   - Tone of voice preferences
   - Content types that resonate
   - Channel preferences

8. **TARGETING RECOMMENDATIONS**
   - Primary vs secondary targets
   - Channel allocation
   - Budget recommendations
   - Campaign ideas

Tahlil in-depth, actionable va marketing strategy ga foundational bo'lsin.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Brand Positioning Strategist",
    category: "Marketing",
    description: "Unique brand positioning va competitive differentiation",
    content: `Siz brand strategist sifatida quyidagi brand uchun unique positioning strategy yarating:

BRAND: [BRAND_NOMI]
CATEGORY: [CATEGORY]
TARGET AUDIENCE: [TARGET_AUDIENCE]
CURRENT PERCEPTION: [CURRENT_PERCEPTION]
DESIRED POSITION: [DESIRED_POSITION]

Quyidagi brand positioning framework yarating:

1. **COMPETITIVE LANDSCAPE ANALYSIS**
   - Direct competitors (5-7 ta)
   - Indirect competitors
   - Market positioning map
   - Competitive gaps identification

2. **BRAND AUDIT**
   - Current brand perception
   - Brand strengths va weaknesses
   - Brand equity assessment
   - Stakeholder feedback analysis

3. **POSITIONING STRATEGY**
   - Target audience definition
   - Category definition
   - Point of difference
   - Reason to believe
   - Brand character

4. **VALUE PROPOSITION DEVELOPMENT**
   - Functional benefits
   - Emotional benefits
   - Social benefits
   - Unique selling proposition

5. **MESSAGING ARCHITECTURE**
   - Brand promise
   - Brand pillars (3-5 ta)
   - Proof points
   - Elevator pitch
   - Tagline options (5-7 ta)

6. **BRAND PERSONALITY**
   - Personality traits (5 ta)
   - Brand voice guidelines
   - Tone of voice examples
   - Brand behavior principles

7. **POSITIONING VALIDATION**
   - Customer testing approach
   - Market research plan
   - Success metrics
   - Refinement process

8. **IMPLEMENTATION ROADMAP**
   - Internal alignment
   - External communication
   - Marketing campaign ideas
   - Brand experience touchpoints

9. **MONITORING VA EVOLUTION**
   - Brand tracking metrics
   - Perception monitoring
   - Competitive tracking
   - Positioning refinement

Positioning unique, memorable, credible va differentiated bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Digital Marketing Campaign Yaratuvchi",
    category: "Marketing",
    description: "Multi-channel digital marketing campaigns",
    content: `Siz digital marketing eksperti sifatida quyidagi maqsad uchun comprehensive digital campaign yarating:

CAMPAIGN MAQSADI: [CAMPAIGN_MAQSADI]
TARGET AUDIENCE: [TARGET_AUDIENCE]
BUDJET: [BUDJET]
TIMELINE: [TIMELINE]
KPI TARGETS: [KPI_TARGETS]

Quyidagi multi-channel campaign strategy yarating:

1. **CAMPAIGN STRATEGY**
   - Campaign positioning
   - Core message va theme
   - Creative concept
   - Call-to-action strategy

2. **CHANNEL STRATEGY**
   
   **SOCIAL MEDIA** (40% budget)
   - Facebook/Instagram campaigns
   - LinkedIn strategy (B2B)
   - TikTok/YouTube (video content)
   - Twitter engagement

   **SEARCH MARKETING** (30% budget)
   - Google Ads strategy
   - SEO content plan
   - Keyword targeting
   - Landing page optimization

   **EMAIL MARKETING** (15% budget)
   - Segmentation strategy
   - Automation sequences
   - Personalization approach
   - A/B testing plan

   **CONTENT MARKETING** (15% budget)
   - Blog content calendar
   - Video content plan
   - Infographic series
   - Podcast/webinar strategy

3. **CREATIVE STRATEGY**
   - Visual identity guidelines
   - Creative concepts (3-5 ta)
   - Asset requirements
   - Brand consistency rules

4. **TECHNICAL IMPLEMENTATION**
   - Tracking setup (GA4, pixels)
   - Conversion tracking
   - Attribution modeling
   - Marketing automation

5. **CONTENT CALENDAR**
   - Weekly content themes
   - Platform-specific content
   - Cross-promotion strategy
   - User-generated content

6. **CAMPAIGN TIMELINE**
   - Pre-launch (preparation)
   - Launch week activities
   - Optimization periods
   - Post-campaign analysis

7. **MEASUREMENT PLAN**
   - KPI definitions va targets
   - Reporting schedule
   - Optimization triggers
   - ROI calculation

Campaign integrated, measurable va scalable bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Content Marketing Strategist",
    category: "Marketing",
    description: "Comprehensive content marketing strategy va calendar",
    content: `Siz content marketing eksperti sifatida quyidagi brand uchun comprehensive content strategy yarating:

BRAND: [BRAND_NOMI]
INDUSTRY: [INDUSTRY]
CONTENT GOALS: [CONTENT_GOALS]
TARGET AUDIENCE: [TARGET_AUDIENCE]
CONTENT BUDGET: [CONTENT_BUDGET]

Quyidagi content marketing strategy yarating:

1. **CONTENT AUDIT VA ANALYSIS**
   - Mavjud content inventory
   - Performance analysis
   - Content gaps identification
   - Competitor content analysis

2. **CONTENT STRATEGY FRAMEWORK**
   - Content mission statement
   - Brand story framework
   - Content pillars (5-7 ta)
   - Content themes va topics

3. **AUDIENCE-DRIVEN CONTENT MAPPING**
   - Persona-based content needs
   - Customer journey content
   - Pain point addressing
   - Educational content opportunities

4. **CONTENT TYPES VA FORMATS**
   
   **WRITTEN CONTENT**
   - Blog posts (weekly themes)
   - Case studies
   - White papers
   - Email newsletters

   **VISUAL CONTENT**
   - Infographics
   - Social media graphics
   - Video series
   - Interactive content

   **AUDIO CONTENT**
   - Podcast strategy
   - Audio blogs
   - Voice content

5. **CONTENT CALENDAR** (3-oy plan)
   - Weekly content themes
   - Platform-specific adaptations
   - Seasonal content opportunities
   - Trending topics integration

6. **CONTENT PRODUCTION WORKFLOW**
   - Ideation process
   - Creation workflow
   - Review va approval process
   - Publishing schedule

7. **DISTRIBUTION STRATEGY**
   - Owned media channels
   - Earned media opportunities
   - Paid promotion strategy
   - Cross-platform optimization

8. **CONTENT OPTIMIZATION**
   - SEO optimization
   - Social sharing optimization
   - Conversion optimization
   - Repurposing strategy

9. **MEASUREMENT VA ANALYTICS**
   - Content performance metrics
   - Engagement tracking
   - Lead generation tracking
   - ROI measurement

Strategy audience-centric, scalable va results-driven bo'lsin.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Customer Retention Marketing Eksperti",
    category: "Marketing",
    description: "Customer loyalty va retention strategies",
    content: `Siz customer retention eksperti sifatida quyidagi business uchun comprehensive retention strategy yarating:

BUSINESS: [BUSINESS_NOMI]
CUSTOMER LIFECYCLE: [CUSTOMER_LIFECYCLE]
CHURN RATE: [CHURN_RATE]
RETENTION CHALLENGES: [RETENTION_CHALLENGES]
CUSTOMER VALUE: [CUSTOMER_VALUE]

Quyidagi retention marketing strategy yarating:

1. **CUSTOMER LIFECYCLE ANALYSIS**
   - Lifecycle stage definitions
   - Behavior patterns analysis
   - Drop-off points identification
   - Value creation opportunities

2. **SEGMENTATION STRATEGY**
   - Value-based segmentation
   - Behavior-based segments
   - Risk level segmentation
   - Engagement level grouping

3. **ONBOARDING OPTIMIZATION**
   - Welcome sequence design
   - Quick value demonstration
   - Success milestone tracking
   - Early engagement tactics

4. **ENGAGEMENT CAMPAIGNS**
   
   **REGULAR TOUCHPOINTS**
   - Educational content series
   - Feature spotlights
   - Success story sharing
   - Community building

   **BEHAVIORAL TRIGGERS**
   - Usage-based messaging
   - Achievement celebrations
   - Re-engagement sequences
   - Win-back campaigns

5. **LOYALTY PROGRAM DESIGN**
   - Loyalty program structure
   - Reward system design
   - Tier benefits definition
   - Gamification elements

6. **PERSONALIZATION STRATEGY**
   - Dynamic content delivery
   - Personalized recommendations
   - Customized experiences
   - Preference management

7. **CUSTOMER SUCCESS INITIATIVES**
   - Success metric tracking
   - Proactive support
   - Training programs
   - Resource libraries

8. **RETENTION CAMPAIGNS**
   
   **PREVENTIVE CAMPAIGNS**
   - Early warning systems
   - Health score monitoring
   - Intervention strategies
   - Risk mitigation

   **WIN-BACK CAMPAIGNS**
   - Lapsed customer identification
   - Re-engagement sequences
   - Special offers design
   - Feedback collection

9. **MEASUREMENT FRAMEWORK**
   - Retention rate tracking
   - Customer lifetime value
   - Engagement metrics
   - Satisfaction scores

Strategy data-driven, personalized va customer-centric bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Influencer Marketing Strategist",
    category: "Marketing",
    description: "Influencer partnership va campaign strategiyasi",
    content: `Siz influencer marketing eksperti sifatida quyidagi brand uchun influencer strategy yarating:

BRAND: [BRAND_NOMI]
PRODUCT/SERVICE: [PRODUCT_SERVICE]
TARGET AUDIENCE: [TARGET_AUDIENCE]
CAMPAIGN GOALS: [CAMPAIGN_GOALS]
BUDGET: [BUDGET]

Quyidagi influencer marketing strategy yarating:

1. **INFLUENCER STRATEGY FRAMEWORK**
   - Campaign objectives
   - Target audience alignment
   - Brand fit criteria
   - Success metrics definition

2. **INFLUENCER IDENTIFICATION**
   
   **MACRO-INFLUENCERS** (100K+ followers)
   - Industry thought leaders
   - Celebrity partnerships
   - Brand ambassadors
   - Content quality assessment

   **MICRO-INFLUENCERS** (10K-100K followers)
   - Niche specialists
   - High engagement rates
   - Authentic audiences
   - Cost-effective options

   **NANO-INFLUENCERS** (1K-10K followers)
   - Local influencers
   - Community leaders
   - Customer advocates
   - Authentic recommendations

3. **INFLUENCER VETTING PROCESS**
   - Audience authenticity check
   - Engagement rate analysis
   - Content quality assessment
   - Brand alignment evaluation
   - Past partnership review

4. **CAMPAIGN TYPES**
   
   **CONTENT COLLABORATION**
   - Sponsored posts
   - Product reviews
   - Unboxing videos
   - Tutorial content

   **LONG-TERM PARTNERSHIPS**
   - Brand ambassadorships
   - Exclusive partnerships
   - Co-created products
   - Event collaborations

5. **CONTENT STRATEGY**
   - Content brief templates
   - Brand guidelines
   - Creative freedom balance
   - Content approval process

6. **CAMPAIGN EXECUTION**
   - Outreach templates
   - Negotiation strategies
   - Contract templates
   - Timeline management

7. **COMPLIANCE VA LEGAL**
   - FTC guidelines compliance
   - Disclosure requirements
   - Contract terms
   - Intellectual property

8. **PERFORMANCE TRACKING**
   - Reach va impressions
   - Engagement metrics
   - Click-through rates
   - Conversion tracking
   - ROI calculation

9. **RELATIONSHIP MANAGEMENT**
   - Influencer onboarding
   - Communication protocols
   - Payment processes
   - Long-term nurturing

Strategy authentic, compliant va measurable bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Event Marketing Strategist",
    category: "Marketing",
    description: "Virtual va physical event marketing campaigns",
    content: `Siz event marketing eksperti sifatida quyidagi event uchun comprehensive marketing strategy yarating:

EVENT: [EVENT_NOMI]
EVENT TURI: [EVENT_TURI]
TARGET ATTENDANCE: [TARGET_ATTENDANCE]
AUDITORIYA: [AUDITORIYA]
BUDGET: [BUDGET]
TIMELINE: [TIMELINE]

Quyidagi event marketing strategy yarating:

1. **EVENT MARKETING GOALS**
   - Attendance targets
   - Lead generation goals
   - Brand awareness objectives
   - Community building aims

2. **TARGET AUDIENCE STRATEGY**
   - Primary audience segments
   - Secondary audiences
   - VIP/speaker targeting
   - Partner audiences

3. **PRE-EVENT MARKETING** (8-12 hafta oldin)
   
   **AWARENESS BUILDING**
   - Save the date campaigns
   - Speaker announcements
   - Early bird promotions
   - Social media teasers

   **REGISTRATION DRIVE**
   - Landing page optimization
   - Email marketing sequences
   - Partner promotions
   - Influencer partnerships

   **CONTENT MARKETING**
   - Blog post series
   - Speaker spotlights
   - Event preview content
   - Educational content

4. **EVENT WEEK MARKETING**
   - Countdown campaigns
   - Last-chance messaging
   - Live social updates
   - Attendee preparation

5. **DURING EVENT ENGAGEMENT**
   - Live social coverage
   - Real-time content sharing
   - Audience interaction
   - User-generated content

6. **POST-EVENT FOLLOW-UP**
   - Thank you campaigns
   - Content sharing
   - Feedback collection
   - Lead nurturing sequences

7. **CHANNEL STRATEGY**
   - Email marketing plan
   - Social media strategy
   - Paid advertising approach
   - PR va media outreach
   - Partner cross-promotion

8. **CONTENT STRATEGY**
   - Video content plan
   - Visual assets creation
   - Speaker content coordination
   - Live streaming strategy

9. **MEASUREMENT PLAN**
   - Registration tracking
   - Attendance metrics
   - Engagement measurements
   - Lead quality assessment
   - ROI calculation

Strategy integrated, engaging va results-focused bo'lsin.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Email Marketing Automation Eksperti",
    category: "Marketing",
    description: "Advanced email marketing automation va segmentation",
    content: `Siz email marketing eksperti sifatida quyidagi business uchun comprehensive email automation strategy yarating:

BUSINESS: [BUSINESS_NOMI]
EMAIL LIST SIZE: [EMAIL_LIST_SIZE]
CURRENT PERFORMANCE: [CURRENT_PERFORMANCE]
GOALS: [GOALS]
CUSTOMER LIFECYCLE: [CUSTOMER_LIFECYCLE]

Quyidagi email automation strategy yarating:

1. **EMAIL STRATEGY FRAMEWORK**
   - Email marketing goals
   - Audience segmentation strategy
   - Content strategy alignment
   - Frequency optimization

2. **ADVANCED SEGMENTATION**
   - Demographic segmentation
   - Behavioral segmentation
   - Purchase history segments
   - Engagement level groups
   - Custom field segmentation

3. **AUTOMATION WORKFLOWS**
   
   **WELCOME SERIES** (5-7 emails)
   - Welcome email
   - Brand story
   - Product education
   - Social proof
   - First purchase incentive

   **ABANDONED CART SERIES** (3-4 emails)
   - Gentle reminder
   - Urgency creation
   - Social proof addition
   - Alternative suggestions

   **POST-PURCHASE SERIES** (4-5 emails)
   - Order confirmation
   - Shipping updates
   - Usage tips
   - Review requests
   - Cross-sell opportunities

   **RE-ENGAGEMENT SERIES** (3-4 emails)
   - "We miss you" messaging
   - Special offers
   - Preference updates
   - Win-back incentives

4. **TRIGGERED CAMPAIGNS**
   - Birthday/anniversary emails
   - Milestone celebrations
   - Behavior-triggered sequences
   - Time-based automations

5. **PERSONALIZATION STRATEGY**
   - Dynamic content blocks
   - Product recommendations
   - Location-based content
   - Purchase history personalization

6. **EMAIL DESIGN VA CONTENT**
   - Mobile-first templates
   - Brand consistency
   - Visual hierarchy
   - CTA optimization

7. **DELIVERABILITY OPTIMIZATION**
   - List hygiene practices
   - Sender reputation management
   - Authentication setup
   - Spam prevention

8. **A/B TESTING FRAMEWORK**
   - Subject line testing
   - Content testing
   - Send time optimization
   - Frequency testing

9. **PERFORMANCE OPTIMIZATION**
   - Open rate improvement
   - Click-through rate optimization
   - Conversion rate enhancement
   - List growth strategies

Strategy personalized, automated va conversion-focused bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Marketing ROI Tahlilchisi",
    category: "Marketing",
    description: "Marketing campaigns ROI measurement va optimization",
    content: `Siz marketing analytics eksperti sifatida quyidagi marketing activities uchun comprehensive ROI analysis va optimization plan yarating:

BUSINESS: [BUSINESS_NOMI]
MARKETING CHANNELS: [MARKETING_CHANNELS]
CURRENT BUDGET: [CURRENT_BUDGET]
TRACKING CHALLENGES: [TRACKING_CHALLENGES]
BUSINESS GOALS: [BUSINESS_GOALS]

Quyidagi ROI analysis framework yarating:

1. **ROI MEASUREMENT FRAMEWORK**
   - ROI calculation methodologies
   - Attribution model selection
   - Customer lifetime value integration
   - Cost allocation strategies

2. **CHANNEL-SPECIFIC ANALYSIS**
   
   **DIGITAL CHANNELS**
   - Google Ads ROI analysis
   - Social media advertising
   - Email marketing returns
   - SEO investment returns
   - Content marketing ROI

   **TRADITIONAL CHANNELS**
   - Print advertising analysis
   - Event marketing ROI
   - PR value calculation
   - Direct mail returns

3. **ATTRIBUTION MODELING**
   - First-touch attribution
   - Last-touch attribution
   - Multi-touch attribution
   - Time-decay models
   - Custom attribution setup

4. **TRACKING IMPLEMENTATION**
   - Conversion tracking setup
   - UTM parameter strategy
   - Goal configuration
   - E-commerce tracking
   - Offline conversion tracking

5. **KEY METRICS DASHBOARD**
   - Customer acquisition cost (CAC)
   - Return on ad spend (ROAS)
   - Marketing qualified leads (MQL)
   - Sales qualified leads (SQL)
   - Customer lifetime value (CLV)

6. **PERFORMANCE BENCHMARKING**
   - Industry benchmarks
   - Historical performance
   - Competitive analysis
   - Best-practice standards

7. **OPTIMIZATION RECOMMENDATIONS**
   - Budget reallocation strategies
   - Underperforming channel improvements
   - High-performing channel scaling
   - Testing opportunities

8. **REPORTING STRUCTURE**
   - Executive summary reports
   - Detailed channel reports
   - Trend analysis reports
   - Action-oriented insights

9. **CONTINUOUS IMPROVEMENT**
   - Monthly optimization reviews
   - Quarterly strategy adjustments
   - Annual budget planning
   - Testing roadmap

Analysis data-driven, actionable va business-aligned bo'lsin.`,
    is_premium: true,
    is_public: true
  },

  // CATEGORY 5: BUSINESS ANALYTICS (Biznes Tahlili) - 10 prompts
  {
    title: "KPI Dashboard Yaratuvchi",
    category: "Biznes Tahlili",
    description: "Comprehensive business KPI dashboard va monitoring system",
    content: `Siz business analytics eksperti sifatida quyidagi business uchun comprehensive KPI dashboard yarating:

BUSINESS: [BUSINESS_NOMI]
INDUSTRY: [INDUSTRY]
BUSINESS GOALS: [BUSINESS_GOALS]
CURRENT CHALLENGES: [CURRENT_CHALLENGES]
STAKEHOLDERS: [STAKEHOLDERS]

Quyidagi KPI framework yarating:

1. **STRATEGIC KPI HIERARCHY**
   
   **EXECUTIVE-LEVEL KPIs**
   - Revenue growth rate
   - Profit margins
   - Market share
   - Customer satisfaction score
   - Employee satisfaction

   **OPERATIONAL KPIs**
   - Customer acquisition cost
   - Customer lifetime value
   - Conversion rates
   - Operational efficiency
   - Quality metrics

   **DEPARTMENTAL KPIs**
   - Sales performance
   - Marketing effectiveness
   - Customer service metrics
   - Product performance
   - Financial health

2. **KPI SPECIFICATIONS**
   - KPI definitions
   - Calculation methods
   - Data sources
   - Update frequency
   - Target values va thresholds

3. **DASHBOARD DESIGN**
   - Executive summary view
   - Departmental dashboards
   - Operational dashboards
   - Real-time monitoring
   - Mobile optimization

4. **DATA VISUALIZATION**
   - Chart type recommendations
   - Color coding systems
   - Alert mechanisms
   - Trend indicators
   - Comparative analysis

5. **AUTOMATED REPORTING**
   - Daily automated reports
   - Weekly summaries
   - Monthly deep dives
   - Quarterly reviews
   - Annual assessments

6. **PERFORMANCE TARGETS**
   - Baseline establishment
   - Target setting methodology
   - Performance bands
   - Benchmark comparisons
   - Goal alignment

7. **ALERT SYSTEM**
   - Performance thresholds
   - Automated notifications
   - Escalation procedures
   - Action triggers
   - Response protocols

8. **DATA GOVERNANCE**
   - Data quality standards
   - Update responsibilities
   - Access controls
   - Audit trails
   - Version control

9. **CONTINUOUS IMPROVEMENT**
   - KPI relevance reviews
   - Dashboard optimization
   - User feedback integration
   - Technology upgrades
   - Process refinements

Dashboard actionable, user-friendly va strategically aligned bo'lsin.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Customer Behavior Tahlilchisi",
    category: "Biznes Tahlili",
    description: "Customer journey va behavior pattern analysis",
    content: `Siz customer analytics eksperti sifatida quyidagi business uchun customer behavior analysis yarating:

BUSINESS: [BUSINESS_NOMI]
CUSTOMER BASE: [CUSTOMER_BASE]
TOUCHPOINTS: [TOUCHPOINTS]
CURRENT CHALLENGES: [CURRENT_CHALLENGES]
ANALYSIS GOALS: [ANALYSIS_GOALS]

Quyidagi customer behavior analysis yarating:

1. **CUSTOMER DATA AUDIT**
   - Available data sources
   - Data quality assessment
   - Data integration opportunities
   - Missing data identification
   - Collection method evaluation

2. **CUSTOMER SEGMENTATION ANALYSIS**
   - Demographic segmentation
   - Behavioral segmentation
   - Value-based segmentation
   - Lifecycle stage analysis
   - Psychographic profiling

3. **CUSTOMER JOURNEY MAPPING**
   - Touchpoint identification
   - Journey stage definition
   - Pain point analysis
   - Moment of truth identification
   - Experience gap analysis

4. **BEHAVIORAL PATTERN ANALYSIS**
   - Purchase behavior patterns
   - Website/app usage patterns
   - Communication preferences
   - Seasonal behavior trends
   - Cross-selling opportunities

5. **CUSTOMER LIFETIME VALUE ANALYSIS**
   - CLV calculation methodology
   - Segment-specific CLV
   - CLV trend analysis
   - Value driver identification
   - Retention impact analysis

6. **CHURN ANALYSIS**
   - Churn rate calculation
   - Churn prediction modeling
   - Risk factor identification
   - Early warning indicators
   - Retention strategy insights

7. **ENGAGEMENT ANALYSIS**
   - Engagement scoring models
   - Channel engagement patterns
   - Content engagement analysis
   - Feature usage analysis
   - Interaction frequency patterns

8. **COHORT ANALYSIS**
   - Acquisition cohorts
   - Behavioral cohorts
   - Retention cohorts
   - Revenue cohorts
   - Performance comparisons

9. **PREDICTIVE INSIGHTS**
   - Future behavior predictions
   - Propensity modeling
   - Next best action recommendations
   - Personalization opportunities
   - Optimization suggestions

10. **ACTIONABLE RECOMMENDATIONS**
    - Customer experience improvements
    - Personalization strategies
    - Retention initiatives
    - Acquisition optimizations
    - Revenue growth opportunities

Analysis data-driven, insight-rich va actionable bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Financial Performance Tahlilchisi",
    category: "Biznes Tahlili",
    description: "Comprehensive financial analysis va forecasting",
    content: `Siz financial analyst sifatida quyidagi business uchun comprehensive financial analysis yarating:

BUSINESS: [BUSINESS_NOMI]
FINANCIAL PERIOD: [FINANCIAL_PERIOD]
BUSINESS MODEL: [BUSINESS_MODEL]
MAIN CONCERNS: [MAIN_CONCERNS]
ANALYSIS PURPOSE: [ANALYSIS_PURPOSE]

Quyidagi financial analysis yarating:

1. **FINANCIAL HEALTH ASSESSMENT**
   - Liquidity analysis
   - Solvency analysis
   - Profitability analysis
   - Efficiency analysis
   - Growth analysis

2. **REVENUE ANALYSIS**
   - Revenue stream breakdown
   - Revenue trend analysis
   - Seasonal patterns
   - Customer segment contribution
   - Product/service performance

3. **COST STRUCTURE ANALYSIS**
   - Fixed vs variable costs
   - Cost category breakdown
   - Cost driver identification
   - Cost trend analysis
   - Efficiency opportunities

4. **PROFITABILITY ANALYSIS**
   - Gross profit margins
   - Operating profit margins
   - Net profit margins
   - EBITDA analysis
   - Profit by segment

5. **CASH FLOW ANALYSIS**
   - Operating cash flow
   - Investment cash flow
   - Financing cash flow
   - Free cash flow
   - Cash conversion cycle

6. **FINANCIAL RATIOS**
   - Liquidity ratios
   - Leverage ratios
   - Efficiency ratios
   - Profitability ratios
   - Market value ratios

7. **BENCHMARKING ANALYSIS**
   - Industry comparisons
   - Competitor analysis
   - Historical benchmarks
   - Best practice standards
   - Performance gaps

8. **FINANCIAL FORECASTING**
   - Revenue forecasting
   - Expense projections
   - Cash flow forecasting
   - Scenario planning
   - Sensitivity analysis

9. **RISK ANALYSIS**
   - Financial risk assessment
   - Market risk evaluation
   - Credit risk analysis
   - Operational risk factors
   - Mitigation strategies

10. **STRATEGIC RECOMMENDATIONS**
    - Growth opportunities
    - Cost optimization
    - Capital allocation
    - Investment priorities
    - Financial strategy

Analysis comprehensive, accurate va strategically relevant bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Market Research va Competitive Analysis",
    category: "Biznes Tahlili",
    description: "In-depth market research va competitor intelligence",
    content: `Siz market research eksperti sifatida quyidagi business uchun comprehensive market analysis yarating:

BUSINESS/PRODUCT: [BUSINESS_PRODUCT]
TARGET MARKET: [TARGET_MARKET]
GEOGRAPHIC SCOPE: [GEOGRAPHIC_SCOPE]
RESEARCH OBJECTIVES: [RESEARCH_OBJECTIVES]
TIMELINE: [TIMELINE]

Quyidagi market research framework yarating:

1. **MARKET SIZE VA OPPORTUNITY**
   - Total addressable market (TAM)
   - Serviceable addressable market (SAM)
   - Serviceable obtainable market (SOM)
   - Market growth projections
   - Revenue opportunity assessment

2. **MARKET SEGMENTATION**
   - Segment identification
   - Segment sizing
   - Segment attractiveness
   - Growth potential
   - Competitive intensity

3. **CUSTOMER RESEARCH**
   - Customer needs analysis
   - Pain point identification
   - Purchase behavior study
   - Decision-making process
   - Price sensitivity analysis

4. **COMPETITIVE LANDSCAPE**
   - Direct competitor analysis
   - Indirect competitor analysis
   - Competitive positioning map
   - Market share analysis
   - Competitive advantages

5. **COMPETITOR PROFILES** (5-7 ta competitor)
   - Company overview
   - Product/service offering
   - Pricing strategy
   - Marketing approach
   - Strengths va weaknesses
   - Market positioning

6. **TREND ANALYSIS**
   - Industry trends
   - Technology trends
   - Consumer trends
   - Regulatory trends
   - Economic trends

7. **SWOT ANALYSIS**
   - Market strengths
   - Market weaknesses
   - Market opportunities
   - Market threats
   - Strategic implications

8. **BARRIERS TO ENTRY**
   - Capital requirements
   - Regulatory barriers
   - Technology barriers
   - Brand loyalty
   - Distribution challenges

9. **MARKET ENTRY STRATEGY**
   - Entry timing
   - Entry mode selection
   - Go-to-market strategy
   - Resource requirements
   - Success factors

10. **RESEARCH METHODOLOGY**
    - Primary research plan
    - Secondary research sources
    - Data collection methods
    - Sample size va selection
    - Research limitations

Research thorough, objective va actionable bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Operational Efficiency Tahlilchisi",
    category: "Biznes Tahlili",
    description: "Business process efficiency va optimization analysis",
    content: `Siz operations analyst sifatida quyidagi business uchun operational efficiency analysis yarating:

BUSINESS: [BUSINESS_NOMI]
CORE PROCESSES: [CORE_PROCESSES]
EFFICIENCY CHALLENGES: [EFFICIENCY_CHALLENGES]
IMPROVEMENT GOALS: [IMPROVEMENT_GOALS]
AVAILABLE DATA: [AVAILABLE_DATA]

Quyidagi operational analysis yarating:

1. **PROCESS MAPPING VA ANALYSIS**
   - Current state process maps
   - Value stream mapping
   - Workflow documentation
   - Handoff points identification
   - Decision points analysis

2. **EFFICIENCY METRICS**
   - Cycle time analysis
   - Throughput measurement
   - Resource utilization
   - Quality metrics
   - Error rates

3. **BOTTLENECK IDENTIFICATION**
   - Constraint analysis
   - Capacity assessment
   - Resource allocation
   - Queue analysis
   - Delay identification

4. **COST ANALYSIS**
   - Activity-based costing
   - Process cost breakdown
   - Resource cost allocation
   - Waste identification
   - Cost reduction opportunities

5. **PERFORMANCE BENCHMARKING**
   - Industry benchmarks
   - Best practice standards
   - Historical performance
   - Peer comparisons
   - Performance gaps

6. **AUTOMATION OPPORTUNITIES**
   - Automation potential assessment
   - Technology solutions
   - ROI calculations
   - Implementation timelines
   - Change management needs

7. **QUALITY ANALYSIS**
   - Defect rate analysis
   - Root cause analysis
   - Quality cost assessment
   - Customer impact evaluation
   - Improvement priorities

8. **RESOURCE OPTIMIZATION**
   - Capacity planning
   - Workforce optimization
   - Equipment utilization
   - Space optimization
   - Inventory analysis

9. **IMPROVEMENT RECOMMENDATIONS**
   - Quick wins identification
   - Long-term improvements
   - Technology investments
   - Process redesign
   - Training needs

10. **IMPLEMENTATION ROADMAP**
    - Priority setting
    - Timeline development
    - Resource requirements
    - Success metrics
    - Risk mitigation

Analysis thorough, practical va improvement-focused bo'lsin.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Data-Driven Decision Making Eksperti",
    category: "Biznes Tahlili",
    description: "Business intelligence va data strategy development",
    content: `Siz business intelligence eksperti sifatida quyidagi organization uchun data-driven decision making framework yarating:

ORGANIZATION: [ORGANIZATION_NOMI]
CURRENT DATA MATURITY: [CURRENT_DATA_MATURITY]
DECISION-MAKING CHALLENGES: [DECISION_MAKING_CHALLENGES]
AVAILABLE RESOURCES: [AVAILABLE_RESOURCES]
STRATEGIC GOALS: [STRATEGIC_GOALS]

Quyidagi BI framework yarating:

1. **DATA STRATEGY ASSESSMENT**
   - Current data landscape
   - Data maturity assessment
   - Data governance evaluation
   - Technology stack review
   - Skill gap analysis

2. **DATA ARCHITECTURE DESIGN**
   - Data source identification
   - Data integration strategy
   - Data warehouse design
   - ETL/ELT processes
   - Data lake considerations

3. **ANALYTICS FRAMEWORK**
   - Descriptive analytics
   - Diagnostic analytics
   - Predictive analytics
   - Prescriptive analytics
   - Real-time analytics

4. **BUSINESS INTELLIGENCE TOOLS**
   - Tool evaluation criteria
   - Tool recommendations
   - Implementation strategy
   - User training needs
   - Support requirements

5. **DECISION-MAKING PROCESSES**
   - Decision framework design
   - Data requirement mapping
   - Analysis workflows
   - Approval processes
   - Feedback mechanisms

6. **KEY ANALYTICS USE CASES**
   - Customer analytics
   - Sales analytics
   - Marketing analytics
   - Operational analytics
   - Financial analytics

7. **DATA GOVERNANCE**
   - Data quality standards
   - Data security protocols
   - Access controls
   - Data lineage tracking
   - Compliance requirements

8. **PERFORMANCE MEASUREMENT**
   - Analytics ROI measurement
   - Decision quality metrics
   - User adoption tracking
   - Business impact assessment
   - Continuous improvement

9. **ORGANIZATIONAL CHANGE**
   - Data culture development
   - Change management plan
   - Training programs
   - Communication strategy
   - Success factors

10. **IMPLEMENTATION ROADMAP**
    - Phase-wise implementation
    - Quick wins identification
    - Long-term vision
    - Resource allocation
    - Risk management

Framework scalable, user-friendly va business-aligned bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Risk Assessment va Management",
    category: "Biznes Tahlili",
    description: "Comprehensive business risk analysis va mitigation strategies",
    content: `Siz risk management eksperti sifatida quyidagi business uchun comprehensive risk assessment yarating:

BUSINESS: [BUSINESS_NOMI]
INDUSTRY: [INDUSTRY]
BUSINESS MODEL: [BUSINESS_MODEL]
CURRENT RISK CONCERNS: [CURRENT_RISK_CONCERNS]
RISK TOLERANCE: [RISK_TOLERANCE]

Quyidagi risk management framework yarating:

1. **RISK IDENTIFICATION**
   - Strategic risks
   - Operational risks
   - Financial risks
   - Compliance risks
   - Technology risks
   - Reputational risks

2. **RISK ASSESSMENT MATRIX**
   - Probability assessment (1-5 scale)
   - Impact assessment (1-5 scale)
   - Risk scoring methodology
   - Risk heat map creation
   - Priority ranking

3. **STRATEGIC RISKS ANALYSIS**
   - Market risks
   - Competitive risks
   - Technology disruption
   - Regulatory changes
   - Economic factors

4. **OPERATIONAL RISKS ANALYSIS**
   - Process failures
   - Human errors
   - System failures
   - Supply chain disruptions
   - Quality issues

5. **FINANCIAL RISKS ANALYSIS**
   - Liquidity risks
   - Credit risks
   - Market risks
   - Currency risks
   - Interest rate risks

6. **COMPLIANCE RISKS ANALYSIS**
   - Regulatory compliance
   - Legal risks
   - Audit findings
   - Industry standards
   - Data protection

7. **RISK MITIGATION STRATEGIES**
   - Risk avoidance strategies
   - Risk reduction approaches
   - Risk transfer options
   - Risk acceptance criteria
   - Contingency planning

8. **RISK MONITORING SYSTEM**
   - Key risk indicators (KRIs)
   - Early warning systems
   - Monitoring frequency
   - Reporting protocols
   - Escalation procedures

9. **CRISIS MANAGEMENT PLAN**
   - Crisis response team
   - Communication protocols
   - Recovery procedures
   - Business continuity
   - Stakeholder management

10. **RISK GOVERNANCE**
    - Risk management framework
    - Roles va responsibilities
    - Decision-making authority
    - Risk appetite setting
    - Regular review processes

Assessment comprehensive, practical va actionable bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Business Performance Optimization",
    category: "Biznes Tahlili",
    description: "Holistic business performance improvement strategies",
    content: `Siz business optimization eksperti sifatida quyidagi business uchun comprehensive performance optimization plan yarating:

BUSINESS: [BUSINESS_NOMI]
PERFORMANCE CHALLENGES: [PERFORMANCE_CHALLENGES]
CURRENT METRICS: [CURRENT_METRICS]
OPTIMIZATION GOALS: [OPTIMIZATION_GOALS]
AVAILABLE BUDGET: [AVAILABLE_BUDGET]

Quyidagi optimization strategy yarating:

1. **PERFORMANCE BASELINE ANALYSIS**
   - Current performance metrics
   - Historical trend analysis
   - Benchmark comparisons
   - Performance gaps identification
   - Root cause analysis

2. **REVENUE OPTIMIZATION**
   - Revenue stream analysis
   - Pricing optimization
   - Customer value optimization
   - Cross-selling opportunities
   - Upselling strategies

3. **COST OPTIMIZATION**
   - Cost structure analysis
   - Cost reduction opportunities
   - Process efficiency improvements
   - Vendor optimization
   - Resource reallocation

4. **OPERATIONAL EXCELLENCE**
   - Process standardization
   - Quality improvements
   - Automation opportunities
   - Lean principles application
   - Six Sigma methodologies

5. **CUSTOMER EXPERIENCE OPTIMIZATION**
   - Customer journey optimization
   - Touchpoint improvements
   - Service quality enhancement
   - Response time reduction
   - Satisfaction improvements

6. **TECHNOLOGY OPTIMIZATION**
   - System performance review
   - Technology upgrade needs
   - Integration opportunities
   - Automation potential
   - Digital transformation

7. **HUMAN CAPITAL OPTIMIZATION**
   - Skill gap analysis
   - Training needs assessment
   - Performance management
   - Motivation strategies
   - Team optimization

8. **FINANCIAL PERFORMANCE**
   - Cash flow optimization
   - Working capital management
   - Investment efficiency
   - Cost of capital optimization
   - Financial planning

9. **STRATEGIC ALIGNMENT**
   - Goal alignment assessment
   - Strategy execution review
   - Resource allocation optimization
   - Priority setting
   - Performance measurement

10. **IMPLEMENTATION ROADMAP**
    - Quick wins (0-90 days)
    - Medium-term improvements (3-12 months)
    - Long-term transformations (1-3 years)
    - Resource requirements
    - Success measurement

Plan holistic, realistic va results-oriented bo'lsin.`,
    is_premium: false,
    is_public: true
  },
  {
    title: "Predictive Analytics va Forecasting",
    category: "Biznes Tahlili",
    description: "Business forecasting va predictive modeling strategies",
    content: `Siz predictive analytics eksperti sifatida quyidagi business uchun comprehensive forecasting framework yarating:

BUSINESS: [BUSINESS_NOMI]
FORECASTING NEEDS: [FORECASTING_NEEDS]
AVAILABLE DATA: [AVAILABLE_DATA]
FORECASTING HORIZON: [FORECASTING_HORIZON]
ACCURACY REQUIREMENTS: [ACCURACY_REQUIREMENTS]

Quyidagi predictive analytics strategy yarating:

1. **FORECASTING REQUIREMENTS ANALYSIS**
   - Business forecasting needs
   - Stakeholder requirements
   - Accuracy expectations
   - Update frequency needs
   - Decision impact assessment

2. **DATA PREPARATION STRATEGY**
   - Data source identification
   - Data quality assessment
   - Data cleaning procedures
   - Feature engineering
   - Data transformation

3. **FORECASTING MODELS**
   
   **TIME SERIES FORECASTING**
   - Trend analysis
   - Seasonal decomposition
   - ARIMA models
   - Exponential smoothing
   - Prophet models

   **REGRESSION MODELS**
   - Linear regression
   - Multiple regression
   - Logistic regression
   - Ridge/Lasso regression
   - Polynomial regression

   **MACHINE LEARNING MODELS**
   - Random Forest
   - Gradient Boosting
   - Neural Networks
   - Support Vector Machines
   - Ensemble methods

4. **BUSINESS FORECASTING APPLICATIONS**
   - Sales forecasting
   - Demand forecasting
   - Revenue forecasting
   - Customer churn prediction
   - Market trend prediction

5. **MODEL VALIDATION VA TESTING**
   - Cross-validation strategies
   - Out-of-sample testing
   - Accuracy metrics
   - Model comparison
   - Performance monitoring

6. **SCENARIO PLANNING**
   - Best-case scenarios
   - Worst-case scenarios
   - Most likely scenarios
   - Sensitivity analysis
   - What-if modeling

7. **FORECASTING AUTOMATION**
   - Automated model updates
   - Real-time forecasting
   - Alert systems
   - Dashboard integration
   - Scheduled reporting

8. **FORECAST COMMUNICATION**
   - Visualization strategies
   - Confidence intervals
   - Uncertainty communication
   - Stakeholder reporting
   - Decision support

9. **CONTINUOUS IMPROVEMENT**
   - Model performance tracking
   - Forecast accuracy monitoring
   - Model retraining schedules
   - Feature updates
   - Process optimization

10. **IMPLEMENTATION PLAN**
    - Technology requirements
    - Skill development needs
    - Timeline va milestones
    - Resource allocation
    - Success metrics

Framework scientific, practical va business-focused bo'lsin.`,
    is_premium: true,
    is_public: true
  },
  {
    title: "Business Intelligence Reporting",
    category: "Biznes Tahlili",
    description: "Executive va operational reporting systems",
    content: `Siz BI reporting eksperti sifatida quyidagi organization uchun comprehensive reporting framework yarating:

ORGANIZATION: [ORGANIZATION_NOMI]
REPORTING NEEDS: [REPORTING_NEEDS]
STAKEHOLDER LEVELS: [STAKEHOLDER_LEVELS]
DATA SOURCES: [DATA_SOURCES]
REPORTING FREQUENCY: [REPORTING_FREQUENCY]

Quyidagi BI reporting strategy yarating:

1. **REPORTING REQUIREMENTS ANALYSIS**
   - Stakeholder needs assessment
   - Information requirements
   - Decision-making contexts
   - Reporting frequency needs
   - Format preferences

2. **REPORT HIERARCHY DESIGN**
   
   **EXECUTIVE REPORTS**
   - Executive summary dashboards
   - KPI scorecards
   - Trend analysis
   - Exception reporting
   - Strategic insights

   **MANAGEMENT REPORTS**
   - Departmental performance
   - Operational metrics
   - Budget vs actual
   - Resource utilization
   - Process efficiency

   **OPERATIONAL REPORTS**
   - Daily activity reports
   - Real-time monitoring
   - Transaction details
   - Quality metrics
   - Productivity measures

3. **DASHBOARD DESIGN**
   - Information architecture
   - Visual design principles
   - Interactive elements
   - Mobile optimization
   - User experience design

4. **DATA VISUALIZATION**
   - Chart selection guidelines
   - Color coding standards
   - Visual hierarchy
   - Storytelling techniques
   - Performance indicators

5. **AUTOMATED REPORTING**
   - Report scheduling
   - Data refresh automation
   - Distribution automation
   - Alert triggers
   - Exception notifications

6. **SELF-SERVICE ANALYTICS**
   - User-friendly interfaces
   - Drag-and-drop capabilities
   - Ad-hoc reporting
   - Data exploration tools
   - Training materials

7. **REPORT GOVERNANCE**
   - Data accuracy standards
   - Version control
   - Access permissions
   - Audit trails
   - Quality assurance

8. **PERFORMANCE OPTIMIZATION**
   - Query optimization
   - Data modeling
   - Caching strategies
   - Load time optimization
   - Scalability planning

9. **USER ADOPTION STRATEGY**
   - Training programs
   - User support
   - Feedback collection
   - Continuous improvement
   - Change management

10. **IMPLEMENTATION ROADMAP**
    - Phase-wise rollout
    - Technology setup
    - User onboarding
    - Testing procedures
    - Go-live planning

Reporting system user-centric, reliable va actionable bo'lsin.`,
    is_premium: false,
    is_public: true
  }
];

async function replaceAllPrompts() {
  try {
    console.log('🗑️ Deleting all existing prompts...');
    
    // Delete all existing prompts
    const { error: deleteError } = await supabase
      .from('prompts')
      .delete()
      .neq('id', 0); // This will delete all records

    if (deleteError) {
      console.error('❌ Error deleting prompts:', deleteError);
      return;
    }

    console.log('✅ All existing prompts deleted successfully');
    console.log('📝 Inserting 50 new professional prompts...');

    // Insert new prompts in batches of 10
    for (let i = 0; i < professionalPrompts.length; i += 10) {
      const batch = professionalPrompts.slice(i, i + 10);
      
      const { error: insertError } = await supabase
        .from('prompts')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i/10) + 1}:`, insertError);
        return;
      }

      console.log(`✅ Batch ${Math.floor(i/10) + 1}/5 inserted successfully`);
    }

    console.log('🎉 All 50 professional prompts inserted successfully!');
    
    // Verify the count
    const { count } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total prompts in database: ${count}`);
    
    // Show category breakdown
    const { data: categoryBreakdown } = await supabase
      .from('prompts')
      .select('category')
      .order('category');

    if (categoryBreakdown) {
      const breakdown = categoryBreakdown.reduce((acc: any, curr: any) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {});

      console.log('📋 Category breakdown:');
      Object.entries(breakdown).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} prompts`);
      });
    }

  } catch (error) {
    console.error('💥 Script execution error:', error);
  }
}

// Execute the script
replaceAllPrompts();