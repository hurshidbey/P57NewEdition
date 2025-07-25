import React from"react";
import { Card, CardContent } from"@/components/ui/card";
import { Alert, AlertDescription } from"@/components/ui/alert";
import { Badge } from"@/components/ui/badge";
import { AiIcon } from"@/components/ai-icon";
import { ExpandableCard } from"../components/ExpandableCard";
import { CodeExample } from"../components/CodeExample";
import type { SectionContent } from"../components/types";

export const nimaUchunMuhim: SectionContent = {
 title:"NIMA UCHUN MUHIM",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div>
     <div>
      <p className="text-base ">
       Tasavvur qiling, sizda juda aqlli do'st bor. U har qanday savolingizga javob bera oladi, 
       vazifalaringizda yordam beradi, hatto she'r ham yozib beradi. Ana shunday do'stlar endi 
       haqiqatga aylandi - ular ChatGPT, Claude va Gemini kabi sun'iy aql yordamchilari.
      </p>
      <p className="text-base ">
       Lekin bir muammo bor: ko'pchiligimiz bu ajoyib do'st bilan qanday gaplashishni bilmaymiz. 
       Xuddi chet ellik do'stingiz bilan til topa olmagandek, biz ham AI bilan "til" topa olmayapmiz.
      </p>
     </div>
     
     <ExpandableCard
      term="PROMPTING"
      definition="Kompyuter do'stingiz bilan to'g'ri gaplashish usuli. Xuddi yaxshi oshpazga retsept aytgandek - aniq aytib bersangiz, ajoyib ovqat pishiradi!"
      icon={<AiIcon name="brain" size={24} />}
      examples={["Yomon: 'Menga maqola yoz'","Yaxshi: 'O'zbek tili tarixiga oid 500 so'zlik ilmiy maqola yoz. Uslub: akademik, auditoriya: universitet talabalari'"
      ]}
     />
     
     <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardContent className="p-6">
       <h3 className="text-xl font-black uppercase ">NIMA UCHUN BU MUHIM?</h3>
       <ul>
        <li className="flex items-start gap-2">
         <AiIcon name="checked" size={24} className="flex-shrink-0" />
         <span>Vaqtingiz qoladi - 10 soat o'tirib qiladigan ishingizni 1 soatda tugatib, oila bilan dam olasiz</span>
        </li>
        <li className="flex items-start gap-2">
         <AiIcon name="checked" size={24} className="flex-shrink-0" />
         <span>Ishingiz chiroyli bo'ladi - Xuddi ustoz yonida ishlagandek professional natija olasiz</span>
        </li>
        <li className="flex items-start gap-2">
         <AiIcon name="checked" size={24} className="flex-shrink-0" />
         <span>Fikrlash kengayadi - Hech xayolingizga kelmagan g'oyalar topasiz</span>
        </li>
       </ul>
      </CardContent>
     </Card>
     
     <CodeExample
      title="YAXSHI PROMPT MISOLI"
      badExample="Biznes-plan kerak"
      goodExample="Do'stim, men online dars berish sayti ochmoqchiman. 

Kimlar uchun: 18-25 yoshli o'quvchilar
Nima o'rgataman: Kasbiy ko'nikmalar (dizayn, dasturlash)
Pul olish usuli: Har oy obuna to'lovi

Menga shular haqida yozib ber:
1. Bozorda kimlar bor va qanday ishlayapti?
2. Raqobatchilarim kimlar?
3. Qanday reklama qilsam bo'ladi?
4. 1 yilda qancha pul aylanadi?
5. Qanday xavflar bor va ulardan qanday saqlanaman?"
      explanation="Yaxshi so'rov xuddi do'stingizga tushuntirganday bo'lishi kerak. Hamma ma'lumotni aytib bersangiz, AI ham sizni yaxshi tushunadi."
     />
    </div>
     </>
    )
   }
  }
 ]
};

