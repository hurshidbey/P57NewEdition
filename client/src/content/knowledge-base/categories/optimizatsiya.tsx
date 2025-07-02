import React from"react";
import { Card, CardContent } from"@/components/ui/card";
import { Alert, AlertDescription } from"@/components/ui/alert";
import { Badge } from"@/components/ui/badge";
import { AiIcon } from"@/components/ai-icon";
import { ExpandableCard } from"../components/ExpandableCard";
import { CodeExample } from"../components/CodeExample";
import type { SectionContent } from"../components/types";

export const narxOptimallashtirish: SectionContent = {
 title:"NARX OPTIMALLASHTIRISH",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-lg ">
        AI xarajatlarini optimallashtirish - bu sifatni saqlab qolgan holda API narxlarini 
        kamaytirish san'ati. To'g'ri strategiya bilan xarajatlarni 10x gacha kamaytirish mumkin.
       </p>
       <p className="text-lg ">
        Har bir token pul turadi, shuning uchun har bir so'rovni optimallashtirishga 
        e'tibor berish kerak. Kichik o'zgarishlar katta tejashga olib kelishi mumkin.
       </p>
      </div>

      <Card className="border-2 border-black bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold flex items-center gap-2 ">
         <AiIcon name="dollar" size={24} />
         NARX OPTIMALLASHTIRISH STRATEGIYALARI
        </h3>
        
        <div>
         <div className="border-l-4 border-gray-600 pl-4">
          <h4 className="font-bold text-gray-800 ">1. MODEL TANLOV</h4>
          <p className="text-sm text-gray-700 ">Vazifaga mos eng arzon modelni tanlash</p>
          <div className="mt-2 text-xs">
           <div>- Oddiy vazifalar → GPT-3.5 Turbo ($0.5/1M)</div>
           <div>- O'rtacha vazifalar → Claude Haiku ($0.25/1M)</div>
           <div>- Murakkab vazifalar → GPT-4o mini ($5/1M)</div>
          </div>
         </div>

         <div className="border-l-4 border-gray-600 pl-4">
          <h4 className="font-bold text-gray-800 ">2. PROMPT QISQARTIRISH</h4>
          <p className="text-sm text-gray-700 ">Keraksiz so'zlarni olib tashlash</p>
          <div className="mt-2 text-xs">
           <div>- Takrorlanishlarni olib tashlash</div>
           <div>- Qisqa ko'rsatmalar yozish</div>
           <div>- Aniq va lo'nda ifodalar</div>
          </div>
         </div>

         <div className="border-l-4 border-gray-600 pl-4">
          <h4 className="font-bold text-gray-800 ">3. CACHING STRATEGIYASI</h4>
          <p className="text-sm text-gray-700 ">Takroriy so'rovlarni saqlash</p>
          <div className="mt-2 text-xs">
           <div>- Natijalarni cache qilish</div>
           <div>- Semantic deduplication</div>
           <div>- TTL bilan smart cache</div>
          </div>
         </div>

         <div className="border-l-4 border-gray-600 pl-4">
          <h4 className="font-bold text-gray-800 ">4. BATCH PROCESSING</h4>
          <p className="text-sm text-gray-700 ">Ko'p so'rovlarni birlashtirib yuborish</p>
          <div className="mt-2 text-xs">
           <div>- Batch API ishlatish (50% arzon)</div>
           <div>- Parallel so'rovlarni kamaytirish</div>
           <div>- Queue tizimini joriy qilish</div>
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
       <Card className="border-2 border-black hover:shadow-lg transition-shadow">
        <div className="bg-black p-3">
         <h4 className="text-white font-bold text-center ">QIMMAT</h4>
        </div>
        <CardContent className="p-4">
         <div className="text-center text-3xl"></div>
         <ul className="text-sm">
          <li>- GPT-4 Turbo</li>
          <li>- Claude Opus</li>
          <li>- Uzun kontekst</li>
          <li>- Takroriy so'rovlar</li>
         </ul>
        </CardContent>
       </Card>

       <Card className="border-2 border-black hover:shadow-lg transition-shadow">
        <div className="bg-gray-700 p-3">
         <h4 className="text-white font-bold text-center ">O'RTACHA</h4>
        </div>
        <CardContent className="p-4">
         <div className="text-center text-3xl"></div>
         <ul className="text-sm">
          <li>- GPT-4o mini</li>
          <li>- Claude Sonnet</li>
          <li>- Optimized prompts</li>
          <li>- Basic caching</li>
         </ul>
        </CardContent>
       </Card>

       <Card className="border-2 border-black hover:shadow-lg transition-shadow">
        <div className="bg-gray-600 p-3">
         <h4 className="text-white font-bold text-center ">ARZON</h4>
        </div>
        <CardContent className="p-4">
         <div className="text-center text-3xl"></div>
         <ul className="text-sm">
          <li>- GPT-3.5 Turbo</li>
          <li>- Claude Haiku</li>
          <li>- Fine-tuned models</li>
          <li>- Full optimization</li>
         </ul>
        </CardContent>
       </Card>
      </div>

      <CodeExample
       title="NARX OPTIMALLASHTIRISH"
       badExample={`# Har doim eng qimmat modelni ishlatish
def process_all(items):
  results = []
  for item in items:
    # Har bir item uchun alohida so'rov
    response = openai.chat.completions.create(
      model="gpt-4-turbo", # $30/1M token
      messages=[
        {"role":"system","content": LONG_SYSTEM_PROMPT}, # 500 token
        {"role":"user","content": f"Process: {item}"}
      ]
    )
    results.append(response)
  return results # 1000 item = $$$`}
       goodExample={`# Intelligent routing va batching
def process_optimized(items):
  # 1. Oddiy itemlarni ajratish
  simple_items = [i for i in items if len(i) < 100]
  complex_items = [i for i in items if len(i) >= 100]
  
  # 2. Batch processing
  if simple_items:
    batch_response = openai.chat.completions.create(
      model="gpt-3.5-turbo", # $0.5/1M token (60x arzon!)
      messages=[
        {"role":"system","content":"Process items:"},
        {"role":"user","content": json.dumps(simple_items)}
      ]
    )
  
  # 3. Faqat murakkab itemlar uchun GPT-4
  complex_results = []
  for item in complex_items:
    if cache.has(item): # Cache tekshirish
      complex_results.append(cache.get(item))
    else:
      result = process_complex(item)
      cache.set(item, result)
      complex_results.append(result)`}
       explanation="Intelligent routing, batching va caching orqali xarajatlarni 90% gacha kamaytirish mumkin."
      />

      <ExpandableCard
       term="TOKEN OPTIMIZATION"
       definition="Prompt va javoblardagi tokenlarni kamaytirish texnikalari"
       icon={<AiIcon name="compress" size={24} />}
       examples={["Qisqartmalar ishlatish (JSON → J)","Whitespace'larni olib tashlash","Strukturani soddalashtirish","Output format'ni optimallashtirish"
       ]}
      />

      <Card className="border-2 border-black bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold text-black ">
         REAL DUNYO MISOLI: 90% TEJASH
        </h3>
        <div>
         <div className="p-3 bg-white border border-gray-300 rounded">
          <strong>Muammo:</strong> Kuniga 100,000 product description generatsiya
         </div>
         <div className="grid md:grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 border border-gray-300 rounded">
           <h5 className="font-bold text-gray-700">Oldin:</h5>
           <ul className="text-sm mt-1">
            <li>- GPT-4: $30/1M token</li>
            <li>- Har biri 500 token</li>
            <li>- Kunlik: $1,500</li>
           </ul>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded">
           <h5 className="font-bold text-gray-700">Keyin:</h5>
           <ul className="text-sm mt-1">
            <li>- GPT-3.5 + caching</li>
            <li>- Batch processing</li>
            <li>- Kunlik: $150 (-90%!)</li>
           </ul>
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <Alert className="border-2 border-gray-600 bg-gray-50">
       <AiIcon name="lightbulb" size={20} className="text-gray-700" />
       <AlertDescription className="text-gray-800">
        <strong>Pro tip:</strong> Monitoring o'rnating va har hafta xarajatlarni tahlil qiling. 
        Ko'pincha 20% so'rovlar 80% xarajatni tashkil qiladi - ularni optimallang!
       </AlertDescription>
      </Alert>
     </div>
    )
   }
  }
 ]
};

