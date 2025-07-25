import React from"react";
import { Card, CardContent } from"@/components/ui/card";
import { Alert, AlertDescription } from"@/components/ui/alert";
import { Badge } from"@/components/ui/badge";
import { AiIcon } from"@/components/ai-icon";
import { ExpandableCard } from"../components/ExpandableCard";
import { CodeExample } from"../components/CodeExample";
import type { SectionContent } from"../components/types";

export const aiQandayIshlaydi: SectionContent = {
 title:"AI QANDAY ISHLAYDI",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <>
<div>
     <div>
      <p className="text-lg ">
       Sun'iy aql - bu kompyuterni bolaga o'xshatib o'rgatish. Bolacha savol bersangiz, 
       u ham bolacha javob beradi. Ustozcha savol bersangiz, ustozcha javob beradi. Qanday "o'rgatish" degani?
      </p>
     </div>

     <Card className="border-2 border-black">
      <CardContent className="p-6">
       <h3 className="text-xl font-bold ">AI QANDAY"O'YLAYDI":</h3>
       <ol>
        <li className="flex gap-3">
         <span className="font-bold">1.</span>
         <div>
          <strong>Naqsh topish:</strong> Minglab rasmlarni ko'rib, mushuk qanday ko'rinishini o'rganadi
         </div>
        </li>
        <li className="flex gap-3">
         <span className="font-bold">2.</span>
         <div>
          <strong>Taxmin qilish:</strong> "Bugun havo..." desangiz, "issiq" yoki "sovuq" deb davom ettiradi
         </div>
        </li>
        <li className="flex gap-3">
         <span className="font-bold">3.</span>
         <div>
          <strong>Gapni tushunish:</strong> "Bank" deganda - daryo qirg'og'imi yoki pulxonami ekanini tushunadi
         </div>
        </li>
       </ol>
      </CardContent>
     </Card>
     
     <ExpandableCard
      term="NEYRON TARMOQLAR"
      definition="Kompyuter ichidagi sun'iy miya. Xuddi bizning miyamiz kabi o'rganadi - lekin elektr signallar bilan."
      icon={<AiIcon name="network" size={24} />}
      examples={["Input (kirish) → Processing (qayta ishlash) → Output (natija)","Misol: Rasm → Neyron tarmoq → 'Bu mushuk rasmi'"
      ]}
     />
     
     <ExpandableCard
      term="MACHINE LEARNING"
      definition="Kompyuter ham xuddi bola kabi o'rganadi - ko'p ko'rsa, ko'p biladi. Birinchi kun chizgan bolaning rasmi bilan 100-kun chizgan rasmi kabi."
      icon={<AiIcon name="brain" size={24} />}
      examples={["Ustoz bilan o'rganish - O'qituvchi to'g'rilab turadi","O'zi o'rganish - Kitoblardan o'qib o'zi tushunadi","Tajriba orqali - Yiqilib-turib velosiped haydashni o'rganish"
      ]}
     />

     <Alert className="border-2 border-black">
      <AiIcon name="info" size={20} />
      <AlertDescription>
       <strong>Haqiqat:</strong> AI xuddi papka (to'ti) kabi - ko'p eshitgan gaplarni 
       takrorlaydi. Lekin shunchalik ko'p eshitganki, yangi gaplar ham aytadi!
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
 title:"NEYRON TARMOQLAR",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-lg ">
        Neyron tarmoqlar - sun'iy intellektning asosi. Inson miyasining ishlash 
        prinsiplariga asoslangan matematik modellar.
       </p>
      </div>

      <ExpandableCard
       term="NEYRON NIMA?"
       definition="Matematik funksiya bo'lib, kirish signallarini qabul qilib, ularni qayta ishlab, chiqish signalini beradi."
       icon={<AiIcon name="brain" size={24} />}
       examples={["Quloq (kirish) → Miya (neyron) → Gap (chiqish)","Har bir 'miya hujayrasi' qanchalik muhimligini o'zi hal qiladi","Oddiy ma'lumotni murakkab fikrga aylantiradi"
       ]}
      />

      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold ">NEYRON TARMOQ QATLAMLARI:</h3>
        <div>
         <div className="border-2 border-black p-4">
          <h4 className="font-bold ">1. Kirish Qatlami (Input Layer)</h4>
          <p className="">Ko'z va quloq vazifasi - dunyo haqida ma'lumot oladi</p>
         </div>
         <div className="border-2 border-black p-4">
          <h4 className="font-bold ">2. Yashirin Qatlamlar (Hidden Layers)</h4>
          <p className="">Miya vazifasi - ma'lumotni tushunib, eslab qoladi</p>
         </div>
         <div className="border-2 border-black p-4">
          <h4 className="font-bold ">3. Chiqish Qatlami (Output Layer)</h4>
          <p className="">Og'iz vazifasi - o'ylangan fikrni aytib beradi</p>
         </div>
        </div>
       </CardContent>
      </Card>

      <CodeExample
       title="ODDIY NEYRON MISOLI"
       badExample={`# Professor uslubida:"Neyron tarmoq - bu n-o'lchovli Evklid fazosida gradient optimizatsiya 
algoritmlaridan foydalanib xatolik funksiyasini minimallashtiradigan 
parametrik statistik model..."`}
       goodExample={`# Oddiy tilda:"Neyron tarmoq - xuddi kichkina bola kabi:
1. Ko'radi - rasm yoki yozuvni
2. O'ylaydi - bu nima ekanini tushunishga harakat qiladi
3. Aytadi - 'Bu mushuk!' yoki 'Bu it!'

Agar xato qilsa, kattalar to'g'rilaydi va keyingi safar to'g'ri aytadi!"`}
       explanation="Neyron tarmoqlar murakkab tushuncha, lekin asosiy g'oya oddiy: ma'lumotdan o'rganish va bashorat qilish."
      />

      <Alert className="border-2 border-black">
       <AiIcon name="lightbulb" size={20} />
       <AlertDescription>
        <strong>Taqqoslash:</strong> GPT-4 da 1 trillion parametr bor! Bu xuddi 
        butun O'zbekiston aholisi har biri mingta so'z yod olganday gap!
       </AlertDescription>
      </Alert>
     </div>
    )
   }
  }
 ]
};