export const promptingNima: SectionContent = {
 title:"PROMPTING NIMA",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div>
     <div>
      <p className="text-base ">
       Prompting — bu kompyuter bilan to'g'ri gaplashish usuli. Xuddi bolangizga biror narsani 
       tushuntirgandek, aniq va tushunarli gapirsangiz, ajoyib natijalar olasiz.
      </p>
     </div>

     <ExpandableCard
      term="PROMPT"
      definition="Kompyuterga aytadigan gapingiz. Qanchalik aniq aytsangiz, shunchalik yaxshi tushunadi - xuddi do'stingizga yo'l ko'rsatgandek."
      icon={<AiIcon name="target" size={24} />}
      examples={["Oddiy prompt: 'Menga Python haqida aytib ber'","Yaxshi prompt: 'Python dasturlash tilining 5 ta asosiy afzalligini sanab ber. Har biri uchun qisqa misol keltir.'"
      ]}
     />

     <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardContent className="p-6">
       <h3 className="text-xl font-black uppercase ">YAXSHI PROMPT ELEMENTLARI:</h3>
       <div>
        <div className="flex items-start gap-3">
         <AiIcon name="target" size={24} className="flex-shrink-0" />
         <div>
          <strong>Aniq maqsad:</strong> Nimani xohlayotganingizni aniq ayting
         </div>
        </div>
        <div className="flex items-start gap-3">
         <AiIcon name="context" size={24} className="flex-shrink-0" />
         <div>
          <strong>Kontekst:</strong> Vaziyat haqida ma'lumot bering
         </div>
        </div>
        <div className="flex items-start gap-3">
         <AiIcon name="format" size={24} className="flex-shrink-0" />
         <div>
          <strong>Format:</strong> Qanday ko'rinishda javob kutayotganingizni ayting
         </div>
        </div>
        <div className="flex items-start gap-3">
         <AiIcon name="layers" size={24} className="flex-shrink-0" />
         <div>
          <strong>Misollar:</strong> Agar kerak bo'lsa, namuna ko'rsating
         </div>
        </div>
       </div>
      </CardContent>
     </Card>

     <CodeExample
      title="PROMPT TAQQOSLASH"
      badExample="Menga marketing haqida yoz"
      goodExample="Men yangi mobil ilova uchun marketing strategiya tuzmoqchiman.

Ilova haqida:
- Nom: FitTracker
- Maqsad: Sog'lom turmush tarzi uchun kunlik rejalar
- Target auditoriya: 25-40 yoshli professional ayollar
- Narx: Oyiga $9.99

Iltimos, quyidagi marketing strategiya tayyorla:
1. 3 ta asosiy marketing kanal
2. Har bir kanal uchun konkret taktikalar
3. Birinchi oy uchun content kalendar
4. Taxminiy byudjet taqsimoti

Format: Bullet point ro'yxat shaklida"
      explanation="Yaxshi promptda barcha kerakli ma'lumotlar, aniq ko'rsatmalar va kutilgan format ko'rsatilgan."
     />

     <Alert className="border-2 border-black bg-white">
      <AiIcon name="lightbulb" size={24} />
      <AlertDescription className="text-black font-bold">
       <strong>Maslahat:</strong> Savol yozishda o'zingizga so'rang: "Agar men bu ishni 
       do'stimdan so'rasam, unga nima aytgan bo'lardim?" Ana shuni yozing!
      </AlertDescription>
     </Alert>
    </div>
     </>
    )
   }
  }
 ]
};

