import React from"react";
import { Card, CardContent } from"@/components/ui/card";
import { Alert, AlertDescription } from"@/components/ui/alert";
import { Badge } from"@/components/ui/badge";
import { AiIcon } from"@/components/ai-icon";
import { ExpandableCard } from"../components/ExpandableCard";
import { CodeExample } from"../components/CodeExample";
import type { SectionContent } from"../components/types";

export const zeroShot: SectionContent = {
 title:"ZERO SHOT",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div>
     <div>
      <p className="text-lg ">
       Zero-shot prompting — AI'ga hech qanday misol bermasdan to'g'ridan-to'g'ri 
       vazifani bajarish ko'rsatmasi. Eng oddiy, lekin kuchli texnika.
      </p>
     </div>

     <Card className="border-2 border-black">
      <CardContent className="p-6">
       <h3 className="text-xl font-bold ">ZERO-SHOT QACHON ISHLAYDI?</h3>
       <ul>
        <li className="flex items-start gap-2">
         <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
         <span>Oddiy va aniq vazifalar uchun</span>
        </li>
        <li className="flex items-start gap-2">
         <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
         <span>AI allaqachon bilishi mumkin bo'lgan ma'lumotlar</span>
        </li>
        <li className="flex items-start gap-2">
         <AiIcon name="checked" size={20} className="mt-1 flex-shrink-0" />
         <span>Umumiy til vazifalar (tarjima, tushuntirish)</span>
        </li>
       </ul>
      </CardContent>
     </Card>

     <CodeExample
      title="ZERO-SHOT MISOLLARI"
      badExample="Quyidagi gapni tahlil qil: 'Bugun havo yaxshi'"
      goodExample="Quyidagi gapni grammatik jihatdan tahlil qiling: 'Bugun havo yaxshi'

Gap tarkibi:
- Gap turi (darak/so'roq/undov)
- Ega va kesim
- Ikkinchi darajali bo'laklar
- So'z turkumlari"
      explanation="Aniq ko'rsatmalar berish zero-shot texnikani samaraliroq qiladi."
     />

     <div className="grid md:grid-cols-2 gap-4">
      <Card className="border-2 border-green-600">
       <CardContent className="p-4">
        <h4 className="font-bold text-green-700 ">✅ AFZALLIKLARI</h4>
        <ul className="text-sm">
         <li>• Tez va oson</li>
         <li>• Misollar tayyorlash shart emas</li>
         <li>• Kam token sarflaydi</li>
        </ul>
       </CardContent>
      </Card>

      <Card className="border-2 border-red-600">
       <CardContent className="p-4">
        <h4 className="font-bold text-red-700 ">❌ KAMCHILIKLARI</h4>
        <ul className="text-sm">
         <li>• Murakkab vazifalar uchun yaramaydi</li>
         <li>• Format nazorati qiyin</li>
         <li>• Natija sifati o'zgaruvchan</li>
        </ul>
       </CardContent>
      </Card>
     </div>
    </div>
     </>
    )
   }
  }
 ]
};