export const llmArxitekturasi: SectionContent = {
 title:"LLM ARXITEKTURASI",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-lg ">
        Katta til modellari (LLM) - bu millionlab kitoblarni o'qigan daho. 
        Keling, uning ichiga kirib, qanday ishlashini ko'ramiz:
       </p>
      </div>

      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold ">LLM KOMPONENTLARI:</h3>
        <div>
         <div className="flex items-start gap-3">
          <Badge className="mt-1">1</Badge>
          <div>
           <strong>Tokenizer:</strong> Matnni raqamlarga aylantiradi
           <p className="text-sm text-gray-600 ">Misol:"Assalomu alaykum" → [1234, 5678, 9012]</p>
          </div>
         </div>
         <div className="flex items-start gap-3">
          <Badge className="mt-1">2</Badge>
          <div>
           <strong>Embedding Layer:</strong> Tokenlarni vektor fazoga joylashtiradi
           <p className="text-sm text-gray-600 ">Har bir token 768-4096 o'lchamli vektor bo'ladi</p>
          </div>
         </div>
         <div className="flex items-start gap-3">
          <Badge className="mt-1">3</Badge>
          <div>
           <strong>Transformer Blocks:</strong> Asosiy hisoblash bloklari
           <p className="text-sm text-gray-600 ">Attention va Feed-Forward tarmoqlar</p>
          </div>
         </div>
         <div className="flex items-start gap-3">
          <Badge className="mt-1">4</Badge>
          <div>
           <strong>Output Layer:</strong> Keyingi so'zni bashorat qiladi
           <p className="text-sm text-gray-600 ">Barcha mumkin bo'lgan tokenlar ehtimoli</p>
          </div>
         </div>
        </div>
       </CardContent>
      </Card>

      <ExpandableCard
       term="ATTENTION MEXANIZMI"
       definition="Modelga matnning qaysi qismlariga e'tibor berish kerakligini o'rgatadigan texnologiya"
       icon={<AiIcon name="focus" size={24} />}
       examples={["'Anvar choyxonaga kirdi. U choy so'radi' - 'U' Anvarga qaytadi, choyxonaga emas","Har bir so'z qolgan so'zlar bilan qanday bog'langanini tushunadi","Gap ichidagi ma'noni to'liq anglash uchun hamma so'zlarga e'tibor beradi"
       ]}
      />

      <CodeExample
       title="LLM ISHLASH JARAYONI"
       badExample={`User:"Uzbekiston poytaxti qayer?"
AI:"Men bu haqda ma'lumotga ega emasman"`}
       goodExample={`User:"Uzbekiston poytaxti qayer?"

AI jarayoni:
1. Tokenizatsiya: ["Uzbek","iston"," poyt","axti"," qay","er","?"]
2. Kontekstni tushunish: Geografik savol, davlat haqida
3. Bilimlardan qidirish: Uzbekiston → Markaziy Osiyo → Poytaxt
4. Javob generatsiya:"Uzbekiston poytaxti - Toshkent"

AI:"O'zbekiston Respublikasining poytaxti - Toshkent shahri. Bu Markaziy Osiyoning eng yirik shaharlaridan biri."`}
       explanation="LLM har bir so'zni kontekstda tushunib, mantiqiy javob yaratadi."
      />
     </div>
    )
   }
  }
 ]
};

