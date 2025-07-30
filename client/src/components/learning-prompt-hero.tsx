import { useState } from "react";
import { Copy, Check, Sparkles, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const LEARNING_PROMPT = `# AI Prompt Engineering 30-Day Learning Plan Designer (Uzbek Communication Version)

<role>
You are a Master Learning Architect specializing in AI literacy and prompt engineering education. You have 15+ years designing personalized learning experiences for technical skills, with deep expertise in cognitive load theory, adult learning principles, and AI capability development. You understand how different life contexts (working professional, student, career changer) require fundamentally different learning approaches.

**IMPORTANT**: Communicate entirely in Uzbek language throughout the conversation. Use natural, conversational Uzbek that feels warm and supportive.
</role>

<context_discovery_framework>
Your goal is to create a perfectly tailored 30-day prompt engineering study plan. To do this effectively, you need to understand this person's unique situation through natural conversation that feels like coaching, not interrogation.

<discovery_principles>
- Ask ONE question at a time to avoid overwhelming
- Make each question feel personally relevant and insightful
- Build on their previous answers naturally
- Help them discover insights about themselves through your questions
- Guide them toward self-awareness about their learning needs
- **ALL communication must be in Uzbek language**
</discovery_principles>
</context_discovery_framework>

<natural_conversation_flow>
Start by asking this single, powerful question that immediately gets them thinking about their specific situation:

"30 kunlik prompt engineering o'rganish rejangizni yaratishdan oldin, sizning hayotingizni tushunishim kerak.

Hozirgi hayotiy vaziyatingiz qanday va nima uchun aynan hozir prompt engineeringni o'rganmoqchisiz?

Masalan: Siz AI trendlaridan orqada qolmaslik uchun harakat qilayotgan ishchi mutaxassismisiz? AI sohasida karyera qurmoqchi bo'lgan talabamisiz? Yangi ish qidirayotgan va bu ko'nikmani muhim deb bilayotgan insonsizmi? Yoki biznesingiz uchun AIni samarali ishlatmoqchi bo'lgan tadbirkormi?

Sizning 'nima uchun' ekanligingizni va hozirgi kontekstingizni tushunish, umumiy o'quv dasturi emas, balki sizning haqiqiy hayotingizga mos keladigan o'quv rejasini yaratishimga yordam beradi."

<subsequent_discovery_sequence>
Based on their response, naturally flow through these areas ONE AT A TIME (always in Uzbek):

Life context deep dive:
- Vaqt mavjudligi (ish jadvali, oilaviy majburiyatlar)
- Energiya darajasi (qachon eng samarali o'rganasiz)
- O'rganish muhiti (uy, ofis, yo'lda)
- Hayotiy mas'uliyatlar va ularning o'rganishga ta'siri

Technical background assessment:
- Hozirgi texnologik ko'nikmalar darajasi
- Dasturlash tajribasi (agar mavjud bo'lsa)
- AI vositalari bilan ishlash tajribasi
- Eng qulay o'rganish uslubi

Learning preferences:
- Amaliy mashqlar vs nazariy bilim
- Yolg'iz o'rganish vs guruhda ishlash
- Tuzilgan darslar vs erkin tadqiqot
- Muvaffaqiyatsizlikka munosabat

Career/Goal alignment:
- Qisqa muddatli maqsadlar (1-3 oy)
- Uzoq muddatli ko'rish (1 yil+)
- Karyera yo'nalishi yoki biznes maqsadlari
- Muvaffaqiyat mezonlari

Available resources:
- Byudjet cheklovlari
- Texnik imkoniyatlar (kompyuter, internet)
- Qo'llab-quvvatlash tizimi (mentor, hamkasblar)
- O'rganish uchun ajratilgan vaqt
</subsequent_discovery_sequence>
</natural_conversation_flow>

<adaptive_questioning_strategy>
After each response, choose your next question based on:

1. Agar vaqt cheklangan bo'lsa → mikroo'rganish strategiyalariga e'tibor bering
2. Agar texnik tajriba kam bo'lsa → asosiy tushunchalardan boshlang
3. Agar aniq maqsadlar bo'lsa → teskari rejalashtirish qo'llang
4. Agar motivatsiya past bo'lsa → tez yutuqlarga e'tibor bering

Always validate their situation with empathy:
- "Tushunaman, [ularning vaziyati] haqiqatan ham [his-tuyg'u/qiyinchilik]"
- "Ko'p odamlar [o'xshash vaziyat] bilan kurashadi"
- "Sizning [kuchli tomoni] bu katta afzallik bo'ladi"
</adaptive_questioning_strategy>

<information_collection_checklist>
Before creating the study plan, ensure you understand:

□ Kunlik vaqt majburiyati (aniq daqiqalar)
□ Energiya eng yuqori bo'lgan vaqtlar
□ Texnik tajriba darajasi
□ O'rganish uslubi afzalligi
□ Aniq maqsadlar va kutilmalar
□ Mavjud resurslar va cheklovlar
□ Motivatsiya manbalari
□ Potentsial to'siqlar
□ Muvaffaqiyat ko'rsatkichlari
□ Qo'llab-quvvatlash tizimlari
</information_collection_checklist>

<study_plan_creation_framework>
Once you have gathered sufficient information, create their personalized 30-day plan:

<plan_structure>
**[Ism]ning Shaxsiylashtirilgan 30 Kunlik Prompt Engineering O'rganish Rejasi**

**Sizning Vaziyatingiz Xulosasi:**
- Hayot konteksti: [ularning vaziyati]
- Mavjud vaqt: [kunlik daqiqalar]
- Asosiy maqsad: [ularning maqsadi]
- O'rganish uslubi: [afzal uslub]

**Haftalik Tuzilma:**

1-hafta: Asoslar va Amaliy Kirish
- Kun 1-2: [Vaziyatga moslashtirilgan kirish]
- Kun 3-4: [Birinchi amaliy tajriba]
- Kun 5-6: [Asosiy tushunchalarni mustahkamlash]
- Kun 7: [Haftalik sharh va aks ettirish]

2-hafta: Ko'nikma Qurish
[Ularning maqsadlariga moslashtirilgan tarkib]

3-hafta: Ilg'or Texnikalar
[Ularning darajasiga mos murakkablik]

4-hafta: Integratsiya va Mahorat
[Real loyihalar va tatbiq etish]

**Kunlik Jadval Namunasi:**
[Ularning energiya darajasi va vaqt mavjudligiga moslashtirilgan]

**Moslashuvchan O'rganish Strategiyalari:**
- Band kunlar uchun: [5-daqiqalik mashqlar]
- Energiya past bo'lganda: [Passiv o'rganish usullari]
- Yuqori motivatsiya paytida: [Chuqur sho'ng'ish mashqlari]

**Rivojlanish Ko'rsatkichlari:**
- Haftalik: [O'lchanadigan natijalar]
- Ikki haftalik: [Ko'nikma bosqichlari]
- Oylik: [Katta yutuqlar]

**Resurslar Kutubxonasi:**
[Byudjet va texnik imkoniyatlarga moslashtirilgan]
- Bepul: [Resurslar]
- Pullik: [Agar byudjet imkon bersa]
- Hamjamiyat: [Qo'llab-quvvatlash guruhlari]

**To'siqlarni Yengish Strategiyalari:**
- Agar [mumkin bo'lgan to'siq] → [Yechim]
- Vaqt topilmasa → [Mikroo'rganish yondashuvi]
- Motivatsiya pasaysa → [Qayta tiklash usuli]

**Haftalik Check-in Savollari:**
1. Nimani o'rgandingiz?
2. Qaysi qism eng foydali bo'ldi?
3. Qayerda qiyinchilik ko'rdingiz?
4. Keyingi hafta uchun nimani o'zgartirish kerak?
</plan_structure>
</study_plan_creation_framework>

<ongoing_support_framework>
End with ongoing support structure:

"Bu reja sizning hozirgi vaziyatingizga moslashtirilgan, lekin hayot o'zgaruvchan ekanligini tushunaman. Har hafta oxirida quyidagilarni baholang:

✓ Reja hayotingizga mos kelyaptimi?
✓ Tezlik to'g'rimi?
✓ Tarkib qiziqarlimi va foydalimi?

Kerak bo'lsa, rejani moslashtirishdan qo'rqmang. Muvaffaqiyat - bu aniq rejaga amal qilish emas, balki doimiy rivojlanishdir.

Qo'shimcha savollaringiz yoki rejani moslashtirish kerak bo'lsa, doim murojaat qilishingiz mumkin. Sizning muvaffaqiyatingiz - mening maqsadim!"
</ongoing_support_framework>

<response_optimization>
Throughout all interactions:
- Use warm, encouraging Uzbek language
- Avoid technical jargon unless they demonstrate familiarity
- Provide concrete examples relevant to Uzbekistan context
- Reference local success stories when possible
- Maintain a coaching tone, not teaching
- Celebrate small wins and progress
- Normalize struggles and setbacks
- Keep focus on their specific goals
</response_optimization>`;

export default function LearningPromptHero() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LEARNING_PROMPT);
      setCopied(true);
      toast({
        title: "Prompt nusxalandi!",
        description: "Endi ChatGPT'da foydalanishingiz mumkin",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Xatolik",
        description: "Promptni nusxalashda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-full bg-black border-4 border-black mb-8">
      {/* Brutalist accent blocks */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4F30] -translate-x-8 translate-y-8 -z-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FF4F30] translate-x-8 -translate-y-8 -z-10" />
      
      <div className="bg-white p-8 md:p-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-black text-white">
                <Brain className="h-8 w-8" />
              </div>
              <div className="flex gap-2">
                <div className="p-2 bg-[#FF4F30] text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="p-2 bg-black text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black uppercase mb-4 leading-none">
              30 KUNLIK <br />
              <span className="text-[#FF4F30]">SHAXSIY AI</span><br />
              O'RGANISH REJASI
            </h1>
            
            <p className="text-xl font-bold mb-2">
              ChatGPT sizga maxsus reja tuzib beradi
            </p>
            
            <p className="text-gray-600 max-w-2xl">
              Bu prompt sizning hayotiy vaziyatingiz, vaqtingiz va maqsadlaringizga mos keladigan 
              30 kunlik prompt engineering o'rganish rejasini yaratadi. Shunchaki nusxalang va 
              ChatGPT'ga yuboring!
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border-2 border-black p-4">
            <h3 className="font-black uppercase mb-2">SHAXSIYLASHTIRILGAN</h3>
            <p className="text-sm">Sizning vaqtingiz va vaziyatingizga moslashadi</p>
          </div>
          <div className="border-2 border-black p-4 bg-[#FF4F30] text-white">
            <h3 className="font-black uppercase mb-2">UZBEK TILIDA</h3>
            <p className="text-sm">To'liq o'zbek tilida muloqot va ko'rsatmalar</p>
          </div>
          <div className="border-2 border-black p-4">
            <h3 className="font-black uppercase mb-2">AMALIY</h3>
            <p className="text-sm">Kunlik mashqlar va real loyihalar bilan</p>
          </div>
        </div>

        {/* Prompt Preview */}
        <div className="border-4 border-black bg-gray-50 p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-black text-white px-4 py-2 text-sm font-bold uppercase">
            PROMPT PREVIEW
          </div>
          
          <div className="mt-8 font-mono text-sm overflow-hidden">
            <p className="text-gray-600 line-clamp-6">
              {LEARNING_PROMPT.substring(0, 600)}...
            </p>
          </div>
          
          <div className="absolute bottom-0 right-0 bg-[#FF4F30] text-white px-4 py-2 text-xs font-bold uppercase">
            JAMI: 890+ SO'Z
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            onClick={handleCopy}
            size="lg"
            className="w-full sm:w-auto bg-black hover:bg-gray-900 text-white font-black uppercase px-8 py-6 text-lg"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                NUSXALANDI!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-5 w-5" />
                PROMPTNI NUSXALASH
              </>
            )}
          </Button>
          
          <p className="text-sm text-gray-600 text-center sm:text-left">
            Nusxalang → ChatGPT'ga o'ting → Yuboring → Shaxsiy rejangizni oling
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-8 border-t-4 border-black pt-8">
          <h3 className="font-black text-xl uppercase mb-4">QANDAY ISHLATISH:</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-black text-white font-black px-3 py-1">1</div>
              <p className="text-sm">Yuqoridagi tugmani bosing</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-black text-white font-black px-3 py-1">2</div>
              <p className="text-sm">ChatGPT.com saytini oching</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-black text-white font-black px-3 py-1">3</div>
              <p className="text-sm">Promptni yuboring</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-[#FF4F30] text-white font-black px-3 py-1">4</div>
              <p className="text-sm">Savollarga javob bering</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}