export const fewShot: SectionContent = {
 title:"FEW SHOT",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div>
     <div>
      <p className="text-lg ">
       Few-shot prompting — AI'ga bir nechta misol ko'rsatib, keyin vazifani 
       bajarishni so'rash. Bu AI'ga formatni va kutilgan natijani tushunishga yordam beradi.
      </p>
     </div>

     <Card className="border-2 border-black">
      <CardContent className="p-6">
       <h3 className="text-xl font-bold ">NECHTA MISOL KERAK?</h3>
       <div className="grid md:grid-cols-3 gap-4">
        <div className="text-center">
         <div className="text-3xl font-bold">1-2</div>
         <div className="text-sm text-muted-foreground">Oddiy formatlar</div>
        </div>
        <div className="text-center">
         <div className="text-3xl font-bold">3-5</div>
         <div className="text-sm text-muted-foreground">O'rtacha murakkablik</div>
        </div>
        <div className="text-center">
         <div className="text-3xl font-bold">5-10</div>
         <div className="text-sm text-muted-foreground">Murakkab pattern'lar</div>
        </div>
       </div>
      </CardContent>
     </Card>

     <CodeExample
      title="FEW-SHOT PROMPTING NAMUNASI"
      badExample="Bu gaplarni ijobiy yoki salbiy deb tasniflang:
'Mahsulot zo'r!'
'Xizmat yomon'"
      goodExample="Gaplarni his-tuyg'u bo'yicha tasniflang:

Gap: Bu kitob juda qiziqarli!
Tasnif: IJOBIY

Gap: Xizmat ko'rsatish darajasi past
Tasnif: SALBIY

Gap: Oddiy mahsulot, na yaxshi na yomon
Tasnif: NEYTRAL

Gap: Bugungi uchrashuvdan xursandman
Tasnif:"
      explanation="Misollar orqali AI format va tasnif mezonlarini aniq tushunadi."
     />

     <Alert className="border-2 border-black">
      <AiIcon name="lightbulb" size={20} />
      <AlertDescription>
       <strong>Pro maslahat:</strong> Misollaringiz turli xil va vakillik qiluvchi 
       bo'lsin. Faqat bir xil turdagi misollar bermang.
      </AlertDescription>
     </Alert>
    </div>
     </>
    )
   }
  }
 ]
};

export const chainOfThought: SectionContent = {
 title:"CHAIN OF THOUGHT",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div>
     <div>
      <p className="text-lg ">
       Chain-of-Thought (CoT) — AI'ni qadam-ba-qadam fikrlashga undash texnikasi. 
       Murakkab masalalar va mantiqiy xulosalar uchun juda samarali.
      </p>
     </div>

     <Card className="border-2 border-black bg-black text-white">
      <CardContent className="p-6">
       <h3 className="text-xl font-bold ">SEHRLI IBORA:</h3>
       <p className="text-2xl font-mono ">"Keling, qadam-ba-qadam fikrlaymiz"</p>
       <p className="text-sm mt-2 ">Let's think step by step</p>
      </CardContent>
     </Card>

     <CodeExample
      title="COT TAQQOSLASH"
      badExample="Agar Aziz 23 yoshda va u akasidan 5 yosh kichik bo'lsa, ularning yoshlari yig'indisi nechchi?

Javob: 51"
      goodExample="Agar Aziz 23 yoshda va u akasidan 5 yosh kichik bo'lsa, ularning yoshlari yig'indisi nechchi?

Keling, qadam-ba-qadam fikrlaymiz:
1. Aziz 23 yoshda
2. U akasidan 5 yosh kichik
3. Demak, akasi: 23 + 5 = 28 yoshda
4. Yoshlari yig'indisi: 23 + 28 = 51

Javob: 51 yosh"
      explanation="CoT texnikasi AI'ni o'z fikrlash jarayonini ko'rsatishga majbur qiladi, bu xatolar ehtimolini kamaytiradi."
     />

     <div className="grid gap-4">
      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h4 className="font-bold ">COT QACHON FOYDALANISH:</h4>
        <ul className="text-sm">
         <li>• Matematik masalalar</li>
         <li>• Mantiqiy topshiriqlar</li>
         <li>• Ko'p bosqichli vazifalar</li>
         <li>• Murakkab tahlillar</li>
        </ul>
       </CardContent>
      </Card>

      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h4 className="font-bold ">COT VARIANTLARI:</h4>
        <ul className="text-sm">
         <li>• <strong>Zero-shot CoT:</strong>"Qadam-ba-qadam tushuntir"</li>
         <li>• <strong>Few-shot CoT:</strong> Misollar bilan</li>
         <li>• <strong>Self-consistency:</strong> Bir necha yechim, eng ko'p takrorlangan javob</li>
        </ul>
       </CardContent>
      </Card>
     </div>
    </div>
     </>
    )
   }
  }
 ]
};

