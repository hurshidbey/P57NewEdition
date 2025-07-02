import React from"react";
import { Card, CardContent } from"@/components/ui/card";
import { Alert, AlertDescription } from"@/components/ui/alert";
import { Badge } from"@/components/ui/badge";
import { AiIcon } from"@/components/ai-icon";
import { ExpandableCard } from"../components/ExpandableCard";
import { CodeExample } from"../components/CodeExample";
import type { SectionContent } from"../components/types";

export const gptOilasi: SectionContent = {
 title:"GPT OILASI",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-base ">
        GPT (Generative Pre-trained Transformer) - OpenAI tomonidan yaratilgan eng mashhur 
        AI model oilasi. GPT-3 dan boshlab GPT-4 gacha, har bir versiya yanada kuchli imkoniyatlar bilan kelgan.
       </p>
       <p className="text-base ">
        GPT modellari matn generatsiya, tarjima, kod yozish, tahlil qilish va ko'plab 
        boshqa vazifalarda yetakchi o'rinni egallaydi.
       </p>
      </div>

      <Card className="border-2 border-black bg-gray-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
       <CardContent className="p-4">
        <h3 className="text-lg font-bold flex items-center gap-2 ">
         <AiIcon name="openai" size={24} />
         GPT MODELLAR EVOLYUTSIYASI
        </h3>
        
        <div>
         <div className="border-l-4 border-gray-600 pl-4">
          <h4 className="font-bold text-gray-800 ">GPT-3 (2020)</h4>
          <p className="text-sm text-gray-700 ">175 milliard parametr</p>
          <div className="mt-1 flex flex-wrap gap-1">
           <Badge className="bg-gray-100 text-gray-800">Birinchi katta til modeli</Badge>
           <Badge className="bg-gray-100 text-gray-800">Few-shot learning</Badge>
          </div>
         </div>

         <div className="border-l-4 border-gray-600 pl-4">
          <h4 className="font-bold text-gray-800 ">GPT-3.5 Turbo (2022)</h4>
          <p className="text-sm text-gray-700 ">ChatGPT asosi</p>
          <div className="mt-1 flex flex-wrap gap-1">
           <Badge className="bg-gray-100 text-gray-800">10x tezroq</Badge>
           <Badge className="bg-gray-100 text-gray-800">Suhbat uchun optimizatsiya</Badge>
          </div>
         </div>

         <div className="border-l-4 border-gray-600 pl-4">
          <h4 className="font-bold text-gray-800 ">GPT-4 (2023)</h4>
          <p className="text-sm text-gray-700 ">1.76 trillion parametr (taxmin)</p>
          <div className="mt-1 flex flex-wrap gap-1">
           <Badge className="bg-gray-100 text-gray-800">Multimodal (rasm+matn)</Badge>
           <Badge className="bg-gray-100 text-gray-800">32K kontekst</Badge>
          </div>
         </div>

         <div className="border-l-4 border-gray-600 pl-4">
          <h4 className="font-bold text-gray-800 ">GPT-4o (2024)</h4>
          <p className="text-sm text-gray-700 ">Omni model - audio, video, matn</p>
          <div className="mt-1 flex flex-wrap gap-1">
           <Badge className="bg-gray-100 text-gray-800">Real-time javob</Badge>
           <Badge className="bg-gray-100 text-gray-800">128K kontekst</Badge>
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
       <Card className="border-2 border-black hover:shadow-lg transition-shadow">
        <div className="bg-black p-3">
         <h4 className="text-white font-bold text-center ">GPT-3.5 TURBO</h4>
        </div>
        <CardContent className="p-4">
         <div className="text-sm">
          <p className=""><strong>Narx:</strong> $0.5/1M token</p>
          <p className=""><strong>Tezlik:</strong> Juda tez</p>
          <p className=""><strong>Kontekst:</strong> 16K</p>
          <p className=""><strong>Foydalanish:</strong> Chatbot, tarjima</p>
         </div>
        </CardContent>
       </Card>

       <Card className="border-2 border-black hover:shadow-lg transition-shadow">
        <div className="bg-gray-700 p-3">
         <h4 className="text-white font-bold text-center ">GPT-4</h4>
        </div>
        <CardContent className="p-4">
         <div className="text-sm">
          <p className=""><strong>Narx:</strong> $30/1M token</p>
          <p className=""><strong>Tezlik:</strong> O'rtacha</p>
          <p className=""><strong>Kontekst:</strong> 32K</p>
          <p className=""><strong>Foydalanish:</strong> Murakkab tahlil</p>
         </div>
        </CardContent>
       </Card>

       <Card className="border-2 border-black hover:shadow-lg transition-shadow">
        <div className="bg-gray-800 p-3">
         <h4 className="text-white font-bold text-center ">GPT-4o</h4>
        </div>
        <CardContent className="p-4">
         <div className="text-sm">
          <p className=""><strong>Narx:</strong> $5/1M token</p>
          <p className=""><strong>Tezlik:</strong> Tez</p>
          <p className=""><strong>Kontekst:</strong> 128K</p>
          <p className=""><strong>Foydalanish:</strong> Universal</p>
         </div>
        </CardContent>
       </Card>
      </div>

      <CodeExample
       title="GPT MODELLARNI CHAQIRISH"
       badExample={`# Har doim eng yangi modelni ishlatish
response = openai.chat.completions.create(
  model="gpt-4-turbo-preview", # Qimmat!
  messages=[{"role":"user","content":"Salom"}]
)`}
       goodExample={`# Vazifaga mos model tanlash
def get_gpt_response(prompt, complexity="low"):
  if complexity =="low":
    model ="gpt-3.5-turbo" # Oddiy vazifalar uchun
  elif complexity =="medium":
    model ="gpt-4o" # Balansli variant
  else:
    model ="gpt-4-turbo" # Murakkab vazifalar
    
  return openai.chat.completions.create(
    model=model,
    messages=[{"role":"user","content": prompt}]
  )`}
       explanation="Har bir vazifa uchun mos GPT modelini tanlash xarajatlarni kamaytiradi."
      />

      <ExpandableCard
       term="FUNCTION CALLING"
       definition="GPT modellarning tashqi funksiyalarni chaqirish qobiliyati"
       icon={<AiIcon name="function" size={24} />}
       examples={["Ma'lumotlar bazasidan qidiruv","API chaqiruvlari","Hisob-kitoblar","Fayl operatsiyalari"
       ]}
      />

      <Alert className="border-2 border-gray-600 bg-gray-50">
       <AiIcon name="info" size={20} className="text-gray-700" />
       <AlertDescription className="text-gray-800">
        <strong>Yangilik:</strong> GPT-4o mini - arzon va tez model, GPT-3.5 o'rniga 
        tavsiya etiladi. Narxi 60% arzon, lekin sifati deyarli bir xil.
       </AlertDescription>
      </Alert>
     </div>
    )
   }
  }
 ]
};

