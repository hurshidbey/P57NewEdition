import React from"react";
import { Card, CardContent } from"@/components/ui/card";
import { Alert, AlertDescription } from"@/components/ui/alert";
import { Badge } from"@/components/ui/badge";
import { AiIcon } from"@/components/ai-icon";
import { ExpandableCard } from"../components/ExpandableCard";
import { CodeExample } from"../components/CodeExample";
import type { SectionContent } from"../components/types";

export const loyihalar: SectionContent = {
 title:"REAL LOYIHALAR",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-lg ">
        AI bilan real loyihalar yaratish - nazariyani amaliyotga tatbiq etishning eng yaxshi yo'li. 
        Bu bo'limda turli sohalarda AI dan foydalanib yaratilgan haqiqiy loyihalar bilan tanishasiz.
       </p>
       <p className="text-lg ">
        Har bir loyiha o'z arxitekturasi, texnologiyalari va yechimlariga ega. Ulardan ilhom oling 
        va o'z g'oyalaringizni amalga oshiring!
       </p>
      </div>

      <Card className="border-2 border-black bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold flex items-center gap-2 ">
         <AiIcon name="sparkles" size={24} />
         TOP AI LOYIHALAR 2024
        </h3>
        
        <div>
         <div className="border-2 border-gray-600 bg-white rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
           <h4 className="font-bold text-gray-800 ">1. SMART CUSTOMER SUPPORT</h4>
           <Badge className="bg-gray-100 text-gray-800">SaaS</Badge>
          </div>
          <p className="text-sm text-gray-700 ">
           24/7 mijozlarga xizmat ko'rsatuvchi AI agent tizimi
          </p>
          <div>
           <div className="flex items-center gap-2 text-xs">
            <AiIcon name="tools" size={14} />
            <span><strong>Stack:</strong> GPT-4o, RAG, Supabase, Next.js</span>
           </div>
           <div className="flex items-center gap-2 text-xs">
            <AiIcon name="chart" size={14} />
            <span><strong>Natija:</strong> 70% support tickets avtomatik hal qilindi</span>
           </div>
           <div className="flex items-center gap-2 text-xs">
            <AiIcon name="dollar" size={14} />
            <span><strong>ROI:</strong> 6 oyda xarajatlar qoplandi</span>
           </div>
          </div>
         </div>

         <div className="border-2 border-gray-600 bg-white rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
           <h4 className="font-bold text-gray-800 ">2. CONTENT GENERATION PLATFORM</h4>
           <Badge className="bg-gray-100 text-gray-800">Marketing</Badge>
          </div>
          <p className="text-sm text-gray-700 ">
           Blog, email va social media uchun kontent yaratuvchi platforma
          </p>
          <div>
           <div className="flex items-center gap-2 text-xs">
            <AiIcon name="tools" size={14} />
            <span><strong>Stack:</strong> Claude 3.5, Fine-tuned Llama, Redis</span>
           </div>
           <div className="flex items-center gap-2 text-xs">
            <AiIcon name="chart" size={14} />
            <span><strong>Natija:</strong> 10x tezroq kontent yaratish</span>
           </div>
           <div className="flex items-center gap-2 text-xs">
            <AiIcon name="users" size={14} />
            <span><strong>Foydalanuvchilar:</strong> 50,000+ aktiv</span>
           </div>
          </div>
         </div>

         <div className="border-2 border-gray-600 bg-white rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
           <h4 className="font-bold text-gray-800 ">3. CODE REVIEW ASSISTANT</h4>
           <Badge className="bg-gray-100 text-gray-800">DevTools</Badge>
          </div>
          <p className="text-sm text-gray-700 ">
           Pull request'larni avtomatik tekshiruvchi AI yordamchi
          </p>
          <div>
           <div className="flex items-center gap-2 text-xs">
            <AiIcon name="tools" size={14} />
            <span><strong>Stack:</strong> GPT-4, GitHub API, Docker</span>
           </div>
           <div className="flex items-center gap-2 text-xs">
            <AiIcon name="chart" size={14} />
            <span><strong>Natija:</strong> 80% bug'lar deploy'dan oldin topildi</span>
           </div>
           <div className="flex items-center gap-2 text-xs">
            <AiIcon name="clock" size={14} />
            <span><strong>Tejash:</strong> Har bir PR uchun 30 daqiqa</span>
           </div>
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
       <ExpandableCard
        term="MVP DEVELOPMENT"
        definition="Minimal Viable Product - eng kam funksiyalar bilan tez ishga tushirish"
        icon={<AiIcon name="rocket" size={24} />}
        examples={["1-2 hafta ichida prototip","Asosiy funksiyalarga fokus","Tez feedback olish","Iterativ yaxshilash"
        ]}
       />

       <ExpandableCard
        term="TECH STACK"
        definition="Loyiha uchun texnologiyalar to'plami"
        icon={<AiIcon name="stack" size={24} />}
        examples={["Frontend: Next.js/React","Backend: Node.js/Python","AI: OpenAI/Claude API","Database: PostgreSQL/Supabase"
        ]}
       />
      </div>

      <CodeExample
       title="LOYIHA ARXITEKTURASI"
       badExample={`# Monolitik yondashuv
class DoEverythingApp:
  def __init__(self):
    self.ai = GPT4()
    self.db = Database()
    self.cache = Cache()
    
  def handle_request(self, request):
    # Hamma narsa bir joyda
    data = self.db.query(request)
    enhanced = self.ai.process(data)
    self.cache.save(enhanced)
    return enhanced`}
       goodExample={`# Mikroservis arxitekturasi
# api-gateway/main.py
async def handle_request(request):
  # 1. Auth service
  user = await auth_service.verify(request.token)
  
  # 2. Data service
  context = await data_service.get_context(user.id)
  
  # 3. AI service (with circuit breaker)
  try:
    result = await ai_service.process(
      prompt=request.prompt,
      context=context,
      model="gpt-4o-mini" # Cost optimization
    )
  except AIServiceError:
    # Fallback to cached or simpler model
    result = await fallback_service.process(request)
  
  # 4. Analytics (async, non-blocking)
  asyncio.create_task(
    analytics_service.track(user.id, request, result)
  )
  
  return result`}
       explanation="Mikroservis arxitekturasi orqali har bir komponent mustaqil scale va deploy qilinadi."
      />

      <Card className="border-2 border-black">
       <div className="bg-black p-4">
        <h3 className="text-white font-bold uppercase ">LOYIHA BOSQICHLARI</h3>
       </div>
       <CardContent className="p-6">
        <div>
         <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">1</div>
          <div className="flex-1">
           <h4 className="font-bold ">IDEYA VA VALIDATSIYA</h4>
           <p className="text-sm text-gray-700 ">Muammoni aniqlash va yechim taklif qilish</p>
           <div className="bg-gray-50 p-3 rounded text-xs">
            <strong>Tools:</strong> User interviews, Google Forms, Landing page
           </div>
          </div>
         </div>

         <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">2</div>
          <div className="flex-1">
           <h4 className="font-bold ">PROTOTIP YARATISH</h4>
           <p className="text-sm text-gray-700 ">Minimal funksiyalar bilan tez boshlash</p>
           <div className="bg-gray-50 p-3 rounded text-xs">
            <strong>Timeline:</strong> 1-2 hafta, Streamlit/Gradio demo
           </div>
          </div>
         </div>

         <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">3</div>
          <div className="flex-1">
           <h4 className="font-bold ">MVP DEVELOPMENT</h4>
           <p className="text-sm text-gray-700 ">Production-ready minimal product</p>
           <div className="bg-gray-50 p-3 rounded text-xs">
            <strong>Focus:</strong> Core features, Authentication, Payment
           </div>
          </div>
         </div>

         <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">4</div>
          <div className="flex-1">
           <h4 className="font-bold ">LAUNCH VA ITERATE</h4>
           <p className="text-sm text-gray-700 ">Foydalanuvchilar bilan test qilish va yaxshilash</p>
           <div className="bg-gray-50 p-3 rounded text-xs">
            <strong>Metrics:</strong> User retention, Usage patterns, Feedback
           </div>
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <Alert className="border-2 border-gray-600 bg-gray-50">
       <AiIcon name="lightbulb" size={20} className="text-gray-700" />
       <AlertDescription className="text-gray-800">
        <strong>Maslahat:</strong> Katta loyihadan boshlamang! Avval oddiy prototip yarating, 
        foydalanuvchilar bilan test qiling, keyin kengaytiring."Ship early, ship often!"
       </AlertDescription>
      </Alert>
     </div>
    )
   }
  }
 ]
};

