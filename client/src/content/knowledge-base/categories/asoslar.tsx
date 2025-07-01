import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AiIcon } from "@/components/ai-icon";
import { ExpandableCard } from "../components/ExpandableCard";
import { CodeExample } from "../components/CodeExample";
import type { SectionContent } from "../components/types";

export const aiQandayIshlaydi: SectionContent = {
  title: "AI QANDAY ISHLAYDI",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <>
<div className="space-y-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              Sun'iy intellekt — bu kompyuterlarni inson kabi "o'ylash"ga o'rgatish san'ati. 
              Lekin bu "o'ylash" aslida nima?
            </p>
          </div>

          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">AI QANDAY "O'YLAYDI":</h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <div>
                    <strong>Pattern tanish:</strong> Millionlab misollardan qonuniyatlarni topadi
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <div>
                    <strong>Bashorat qilish:</strong> O'rgangan pattern'lar asosida keyingi so'zni taxmin qiladi
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">3.</span>
                  <div>
                    <strong>Kontekstni tushunish:</strong> Sizning savolingiz qaysi mavzuga tegishli ekanini aniqlaydi
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
          
          <ExpandableCard
            term="NEYRON TARMOQLAR"
            definition="Inson miyasining ishlash prinsipiga asoslangan kompyuter tizimlari. Millionlab 'neyron'lar ma'lumotni qayta ishlaydi."
            icon={<AiIcon name="network" size={24} />}
            examples={[
              "Input (kirish) → Processing (qayta ishlash) → Output (natija)",
              "Misol: Rasm → Neyron tarmoq → 'Bu mushuk rasmi'"
            ]}
          />
          
          <ExpandableCard
            term="MACHINE LEARNING"
            definition="Kompyuterlarning ma'lumotlardan o'rganish qobiliyati. Qancha ko'p ma'lumot, shuncha yaxshi natija."
            icon={<AiIcon name="brain" size={24} />}
            examples={[
              "Supervised Learning - Nazorat ostida o'rganish",
              "Unsupervised Learning - Mustaqil o'rganish",
              "Reinforcement Learning - Mukofotlash orqali o'rganish"
            ]}
          />

          <Alert className="border-2 border-black">
            <AiIcon name="info" size={20} />
            <AlertDescription>
              <strong>Muhim:</strong> AI aslida "tushunmaydi" — u statistik model. 
              Lekin bu model shunchalik murakkabki, u go'yo tushungandek natija beradi.
            </AlertDescription>
          </Alert>
        </div>
          </>
        )
      }
    }
  ]
};
export const neyronTarmoqlar: SectionContent = {
  title: "NEYRON TARMOQLAR",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Neyron tarmoqlar - sun'iy intellektning asosi. Inson miyasining ishlash 
                prinsiplariga asoslangan matematik modellar.
              </p>
            </div>

            <ExpandableCard
              term="NEYRON NIMA?"
              definition="Matematik funksiya bo'lib, kirish signallarini qabul qilib, ularni qayta ishlab, chiqish signalini beradi."
              icon={<AiIcon name="brain" size={24} />}
              examples={[
                "Kirish: [0.5, 0.3, 0.8] → Neyron → Chiqish: 0.7",
                "Har bir neyron o'z vazn (weight) va bias qiymatlariga ega",
                "Aktivatsiya funksiyasi orqali chiziqli bo'lmagan transformatsiya"
              ]}
            />

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">NEYRON TARMOQ QATLAMLARI:</h3>
                <div className="space-y-4">
                  <div className="border-2 border-black p-4">
                    <h4 className="font-bold mb-2">1. Kirish Qatlami (Input Layer)</h4>
                    <p>Ma'lumotlarni qabul qiladi (matn, rasm, ovoz)</p>
                  </div>
                  <div className="border-2 border-black p-4">
                    <h4 className="font-bold mb-2">2. Yashirin Qatlamlar (Hidden Layers)</h4>
                    <p>Ma'lumotlarni qayta ishlaydi va pattern'larni o'rganadi</p>
                  </div>
                  <div className="border-2 border-black p-4">
                    <h4 className="font-bold mb-2">3. Chiqish Qatlami (Output Layer)</h4>
                    <p>Natijani beradi (javob, klassifikatsiya, bashorat)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CodeExample
              title="ODDIY NEYRON MISOLI"
              badExample={`# Murakkab tushuntirish
"Neyron tarmoq - bu ko'p o'lchovli fazoda gradient descent 
algoritmidan foydalanib loss funksiyani minimallashtiradigan 
parametrik model..."`}
              goodExample={`# Sodda tushuntirish
"Neyron tarmoq - xuddi miya kabi ishlaydi:
1. Ko'z (input) → rasmni ko'radi
2. Miya (hidden layers) → rasmni tahlil qiladi  
3. Xulosa (output) → 'Bu mushuk' deb aytadi

Har safar xato qilganda, o'rganib boradi!"`}
              explanation="Neyron tarmoqlar murakkab tushuncha, lekin asosiy g'oya oddiy: ma'lumotdan o'rganish va bashorat qilish."
            />

            <Alert className="border-2 border-black">
              <AiIcon name="lightbulb" size={20} />
              <AlertDescription>
                <strong>Qiziq fakt:</strong> GPT-4 kabi modellar 1 trillion parametrga ega! 
                Bu inson miyasidagi neyronlar sonidan ham ko'p.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const llmArxitekturasi: SectionContent = {
  title: "LLM ARXITEKTURASI",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Large Language Model (LLM) - katta til modellari qanday tuzilgan va 
                ular qanday ishlaydi?
              </p>
            </div>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">LLM KOMPONENTLARI:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">1</Badge>
                    <div>
                      <strong>Tokenizer:</strong> Matnni raqamlarga aylantiradi
                      <p className="text-sm text-gray-600">Misol: "Salom" → [1234, 5678]</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">2</Badge>
                    <div>
                      <strong>Embedding Layer:</strong> Tokenlarni vektor fazoga joylashtiradi
                      <p className="text-sm text-gray-600">Har bir token 768-4096 o'lchamli vektor bo'ladi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">3</Badge>
                    <div>
                      <strong>Transformer Blocks:</strong> Asosiy hisoblash bloklari
                      <p className="text-sm text-gray-600">Attention va Feed-Forward tarmoqlar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-1">4</Badge>
                    <div>
                      <strong>Output Layer:</strong> Keyingi so'zni bashorat qiladi
                      <p className="text-sm text-gray-600">Barcha mumkin bo'lgan tokenlar ehtimoli</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ExpandableCard
              term="ATTENTION MEXANIZMI"
              definition="Modelga matnning qaysi qismlariga e'tibor berish kerakligini o'rgatadigan texnologiya"
              icon={<AiIcon name="focus" size={24} />}
              examples={[
                "'U mushukni ko'rdi' - 'U' so'zi 'mushuk'ka emas, balki biror shaxsga ishora qiladi",
                "Model har bir so'zning boshqa so'zlar bilan bog'lanishini o'rganadi",
                "Self-attention: matn o'z-o'ziga e'tibor beradi"
              ]}
            />

            <CodeExample
              title="LLM ISHLASH JARAYONI"
              badExample={`User: "Uzbekiston poytaxti qayer?"
AI: "Men bu haqda ma'lumotga ega emasman"`}
              goodExample={`User: "Uzbekiston poytaxti qayer?"

AI jarayoni:
1. Tokenizatsiya: ["Uzbek", "iston", " poyt", "axti", " qay", "er", "?"]
2. Kontekstni tushunish: Geografik savol, davlat haqida
3. Bilimlardan qidirish: Uzbekiston → Markaziy Osiyo → Poytaxt
4. Javob generatsiya: "Uzbekiston poytaxti - Toshkent"

AI: "Uzbekiston poytaxti Toshkent shahridir."`}
              explanation="LLM har bir so'zni kontekstda tushunib, mantiqiy javob yaratadi."
            />
          </div>
        )
      }
    }
  ]
};

