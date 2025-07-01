import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AiIcon } from "@/components/ai-icon";
import { ExpandableCard } from "../components/ExpandableCard";
import { CodeExample } from "../components/CodeExample";
import type { SectionContent } from "../components/types";

export const haroratParametri: SectionContent = {
 title: "HARORAT PARAMETRI",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div className="space-y-6">
     <div>
      <p className="text-lg leading-relaxed">
       Temperature (harorat) — AI javoblarining kreativlik darajasini boshqaruvchi 
       eng muhim parametr. 0 dan 2 gacha qiymat oladi.
      </p>
     </div>

     <Card className="border-2 border-black">
      <CardContent className="p-6">
       <h3 className="text-xl font-bold">TEMPERATURE SHKALASI</h3>
       <div className="space-y-4">
        <div className="flex items-center gap-4">
         <div className="w-24 text-center">
          <div className="text-2xl font-bold">0.0</div>
          <div className="text-xs text-muted-foreground">Deterministik</div>
         </div>
         <div className="flex-1 bg-gradient-to-r from-blue-100 via-yellow-100 to-red-100 h-8 border-2 border-black"></div>
         <div className="w-24 text-center">
          <div className="text-2xl font-bold">2.0</div>
          <div className="text-xs text-muted-foreground">Xaotik</div>
         </div>
        </div>
       </div>
      </CardContent>
     </Card>

     <div className="grid md:grid-cols-3 gap-4">
      <Card className="border-2 border-black">
       <CardContent className="p-4">
        <h4 className="font-bold">PAST (0.0-0.5)</h4>
        <p className="text-sm text-muted-foreground">Aniq, bashorat qilsa bo'ladigan</p>
        <ul className="text-xs space-y-1">
         <li>• Faktlar va ma'lumotlar</li>
         <li>• Kod yozish</li>
         <li>• Hisob-kitoblar</li>
        </ul>
       </CardContent>
      </Card>

      <Card className="border-2 border-black">
       <CardContent className="p-4">
        <h4 className="font-bold">O'RTA (0.5-1.0)</h4>
        <p className="text-sm text-muted-foreground">Muvozanatli javoblar</p>
        <ul className="text-xs space-y-1">
         <li>• Umumiy foydalanish</li>
         <li>• Maqola yozish</li>
         <li>• Suhbat</li>
        </ul>
       </CardContent>
      </Card>

      <Card className="border-2 border-black">
       <CardContent className="p-4">
        <h4 className="font-bold">YUQORI (1.0-2.0)</h4>
        <p className="text-sm text-muted-foreground">Ijodkor, kutilmagan</p>
        <ul className="text-xs space-y-1">
         <li>• Brainstorming</li>
         <li>• She'riyat</li>
         <li>• Kreativ yozish</li>
        </ul>
       </CardContent>
      </Card>
     </div>

     <CodeExample
      title="TEMPERATURE MISOLLARI"
      badExample="Temperature = 2.0
Prompt: O'zbekiston poytaxti qaysi?
Javob: O'zbekiston poytaxti... balki Samarqand? Yoki Buxoro? Qadimda turli shaharlar..."
      goodExample="Temperature = 0.2
Prompt: O'zbekiston poytaxti qaysi?
Javob: O'zbekiston poytaxti - Toshkent shahri."
      explanation="Faktik ma'lumotlar uchun past temperature, ijodiy vazifalar uchun yuqori temperature ishlating."
     />
    </div>
     </>
    )
   }
  }
 ]
};