export const debugging: SectionContent = {
 title:"DEBUGGING VA TESTING",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-lg ">
        AI ilovalarini debug qilish an'anaviy dasturlashdan farq qiladi. Deterministik bo'lmagan 
        xatti-harakatlar, prompt sensitivity va model hallucinations - bularning barchasi alohida yondashuvni talab qiladi.
       </p>
       <p className="text-lg ">
        To'g'ri debugging va testing strategiyalari yordamida ishonchli va bashorat qilinadigan 
        AI tizimlar yaratish mumkin.
       </p>
      </div>

      <Card className="border-2 border-black bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold flex items-center gap-2 ">
         <AiIcon name="bug" size={24} />
         AI DEBUGGING TOOLKIT
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
         <div>
          <h4 className="font-bold text-gray-800 ">DEBUGGING TOOLS</h4>
          <div>
           <div className="p-3 bg-white border border-gray-300 rounded">
            <h5 className="font-semibold text-sm">Prompt Logging</h5>
            <p className="text-xs text-gray-600 mt-1 ">Har bir prompt va javobni saqlash</p>
           </div>
           <div className="p-3 bg-white border border-gray-300 rounded">
            <h5 className="font-semibold text-sm">Token Counter</h5>
            <p className="text-xs text-gray-600 mt-1 ">Xarajatlar va limitlarni kuzatish</p>
           </div>
           <div className="p-3 bg-white border border-gray-300 rounded">
            <h5 className="font-semibold text-sm">Response Validator</h5>
            <p className="text-xs text-gray-600 mt-1 ">Javob formatini tekshirish</p>
           </div>
          </div>
         </div>

         <div>
          <h4 className="font-bold text-gray-800 ">TESTING STRATEGIES</h4>
          <div>
           <div className="p-3 bg-white border border-gray-300 rounded">
            <h5 className="font-semibold text-sm">Unit Tests</h5>
            <p className="text-xs text-gray-600 mt-1 ">Prompt templates va parsers</p>
           </div>
           <div className="p-3 bg-white border border-gray-300 rounded">
            <h5 className="font-semibold text-sm">Integration Tests</h5>
            <p className="text-xs text-gray-600 mt-1 ">API chaqiruvlar va flow</p>
           </div>
           <div className="p-3 bg-white border border-gray-300 rounded">
            <h5 className="font-semibold text-sm">Evaluation Sets</h5>
            <p className="text-xs text-gray-600 mt-1 ">Golden test cases</p>
           </div>
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <CodeExample
       title="AI DEBUGGING PATTERN"
       badExample={`# Debug ma'lumotisiz
def process_with_ai(user_input):
  response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role":"user","content": user_input}]
  )
  return response.choices[0].message.content

# Xato bo'lsa nima bo'lganini bilmaymiz!`}
       goodExample={`# Comprehensive debugging
import logging
from datetime import datetime
import json

class AIDebugger:
  def __init__(self):
    self.logger = logging.getLogger("ai_debug")
    
  def process_with_debug(self, user_input, user_id=None):
    # Request ID for tracking
    request_id = f"{datetime.now().isoformat()}_{user_id}"
    
    # Log input
    self.logger.info(f"[{request_id}] Input: {user_input[:100]}...")
    
    try:
      # Track token usage
      messages = [{"role":"user","content": user_input}]
      
      response = openai.chat.completions.create(
        model="gpt-4",
        messages=messages,
        temperature=0.7,
        seed=12345 # Reproducibility
      )
      
      # Log full exchange
      debug_info = {"request_id": request_id,"timestamp": datetime.now().isoformat(),"input": user_input,"model":"gpt-4","temperature": 0.7,"usage": response.usage.dict(),"response": response.choices[0].message.content
      }
      
      self.logger.debug(json.dumps(debug_info, indent=2))
      
      # Validate response
      if not self.validate_response(response.choices[0].message.content):
        self.logger.warning(f"[{request_id}] Invalid response format")
      
      return response.choices[0].message.content
      
    except Exception as e:
      self.logger.error(f"[{request_id}] Error: {str(e)}")
      # Store failed request for analysis
      self.save_failed_request(request_id, user_input, str(e))
      raise`}
       explanation="Har bir AI interaksiyani to'liq log qilish orqali muammolarni tez topish va hal qilish mumkin."
      />

      <div className="grid gap-4 md:grid-cols-3">
       <Card className="border-2 border-black hover:shadow-lg transition-shadow">
        <div className="bg-black p-3">
         <h4 className="text-white font-bold text-center ">PROMPT TESTING</h4>
        </div>
        <CardContent className="p-4">
         <div className="text-center">
          <span className="text-3xl"></span>
         </div>
         <ul className="text-sm">
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span>A/B testing prompts</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span>Version control</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span>Performance metrics</span>
          </li>
         </ul>
        </CardContent>
       </Card>

       <Card className="border-2 border-black hover:shadow-lg transition-shadow">
        <div className="bg-gray-700 p-3">
         <h4 className="text-white font-bold text-center ">ERROR HANDLING</h4>
        </div>
        <CardContent className="p-4">
         <div className="text-center">
          <span className="text-3xl"></span>
         </div>
         <ul className="text-sm">
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span>Retry logic</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span>Fallback models</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span>Graceful degradation</span>
          </li>
         </ul>
        </CardContent>
       </Card>

       <Card className="border-2 border-black hover:shadow-lg transition-shadow">
        <div className="bg-gray-600 p-3">
         <h4 className="text-white font-bold text-center ">MONITORING</h4>
        </div>
        <CardContent className="p-4">
         <div className="text-center">
          <span className="text-3xl"></span>
         </div>
         <ul className="text-sm">
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span>Real-time dashboards</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span>Alert systems</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span>Usage analytics</span>
          </li>
         </ul>
        </CardContent>
       </Card>
      </div>

      <ExpandableCard
       term="EVALUATION METRICS"
       definition="AI javoblarini baholash uchun metrikalar"
       icon={<AiIcon name="chart" size={24} />}
       examples={["Accuracy - To'g'rilik darajasi","Coherence - Mantiqiy izchillik","Relevance - Savolga moslik","Safety - Xavfsizlik va etika"
       ]}
      />

      <Card className="border-2 border-black bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold text-black ">
         REAL-TIME DEBUGGING DASHBOARD
        </h3>
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4 font-mono text-sm">
         <div className="mb-0">
          <span className="text-gray-600">REQUEST:</span> #2024-03-15-001
         </div>
         <div className="grid grid-cols-2 gap-4">
          <div>
           <p className="text-gray-600 ">Model: gpt-4-turbo</p>
           <p className="text-gray-600 ">Tokens: 1,234 / 2,000</p>
           <p className="text-gray-600 ">Cost: $0.037</p>
          </div>
          <div>
           <p className="text-gray-600 ">Latency: 2.3s</p>
           <p className="text-gray-600 ">Temperature: 0.7</p>
           <p className="text-gray-600 ">Status: Success</p>
          </div>
         </div>
         <div className="mt-3 p-2 bg-gray-100 rounded">
          <p className="text-xs ">PROMPT:"Generate product description for..."</p>
         </div>
        </div>
       </CardContent>
      </Card>

      <Alert className="border-2 border-gray-600 bg-gray-50">
       <AiIcon name="warning" size={20} className="text-gray-700" />
       <AlertDescription className="text-gray-800">
        <strong>Muhim:</strong> Production'da har doim rate limiting, error handling va 
        monitoring o'rnatilgan bo'lishi kerak."Fail gracefully" prinsipi AI ilovalar uchun juda muhim!
       </AlertDescription>
      </Alert>
     </div>
    )
   }
  }
 ]
};