export const claudeOilasi: SectionContent = {
 title:"CLAUDE OILASI",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-base ">
        Claude - Anthropic kompaniyasi tomonidan yaratilgan AI assistant oilasi. 
        Xavfsizlik, foydalilik va halollikka alohida e'tibor berilgan bu modellar 
        professional foydalanish uchun eng yaxshi tanlovlardan biri.
       </p>
       <p className="text-base ">
        Claude modellari uzun kontekst bilan ishlash, kod yozish, ilmiy tahlil va 
        ijodiy yozuvlarda ajoyib natijalar ko'rsatadi.
       </p>
      </div>

      <Card className="border-2 border-black overflow-hidden">
       <div className="bg-black p-4">
        <h3 className="text-base font-bold uppercase text-center ">CLAUDE 3 MODEL OILASI</h3>
       </div>
       <CardContent className="p-0">
        <div className="grid md:grid-cols-3 divide-x-2 divide-black">
         <div className="p-6 text-center">
          <div className="text-4xl"></div>
          <h4 className="font-bold text-lg ">CLAUDE 3 HAIKU</h4>
          <p className="text-sm text-gray-700 ">Eng tez va arzon</p>
          <div className="text-xs">
           <p className="">0.25¢ / 1K token</p>
           <p className="">200K kontekst</p>
           <p className="">Oddiy vazifalar</p>
          </div>
         </div>

         <div className="p-6 text-center bg-gray-50">
          <div className="text-4xl"></div>
          <h4 className="font-bold text-lg ">CLAUDE 3.5 SONNET</h4>
          <p className="text-sm text-gray-700 ">Eng muvozanatli</p>
          <div className="text-xs">
           <p className="">3¢ / 1K token</p>
           <p className="">200K kontekst</p>
           <p className="">Ko'pchilik vazifalar</p>
          </div>
         </div>

         <div className="p-6 text-center">
          <div className="text-4xl"></div>
          <h4 className="font-bold text-lg ">CLAUDE 3 OPUS</h4>
          <p className="text-sm text-gray-700 ">Eng kuchli</p>
          <div className="text-xs">
           <p className="">15¢ / 1K token</p>
           <p className="">200K kontekst</p>
           <p className="">Murakkab vazifalar</p>
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
       <ExpandableCard
        term="CONSTITUTIONAL AI"
        definition="Claude'ning xavfsizlik tamoyili - AI o'z-o'zini nazorat qiladi"
        icon={<AiIcon name="shield" size={24} />}
        examples={["Zararli kontentni rad etish","Xolis va adolatli javoblar","Shaxsiy ma'lumotlarni himoya","Etik chegaralarni saqlash"
        ]}
       />

       <ExpandableCard
        term="ARTIFACTS"
        definition="Claude'ning kod va hujjatlarni alohida oynada ko'rsatish funksiyasi"
        icon={<AiIcon name="window" size={24} />}
        examples={["To'liq dasturlar yaratish","Interaktiv HTML sahifalar","SVG grafikalar","Markdown hujjatlar"
        ]}
       />
      </div>

      <CodeExample
       title="CLAUDE API ISHLATISH"
       badExample={`# Kontekstni isrof qilish
messages = [
  {"role":"user","content": entire_book}, # 100K token!
  {"role":"user","content":"Ushbu kitobda nima haqida?"}
]`}
       goodExample={`# Samarali kontekst boshqaruvi
# Avval qisqacha ma'lumot
summary_prompt ="Kitobning asosiy g'oyalarini 3 ta bullet point qilib ber"

# Keyin aniq savollar
detailed_prompt ="""
Kontekst: [relevant excerpt]
Savol: Bu qism qanday bog'langan asosiy tezis bilan?"""`}
       explanation="Claude'ning katta kontekst oynasidan samarali foydalaning, lekin ortiqcha yuklamang."
      />

      <Card className="border-2 border-black bg-gray-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
       <CardContent className="p-4">
        <h3 className="text-lg font-bold text-black ">
         CLAUDE VS GPT: QACHON QAYSI?
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
         <div>
          <h4 className="font-bold text-gray-700 ">Claude yaxshiroq:</h4>
          <ul className="text-sm">
           <li>- Uzun hujjatlar tahlili</li>
           <li>- Kod yozish va debug</li>
           <li>- Ilmiy tadqiqotlar</li>
           <li>- Xavfsizlik muhim bo'lsa</li>
          </ul>
         </div>
         <div>
          <h4 className="font-bold text-gray-700 ">GPT yaxshiroq:</h4>
          <ul className="text-sm">
           <li>- Ijodiy yozuv</li>
           <li>- Ko'p tilli tarjima</li>
           <li>- Function calling</li>
           <li>- Rasm bilan ishlash</li>
          </ul>
         </div>
        </div>
       </CardContent>
      </Card>

      <Alert className="border-2 border-gray-600 bg-gray-50">
       <AiIcon name="rocket" size={20} className="text-gray-700" />
       <AlertDescription className="text-gray-800">
        <strong>Pro tip:</strong> Claude 3.5 Sonnet ko'p hollarda Opus'dan ham yaxshi 
        natija beradi, lekin 5x arzon. Avval Sonnet'ni sinab ko'ring!
       </AlertDescription>
      </Alert>
     </div>
    )
   }
  }
 ]
};