export const topPVaTopK: SectionContent = {
 title: "TOP P VA TOP K",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div className="space-y-6">
     <div>
      <p className="text-lg leading-relaxed">
       Top-P va Top-K parametrlari AI'ning so'z tanlash jarayonini boshqaradi. 
       Ular temperature bilan birgalikda ishlab, javob sifatini nazorat qiladi.
      </p>
     </div>

     <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h3 className="text-lg font-bold">TOP-P (Nucleus Sampling)</h3>
        <p className="text-sm text-muted-foreground">
         Ehtimollik yig'indisi P ga teng bo'lgan so'zlarni tanlaydi
        </p>
        <div className="space-y-3">
         <div className="bg-gray-100 p-3 border border-gray-300">
          <div className="font-mono text-sm">top_p = 0.1</div>
          <div className="text-xs">Faqat eng ehtimollik yuqori so'zlar</div>
         </div>
         <div className="bg-gray-100 p-3 border border-gray-300">
          <div className="font-mono text-sm">top_p = 0.9</div>
          <div className="text-xs">Ko'proq so'z variantlari</div>
         </div>
        </div>
       </CardContent>
      </Card>

      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h3 className="text-lg font-bold">TOP-K</h3>
        <p className="text-sm text-muted-foreground">
         Faqat eng yuqori K ta so'zdan tanlaydi
        </p>
        <div className="space-y-3">
         <div className="bg-gray-100 p-3 border border-gray-300">
          <div className="font-mono text-sm">top_k = 5</div>
          <div className="text-xs">Faqat 5 ta eng ehtimol so'z</div>
         </div>
         <div className="bg-gray-100 p-3 border border-gray-300">
          <div className="font-mono text-sm">top_k = 50</div>
          <div className="text-xs">50 ta so'z variantidan tanlash</div>
         </div>
        </div>
       </CardContent>
      </Card>
     </div>

     <Alert className="border-2 border-black">
      <AiIcon name="info" size={20} />
      <AlertDescription>
       <strong>Qachon ishlatish:</strong> Ko'pchilik holatlarda default qiymatlar 
       yetarli. Faqat maxsus ehtiyoj bo'lganda o'zgartiring.
      </AlertDescription>
     </Alert>
    </div>
     </>
    )
   }
  }
 ]
};

export const maxTokens: SectionContent = {
 title: "MAX TOKENS",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div className="space-y-6">
     <div>
      <p className="text-lg leading-relaxed">
       Max tokens parametri AI javobining maksimal uzunligini belgilaydi. 
       Bu nafaqat narxni, balki javob to'liqligini ham nazorat qiladi.
      </p>
     </div>

     <Card className="border-2 border-black">
      <CardContent className="p-6">
       <h3 className="text-xl font-bold">TOKEN HISOBI</h3>
       <div className="grid md:grid-cols-3 gap-4 text-center">
        <div>
         <div className="text-3xl font-bold">1 token</div>
         <div className="text-sm text-muted-foreground">≈ 0.75 so'z (inglizcha)</div>
        </div>
        <div>
         <div className="text-3xl font-bold">1 token</div>
         <div className="text-sm text-muted-foreground">≈ 0.5 so'z (o'zbekcha)</div>
        </div>
        <div>
         <div className="text-3xl font-bold">1000 token</div>
         <div className="text-sm text-muted-foreground">≈ 2 sahifa matn</div>
        </div>
       </div>
      </CardContent>
     </Card>

     <div className="grid gap-4">
      <Card className="border-2 border-black">
       <CardContent className="p-4">
        <h4 className="font-bold">QISQA JAVOBLAR (50-150 token)</h4>
        <ul className="text-sm space-y-1">
         <li>• Ha/yo'q savollari</li>
         <li>• Qisqa ta'riflar</li>
         <li>• Tezkor javoblar</li>
        </ul>
       </CardContent>
      </Card>

      <Card className="border-2 border-black">
       <CardContent className="p-4">
        <h4 className="font-bold">O'RTA JAVOBLAR (500-1000 token)</h4>
        <ul className="text-sm space-y-1">
         <li>• Email va xatlar</li>
         <li>• Qisqa maqolalar</li>
         <li>• Kod parchalari</li>
        </ul>
       </CardContent>
      </Card>

      <Card className="border-2 border-black">
       <CardContent className="p-4">
        <h4 className="font-bold">UZUN JAVOBLAR (2000+ token)</h4>
        <ul className="text-sm space-y-1">
         <li>• To'liq maqolalar</li>
         <li>• Batafsil tahlillar</li>
         <li>• Katta kod fayllari</li>
        </ul>
       </CardContent>
      </Card>
     </div>

     <Alert className="border-2 border-black bg-gray-50">
      <AiIcon name="dollar" size={20} />
      <AlertDescription>
       <strong>Narx optimallashtirish:</strong> Keragidan ortiq token sarflamang. 
       Agar 500 token yetarli bo'lsa, max_tokens=2000 qo'ymang.
      </AlertDescription>
     </Alert>
    </div>
     </>
    )
   }
  }
 ]
};

