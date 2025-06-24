import OpenAI from 'openai';
import { Protocol } from '@shared/schema';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export interface PromptEvaluation {
  score: number; // 1-100 scale
  strengths: string[];
  improvements: string[];
  rewrittenPrompt: string;
  explanation: string;
}

export async function evaluatePrompt(
  userPrompt: string,
  protocol: Protocol
): Promise<PromptEvaluation> {
  try {
    const systemPrompt = `Siz professional AI prompt baholovchisi va o'qituvchisisiz. Sizning vazifangiz foydalanuvchi promptlarini ma'lum protokollar asosida chuqur tahlil qilish va aniq yo'l-yo'riq berishdir.

BAHOLANADIGAN PROTOKOL:
Sarlavha: ${protocol.title}
Tavsif: ${protocol.description}
Yaxshi misol: ${protocol.goodExample}
Yomon misol: ${protocol.badExample}

BATAFSIL BAHOLASH MEZONLARI:
1. PROTOKOL MOSLIK (40 ball): Prompt ushbu protokolning asosiy tamoyillariga qanchalik rioya qiladi?
2. ANIQLIK VA TUSHUNARLIK (25 ball): Prompt aniq, boshqaruvchan va amalga oshirish mumkinmi?
3. XATOLIKLAR NAZORATI (20 ball): Yomon misoldagi keng tarqalgan xatolardan qochganmi?
4. YAXSHI AMALIYOT (15 ball): Yaxshi misoldagi samarali usullarni qo'llaganmi?

TAKLIFLAR UCHUN QOIDALAR:
- Har bir taklif aniq va amaliy bo'lishi kerak
- "Ko'proq ma'lumot qo'shing" kabi umumiy gaplar emas, balki aniq nima qo'shish kerakligini aytish
- Protokolning o'ziga xos xususiyatlariga e'tibor berish
- Konkret so'zlar, iboralar yoki tuzilma o'zgarishlarini taklif qilish

JAVOB FORMATI:
Baholashingizni JSON obyekt sifatida bering:
{
  "score": raqam (1-100, har bir mezon bo'yicha aniq ball),
  "strengths": ["Aniq kuchli tomon 1", "Aniq kuchli tomon 2", "Aniq kuchli tomon 3"] (faqat haqiqiy yutuqlar),
  "improvements": ["Aniq va amaliy taklif 1", "Aniq va amaliy taklif 2"] (konkret o'zgarishlar),
  "rewrittenPrompt": "Protokol tamoyillariga to'liq mos keluvchi yaxshilangan versiya",
  "explanation": "Ball taqsimoti va asosiy kamchiliklar/afzalliklar haqida batafsil tushuntirish (3-4 jumla)"
}

MUHIM: Har bir taklif konkret bo'lishi va promptni qanday o'zgartirish kerakligini aniq ko'rsatishi kerak. Barcha javoblar O'ZBEK TILIDA va professional darajada bo'lishi shart.`;

    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Ushbu promptni baholang: "${userPrompt}"` }
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse JSON response
    try {
      const evaluation = JSON.parse(content) as PromptEvaluation;
      
      // Validate the response structure
      if (typeof evaluation.score !== 'number' || 
          !Array.isArray(evaluation.strengths) ||
          !Array.isArray(evaluation.improvements) ||
          typeof evaluation.rewrittenPrompt !== 'string' ||
          typeof evaluation.explanation !== 'string') {
        throw new Error('Invalid response structure');
      }

      // Ensure score is within range
      evaluation.score = Math.max(1, Math.min(100, Math.round(evaluation.score)));

      return evaluation;
    } catch (parseError) {
      // If JSON parsing fails, create a fallback response
      return {
        score: 50,
        strengths: ['Prompt strukturasi mavjud', 'Asosiy g\'oya aniq'],
        improvements: ['Protokolning asosiy tamoyillarini qo\'llash kerak', 'Konkret ko\'rsatmalar va misollar qo\'shish lozim'],
        rewrittenPrompt: userPrompt,
        explanation: 'AI baholash xizmatida texnik xatolik yuz berdi. Prompt o\'rtacha darajada baholandi, lekin batafsil tahlil uchun qaytadan urinib ko\'ring.'
      };
    }

  } catch (error) {

    // Return a fallback evaluation if API fails
    return {
      score: 50,
      strengths: ['Prompt muvaffaqiyatli yuborildi', 'Asosiy mazmun mavjud'],
      improvements: ['AI baholash xizmati bilan bog\'lanish yo\'q', 'Internetni tekshiring va qaytadan urinib ko\'ring'],
      rewrittenPrompt: userPrompt,
      explanation: 'Baholash xizmati bilan bog\'lanishda xatolik yuz berdi. Tarmoq ulanishini tekshiring va qaytadan urinib ko\'ring. Prompt asosiy talablarga javob beradi.'
    };
  }
}

export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Test connection' }],
      max_tokens: 5,
    });
    return response.choices.length > 0;
  } catch (error) {

    return false;
  }
}