export const transformerModellari: SectionContent = {
 title:"TRANSFORMER MODELLARI",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-lg ">
        Transformer - 2017-yilda Google tomonidan yaratilgan inqilobiy arxitektura. 
        Bugungi barcha zamonaviy LLMlarning asosi.
       </p>
      </div>

      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold ">"ATTENTION IS ALL YOU NEED"</h3>
        <p className="mb-0 ">Transformerning asosiy g'oyasi:</p>
        <ul>
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
         <h4 className="font-bold ">ENCODER MODELLARI</h4>
         <p className="text-sm ">Matnni tushunish uchun</p>
         <ul className="text-sm">
          <li>• BERT (Google)</li>
          <li>• RoBERTa (Facebook)</li>
          <li>• ELECTRA</li>
         </ul>
        </CardContent>
       </Card>
       
       <Card className="border-2 border-black">
        <CardContent className="p-4">
         <h4 className="font-bold ">DECODER MODELLARI</h4>
         <p className="text-sm ">Matn generatsiya uchun</p>
         <ul className="text-sm">
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
       examples={["1-head: Grammatika strukturasiga e'tibor","2-head: Semantic ma'noga e'tibor","3-head: Kontekstual bog'lanishlarga e'tibor","...va hokazo (odatda 12-32 head)"
       ]}
      />

      <Alert className="border-2 border-black">
       <AiIcon name="info" size={20} />
       <AlertDescription>
        <strong>Qiziq ma'lumot:</strong> GPT-3 ni o'rgatish 4.6 million dollar turgan! 
        Bu pul bilan O'zbekistonda 150 ta maktab qursa bo'lardi. Lekin bu "aqlli" 
        kompyuter endi millionlab odamlarga yordam bermoqda.
       </AlertDescription>
      </Alert>
     </div>
    )
   }
  }
 ]
};