export const stopSequences: SectionContent = {
 title: "STOP SEQUENCES",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div className="space-y-6">
      <div>
       <p className="text-lg leading-relaxed">
        Stop sequences - AI javobini to'xtatish uchun maxsus belgilar yoki so'zlar. 
        Bu AI'ni nazorat qilishning kuchli usuli.
       </p>
      </div>

      <ExpandableCard
       term="STOP SEQUENCE NIMA?"
       definition="AI matn generatsiyasini to'xtatadigan belgi yoki so'z. AI bu ketma-ketlikni ko'rganda javobni tugatadi."
       icon={<AiIcon name="stop" size={24} />}
       examples={[
        "Stop: '\\n\\n' - Ikki marta enter",
        "Stop: 'END' - So'z oxiri belgisi",
        "Stop: '</output>' - XML tegi"
       ]}
      />

      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold">QACHON ISHLATILADI:</h3>
        <div className="space-y-4">
         <div className="border-l-4 border-black pl-4">
          <h4 className="font-bold">1. Strukturalangan javoblar</h4>
          <p className="text-sm text-gray-700">JSON, XML yoki boshqa formatlar uchun</p>
         </div>
         <div className="border-l-4 border-black pl-4">
          <h4 className="font-bold">2. Dialog tizimlar</h4>
          <p className="text-sm text-gray-700">Foydalanuvchi va AI o'rtasidagi chegaralar</p>
         </div>
         <div className="border-l-4 border-black pl-4">
          <h4 className="font-bold">3. Ko'p qismli javoblar</h4>
          <p className="text-sm text-gray-700">Har bir qismni alohida generatsiya qilish</p>
         </div>
        </div>
       </CardContent>
      </Card>

      <CodeExample
       title="STOP SEQUENCE MISOLI"
       badExample={`# Stop sequence ishlatmaslik
prompt = "3 ta marketing g'oya yoz"

# AI javob beradi va to'xtamasdan davom etadi:
"1. Social media kampaniya
2. Email marketing
3. Influencer hamkorlik
Bundan tashqari, siz quyidagilarni ham... [davom etaveradi]"`}
       goodExample={`# Stop sequence bilan
prompt = """
3 ta marketing g'oya yoz. Har bir g'oyadan keyin '---' belgisini qo'y.
"""
stop_sequences = ["---"]

# AI javob:
"1. Social media kampaniya: Instagram reels orqali mahsulot namoyishi
---"
# To'xtaydi!`}
       explanation="Stop sequences yordamida aniq va qisqa javoblar olish mumkin."
      />

      <Alert className="border-2 border-black">
       <AiIcon name="lightbulb" size={20} />
       <AlertDescription>
        <strong>Pro tip:</strong> Ko'p stop sequence ishlatish mumkin: 
        ['\\n\\n', 'END', '---']. AI ulardan birinchisini ko'rganda to'xtaydi.
       </AlertDescription>
      </Alert>

      <Card className="border-2 border-black bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-lg font-bold">AMALIY MISOLLAR:</h3>
        <pre className="text-sm overflow-x-auto">
{`# JSON uchun
stop_sequences = ['}']

# Dialog uchun 
stop_sequences = ['Human:', 'User:']

# Ro'yxat uchun
stop_sequences = ['\\n\\n', 'Tugadi']`}
        </pre>
       </CardContent>
      </Card>
     </div>
    )
   }
  }
 ]
};