export const promptElementlari: SectionContent = {
 title:"PROMPT ELEMENTLARI",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div>
     <div>
      <p className="text-base ">
       Professional prompt 5 ta asosiy elementdan tashkil topadi. Har bir element 
       o'z vazifasiga ega va natija sifatiga ta'sir qiladi.
      </p>
     </div>

     <div className="grid gap-4">
      <ExpandableCard
       term="1. ROL (ROLE)"
       definition="AI'ga qanday mutaxassis sifatida javob berishini ko'rsating."
       icon={<AiIcon name="brain" size={24} />}
       examples={["Sen tajribali marketing mutaxassisisan...","Professional dasturchi sifatida...","10 yillik tajribaga ega moliya maslahatchisi rolida..."
       ]}
      />

      <ExpandableCard
       term="2. KONTEKST (CONTEXT)"
       definition="Vaziyat haqida to'liq ma'lumot bering."
       icon={<AiIcon name="context" size={24} />}
       examples={["Bizning kompaniya B2B SaaS mahsulot ishlab chiqaradi...","Men universitetda o'qiyman va diplom ishi yozishim kerak...","Kichik biznes egasiman, 5 ta xodim bor..."
       ]}
      />

      <ExpandableCard
       term="3. VAZIFA (TASK)"
       definition="Aniq nima qilish kerakligini ayting."
       icon={<AiIcon name="target" size={24} />}
       examples={["3 oylik marketing kampaniya rejasini tuzing","Ushbu kodni optimize qiling va kommentlar qo'shing","SWOT tahlil o'tkazing va tavsiyalar bering"
       ]}
      />

      <ExpandableCard
       term="4. FORMAT"
       definition="Javob qanday ko'rinishda bo'lishini belgilang."
       icon={<AiIcon name="format" size={24} />}
       examples={["Markdown table shaklida","5 ta bullet point","Step-by-step qo'llanma"
       ]}
      />

      <ExpandableCard
       term="5. TON (TONE)"
       definition="Qanday uslubda yozilishini ko'rsating."
       icon={<AiIcon name="message" size={24} />}
       examples={["Professional va rasmiy","Do'stona va tushunarli","Qisqa va lo'nda"
       ]}
      />
     </div>

     <Card className="border-2 border-black bg-gray-50">
      <CardContent className="p-6">
       <h3 className="text-xl font-black uppercase ">TO'LIQ PROMPT NAMUNASI:</h3>
       <pre className="bg-white border-2 border-black p-4 overflow-x-auto text-sm">
{`ROL: Sen tajribali content marketing mutaxassisisan.

KONTEKST: Men yangi fitness blog ochyapman. Target auditoriya - 
25-40 yoshli ayollar. Asosiy mavzu - uyda mashq qilish.

VAZIFA: Birinchi oy uchun content plan tuzing.

FORMAT: 
- 4 haftalik jadval
- Har hafta uchun 3 ta post mavzusi
- Har bir post uchun asosiy kalit so'zlar

TON: Professional lekin do'stona`}</pre>
      </CardContent>
     </Card>
    </div>
     </>
    )
   }
  }
 ]
};

export const aiInqilobi: SectionContent = {
 title:"AI INQILOBI",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div>
     <div>
      <p className="text-base ">
       AI inqilobi global miqyosda sodir bo'lmoqda. O'zbekiston ham bu jarayondan 
       chetda qolmasligi, balki faol ishtirok etishi muhim.
      </p>
     </div>

     <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <CardContent className="p-6">
       <h3 className="text-xl font-black uppercase ">AI INQILOBINING 3 TO'LQINI:</h3>
       <div>
        <div className="border-l-2 border-black pl-4">
         <h4 className="font-black uppercase ">1-TO'LQIN: TOR AI (2010-2020)</h4>
         <p className="text-black/70 ">Bitta vazifaga ixtisoslashgan AI: rasm tanish, tarjima, tavsiyalar</p>
        </div>
        <div className="border-l-2 border-black pl-4">
         <h4 className="font-black uppercase ">2-TO'LQIN: GENERATIV AI (2020-2025)</h4>
         <p className="text-black/70 ">Yangi kontent yaratadigan AI: ChatGPT, DALL-E, Midjourney</p>
        </div>
        <div className="border-l-2 border-black/30 pl-4">
         <h4 className="font-black text-black/50 uppercase ">3-TO'LQIN: AGI (2025+)</h4>
         <p className="text-black/70 ">Inson darajasidagi umumiy sun'iy intellekt</p>
        </div>
       </div>
      </CardContent>
     </Card>

     <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
       <CardContent className="p-6">
        <h4 className="font-black flex items-center gap-2 uppercase ">
         <AiIcon name="world" size={24} />
         GLOBAL IMKONIYATLAR
        </h4>
        <ul className="text-sm">
         <li>• Remote ish imkoniyatlari</li>
         <li>• Global bozorga chiqish</li>
         <li>• Xalqaro hamkorlik</li>
         <li>• Bilim almashish</li>
        </ul>
       </CardContent>
      </Card>

      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
       <CardContent className="p-6">
        <h4 className="font-black flex items-center gap-2 uppercase ">
         <AiIcon name="flag" size={24} />
         O'ZBEKISTON UCHUN
        </h4>
        <ul className="text-sm">
         <li>• IT eksporti o'sishi</li>
         <li>• Ta'lim tizimi yangilanishi</li>
         <li>• Startap ekotizimi</li>
         <li>• Raqamli transformatsiya</li>
        </ul>
       </CardContent>
      </Card>
     </div>

     <Alert className="border-2 border-black bg-white">
      <AiIcon name="lightbulb" size={24} />
      <AlertDescription className="text-black font-bold">
       <strong>Muhim:</strong> AI inqilobida g'olib bo'lish uchun texnologiyani 
       tushunish yetarli emas — uni to'g'ri qo'llashni bilish kerak. Aynan shuning 
       uchun prompting ko'nikmalari muhim.
      </AlertDescription>
     </Alert>
    </div>
     </>
    )
   }
  }
 ]
};

