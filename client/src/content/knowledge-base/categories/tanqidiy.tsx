import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AiIcon } from "@/components/ai-icon";
import { ExpandableCard } from "../components/ExpandableCard";
import { CodeExample } from "../components/CodeExample";
import type { SectionContent } from "../components/types";

export const baholash: SectionContent = {
  title: "NATIJALARNI BAHOLASH",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                AI natijalarini baholash - bu model javoblarining sifati, aniqligi va foydaliligini 
                o'lchash jarayoni. To'g'ri baholash orqali siz AI'dan maksimal foyda olishingiz mumkin.
              </p>
              <p className="text-lg leading-relaxed">
                Har bir AI javobi kritik fikrlash bilan tahlil qilinishi kerak. Chunki AI ba'zan 
                noto'g'ri ma'lumot berishi yoki "gallyutsinatsiya" qilishi mumkin.
              </p>
            </div>

            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <AiIcon name="checklist" size={24} />
                  BAHOLASH MEZONLARI
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="border-2 border-gray-600 bg-white p-4 rounded">
                      <h4 className="font-bold text-gray-800 mb-2">1. TO'G'RILIK</h4>
                      <p className="text-sm">Faktlar va ma'lumotlarning aniqligi</p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="secondary">Faktlarni tekshirish</Badge>
                        <Badge variant="secondary">Manbalar</Badge>
                      </div>
                    </div>

                    <div className="border-2 border-gray-600 bg-white p-4 rounded">
                      <h4 className="font-bold text-gray-800 mb-2">2. TO'LIQLIK</h4>
                      <p className="text-sm">Savol to'liq javoblanganligi</p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="secondary">Qamrov</Badge>
                        <Badge variant="secondary">Chuqurlik</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="border-2 border-gray-600 bg-white p-4 rounded">
                      <h4 className="font-bold text-gray-800 mb-2">3. RELEVANTLIK</h4>
                      <p className="text-sm">Javobning savolga mosligi</p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="secondary">Kontekst</Badge>
                        <Badge variant="secondary">Fokus</Badge>
                      </div>
                    </div>

                    <div className="border-2 border-gray-600 bg-white p-4 rounded">
                      <h4 className="font-bold text-gray-800 mb-2">4. FOYDALILIK</h4>
                      <p className="text-sm">Amaliy qiymat va qo'llanilishi</p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="secondary">Amaliyot</Badge>
                        <Badge variant="secondary">Natija</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ExpandableCard
              term="GALLYUTSINATSIYA"
              definition="AI tomonidan yaratilgan noto'g'ri yoki mavjud bo'lmagan ma'lumotlar"
              icon={<AiIcon name="warning" size={24} />}
              examples={[
                "Mavjud bo'lmagan manbalarni ko'rsatish",
                "Noto'g'ri statistik ma'lumotlar",
                "O'ylab topilgan voqealar yoki shaxslar",
                "Xato kod yoki formulalar"
              ]}
            />

            <CodeExample
              title="BAHOLASH JARAYONI"
              badExample={`# Tanqidiy baholashsiz qabul qilish
user: "Toshkentda nechta metro stantsiyasi bor?"
ai: "Toshkentda 43 ta metro stantsiyasi mavjud"
user: "Rahmat!" [Tekshirmaydi]`}
              goodExample={`# Tanqidiy baholash bilan
user: "Toshkentda nechta metro stantsiyasi bor?"
ai: "Toshkentda 43 ta metro stantsiyasi mavjud"
user: "Bu ma'lumot qaysi yilga tegishli? Manba bera olasizmi?"
ai: "Kechirasiz, aniq manba keltira olmayman. 
     2024-yil holatiga ko'ra rasmiy ma'lumotlarni
     Toshkent metropoliteni saytidan tekshiring."`}
              explanation="Har doim ma'lumotlarni tekshiring va manbalarni so'rang."
            />

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 border-black">
                <div className="bg-black p-3">
                  <h4 className="text-white font-bold text-center">XAVFLI</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li>- Ko'r-ko'rona ishonish</li>
                    <li>- Manbalarni tekshirmaslik</li>
                    <li>- Bir AI'ga tayanish</li>
                    <li>- Kritik qarorlar uchun</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-700">
                <div className="bg-gray-700 p-3">
                  <h4 className="text-white font-bold text-center">EHTIYOT</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li>- Yangi ma'lumotlar</li>
                    <li>- Murakkab hisoblashlar</li>
                    <li>- Huquqiy maslahatlar</li>
                    <li>- Tibbiy tavsiyalar</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-600">
                <div className="bg-gray-600 p-3">
                  <h4 className="text-white font-bold text-center">XAVFSIZ</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li>- Umumiy ma'lumotlar</li>
                    <li>- Ijodiy g'oyalar</li>
                    <li>- Kod namunalari</li>
                    <li>- Til o'rganish</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-2 border-gray-600 bg-gray-50">
              <AiIcon name="lightbulb" size={20} className="text-gray-700" />
              <AlertDescription className="text-gray-800">
                <strong>Pro tip:</strong> Muhim ma'lumotlar uchun doim bir necha manbadan 
                foydalaning va o'zaro tekshiring. AI - bu vosita, oxirgi qaror sizniki.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const taqqoslash: SectionContent = {
  title: "MODELLARNI TAQQOSLASH",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Turli AI modellarini taqqoslash - to'g'ri vositani tanlash uchun muhim ko'nikma. 
                Har bir model o'z kuchli va zaif tomonlariga ega.
              </p>
              <p className="text-lg leading-relaxed">
                Modellarni baholashda nafaqat texnik ko'rsatkichlar, balki amaliy foydalanish 
                senariylari ham hisobga olinishi kerak.
              </p>
            </div>

            <Card className="border-2 border-black overflow-hidden">
              <div className="bg-black p-4">
                <h3 className="text-white font-bold uppercase">ASOSIY MODELLAR TAQQOSLASH JADVALI</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-black bg-gray-100">
                      <th className="p-3 text-left font-bold">Model</th>
                      <th className="p-3 text-center font-bold">Tezlik</th>
                      <th className="p-3 text-center font-bold">Aniqlik</th>
                      <th className="p-3 text-center font-bold">Narx</th>
                      <th className="p-3 text-center font-bold">Kontekst</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="p-3 font-semibold">GPT-4o</td>
                      <td className="p-3 text-center">****</td>
                      <td className="p-3 text-center">*****</td>
                      <td className="p-3 text-center">$$$</td>
                      <td className="p-3 text-center">128K</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-3 font-semibold">Claude 3.5</td>
                      <td className="p-3 text-center">****</td>
                      <td className="p-3 text-center">*****</td>
                      <td className="p-3 text-center">$$$</td>
                      <td className="p-3 text-center">200K</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-3 font-semibold">Gemini Pro</td>
                      <td className="p-3 text-center">*****</td>
                      <td className="p-3 text-center">****</td>
                      <td className="p-3 text-center">$$</td>
                      <td className="p-3 text-center">1M+</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-3 font-semibold">Llama 3</td>
                      <td className="p-3 text-center">***</td>
                      <td className="p-3 text-center">****</td>
                      <td className="p-3 text-center">$</td>
                      <td className="p-3 text-center">8K</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <ExpandableCard
                term="BENCHMARK"
                definition="Modellarni standart testlar orqali baholash"
                icon={<AiIcon name="chart" size={24} />}
                examples={[
                  "MMLU - Ko'p sohali bilimlar testi",
                  "HumanEval - Kod yozish qobiliyati",
                  "HellaSwag - Mantiqiy fikrlash",
                  "TruthfulQA - Haqiqatga sodiqlik"
                ]}
              />

              <ExpandableCard
                term="USE CASE"
                definition="Har bir model uchun optimal foydalanish holatlari"
                icon={<AiIcon name="target" size={24} />}
                examples={[
                  "GPT-4: Murakkab tahlil va ijod",
                  "Claude: Uzun hujjatlar bilan ishlash",
                  "Gemini: Ko'p modallik (rasm+matn)",
                  "Llama: Mahalliy deployment"
                ]}
              />
            </div>

            <CodeExample
              title="MODEL TANLASH STRATEGIYASI"
              badExample={`# Har doim eng qimmat modelni tanlash
task = "Oddiy savol-javob"
model = "gpt-4-turbo"  # $20/1M token
# Ortiqcha xarajat!`}
              goodExample={`# Vazifaga mos model tanlash
def select_model(task_complexity, budget, speed_required):
    if task_complexity == "low" and speed_required:
        return "gpt-3.5-turbo"  # Tez va arzon
    elif task_complexity == "high" and budget == "high":
        return "gpt-4o"  # Eng yaxshi sifat
    elif need_long_context:
        return "claude-3-sonnet"  # 200K kontekst
    else:
        return "gemini-pro"  # Balansli variant`}
              explanation="Har bir vazifa uchun optimal model tanlanishi kerak - har doim eng kuchli model kerak emas."
            />

            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-black">
                  MODEL TANLASH CHECKLIST
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: "target", text: "Vazifa murakkabligi qanday?" },
                    { icon: "dollar", text: "Byudjet cheklovi bormi?" },
                    { icon: "clock", text: "Javob tezligi muhimmi?" },
                    { icon: "shield", text: "Ma'lumot maxfiyligi kerakmi?" },
                    { icon: "code", text: "Qanday formatda javob kerak?" },
                    { icon: "language", text: "Qaysi tillar qo'llab-quvvatlanadi?" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded">
                      <AiIcon name={item.icon as any} size={20} className="text-gray-700" />
                      <span className="font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Alert className="border-2 border-gray-600 bg-gray-50">
              <AiIcon name="info" size={20} className="text-gray-700" />
              <AlertDescription className="text-gray-800">
                <strong>Eslatma:</strong> Modellar tez rivojlanmoqda. Har 3-6 oyda 
                yangi versiyalar va imkoniyatlarni tekshirib turing.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const xatoAnaliz: SectionContent = {
  title: "XATOLARNI TAHLIL QILISH",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                AI xatolarini tahlil qilish - modellardan samarali foydalanish va natijalarni 
                yaxshilashning asosiy yo'li. Xatolarni tushunish orqali promptlarni optimallashtirishingiz mumkin.
              </p>
              <p className="text-lg leading-relaxed">
                Har bir xato - o'rganish imkoniyati. To'g'ri tahlil orqali siz AI bilan 
                ishlash ko'nikmangizni sezilarli darajada oshirishingiz mumkin.
              </p>
            </div>

            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 text-center">XATO TURLARI VA SABABLARI</h3>
                
                <div className="space-y-4">
                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold">1</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">KONTEKST XATOLARI</h4>
                        <p className="text-sm text-gray-700 mt-1">Noto'g'ri yoki yetarli bo'lmagan kontekst</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">Aniq bo'lmagan savol</Badge>
                          <Badge variant="outline">Kontekst yo'qligi</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold">2</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">MANTIQIY XATOLAR</h4>
                        <p className="text-sm text-gray-700 mt-1">Noto'g'ri xulosalar va qarama-qarshiliklar</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">Ziddiyatli javoblar</Badge>
                          <Badge variant="outline">Noto'g'ri hisoblash</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold">3</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">FORMAT XATOLARI</h4>
                        <p className="text-sm text-gray-700 mt-1">Kutilgan formatga mos kelmaydigan javoblar</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">Struktura buzilishi</Badge>
                          <Badge variant="outline">Til xatolari</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold">4</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">GALLYUTSINATSIYA</h4>
                        <p className="text-sm text-gray-700 mt-1">To'liq o'ylab topilgan ma'lumotlar</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">Mavjud bo'lmagan faktlar</Badge>
                          <Badge variant="outline">Noto'g'ri manbalar</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CodeExample
              title="XATONI TAHLIL QILISH"
              badExample={`# Xatoni e'tiborsiz qoldirish
user: "Python'da fayl o'qish"
ai: "file = open('data.txt', 'w')"  # Xato: 'w' emas, 'r' bo'lishi kerak
user: [Xatoni sezmaydi va davom etadi]`}
              goodExample={`# Xatoni tahlil qilish
user: "Python'da fayl o'qish"
ai: "file = open('data.txt', 'w')"
user: "Bu xato. 'w' yozish uchun, men o'qish kerak"
ai: "To'g'ri, kechirasiz. O'qish uchun:
     file = open('data.txt', 'r')
     # yoki kontekst manager bilan:
     with open('data.txt', 'r') as file:
         content = file.read()"`}
              explanation="Xatolarni ko'rsatish AI'ga o'rganish va to'g'rilash imkonini beradi."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-2 border-black">
                <div className="bg-black p-3">
                  <h4 className="text-white font-bold">XATOLARNI OLDINI OLISH</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
                      <span>Aniq va to'liq prompt yozish</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
                      <span>Misollar bilan ko'rsatish</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
                      <span>Format va cheklovlarni belgilash</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} className="mt-0.5 text-black" />
                      <span>Bosqichma-bosqich so'rash</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-black">
                <div className="bg-black p-3">
                  <h4 className="text-white font-bold">XATOLARDAN O'RGANISH</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <AiIcon name="brain" size={16} className="mt-0.5 text-black" />
                      <span>Xato sababini aniqlash</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="brain" size={16} className="mt-0.5 text-black" />
                      <span>Promptni qayta yozish</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="brain" size={16} className="mt-0.5 text-black" />
                      <span>Alternativ yondashuvlar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="brain" size={16} className="mt-0.5 text-black" />
                      <span>Natijalarni solishtirish</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-2 border-gray-600 bg-gray-50">
              <AiIcon name="lightbulb" size={20} className="text-gray-700" />
              <AlertDescription className="text-gray-800">
                <strong>Foydali maslahat:</strong> Xatolarni jurnal qilib boring. 
                Vaqt o'tishi bilan siz qaysi turdagi xatolar ko'p uchrayotganini va 
                ularni qanday hal qilishni bilib olasiz.
              </AlertDescription>
            </Alert>

            <Card className="border-2 border-black">
              <div className="bg-black p-4">
                <h3 className="text-white font-bold uppercase">XATO TAHLIL FRAMEWORK</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-bold">ANIQLASH</h4>
                      <p className="text-sm text-gray-600">Xato qayerda va qanday yuz berdi?</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-bold">TASNIFLASH</h4>
                      <p className="text-sm text-gray-600">Bu qaysi turdagi xato?</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-bold">TAHLIL QILISH</h4>
                      <p className="text-sm text-gray-600">Nima sabab bo'ldi?</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 text-white rounded-lg flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-bold">TO'G'RILASH</h4>
                      <p className="text-sm text-gray-600">Qanday hal qilish mumkin?</p>
                    </div>
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