export const rolePlaying: SectionContent = {
 title:"ROLE PLAYING",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div>
     <div>
      <p className="text-lg ">
       Role-playing — AI'ga ma'lum bir mutaxassis yoki shaxs rolini berish. 
       Bu javob sifati va uslubini sezilarli yaxshilaydi.
      </p>
     </div>

     <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h3 className="text-lg font-bold ">PROFESSIONAL ROLLAR</h3>
        <ul className="text-sm">
         <li>• Tajribali dasturchi</li>
         <li>• Marketing mutaxassisi</li>
         <li>• Moliya maslahatchisi</li>
         <li>• Tibbiyot mutaxassisi</li>
         <li>• Huquqshunos</li>
        </ul>
       </CardContent>
      </Card>

      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h3 className="text-lg font-bold ">KREATIV ROLLAR</h3>
        <ul className="text-sm">
         <li>• Stend-up komediyachi</li>
         <li>• Motivatsion spiker</li>
         <li>• Tarixchi</li>
         <li>• Bolalar yozuvchisi</li>
         <li>• Ilmiy fantast muallifi</li>
        </ul>
       </CardContent>
      </Card>
     </div>

     <CodeExample
      title="ROLE-PLAYING MISOLI"
      badExample="Menga JavaScript'da array methods haqida tushuntir"
      goodExample="Sen 10 yillik tajribaga ega Senior JavaScript dasturchisan. Junior dasturchilarga murakkab tushunchalarni sodda tilda tushuntirish bo'yicha maxsus tajribaga egasan.

Menga JavaScript'dagi array methodlari haqida tushuntir. Har bir method uchun:
1. Nima ish qilishini
2. Qachon ishlatilishini
3. Real proyektdan misol keltirishingni xohlayman."
      explanation="Aniq rol va kontekst berish AI'ni mutaxassis kabi javob berishga undaydi."
     />

     <Alert className="border-2 border-black">
      <AiIcon name="info" size={20} />
      <AlertDescription>
       <strong>Maslahat:</strong> Rolni batafsil tavsiflang - tajriba, mutaxassislik 
       sohasi, uslub. Qanchalik aniq bo'lsa, shunchalik yaxshi natija.
      </AlertDescription>
     </Alert>
    </div>
   <div>
    <Alert className="border-2 border-black">
     <AiIcon name="warning" size={20} />
     <AlertDescription>
      Bu bo'lim hozircha ishlab chiqilmoqda. Tez orada to'liq kontent qo'shiladi.
     </AlertDescription>
    </Alert>
    <p className="text-lg mt-4 ">
     Hozircha boshqa bo'limlarni ko'rib chiqishingiz mumkin. Har bir bo'lim AI va prompting 
     bo'yicha foydali ma'lumotlar bilan to'ldiriladi.
    </p>
   </div>
     </>
    )
   }
  }
 ]
};