export const umumiyMaslahatlar: SectionContent = {
 title:"UMUMIY MASLAHATLAR",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div>
     <div>
      <p className="text-base ">
       AI bilan ishlashda muvaffaqiyatli bo'lish uchun ushbu asosiy tamoyillarga 
       amal qiling.
      </p>
     </div>

     <Card className="border-2 border-black bg-black text-white">
      <CardContent className="p-6">
       <h3 className="text-xl font-black uppercase ">7 OLTIN QOIDA</h3>
       <div>
        {["Aniq va konkret bo'ling","Kontekst bering","Misollar keltiring","Iterativ yondashing","Faktlarni tekshiring","Etik chegaralarni saqlang","Doimiy o'rganing"
        ].map((rule, idx) => (
         <div key={idx} className="flex items-center gap-3">
          <span className="font-bold text-2xl">{idx + 1}</span>
          <span>{rule}</span>
         </div>
        ))}
       </div>
      </CardContent>
     </Card>

     <div className="grid gap-4">
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
       <CardContent className="p-6">
        <h4 className="font-black uppercase ">❌ QILMANG:</h4>
        <ul className="text-sm">
         <li>• Noaniq so'rovlar bermang</li>
         <li>• AI'ga ko'r-ko'rona ishonmang</li>
         <li>• Shaxsiy ma'lumotlarni bermang</li>
         <li>• Noqonuniy maqsadlarda foydalanmang</li>
        </ul>
       </CardContent>
      </Card>

      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
       <CardContent className="p-6">
        <h4 className="font-black uppercase ">✅ QILING:</h4>
        <ul className="text-sm">
         <li>• Aniq maqsad belgilang</li>
         <li>• Natijalarni tekshiring</li>
         <li>• Takrorlash orqali yaxshilang</li>
         <li>• Yangi texnikalarni sinang</li>
        </ul>
       </CardContent>
      </Card>
     </div>

     <CodeExample
      title="ITERATIV YONDASHUV MISOLI"
      badExample="Menga maqola yoz"
      goodExample="1-urinish: Menga texnologiya haqida maqola yoz
2-urinish: Sun'iy intellekt haqida 500 so'zlik maqola yoz
3-urinish: ChatGPT'ning ta'limdagi roli haqida 500 so'zlik maqola yoz. Auditoriya: o'qituvchilar
4-urinish: [Oldingi natijaga asoslanib] Iltimos, ko'proq amaliy misollar qo'sh"
      explanation="Har bir iteratsiyada promptingizni aniqlashtirib boring. Bu sizga kerakli natijaga tezroq erishishga yordam beradi."
     />
    </div>
     </>
    )
   }
  }
 ]
};
