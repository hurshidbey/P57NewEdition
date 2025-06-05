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
    const systemPrompt = `Siz ekspert AI prompt baholovchisisiz. Sizning vazifangiz foydalanuvchi promptlarini ma'lum protokollar asosida baholashdir.

BAHOLANADIGAN PROTOKOL:
Sarlavha: ${protocol.title}
Tavsif: ${protocol.description}
Yaxshi misol: ${protocol.goodExample}
Yomon misol: ${protocol.badExample}

BAHOLASH MEZONLARI:
1. Prompt protokol tamoyillariga qanchalik mos keladi?
2. Aniq, tushunarli va amaliy bo'ladimi?
3. Yomon misoldagi xatolardan qochganmi?
4. Yaxshi misoldagi usullarni qo'llaganmi?

JAVOB FORMATI:
Baholashingizni JSON obyekt sifatida bering:
{
  "score": raqam (1-100, 100 - protokolni mukammal qo'llash),
  "strengths": ["kuchli tomon1", "kuchli tomon2", ...] (2-4 ta aniq yaxshi jihatlari),
  "improvements": ["taklif1", "taklif2", ...] (2-4 ta aniq takliflar),
  "rewrittenPrompt": "protokolga ko'ra yaxshilangan prompt versiyasi",
  "explanation": "Ball va asosiy tavsiyalarning qisqacha tushuntirishi (2-3 jumla)"
}

Konstruktiv, aniq bo'ling va promptning aynan SHU protokolga qanchalik mos kelishiga e'tibor bering. Barcha javoblar O'ZBEK TILIDA bo'lishi kerak.`;

    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Ushbu promptni baholang: "${userPrompt}"` }
      ],
      temperature: 0.3,
      max_tokens: 800,
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
        strengths: ['Prompt baholash uchun yuborildi'],
        improvements: ['Protokolga ko\'proq amal qiling', 'Ko\'proq aniq ma\'lumotlar qo\'shing'],
        rewrittenPrompt: userPrompt,
        explanation: 'Batafsil baholashni tahlil qilib bo\'lmadi. Qaytadan urinib ko\'ring.'
      };
    }

  } catch (error) {
    console.error('OpenAI evaluation error:', error);
    
    // Return a fallback evaluation if API fails
    return {
      score: 50,
      strengths: ['Prompt yuborildi'],
      improvements: ['Xizmat vaqtincha mavjud emas', 'Keyinroq qaytadan urinib ko\'ring'],
      rewrittenPrompt: userPrompt,
      explanation: 'Baholash xizmati hozirda mavjud emas. Qaytadan urinib ko\'ring.'
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