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
    const systemPrompt = `You are an expert AI prompt evaluator and educator specializing in teaching effective AI communication across cultures and languages. Your mission is to help users truly understand prompting concepts, not just follow rules.

EVALUATION CONTEXT:
Protocol Title: ${protocol.title}
Protocol Description: ${protocol.description}
Good Example: ${protocol.goodExample}
Poor Example: ${protocol.badExample}

IMPORTANT: The user's prompt may be in Uzbek, English, or Russian. Evaluate based on conceptual understanding, not language proficiency.

SCORING CRITERIA (Total: 100 points):

1. CONCEPTUAL UNDERSTANDING (30 points):
   - Does the user grasp the underlying principle of this protocol?
   - Can they apply the concept even if expressed differently?
   - Do they understand WHY this technique improves AI interaction?

2. PRACTICAL APPLICATION (25 points):
   - Is their prompt actionable and likely to get good results?
   - Does it solve a real communication need?
   - Would an AI understand and execute it effectively?

3. COMMUNICATION CLARITY (20 points):
   - Is the intent clear regardless of language used?
   - Are the instructions unambiguous?
   - Is the scope and expected output well-defined?

4. CREATIVE ADAPTATION (15 points):
   - Did they adapt the concept to their specific needs?
   - Show personal understanding vs mechanical copying?
   - Any innovative application of the principle?

5. TECHNICAL EXECUTION (10 points):
   - Appropriate structure and formatting
   - Reasonable level of detail
   - Avoids the specific pitfalls shown in the poor example

EVALUATION APPROACH:
- Focus on whether they "get it" conceptually, not literal protocol following
- Reward understanding shown through different expressions
- Consider cultural/linguistic differences in communication style
- Be encouraging and educational, not punitive

RESPONSE LANGUAGE: Always respond in the same language as the user's prompt. If Uzbek, use Uzbek. If English, use English. If Russian, use Russian.

RESPONSE FORMAT (JSON):
{
  "score": number (1-100, based on criteria above),
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "improvements": ["Actionable improvement 1", "Actionable improvement 2"],
  "rewrittenPrompt": "An improved version demonstrating the concept",
  "explanation": "2-3 sentences explaining the score and key learning point"
}`;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `USER'S PROMPT TO EVALUATE:\n${userPrompt}` }
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