export const tezlikOshirish: SectionContent = {
 title:"TEZLIKNI OSHIRISH",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-lg ">
        AI javob tezligini oshirish - foydalanuvchi tajribasini yaxshilashning muhim qismi. 
        Sekin javoblar foydalanuvchilarni zeriktiradi va mahsulot qiymatini pasaytiradi.
       </p>
       <p className="text-lg ">
        To'g'ri optimallashtirish bilan AI javob vaqtini 10x gacha tezlashtirish mumkin, 
        bu esa real-time tajribalar yaratish imkonini beradi.
       </p>
      </div>

      <Card className="border-2 border-black bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold text-center ">TEZLIK OPTIMIZATSIYA PIRAMIDASI</h3>
        
        <div>
         <div className="bg-gray-800 text-white p-4 rounded-none">
          <h4 className="font-bold ">STREAMING (100ms)</h4>
          <p className="text-sm ">Javobni bo'laklab yuborish - eng tez usul</p>
         </div>
         
         <div className="bg-gray-700 text-white p-4 rounded-none ml-4">
          <h4 className="font-bold ">EDGE DEPLOYMENT (200ms)</h4>
          <p className="text-sm ">Foydalanuvchiga yaqin serverlar</p>
         </div>
         
         <div className="bg-gray-600 text-white p-4 rounded-none ml-8">
          <h4 className="font-bold ">SMART CACHING (300ms)</h4>
          <p className="text-sm ">Oldingi javoblarni qayta ishlatish</p>
         </div>
         
         <div className="bg-gray-500 text-white p-4 rounded-none ml-12">
          <h4 className="font-bold ">MODEL OPTIMIZATION (500ms)</h4>
          <p className="text-sm ">Tezroq modellar va parametrlar</p>
         </div>
         
         <div className="bg-gray-400 text-white p-4 rounded-none ml-16">
          <h4 className="font-bold ">PARALLEL PROCESSING (1s)</h4>
          <p className="text-sm ">Bir necha so'rovlarni parallel yuborish</p>
         </div>
        </div>
       </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
       <ExpandableCard
        term="STREAMING RESPONSES"
        definition="Javobni to'liq kutmasdan, qismlarini darhol ko'rsatish"
        icon={<AiIcon name="stream" size={24} />}
        examples={["Server-Sent Events (SSE)","WebSocket streaming","Chunked transfer encoding","Progressive rendering"
        ]}
       />

       <ExpandableCard
        term="LATENCY OPTIMIZATION"
        definition="Har bir millisekundni tejash uchun texnikalar"
        icon={<AiIcon name="lightning" size={24} />}
        examples={["Connection pooling","Request batching","Prefetching","DNS optimization"
        ]}
       />
      </div>

      <CodeExample
       title="STREAMING IMPLEMENTATION"
       badExample={`# Butun javobni kutish
async def slow_chat(prompt):
  # Foydalanuvchi 10-30 soniya kutadi
  response = await openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role":"user","content": prompt}]
  )
  # Faqat oxirida ko'rsatiladi
  return response.choices[0].message.content`}
       goodExample={`# Streaming bilan darhol ko'rsatish
async def fast_chat(prompt):
  stream = await openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role":"user","content": prompt}],
    stream=True # Streaming yoqish
  )
  
  # Har bir bo'lakni darhol yuborish
  async for chunk in stream:
    if chunk.choices[0].delta.content:
      yield chunk.choices[0].delta.content
      # Foydalanuvchi darhol ko'ra boshlaydi!`}
       explanation="Streaming bilan foydalanuvchi 100ms ichida birinchi harflarni ko'ra boshlaydi."
      />

      <Card className="border-2 border-black">
       <div className="bg-black p-4">
        <h3 className="text-white font-bold uppercase ">TEZLIK BENCHMARKS</h3>
       </div>
       <div className="overflow-x-auto">
        <table className="w-full">
         <thead>
          <tr className="border-b-2 border-black bg-gray-100">
           <th className="p-3 text-left">Texnika</th>
           <th className="p-3 text-center">Birinchi Token</th>
           <th className="p-3 text-center">To'liq Javob</th>
           <th className="p-3 text-center">Improvement</th>
          </tr>
         </thead>
         <tbody>
          <tr className="border-b">
           <td className="p-3 font-semibold">Baseline</td>
           <td className="p-3 text-center">2000ms</td>
           <td className="p-3 text-center">8000ms</td>
           <td className="p-3 text-center">-</td>
          </tr>
          <tr className="border-b bg-gray-50">
           <td className="p-3 font-semibold">+ Streaming</td>
           <td className="p-3 text-center">200ms</td>
           <td className="p-3 text-center">8000ms</td>
           <td className="p-3 text-center text-black">10x faster TTFT</td>
          </tr>
          <tr className="border-b bg-gray-50">
           <td className="p-3 font-semibold">+ Edge Cache</td>
           <td className="p-3 text-center">50ms</td>
           <td className="p-3 text-center">2000ms</td>
           <td className="p-3 text-center text-black">40x faster</td>
          </tr>
          <tr className="border-b bg-gray-50">
           <td className="p-3 font-semibold">+ Smaller Model</td>
           <td className="p-3 text-center">100ms</td>
           <td className="p-3 text-center">1000ms</td>
           <td className="p-3 text-center text-black">8x faster</td>
          </tr>
         </tbody>
        </table>
       </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
       <Card className="border-2 border-black">
        <div className="bg-black p-3">
         <h4 className="text-white font-bold ">TEZLASHTIRISH USULLARI</h4>
        </div>
        <CardContent className="p-4">
         <ul className="text-sm">
          <li className="flex items-start gap-2">
           <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
           <span>Groq Cloud - 500 token/s</span>
          </li>
          <li className="flex items-start gap-2">
           <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
           <span>Together AI - optimized inference</span>
          </li>
          <li className="flex items-start gap-2">
           <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
           <span>Cloudflare Workers AI</span>
          </li>
          <li className="flex items-start gap-2">
           <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
           <span>Local SSD caching</span>
          </li>
         </ul>
        </CardContent>
       </Card>

       <Card className="border-2 border-black">
        <div className="bg-black p-3">
         <h4 className="text-white font-bold ">MONITORING METRICS</h4>
        </div>
        <CardContent className="p-4">
         <ul className="text-sm">
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span><strong>TTFT:</strong> Time to First Token</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span><strong>TPS:</strong> Tokens Per Second</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span><strong>P95:</strong> 95th percentile latency</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span><strong>Cache Hit Rate:</strong> % from cache</span>
          </li>
         </ul>
        </CardContent>
       </Card>
      </div>

      <Alert className="border-2 border-gray-600 bg-gray-50">
       <AiIcon name="rocket" size={20} className="text-gray-700" />
       <AlertDescription className="text-gray-800">
        <strong>Yangilik:</strong> Groq LPU (Language Processing Unit) bilan Llama 3 
        modelini 500+ token/sekund tezlikda ishlatish mumkin - GPT-4 dan 10x tezroq!
       </AlertDescription>
      </Alert>
     </div>
    )
   }
  }
 ]
};

