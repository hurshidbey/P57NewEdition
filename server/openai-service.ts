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
  score: number; // 1-10 scale
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
    const systemPrompt = `You are an expert AI prompt evaluator. Your job is to evaluate user prompts based on specific prompting protocols.

PROTOCOL BEING EVALUATED:
Title: ${protocol.title}
Description: ${protocol.description}
Good Example: ${protocol.goodExample}
Bad Example: ${protocol.badExample}

EVALUATION CRITERIA:
1. How well does the prompt follow the specific protocol principles?
2. Is it clear, specific, and actionable?
3. Does it avoid the mistakes shown in the bad example?
4. Does it incorporate techniques from the good example?

RESPONSE FORMAT:
Provide your evaluation as a JSON object with these exact fields:
{
  "score": number (1-10, where 10 is perfect application of the protocol),
  "strengths": ["strength1", "strength2", ...] (2-4 specific things done well),
  "improvements": ["improvement1", "improvement2", ...] (2-4 specific suggestions),
  "rewrittenPrompt": "improved version of the prompt following the protocol better",
  "explanation": "Brief explanation (2-3 sentences) of the score and key recommendations"
}

Be constructive, specific, and focus on how well the prompt applies THIS specific protocol.`;

    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Evaluate this prompt: "${userPrompt}"` }
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
      evaluation.score = Math.max(1, Math.min(10, Math.round(evaluation.score)));

      return evaluation;
    } catch (parseError) {
      // If JSON parsing fails, create a fallback response
      return {
        score: 5,
        strengths: ['Prompt submitted for evaluation'],
        improvements: ['Consider following the protocol more closely', 'Add more specific details'],
        rewrittenPrompt: userPrompt,
        explanation: 'Unable to parse detailed evaluation. Please try again.'
      };
    }

  } catch (error) {
    console.error('OpenAI evaluation error:', error);
    
    // Return a fallback evaluation if API fails
    return {
      score: 5,
      strengths: ['Prompt submitted'],
      improvements: ['Service temporarily unavailable', 'Please try again later'],
      rewrittenPrompt: userPrompt,
      explanation: 'Evaluation service is currently unavailable. Please try again.'
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