export const ochiqModellar: SectionContent = {
 title:"OCHIQ MODELLAR",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-base ">
        Ochiq manbali AI modellar - bepul yuklab olish, o'zgartirish va tijorat maqsadlarida 
        foydalanish mumkin bo'lgan modellar. Ular maxfiylik, moslashuvchanlik va narx jihatidan katta afzalliklarga ega.
       </p>
       <p className="text-base ">
        Meta'ning Llama, Mistral AI va boshqa kompaniyalar ochiq modellar sohasida 
        inqilob qilmoqda, ba'zi modellari GPT-3.5 darajasiga yetib kelgan.
       </p>
      </div>

      <Card className="border-2 border-black bg-gray-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
       <CardContent className="p-4">
        <h3 className="text-lg font-bold text-center ">TOP OCHIQ MODELLAR 2024</h3>
        
        <div>
         <div className="border-2 border-gray-600 rounded-none p-4 bg-white">
          <div className="flex items-start justify-between">
           <div>
            <h4 className="font-bold text-gray-800 ">LLAMA 3.1 (Meta)</h4>
            <p className="text-sm text-gray-700 mt-1 ">8B, 70B, 405B parametr versiyalari</p>
            <div className="mt-2 flex flex-wrap gap-2">
             <Badge variant="outline">128K kontekst</Badge>
             <Badge variant="outline">Multilingual</Badge>
             <Badge variant="outline">Commercial use</Badge>
            </div>
           </div>
           <div className="text-2xl">1</div>
          </div>
         </div>

         <div className="border-2 border-gray-600 rounded-none p-4 bg-white">
          <div className="flex items-start justify-between">
           <div>
            <h4 className="font-bold text-gray-800 ">MISTRAL & MIXTRAL</h4>
            <p className="text-sm text-gray-700 mt-1 ">7B, 8x7B, 8x22B MoE modellari</p>
            <div className="mt-2 flex flex-wrap gap-2">
             <Badge variant="outline">32K kontekst</Badge>
             <Badge variant="outline">Apache 2.0</Badge>
             <Badge variant="outline">Function calling</Badge>
            </div>
           </div>
           <div className="text-2xl">2</div>
          </div>
         </div>

         <div className="border-2 border-gray-600 rounded-none p-4 bg-white">
          <div className="flex items-start justify-between">
           <div>
            <h4 className="font-bold text-gray-800 ">QWEN 2.5 (Alibaba)</h4>
            <p className="text-sm text-gray-700 mt-1 ">0.5B dan 72B gacha</p>
            <div className="mt-2 flex flex-wrap gap-2">
             <Badge variant="outline">128K kontekst</Badge>
             <Badge variant="outline">Multilingual++</Badge>
             <Badge variant="outline">Code & Math</Badge>
            </div>
           </div>
           <div className="text-2xl">3</div>
          </div>
         </div>

         <div className="border-2 border-gray-600 rounded-none p-4 bg-white">
          <div className="flex items-start justify-between">
           <div>
            <h4 className="font-bold text-gray-800 ">DEEPSEEK</h4>
            <p className="text-sm text-gray-700 mt-1 ">DeepSeek-V2, Coder modellari</p>
            <div className="mt-2 flex flex-wrap gap-2">
             <Badge variant="outline">128K kontekst</Badge>
             <Badge variant="outline">MoE architecture</Badge>
             <Badge variant="outline">Coding specialist</Badge>
            </div>
           </div>
           <div className="text-2xl">4</div>
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
       <Card className="border-2 border-black">
        <div className="bg-black p-3">
         <h4 className="text-white font-bold ">OCHIQ MODELLAR AFZALLIKLARI</h4>
        </div>
        <CardContent className="p-4">
         <ul className="text-sm">
          <li className="flex items-start gap-2">
           <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
           <span>To'liq nazorat va maxfiylik</span>
          </li>
          <li className="flex items-start gap-2">
           <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
           <span>O'z serveringizda ishlatish</span>
          </li>
          <li className="flex items-start gap-2">
           <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
           <span>Fine-tuning imkoniyati</span>
          </li>
          <li className="flex items-start gap-2">
           <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
           <span>API limitlari yo'q</span>
          </li>
         </ul>
        </CardContent>
       </Card>

       <Card className="border-2 border-black">
        <div className="bg-black p-3">
         <h4 className="text-white font-bold ">DEPLOYMENT VARIANTLARI</h4>
        </div>
        <CardContent className="p-4">
         <ul className="text-sm">
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span><strong>Ollama:</strong> Lokal kompyuterda</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span><strong>Groq:</strong> Eng tez inference</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span><strong>Together AI:</strong> Cloud API</span>
          </li>
          <li className="flex items-start gap-2">
           <span className="text-black">•</span>
           <span><strong>Replicate:</strong> Serverless</span>
          </li>
         </ul>
        </CardContent>
       </Card>
      </div>

      <CodeExample
       title="OCHIQ MODEL TANLASH"
       badExample={`# Eng katta modelni tanlash
model ="llama-3.1-405b" # 800GB+ GPU kerak!
# Ko'pchilik uchun ishlamaydi`}
       goodExample={`# Resursga mos model tanlash
def select_open_model(gpu_memory, use_case):
  if gpu_memory < 8: # GB
    return"llama-3.2-3b" # Mobil/edge
  elif gpu_memory < 24:
    return"mistral-7b" # Desktop GPU
  elif gpu_memory < 80:
    return"llama-3.1-70b-4bit" # Quantized
  else:
    return"mixtral-8x22b" # Server GPU`}
       explanation="Mavjud resurslaringizga mos ochiq modelni tanlang."
      />

      <ExpandableCard
       term="QUANTIZATION"
       definition="Modellarni kichiklashtirish texnologiyasi - sifatni kam yo'qotib hajmni kamaytirish"
       icon={<AiIcon name="compress" size={24} />}
       examples={["FP16 → INT8: 2x kichik, 5% sifat yo'qotish","GPTQ: 4-bit quantization","GGUF: CPU-optimized format","AWQ: Activation-aware quantization"
       ]}
      />

      <Alert className="border-2 border-gray-600 bg-gray-50">
       <AiIcon name="lightbulb" size={20} className="text-gray-700" />
       <AlertDescription className="text-gray-800">
        <strong>Boshlash uchun:</strong> Ollama.ai dan foydalaning - bu eng oson yo'l 
        ochiq modellarni lokal kompyuterda ishlatish uchun. Llama 3.2 3B modeli 
        oddiy noutbukda ham ishlaydi!
       </AlertDescription>
      </Alert>

      <Card className="border-2 border-black">
       <div className="bg-black p-4">
        <h3 className="text-white font-bold uppercase ">O'ZBEK TILI UCHUN MODELLAR</h3>
       </div>
       <CardContent className="p-4">
        <p className="text-sm text-gray-700 ">
         O'zbek tili uchun maxsus treninig qilingan modellar kam, lekin multilingual modellar yaxshi ishlaydi:
        </p>
        <div>
         <div className="p-4 bg-gray-50 border-2 border-black">
          <strong>Qwen 2.5:</strong> Eng yaxshi o'zbek tili qo'llab-quvvatlashi
         </div>
         <div className="p-4 bg-gray-50 border-2 border-black">
          <strong>Llama 3.1:</strong> Yaxshi multilingual qobiliyat
         </div>
         <div className="p-4 bg-gray-50 border-2 border-black">
          <strong>mT5:</strong> Tarjima va text2text vazifalar uchun
         </div>
        </div>
       </CardContent>
      </Card>
     </div>
    )
   }
  }
 ]
};

// Remove placeholder export since we now have all content