export const xotiraBoshqaruv: SectionContent = {
 title:"XOTIRA BOSHQARUV",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-lg ">
        AI kontekst xotirasini to'g'ri boshqarish - uzoq suhbatlar va murakkab vazifalar 
        uchun muhim. Har bir model cheklangan kontekst oynasiga ega.
       </p>
       <p className="text-lg ">
        Samarali xotira boshqaruvi orqali AI uzoqroq va aniqroq suhbatlar olib borishi, 
        oldingi ma'lumotlarni eslab qolishi va kontekstni yo'qotmasdan ishlashi mumkin.
       </p>
      </div>

      <Card className="border-2 border-black bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold flex items-center gap-2 ">
         <AiIcon name="memory" size={24} />
         KONTEKST OYNASI CHEGARALARI
        </h3>
        
        <div>
         <div className="flex items-center justify-between p-3 bg-white border-2 border-gray-300 rounded">
          <div>
           <h4 className="font-bold ">GPT-4o</h4>
           <p className="text-sm text-gray-600 ">128K tokens</p>
          </div>
          <div className="text-right">
           <p className="font-mono text-lg ">~96,000 so'z</p>
           <p className="text-xs text-gray-500 ">~300 sahifa</p>
          </div>
         </div>

         <div className="flex items-center justify-between p-3 bg-white border-2 border-gray-300 rounded">
          <div>
           <h4 className="font-bold ">Claude 3</h4>
           <p className="text-sm text-gray-600 ">200K tokens</p>
          </div>
          <div className="text-right">
           <p className="font-mono text-lg ">~150,000 so'z</p>
           <p className="text-xs text-gray-500 ">~500 sahifa</p>
          </div>
         </div>

         <div className="flex items-center justify-between p-3 bg-white border-2 border-gray-300 rounded">
          <div>
           <h4 className="font-bold ">Gemini Pro</h4>
           <p className="text-sm text-gray-600 ">1M+ tokens</p>
          </div>
          <div className="text-right">
           <p className="font-mono text-lg ">~750,000 so'z</p>
           <p className="text-xs text-gray-500 ">~2500 sahifa</p>
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
       <ExpandableCard
        term="SLIDING WINDOW"
        definition="Yangi xabarlar qo'shilganda eskisini olib tashlash"
        icon={<AiIcon name="window" size={24} />}
        examples={["Oxirgi N ta xabarni saqlash","Muhim xabarlarni pin qilish","Vaqt bo'yicha filtrlash","Prioritet asosida saqlash"
        ]}
       />

       <ExpandableCard
        term="SUMMARIZATION"
        definition="Uzoq kontekstni qisqacha xulosaga aylantirish"
        icon={<AiIcon name="compress" size={24} />}
        examples={["Har 10 xabardan keyin xulosa","Mavzu bo'yicha guruhlash","Muhim faktlarni ajratish","Hierarchik summarization"
        ]}
       />
      </div>

      <CodeExample
       title="XOTIRA BOSHQARUV STRATEGIYASI"
       badExample={`# Hamma narsani saqlashga urinish
messages = []
while True:
  user_input = get_user_input()
  messages.append({"role":"user","content": user_input})
  
  # Kontekst tezda to'lib ketadi!
  response = ai.chat(messages) # ERROR: Context length exceeded
  messages.append({"role":"assistant","content": response})`}
       goodExample={`# Intelligent memory management
class MemoryManager:
  def __init__(self, max_tokens=4000):
    self.messages = []
    self.summary =""
    self.max_tokens = max_tokens
  
  def add_message(self, message):
    self.messages.append(message)
    
    # Token hisobini tekshirish
    if self.count_tokens() > self.max_tokens:
      self.compress_memory()
  
  def compress_memory(self):
    # Eski xabarlarni xulosa qilish
    old_messages = self.messages[:-10] # Oxirgi 10 ta qolsin
    self.summary = self.summarize(old_messages)
    self.messages = self.messages[-10:]
  
  def get_context(self):
    context = []
    if self.summary:
      context.append({"role":"system","content": f"Previous conversation summary: {self.summary}"
      })
    context.extend(self.messages)
    return context`}
       explanation="Smart memory management orqali uzoq suhbatlarni kontekst chegarasida saqlash mumkin."
      />

      <Card className="border-2 border-black">
       <div className="bg-black p-4">
        <h3 className="text-white font-bold uppercase ">XOTIRA STRATEGIYALARI</h3>
       </div>
       <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-4">
         <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto flex items-center justify-center">
           <span className="text-white text-2xl"></span>
          </div>
          <h4 className="font-bold ">PINNED MEMORY</h4>
          <p className="text-sm ">Muhim ma'lumotlarni doim saqlash</p>
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
           System prompt, User preferences, Key facts
          </div>
         </div>

         <div className="text-center">
          <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto flex items-center justify-center">
           <span className="text-white text-2xl"></span>
          </div>
          <h4 className="font-bold ">ROLLING BUFFER</h4>
          <p className="text-sm ">Oxirgi N ta xabarni saqlash</p>
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
           Recent context, Active discussion
          </div>
         </div>

         <div className="text-center">
          <div className="w-16 h-16 bg-gray-500 rounded-full mx-auto flex items-center justify-center">
           <span className="text-white text-2xl"></span>
          </div>
          <h4 className="font-bold ">EPISODIC MEMORY</h4>
          <p className="text-sm ">Mavzu bo'yicha guruhlash</p>
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
           Topic summaries, Session history
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <Card className="border-2 border-gray-600 bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-800 ">
         AMALIY MISOL: CUSTOMER SUPPORT BOT
        </h3>
        <div>
         <div className="p-3 bg-white border border-gray-300 rounded">
          <h5 className="font-bold">Muammo:</h5>
          <p className="text-sm ">24/7 support bot har bir mijoz bilan uzoq suhbat olib borishi kerak</p>
         </div>
         
         <div>
          <div className="p-3 bg-gray-100 border border-gray-300 rounded">
           <strong>Layer 1:</strong> Joriy muammo (500 tokens)
          </div>
          <div className="p-3 bg-gray-100 border border-gray-300 rounded ml-4">
           <strong>Layer 2:</strong> Mijoz profili (200 tokens)
          </div>
          <div className="p-3 bg-gray-100 border border-gray-300 rounded ml-8">
           <strong>Layer 3:</strong> Oldingi muammolar xulosasi (300 tokens)
          </div>
          <div className="p-3 bg-gray-100 border border-gray-300 rounded ml-12">
           <strong>Layer 4:</strong> Kompaniya qoidalari (1000 tokens)
          </div>
         </div>
         
         <p className="text-sm font-semibold text-gray-700 ">
          Natija: 2000 token bilan cheksiz uzoq suhbat!
         </p>
        </div>
       </CardContent>
      </Card>

      <Alert className="border-2 border-gray-600 bg-gray-50">
       <AiIcon name="info" size={20} className="text-gray-700" />
       <AlertDescription className="text-gray-800">
        <strong>Eslatma:</strong> Kontekst oynasi katta bo'lsa ham, ko'p kontekst = sekin javob. 
        Optimal kontekst hajmi 4K-8K token atrofida.
       </AlertDescription>
      </Alert>
     </div>
    )
   }
  }
 ]
};

// Remove placeholder export since we now have all content
