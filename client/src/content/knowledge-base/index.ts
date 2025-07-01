import type { SectionContent } from './components/types';

// Import all category modules
import * as kirish from './categories/kirish';
import * as asoslar from './categories/asoslar';
import * as sozlamalar from './categories/sozlamalar';
import * as texnikalar from './categories/texnikalar';
import * as agents from './categories/agents';
import * as rag from './categories/rag';
import * as tanqidiy from './categories/tanqidiy';
import * as modellar from './categories/modellar';
import * as xavfsizlik from './categories/xavfsizlik';
import * as optimizatsiya from './categories/optimizatsiya';
import * as amaliyot from './categories/amaliyot';
import * as resurslar from './categories/resurslar';

// Content registry mapping section IDs to content
export const contentRegistry: Record<string, Record<string, SectionContent>> = {
  kirish: {
    'nima-uchun-muhim': kirish.nimaUchunMuhim,
    'prompting-nima': kirish.promptingNima,
    'prompt-elementlari': kirish.promptElementlari,
    'ai-inqilobi': kirish.aiInqilobi,
    'umumiy-maslahatlar': kirish.umumiyMaslahatlar,
  },
  asoslar: {
    'ai-qanday-ishlaydi': asoslar.aiQandayIshlaydi,
    'neyron-tarmoqlar': asoslar.neyronTarmoqlar,
    'llm-arxitekturasi': asoslar.llmArxitekturasi,
    'transformer-modellari': asoslar.transformerModellari,
    'tokenizatsiya': asoslar.tokenizatsiya,
  },
  sozlamalar: {
    'harorat-parametri': sozlamalar.haroratParametri,
    'top-p-va-top-k': sozlamalar.topPVaTopK,
    'max-tokens': sozlamalar.maxTokens,
    'stop-sequences': sozlamalar.stopSequences,
    'presence-frequency': sozlamalar.presenceFrequency,
  },
  texnikalar: {
    'zero-shot': texnikalar.zeroShot,
    'few-shot': texnikalar.fewShot,
    'chain-of-thought': texnikalar.chainOfThought,
    'role-playing': texnikalar.rolePlaying,
    'structured-output': texnikalar.structuredOutput,
  },
  agents: {
    'agent-tizimlar': agents.placeholder || {},
    'tool-use': agents.placeholder || {},
    'orchestration': agents.placeholder || {},
  },
  rag: {
    'rag-asoslari': rag.placeholder || {},
    'vektor-qidiruv': rag.placeholder || {},
    'hybrid-search': rag.placeholder || {},
  },
  tanqidiy: {
    'baholash': tanqidiy.placeholder || {},
    'taqqoslash': tanqidiy.placeholder || {},
    'xato-analiz': tanqidiy.placeholder || {},
  },
  modellar: {
    'gpt-oilasi': modellar.placeholder || {},
    'claude-oilasi': modellar.placeholder || {},
    'ochiq-modellar': modellar.placeholder || {},
  },
  xavfsizlik: {
    'xavfsizlik-tamoyillari': xavfsizlik.xavfsizlikTamoyillari,
    'jailbreaking': xavfsizlik.jailbreaking,
    'responsible-ai': xavfsizlik.responsibleAi,
  },
  optimizatsiya: {
    'narx-optimallashtirish': optimizatsiya.placeholder || {},
    'tezlik-oshirish': optimizatsiya.placeholder || {},
    'xotira-boshqaruv': optimizatsiya.placeholder || {},
  },
  amaliyot: {
    'chatbot-yaratish': amaliyot.placeholder || {},
    'kontent-generatsiya': amaliyot.placeholder || {},
    'kod-assistenti': amaliyot.placeholder || {},
  },
  resurslar: {
    'qollanmalar': resurslar.placeholder || {},
    'vositalar': resurslar.placeholder || {},
    'jamiyat': resurslar.placeholder || {},
  },
};

// Export content by section ID for easier access
export function getContent(categoryId: string, sectionId: string): SectionContent | null {
  return contentRegistry[categoryId]?.[sectionId] || null;
}