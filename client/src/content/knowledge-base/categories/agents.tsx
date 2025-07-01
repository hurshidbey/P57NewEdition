import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AiIcon } from "@/components/ai-icon";
import { ExpandableCard } from "../components/ExpandableCard";
import { CodeExample } from "../components/CodeExample";
import type { SectionContent } from "../components/types";

export const agentTizimlar: SectionContent = {
  title: "AGENT NIMA?",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                AI Agent - bu mustaqil ravishda vazifalarni bajarish, qarorlar qabul qilish va o'z maqsadlariga erishish 
                uchun turli vositalardan foydalana oladigan intellektual tizim.
              </p>
              <p className="text-lg leading-relaxed">
                Oddiy AI chatbotdan farqli o'laroq, agentlar proaktiv, maqsadga yo'naltirilgan va ko'p bosqichli 
                vazifalarni mustaqil bajarish qobiliyatiga ega.
              </p>
            </div>

            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AiIcon name="robot" size={24} />
                  AGENT KOMPONENTLARI
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border-2 border-black bg-white p-4">
                    <h4 className="font-bold mb-2">1. MIYAGA (LLM)</h4>
                    <p className="text-sm">Fikrlash va qaror qabul qilish markazi</p>
                  </div>
                  <div className="border-2 border-black bg-white p-4">
                    <h4 className="font-bold mb-2">2. XOTIRA</h4>
                    <p className="text-sm">Kontekst va o'tmish tajribalarni saqlash</p>
                  </div>
                  <div className="border-2 border-black bg-white p-4">
                    <h4 className="font-bold mb-2">3. VOSITALAR</h4>
                    <p className="text-sm">Tashqi dunyo bilan o'zaro ta'sir qilish</p>
                  </div>
                  <div className="border-2 border-black bg-white p-4">
                    <h4 className="font-bold mb-2">4. REJALASHTIRISH</h4>
                    <p className="text-sm">Vazifalarni bosqichlarga bo'lish</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CodeExample
              title="ODDIY AGENT MISOLI"
              badExample={`# Oddiy chatbot
user: "Menga Python o'rgatilgan kurslar haqida ma'lumot ber"
ai: "Python kurslari haqida ma'lumot: [statik javob]"`}
              goodExample={`# AI Agent
user: "Menga Python o'rgatilgan kurslar haqida ma'lumot ber"
agent: 
  1. Google'dan so'nggi Python kurslarini qidiraman...
  2. Kurslarni narx va reyting bo'yicha taqqoslayman...
  3. Sizning darajangizga mos kurslarni tanlayman...
  4. [Dinamik, yangilangan natijalar]`}
              explanation="Agent real vaqtda ma'lumot to'playdi, tahlil qiladi va shaxsiylashtirilgan tavsiyalar beradi."
            />

            <ExpandableCard
              term="AGENT TURLARI"
              definition="Turli vazifalar uchun ixtisoslashtirilgan agent turlari"
              icon={<AiIcon name="layers" size={24} />}
              examples={[
                "ReAct Agent - Fikrlash va harakat qilish sikli",
                "Task Agent - Aniq vazifalarni bajarish",
                "Conversational Agent - Suhbat orqali yordam",
                "Autonomous Agent - To'liq mustaqil ishlash"
              ]}
            />

            <Alert className="border-2 border-orange-500 bg-orange-50">
              <AiIcon name="lightbulb" size={20} className="text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Maslahat:</strong> Agentlar eng yaxshi natija beradi qachonki ularga aniq maqsad, 
                kerakli vositalar va etarli vaqt berilsa.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const toolUse: SectionContent = {
  title: "TOOL USE",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Tool Use (Vositalardan foydalanish) - bu AI agentlarning tashqi API, ma'lumotlar bazasi, 
                kalkulyator va boshqa vositalar bilan ishlash qobiliyati.
              </p>
              <p className="text-lg leading-relaxed">
                Bu xususiyat agentlarga real dunyo bilan o'zaro ta'sir qilish va o'z bilimlaridan 
                tashqaridagi ma'lumotlarga kirish imkonini beradi.
              </p>
            </div>

            <Card className="border-2 border-black">
              <div className="bg-black p-4">
                <h3 className="text-white font-bold uppercase">ASOSIY VOSITALAR</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 border-2 border-gray-300 hover:border-black transition-colors">
                    <AiIcon name="search" size={24} className="flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold">WEB QIDIRUV</h4>
                      <p className="text-sm text-gray-700">Real vaqtda internetdan ma'lumot olish</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 mt-1 inline-block">search_web("query")</code>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border-2 border-gray-300 hover:border-black transition-colors">
                    <AiIcon name="calculator" size={24} className="flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold">KALKULYATOR</h4>
                      <p className="text-sm text-gray-700">Murakkab matematik hisoblashlar</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 mt-1 inline-block">calculate("2^10 + sqrt(16)")</code>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border-2 border-gray-300 hover:border-black transition-colors">
                    <AiIcon name="database" size={24} className="flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold">MA'LUMOTLAR BAZASI</h4>
                      <p className="text-sm text-gray-700">Strukturalangan ma'lumotlarni saqlash va olish</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 mt-1 inline-block">db.query("SELECT * FROM users")</code>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border-2 border-gray-300 hover:border-black transition-colors">
                    <AiIcon name="code" size={24} className="flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold">KOD BAJARISH</h4>
                      <p className="text-sm text-gray-700">Python yoki boshqa tillarni ishga tushirish</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 mt-1 inline-block">execute_code(code)</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CodeExample
              title="TOOL USE JARAYONI"
              badExample={`# Vositasiz yondashuv
user: "AAPL aksiyasi narxi qancha?"
ai: "Men real vaqt ma'lumotlariga ega emasman, 
     lekin 2024 yil boshida AAPL taxminan $190 atrofida edi."`}
              goodExample={`# Tool Use bilan
user: "AAPL aksiyasi narxi qancha?"
agent: 
  Fikr: Joriy aksiya narxini olish kerak
  Harakat: stock_api.get_price("AAPL")
  Kuzatuv: AAPL = $195.83 (↑2.3%)
  Javob: "Apple (AAPL) aksiyasi hozirda $195.83, 
          bugun 2.3% ko'tarilgan"`}
              explanation="Agent tashqi API'dan real vaqt ma'lumotlarini oladi va aniq javob beradi."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-2 border-green-600">
                <CardContent className="p-4">
                  <h4 className="font-bold text-green-800 mb-2">✓ AFZALLIKLAR</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Real vaqt ma'lumotlari</li>
                    <li>• Aniq hisoblashlar</li>
                    <li>• Keng imkoniyatlar</li>
                    <li>• Avtomatlashtirish</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-red-600">
                <CardContent className="p-4">
                  <h4 className="font-bold text-red-800 mb-2">✗ CHEKLOVLAR</h4>
                  <ul className="text-sm space-y-1">
                    <li>• API limitlari</li>
                    <li>• Xavfsizlik masalalari</li>
                    <li>• Sekinroq javob</li>
                    <li>• Xatolik ehtimoli</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-2 border-blue-500 bg-blue-50">
              <AiIcon name="shield" size={20} className="text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Xavfsizlik:</strong> Agentlarga faqat kerakli vositalarni bering. 
                Har bir vosita uchun ruxsatlarni aniq belgilang.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const orchestration: SectionContent = {
  title: "ORCHESTRATION",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Orchestration - bu bir necha agentlarni birgalikda ishlashini tashkil qilish va 
                ularning harakatlarini muvofiqlashtirish jarayoni.
              </p>
              <p className="text-lg leading-relaxed">
                Murakkab vazifalarni bajarish uchun turli ixtisoslashgan agentlar birgalikda 
                ishlashi va o'zaro ma'lumot almashishi kerak.
              </p>
            </div>

            <Card className="border-2 border-black bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 text-center">ORCHESTRATION ARXITEKTURASI</h3>
                
                <div className="space-y-6">
                  {/* Orchestrator */}
                  <div className="border-3 border-black bg-white p-4 shadow-lg">
                    <h4 className="font-bold text-center mb-2">🎯 ORCHESTRATOR</h4>
                    <p className="text-sm text-center">Vazifalarni taqsimlash va natijalarni birlashtirish</p>
                  </div>

                  {/* Agents */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border-2 border-blue-600 bg-blue-50 p-3">
                      <h5 className="font-bold text-sm text-center mb-1">📊 Tahlil Agent</h5>
                      <p className="text-xs text-center">Ma'lumotlarni tahlil qilish</p>
                    </div>
                    <div className="border-2 border-green-600 bg-green-50 p-3">
                      <h5 className="font-bold text-sm text-center mb-1">✍️ Yozuv Agent</h5>
                      <p className="text-xs text-center">Kontent yaratish</p>
                    </div>
                    <div className="border-2 border-purple-600 bg-purple-50 p-3">
                      <h5 className="font-bold text-sm text-center mb-1">✓ Tekshiruv Agent</h5>
                      <p className="text-xs text-center">Sifatni nazorat qilish</p>
                    </div>
                  </div>

                  {/* Arrows showing flow */}
                  <div className="text-center text-2xl">↕️</div>

                  {/* Shared Resources */}
                  <div className="border-2 border-gray-600 bg-gray-100 p-4">
                    <h4 className="font-bold text-center mb-2">💾 UMUMIY RESURSLAR</h4>
                    <p className="text-sm text-center">Xotira, Vositalar, Ma'lumotlar bazasi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ExpandableCard
              term="ORCHESTRATION PATTERNS"
              definition="Agentlarni tashkil qilishning asosiy usullari"
              icon={<AiIcon name="git-branch" size={24} />}
              examples={[
                "Sequential - Ketma-ket bajarish",
                "Parallel - Parallel ishlash",
                "Hierarchical - Ierarxik tuzilma",
                "Collaborative - Hamkorlikda ishlash",
                "Competitive - Raqobat asosida"
              ]}
            />

            <CodeExample
              title="ORCHESTRATION MISOLI"
              badExample={`# Bitta agent hamma ishni bajarmoqchi
agent.execute(
  "1. Ma'lumot to'pla
   2. Tahlil qil
   3. Hisobot yoz
   4. Grafiklar yasat
   5. Prezentatsiya tayyorla"
)
# Natija: Sekin, xatolikka moyil`}
              goodExample={`# Orchestrator bilan
orchestrator.assign_tasks({
  "data_agent": "Ma'lumot to'plash",
  "analyst_agent": "Tahlil qilish",
  "writer_agent": "Hisobot yozish",
  "visual_agent": "Grafiklar yaratish"
})
# Parallel ishlash, tezroq natija`}
              explanation="Har bir agent o'z ixtisosiga mos vazifani bajaradi, orchestrator ularni muvofiqlashtiradi."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-2 border-black">
                <div className="bg-black p-3">
                  <h4 className="text-white font-bold text-sm">QACHON KERAK?</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>Murakkab, ko'p bosqichli vazifalar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>Turli ixtisoslar talab qilinsa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>Parallel ishlash imkoni bo'lsa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>Katta hajmdagi ishlar</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-black">
                <div className="bg-black p-3">
                  <h4 className="text-white font-bold text-sm">BEST PRACTICES</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Aniq rol va mas'uliyatlar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Samarali kommunikatsiya</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Xatoliklarni boshqarish</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>Monitoring va logging</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-2 border-purple-500 bg-purple-50">
              <AiIcon name="rocket" size={20} className="text-purple-600" />
              <AlertDescription className="text-purple-800">
                <strong>Pro tip:</strong> Orchestration-ni oddiy vazifadan boshlang. 
                Murakkablikni asta-sekin oshiring va har bir agentni alohida test qiling.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

// Remove placeholder export since we now have all content