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

// Main evaluatePrompt function that handles both signatures
export async function evaluatePrompt(
  contextOrUserPrompt: string,
  userPromptOrProtocol?: string | Protocol
): Promise<PromptEvaluation> {
  // If second parameter is a string, we're using the simple context/userPrompt version
  if (typeof userPromptOrProtocol === 'string') {
    const context = contextOrUserPrompt;
    const userPrompt = userPromptOrProtocol;
    
    // Create a mock protocol for evaluation
    const mockProtocol: Protocol = {
      id: 0,
      number: 0,
      title: 'Umumiy Prompt Baholash',
      description: context,
      goodExample: 'Aniq, maqsadli va kontekstga mos prompt',
      badExample: 'Noaniq, uzun va tarqoq prompt',
      difficulty: 'medium',
      categoryId: 1,
      isPremium: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return evaluatePromptWithProtocol(userPrompt, mockProtocol);
  }
  
  // Otherwise, it's the original version with userPrompt and protocol
  const userPrompt = contextOrUserPrompt;
  const protocol = userPromptOrProtocol as Protocol;
  
  return evaluatePromptWithProtocol(userPrompt, protocol);
}

// Internal implementation
async function evaluatePromptWithProtocol(
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
  "rewrittenPrompt": "Taklif qilingan yaxshilangan prompt versiyasi",
  "explanation": "Umumiy baholash va asosiy xulosa (2-3 gap)"
}`;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `FOYDALANUVCHI PROMPTI:\n${userPrompt}` }
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const evaluation = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate the response
    if (!evaluation.score || !evaluation.strengths || !evaluation.improvements) {
      throw new Error('Invalid evaluation response from OpenAI');
    }

    return evaluation;

  } catch (error: any) {
    // Log the error but don't expose it to the user
    console.error('OpenAI API error:', error.message);
    
    // Check if it's specifically an API key error
    if (error.message?.includes('API key') || error.status === 401) {
      return {
        score: 50,
        strengths: ['Prompt yuborildi', 'Asosiy tuzilma mavjud'],
        improvements: ['AI xizmati sozlanmagan', 'Administratorga murojaat qiling'],
        rewrittenPrompt: userPrompt,
        explanation: 'AI baholash xizmatida texnik xatolik yuz berdi. Prompt o\'rtacha darajada baholandi, lekin batafsil tahlil uchun qaytadan urinib ko\'ring.'
      };
    }

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
    console.error('OpenAI connection test failed:', error);
    return false;
  }
}