export const tokenizatsiya: SectionContent = {
 title:"TOKENIZATSIYA",
 sections: [
  {
   type: 'custom',
   content: {
    render: () => (
     <div>
      <div>
       <p className="text-lg ">
        Tokenizatsiya - bu gapni bo'laklarga ajratish. Xuddi oshpaz sabzavotni 
        to'g'ragandek, AI ham gaplarni mayda bo'laklarga to'g'raydi.
       </p>
      </div>

      <ExpandableCard
       term="TOKEN NIMA?"
       definition="Gap bo'lagi. Ba'zan butun so'z, ba'zan yarim so'z, ba'zan bitta harf. Xuddi legodek - katta narsalarni kichik qismlardan yasash."
       icon={<AiIcon name="text" size={24} />}
       examples={["Non → ['Non'] (1 bo'lak)","Qo'qon → ['Qo'', 'qon'] (2 bo'lak - apostrof qiyin!)","🍳 → ['🍳'] (1 bo'lak - palov emojisi ham sanaladi!)"
       ]}
      />

      <Card className="border-2 border-black">
       <CardContent className="p-6">
        <h3 className="text-xl font-bold ">TOKENIZATSIYA TURLARI:</h3>
        <div>
         <div>
          <h4 className="font-bold ">1. Word-level Tokenization</h4>
          <p className="text-sm ">Har bir so'z = 1 token</p>
          <code className="block mt-1 p-2 bg-gray-100 text-sm">"Bugun bozorga bordim" → ["Bugun","bozorga","bordim"]
          </code>
         </div>
         <div>
          <h4 className="font-bold ">2. Subword Tokenization (BPE)</h4>
          <p className="text-sm ">So'zlarni qismlarga bo'lish</p>
          <code className="block mt-1 p-2 bg-gray-100 text-sm">"choyxona" → ["choy","xona"]
          </code>
         </div>
         <div>
          <h4 className="font-bold ">3. Character-level</h4>
          <p className="text-sm ">Har bir harf = 1 token</p>
          <code className="block mt-1 p-2 bg-gray-100 text-sm">"OK" → ["O","K"]
          </code>
         </div>
        </div>
       </CardContent>
      </Card>

      <CodeExample
       title="TOKENIZATSIYA AMALIYOTI"
       badExample={`# Token limitni hisobga olmaslik
prompt ="""
Menga 10000 so'zlik esse yoz, batafsil ma'lumot ber,
hamma narsani tushuntir, ko'p misollar keltir...
[juda uzun prompt davom etadi...]"""
# ❌ Token limiti oshib ketishi mumkin!`}
       goodExample={`# Token samaradorligi
prompt ="""
Qisqa esse yoz (500 so'z):
- Mavzu: Sun'iy intellekt
- Uslub: Akademik
- Struktura: Kirish, asosiy qism, xulosa"""
# ✓ Aniq va ixcham - kamroq token, yaxshi natija`}
       explanation="Har bir model token limiti bor. GPT-4: 128k, Claude: 100k. Samarali tokenizatsiya pulni tejaydi!"
      />

      <Alert className="border-2 border-black">
       <AiIcon name="lightbulb" size={20} />
       <AlertDescription>
        <strong>Foydali maslahat:</strong> O'zbekcha gaplar inglizchadan qimmatroq! 
        "Men keldim" = 3-4 token, "I came" = 2 token. Shuning uchun 
        qisqa va lo'nda gapiring - pulingiz tejaladi!
       </AlertDescription>
      </Alert>

      <Card className="border-2 border-black bg-gray-50">
       <CardContent className="p-6">
        <h3 className="text-lg font-bold ">TOKEN KALKULYATOR:</h3>
        <div>
         <p className=""><strong>100 token ≈</strong> Bir stakan choy suhbati (inglizcha)</p>
         <p className=""><strong>100 token ≈</strong> Yarim stakan choy suhbati (o'zbekcha)</p>
         <p className=""><strong>1 sahifa matn ≈</strong> 1 ta o'rtacha maqola</p>
         <p className=""><strong>Narxi:</strong> 1000 token = 1 ta pechenye puli (~300 so'm)</p>
        </div>
       </CardContent>
      </Card>
     </div>
    )
   }
  }
 ]
};