export const structuredOutput: SectionContent = {
 title:"STRUCTURED OUTPUT",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-lg ">
        Structured output - AI javoblarini aniq format (JSON, XML, CSV) da olish texnikasi. 
        Bu dasturlar bilan integratsiya uchun juda muhim.
       </p>
      </div>

      <ExpandableCard
       term="NIMA UCHUN KERAK?"
       definition="AI javoblarini to'g'ridan-to'g'ri dasturda ishlatish uchun strukturalangan formatda olish"
       icon={<AiIcon name="structure" size={24} />}
       examples={["JSON API javoblari","Ma'lumotlar bazasi uchun CSV","Konfiguratsiya fayllari","Strukturalangan hisobotlar"
       ]}
      />

      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold ">ASOSIY USULLAR:</h3>
        <div>
         <div className="border-2 border-black p-4">
          <h4 className="font-bold ">1. Format Ko'rsatish</h4>
          <p className="text-sm ">Promptda aniq format talab qilish</p>
          <code className="block mt-2 p-2 bg-gray-100 text-xs">"Javobni JSON formatida ber: {'{'}name, age, city{'}'}"
          </code>
         </div>
         <div className="border-2 border-black p-4">
          <h4 className="font-bold ">2. Schema Berish</h4>
          <p className="text-sm ">To'liq struktura sxemasini ko'rsatish</p>
          <code className="block mt-2 p-2 bg-gray-100 text-xs">"Quyidagi JSON sxemaga mos javob ber: ..."
          </code>
         </div>
         <div className="border-2 border-black p-4">
          <h4 className="font-bold ">3. Function Calling</h4>
          <p className="text-sm ">OpenAI/Claude API maxsus funksiyalari</p>
          <code className="block mt-2 p-2 bg-gray-100 text-xs">
           functions=[{'{'}"name":"get_weather", ...{'}'}]
          </code>
         </div>
        </div>
       </CardContent>
      </Card>

      <CodeExample
       title="JSON OUTPUT MISOLI"
       badExample={`prompt ="Kitob haqida ma'lumot ber"

# Natija (strukturasiz):"'1984' - George Orwell tomonidan yozilgan distopik roman. 
1949-yilda nashr etilgan. Totalitar jamiyat haqida..."`}
       goodExample={`prompt ="""
Kitob haqida ma'lumot ber. Javobni quyidagi JSON formatida:
{"title":"kitob nomi","author":"muallif","year": nashr_yili,"genre":"janr","summary":"qisqacha mazmun"
}"""

# Natija:
{"title":"1984","author":"George Orwell","year": 1949,"genre":"Dystopian fiction","summary":"Totalitar jamiyatda yashovchi Winston Smith..."
}`}
       explanation="Aniq format ko'rsatish orqali parse qilish oson bo'lgan javoblar olinadi."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <Card className="border-2 border-black">
        <CardContent className="p-4">
         <h4 className="font-bold ">✓ YAXSHI AMALIYOTLAR</h4>
         <ul className="text-sm">
          <li>• Aniq misol ko'rsating</li>
          <li>• Validatsiya qoidalarini ayting</li>
          <li>• Type'larni aniq belgilang</li>
          <li>• Default qiymatlar bering</li>
         </ul>
        </CardContent>
       </Card>
       
       <Card className="border-2 border-black">
        <CardContent className="p-4">
         <h4 className="font-bold ">✗ XATOLAR</h4>
         <ul className="text-sm">
          <li>• Murakkab nested strukturalar</li>
          <li>• Aniq bo'lmagan format</li>
          <li>• Validatsiyasiz ma'lumotlar</li>
          <li>• Type aralash formatlar</li>
         </ul>
        </CardContent>
       </Card>
      </div>

      <Alert className="border-2 border-black">
       <AiIcon name="lightbulb" size={20} />
       <AlertDescription>
        <strong>Pro tip:</strong> GPT-4 va Claude-3 JSON mode'ga ega - bu rejimda 
        faqat valid JSON javob qaytaradi. API'da `response_format={'{'}type:"json_object"{'}'}` 
        parametrini ishlating.
       </AlertDescription>
      </Alert>

      <Card className="border-2 border-black bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-lg font-bold ">MURAKKAB MISOL:</h3>
        <pre className="text-xs overflow-x-auto">
{`prompt ="""
Quyidagi SQL so'rovni tahlil qil va JSON formatda javob ber:

SELECT * FROM users WHERE age > 18

Format:
{"query_type":"SELECT|INSERT|UPDATE|DELETE","tables": ["jadval nomlari"],"conditions": [
  {"column":"ustun nomi","operator":"operator","value":"qiymat"
  }
 ],"complexity":"simple|medium|complex"
}"""

# AI javobi:
{"query_type":"SELECT","tables": ["users"],"conditions": [
  {"column":"age","operator":"">","value":"18"
  }
 ],"complexity":"simple"
}`}
        </pre>
       </CardContent>
      </Card>
     </div>
    )
   }
  }
 ]
};