export const transformerModellari: SectionContent = {
  title: "TRANSFORMER MODELLARI",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Transformer - 2017-yilda Google tomonidan yaratilgan inqilobiy arxitektura. 
                Bugungi barcha zamonaviy LLMlarning asosi.
              </p>
            </div>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">"ATTENTION IS ALL YOU NEED"</h3>
                <p className="mb-4">Transformerning asosiy g'oyasi:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
                    <span>Parallel hisoblash - tezkor ishlash</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
                    <span>Uzoq masofali bog'lanishlarni tushunish</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
                    <span>Kontekstni chuqur tahlil qilish</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-black">
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2">ENCODER MODELLARI</h4>
                  <p className="text-sm mb-2">Matnni tushunish uchun</p>
                  <ul className="text-sm space-y-1">
                    <li>• BERT (Google)</li>
                    <li>• RoBERTa (Facebook)</li>
                    <li>• ELECTRA</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-black">
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2">DECODER MODELLARI</h4>
                  <p className="text-sm mb-2">Matn generatsiya uchun</p>
                  <ul className="text-sm space-y-1">
                    <li>• GPT seriyasi</li>
                    <li>• Claude</li>
                    <li>• LLaMA</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <ExpandableCard
              term="MULTI-HEAD ATTENTION"
              definition="Bir vaqtda bir necha jihatdan matnni tahlil qilish qobiliyati"
              icon={<AiIcon name="multi-select" size={24} />}
              examples={[
                "1-head: Grammatika strukturasiga e'tibor",
                "2-head: Semantic ma'noga e'tibor", 
                "3-head: Kontekstual bog'lanishlarga e'tibor",
                "...va hokazo (odatda 12-32 head)"
              ]}
            />

            <Alert className="border-2 border-black">
              <AiIcon name="info" size={20} />
              <AlertDescription>
                <strong>Fun fact:</strong> GPT-3 175 milliard parametrga ega va uni train qilish 
                $4.6 million dollar turgan! Transformer arxitekturasi bu katta modellarni 
                samarali train qilish imkonini beradi.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const tokenizatsiya: SectionContent = {
  title: "TOKENIZATSIYA",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Tokenizatsiya - matnni AI tushunadigan raqamlarga aylantirish jarayoni. 
                Bu AI'ning birinchi va eng muhim qadami.
              </p>
            </div>

            <ExpandableCard
              term="TOKEN NIMA?"
              definition="Matnning eng kichik ma'noli bo'lagi. Bu to'liq so'z, so'z qismi yoki hatto bitta belgi bo'lishi mumkin."
              icon={<AiIcon name="text" size={24} />}
              examples={[
                "Salom → ['Salom'] (1 token)",
                "Assalomu alaykum → ['Ass', 'alomu', ' alay', 'kum'] (4 token)",
                "👋 → ['👋'] (1 token - emoji ham token!)"
              ]}
            />

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">TOKENIZATSIYA TURLARI:</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold">1. Word-level Tokenization</h4>
                    <p className="text-sm">Har bir so'z = 1 token</p>
                    <code className="block mt-1 p-2 bg-gray-100 text-sm">
                      "Men dasturlashni yaxshi ko'raman" → ["Men", "dasturlashni", "yaxshi", "ko'raman"]
                    </code>
                  </div>
                  <div>
                    <h4 className="font-bold">2. Subword Tokenization (BPE)</h4>
                    <p className="text-sm">So'zlarni qismlarga bo'lish</p>
                    <code className="block mt-1 p-2 bg-gray-100 text-sm">
                      "dasturlash" → ["dastur", "lash"]
                    </code>
                  </div>
                  <div>
                    <h4 className="font-bold">3. Character-level</h4>
                    <p className="text-sm">Har bir harf = 1 token</p>
                    <code className="block mt-1 p-2 bg-gray-100 text-sm">
                      "AI" → ["A", "I"]
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CodeExample
              title="TOKENIZATSIYA AMALIYOTI"
              badExample={`# Token limitni hisobga olmaslik
prompt = """
Menga 10000 so'zlik esse yoz, batafsil ma'lumot ber,
hamma narsani tushuntir, ko'p misollar keltir...
[juda uzun prompt davom etadi...]
"""
# ❌ Token limiti oshib ketishi mumkin!`}
              goodExample={`# Token samaradorligi
prompt = """
Qisqa esse yoz (500 so'z):
- Mavzu: Sun'iy intellekt
- Uslub: Akademik
- Struktura: Kirish, asosiy qism, xulosa
"""
# ✓ Aniq va ixcham - kamroq token, yaxshi natija`}
              explanation="Har bir model token limiti bor. GPT-4: 128k, Claude: 100k. Samarali tokenizatsiya pulni tejaydi!"
            />

            <Alert className="border-2 border-black">
              <AiIcon name="lightbulb" size={20} />
              <AlertDescription>
                <strong>Pro tip:</strong> O'zbek tilida 1 so'z ≈ 2-3 token. 
                Ingliz tilida 1 so'z ≈ 1-1.5 token. Tokenlarni tejash uchun 
                qisqa va aniq yozing!
              </AlertDescription>
            </Alert>

            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">TOKEN KALKULYATOR:</h3>
                <div className="space-y-2">
                  <p><strong>100 token ≈</strong> 75 so'z (inglizcha)</p>
                  <p><strong>100 token ≈</strong> 35-50 so'z (o'zbekcha)</p>
                  <p><strong>1 sahifa matn ≈</strong> 500-700 token</p>
                  <p><strong>Narxi:</strong> GPT-4 uchun 1000 token ≈ $0.03</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
    }
  ]
};