export const presenceFrequency: SectionContent = {
 title: "PRESENCE FREQUENCY",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div className="space-y-6">
      <div>
       <p className="text-lg leading-relaxed">
        Presence va Frequency penalty - AI javoblarida takrorlanishni kamaytirish 
        va rang-baranglikni oshirish uchun parametrlar.
       </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <Card className="border-2 border-black">
        <CardContent className="p-6">
         <h3 className="text-lg font-bold">PRESENCE PENALTY</h3>
         <p className="text-sm">Yangi mavzularni qo'shishga undaydi</p>
         <div className="space-y-2">
          <div className="flex justify-between text-sm">
           <span>0.0</span>
           <span className="text-gray-600">Standart</span>
          </div>
          <div className="flex justify-between text-sm">
           <span>0.6</span>
           <span className="text-gray-600">Muvozanatli</span>
          </div>
          <div className="flex justify-between text-sm">
           <span>2.0</span>
           <span className="text-gray-600">Juda rang-barang</span>
          </div>
         </div>
        </CardContent>
       </Card>

       <Card className="border-2 border-black">
        <CardContent className="p-6">
         <h3 className="text-lg font-bold">FREQUENCY PENALTY</h3>
         <p className="text-sm">Takrorlanishni kamaytiradi</p>
         <div className="space-y-2">
          <div className="flex justify-between text-sm">
           <span>0.0</span>
           <span className="text-gray-600">Takrorga ruxsat</span>
          </div>
          <div className="flex justify-between text-sm">
           <span>0.5</span>
           <span className="text-gray-600">Kamroq takror</span>
          </div>
          <div className="flex justify-between text-sm">
           <span>2.0</span>
           <span className="text-gray-600">Takrorsiz</span>
          </div>
         </div>
        </CardContent>
       </Card>
      </div>

      <ExpandableCard
       term="QANDAY ISHLAYDI?"
       definition="Bu parametrlar allaqachon ishlatilgan so'zlarga 'jarima' beradi, natijada AI yangi so'zlarni tanlashga majbur bo'ladi."
       icon={<AiIcon name="penalty" size={24} />}
       examples={[
        "Presence: Bir marta ishlatilgan so'zga jarima",
        "Frequency: Qancha ko'p ishlatilsa, shuncha ko'p jarima",
        "Ikkalasini birgalikda ishlatish eng yaxshi natija beradi"
       ]}
      />

      <CodeExample
       title="PENALTY PARAMETRLARI"
       badExample={`# Parametrlarsiz (takrorlanish ko'p)
response = ai.complete(
  prompt="Marketing strategiya yoz",
  temperature=0.7
)

# Natija:
"Marketing strategiya muhim. Marketing strategiya yaratishda 
marketing strategiyani..." # Takror ko'p!`}
       goodExample={`# Penalty bilan
response = ai.complete(
  prompt="Marketing strategiya yoz",
  temperature=0.7,
  presence_penalty=0.6,
  frequency_penalty=0.6
)

# Natija:
"Zamonaviy bozorda muvaffaqiyat uchun innovatsion yondashuv 
kerak. Mijozlar ehtiyojini tahlil qilib..." # Rang-barang!`}
       explanation="Penalty parametrlari AI javoblarini tabiiy va qiziqarli qiladi."
      />

      <Alert className="border-2 border-black bg-yellow-50">
       <AiIcon name="warning" size={20} />
       <AlertDescription>
        <strong>Ehtiyot bo'ling:</strong> Juda yuqori penalty ({'>'} 1.5) mantiqsiz 
        javoblarga olib kelishi mumkin. Muvozanatni saqlang!
       </AlertDescription>
      </Alert>

      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h3 className="text-lg font-bold">QO'LLANISH SOHALARI:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
          <Badge className="mb-0">Ijodiy yozuv</Badge>
          <p className="text-sm">Presence: 0.6-1.0<br/>Frequency: 0.6-1.0</p>
         </div>
         <div>
          <Badge className="mb-0">Texnik hujjatlar</Badge>
          <p className="text-sm">Presence: 0.0-0.3<br/>Frequency: 0.3-0.5</p>
         </div>
         <div>
          <Badge className="mb-0">Dialog tizimlar</Badge>
          <p className="text-sm">Presence: 0.4-0.8<br/>Frequency: 0.4-0.8</p>
         </div>
         <div>
          <Badge className="mb-0">Kod generatsiya</Badge>
          <p className="text-sm">Presence: 0.0<br/>Frequency: 0.0-0.2</p>
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