export const sohalarAmaliyot: SectionContent = {
 title:"TURLI SOHALARDA AMALIYOT",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-lg ">
        AI texnologiyalari deyarli barcha sohalarda inqilob yaratmoqda. Har bir soha o'ziga xos 
        challenges va opportunities taqdim etadi.
       </p>
       <p className="text-lg ">
        Bu bo'limda turli sohalarda AI ning real amaliy qo'llanilishi, case study'lar va 
        eng yaxshi praktikalar bilan tanishasiz.
       </p>
      </div>

      <Card className="border-2 border-black bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold text-center ">AI SOHALARDA TATBIQI</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
         <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
          <div className="flex items-center gap-3">
           <div className="text-3xl"></div>
           <h4 className="font-bold text-gray-800 ">TIBBIYOT</h4>
          </div>
          <div className="text-sm">
           <div className="p-2 bg-gray-50 rounded">
            <strong>Diagnostika:</strong> Rentgen va MRI tahlili
           </div>
           <div className="p-2 bg-gray-50 rounded">
            <strong>Drug Discovery:</strong> Yangi dorilar yaratish
           </div>
           <div className="p-2 bg-gray-50 rounded">
            <strong>Personalized Medicine:</strong> Individual davolash
           </div>
           <Badge className="mt-2">ROI: 40% xarajat tejash</Badge>
          </div>
         </div>

         <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
          <div className="flex items-center gap-3">
           <div className="text-3xl"></div>
           <h4 className="font-bold text-gray-800 ">MOLIYA</h4>
          </div>
          <div className="text-sm">
           <div className="p-2 bg-gray-50 rounded">
            <strong>Fraud Detection:</strong> Real-time firibgarlik aniqlash
           </div>
           <div className="p-2 bg-gray-50 rounded">
            <strong>Risk Assessment:</strong> Kredit skoringi
           </div>
           <div className="p-2 bg-gray-50 rounded">
            <strong>Trading:</strong> Algorithmic trading strategiyalar
           </div>
           <Badge className="mt-2">Natija: 95% fraud detection</Badge>
          </div>
         </div>

         <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
          <div className="flex items-center gap-3">
           <div className="text-3xl"></div>
           <h4 className="font-bold text-gray-800 ">TA'LIM</h4>
          </div>
          <div className="text-sm">
           <div className="p-2 bg-gray-50 rounded">
            <strong>Personalized Learning:</strong> Har bir talaba uchun
           </div>
           <div className="p-2 bg-gray-50 rounded">
            <strong>AI Tutors:</strong> 24/7 yordam va tushuntirish
           </div>
           <div className="p-2 bg-gray-50 rounded">
            <strong>Assessment:</strong> Avtomatik baholash
           </div>
           <Badge className="mt-2">O'sish: 3x tezroq o'rganish</Badge>
          </div>
         </div>

         <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
          <div className="flex items-center gap-3">
           <div className="text-3xl"></div>
           <h4 className="font-bold text-gray-800 ">E-COMMERCE</h4>
          </div>
          <div className="text-sm">
           <div className="p-2 bg-gray-50 rounded">
            <strong>Recommendations:</strong> Shaxsiylashtirilgan takliflar
           </div>
           <div className="p-2 bg-gray-50 rounded">
            <strong>Dynamic Pricing:</strong> Real-time narxlash
           </div>
           <div className="p-2 bg-gray-50 rounded">
            <strong>Chatbots:</strong> 24/7 mijozlar xizmati
           </div>
           <Badge className="mt-2">Konversiya: +35% o'sish</Badge>
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <CodeExample
       title="SOHA-SPECIFIC IMPLEMENTATION"
       badExample={`# Generic yondashuv
def process_any_data(data):
  # Bir xil prompt barcha sohalar uchun
  prompt ="Analyze this data and provide insights"
  return ai.complete(prompt + str(data))`}
       goodExample={`# Domain-specific yondashuvlar
class MedicalAI:
  def __init__(self):
    self.model ="medpalm-2" # Medical-specific model
    self.terminology = load_medical_terms()
    
  def diagnose(self, symptoms, history, tests):
    # Medical context va safety
    prompt = self.build_medical_prompt(
      symptoms=symptoms,
      patient_history=history,
      lab_results=tests,
      safety_check=True
    )
    
    response = self.model.predict(prompt)
    
    # Validate medical guidelines
    if self.requires_human_review(response):
      return {"diagnosis": response,"confidence":"low","action":"Consult specialist"
      }
    
    return self.format_medical_response(response)

class FinanceAI:
  def __init__(self):
    self.model ="finbert" # Finance-tuned model
    self.regulations = load_compliance_rules()
    
  def assess_risk(self, transaction):
    # Compliance va real-time checks
    if self.is_suspicious_pattern(transaction):
      self.flag_for_review(transaction)
      
    risk_score = self.calculate_risk(
      transaction,
      historical_data=self.get_user_history(),
      market_conditions=self.get_market_data()
    )
    
    return self.compliance_wrapper(risk_score)`}
       explanation="Har bir soha uchun maxsus modellar, safety checks va compliance qoidalari qo'llanilishi kerak."
      />

      <div className="grid gap-4 md:grid-cols-2">
       <ExpandableCard
        term="DOMAIN EXPERTISE"
        definition="Soha bo'yicha chuqur bilim va tajriba"
        icon={<AiIcon name="brain" size={24} />}
        examples={["Medical: HIPAA compliance, clinical guidelines","Finance: SEC regulations, risk models","Legal: Jurisdiction-specific laws","Education: Pedagogical principles"
        ]}
       />

       <ExpandableCard
        term="ETHICAL CONSIDERATIONS"
        definition="Har bir sohaning etik talablari"
        icon={<AiIcon name="shield" size={24} />}
        examples={["Privacy va data protection","Bias va fairness","Transparency requirements","Human oversight necessity"
        ]}
       />
      </div>

      <Card className="border-2 border-black">
       <div className="bg-black p-4">
        <h3 className="text-white font-bold uppercase ">SUCCESS METRICS BY INDUSTRY</h3>
       </div>
       <div className="overflow-x-auto">
        <table className="w-full">
         <thead>
          <tr className="border-b-2 border-black bg-gray-100">
           <th className="p-3 text-left">Soha</th>
           <th className="p-3 text-center">KPI</th>
           <th className="p-3 text-center">Before AI</th>
           <th className="p-3 text-center">After AI</th>
           <th className="p-3 text-center">Impact</th>
          </tr>
         </thead>
         <tbody>
          <tr className="border-b">
           <td className="p-3 font-semibold">Healthcare</td>
           <td className="p-3 text-center">Diagnosis Accuracy</td>
           <td className="p-3 text-center">75%</td>
           <td className="p-3 text-center">94%</td>
           <td className="p-3 text-center text-black">+25%</td>
          </tr>
          <tr className="border-b bg-gray-50">
           <td className="p-3 font-semibold">Finance</td>
           <td className="p-3 text-center">Fraud Detection</td>
           <td className="p-3 text-center">60%</td>
           <td className="p-3 text-center">95%</td>
           <td className="p-3 text-center text-black">+58%</td>
          </tr>
          <tr className="border-b">
           <td className="p-3 font-semibold">Retail</td>
           <td className="p-3 text-center">Customer Satisfaction</td>
           <td className="p-3 text-center">3.2/5</td>
           <td className="p-3 text-center">4.6/5</td>
           <td className="p-3 text-center text-black">+44%</td>
          </tr>
          <tr className="border-b bg-gray-50">
           <td className="p-3 font-semibold">Manufacturing</td>
           <td className="p-3 text-center">Defect Rate</td>
           <td className="p-3 text-center">4.5%</td>
           <td className="p-3 text-center">0.8%</td>
           <td className="p-3 text-center text-black">-82%</td>
          </tr>
         </tbody>
        </table>
       </div>
      </Card>

      <Alert className="border-2 border-gray-600 bg-gray-50">
       <AiIcon name="info" size={20} className="text-gray-700" />
       <AlertDescription className="text-gray-800">
        <strong>Eslatma:</strong> Har bir sohada AI tatbiq etishdan oldin regulatory compliance, 
        data privacy va ethical guidelines'larni o'rganing. Soha ekspertlari bilan hamkorlik qiling!
       </AlertDescription>
      </Alert>
     </div>
    )
   }
  }
 ]
};

// Remove placeholder export since we now have all content
