import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AiIcon } from "@/components/ai-icon";
import { ExpandableCard } from "../components/ExpandableCard";
import { CodeExample } from "../components/CodeExample";
import type { SectionContent } from "../components/types";

export const foydaliFoydaliKutubxonalar: SectionContent = {
  title: "FOYDALI KUTUBXONALAR",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                AI loyihalaringizni tezlashtirish uchun tayyor kutubxonalar va frameworklar. 
                Bu yerda eng mashhur va foydali AI/ML kutubxonalari, ularning qo'llanilishi va integration usullari keltirilgan.
              </p>
              <p className="text-lg leading-relaxed">
                To'g'ri kutubxonani tanlash - muvaffaqiyatli loyihaning yarmi. Har bir kutubxonaning 
                o'z kuchli tomonlari va use-case'lari mavjud.
              </p>
            </div>

            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <AiIcon name="package" size={24} />
                  TOP AI/ML KUTUBXONALAR
                </h3>
                
                <div className="space-y-4">
                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-800">LANGCHAIN</h4>
                      <Badge className="bg-gray-100 text-gray-800">LLM Framework</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      LLM ilovalar yaratish uchun eng mashhur framework
                    </p>
                    <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-3">
                      pip install langchain langchain-openai
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Chains</Badge>
                      <Badge variant="outline">Agents</Badge>
                      <Badge variant="outline">Memory</Badge>
                      <Badge variant="outline">Tools</Badge>
                    </div>
                  </div>

                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-800">LLAMAINDEX</h4>
                      <Badge className="bg-gray-100 text-gray-800">Data Framework</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      RAG va data-intensive AI ilovalar uchun
                    </p>
                    <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-3">
                      pip install llama-index
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Document Loaders</Badge>
                      <Badge variant="outline">Vector Stores</Badge>
                      <Badge variant="outline">Query Engines</Badge>
                    </div>
                  </div>

                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-800">TRANSFORMERS</h4>
                      <Badge className="bg-gray-100 text-gray-800">Model Hub</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Hugging Face'ning 100,000+ pre-trained modellari
                    </p>
                    <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-3">
                      pip install transformers torch
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">NLP</Badge>
                      <Badge variant="outline">Computer Vision</Badge>
                      <Badge variant="outline">Audio</Badge>
                      <Badge variant="outline">Multimodal</Badge>
                    </div>
                  </div>

                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-800">PANDAS AI</h4>
                      <Badge className="bg-gray-100 text-gray-800">Data Analysis</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Natural tilda data analysis va visualization
                    </p>
                    <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-3">
                      pip install pandasai
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Natural Language</Badge>
                      <Badge variant="outline">Auto Viz</Badge>
                      <Badge variant="outline">Data Cleaning</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 border-black hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2">VECTOR DATABASES</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>Pinecone:</strong> Managed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>Weaviate:</strong> Open-source</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>Chroma:</strong> Lightweight</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>Qdrant:</strong> High-performance</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-black hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2">DEPLOYMENT TOOLS</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>Streamlit:</strong> Quick demos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>Gradio:</strong> ML interfaces</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>FastAPI:</strong> Production APIs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>BentoML:</strong> Model serving</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-black hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2">MONITORING</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>Weights & Biases:</strong> ML tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>MLflow:</strong> Lifecycle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>Langfuse:</strong> LLM monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-black">•</span>
                      <span><strong>Helicone:</strong> Cost tracking</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <CodeExample
              title="KUTUBXONA INTEGRATSIYASI"
              badExample={`# Hamma narsani o'zingiz yozish
def my_rag_system():
    # PDF parsing from scratch
    # Embedding generation from scratch  
    # Vector search from scratch
    # ... 1000+ lines of code`}
              goodExample={`# Kutubxonalardan foydalanish
from langchain.document_loaders import PyPDFLoader
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA

# 10 qator kod bilan to'liq RAG sistema
loader = PyPDFLoader("document.pdf")
docs = loader.load_and_split()

vectorstore = Chroma.from_documents(
    docs, 
    OpenAIEmbeddings()
)

qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(),
    retriever=vectorstore.as_retriever()
)

answer = qa_chain.run("Your question here")`}
              explanation="Tayyor kutubxonalar yordamida haftalar o'rniga soatlar ichida MVP yaratish mumkin."
            />

            <Alert className="border-2 border-gray-600 bg-gray-50">
              <AiIcon name="lightbulb" size={20} className="text-black" />
              <AlertDescription className="text-gray-800">
                <strong>Maslahat:</strong> Avval oddiy kutubxonalardan boshlang. Murakkab frameworklarga 
                o'tishdan oldin asosiy konseptlarni o'rganing. "Start simple, iterate fast!"
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const dokumentatsiya: SectionContent = {
  title: "DOKUMENTATSIYA VA O'QUISH",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                AI sohasida yangiliklar tez o'zgaradi. Shuning uchun doimiy o'rganish va 
                eng so'nggi dokumentatsiyalarni kuzatib borish muhim.
              </p>
              <p className="text-lg leading-relaxed">
                Bu bo'limda eng yaxshi o'quv resurslari, dokumentatsiyalar va o'rganish 
                yo'llari keltirilgan.
              </p>
            </div>

            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-center">ASOSIY DOKUMENTATSIYALAR</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800">RASMIY DOCS</h4>
                    <div className="space-y-2">
                      <a href="#" className="block p-3 bg-white border border-gray-300 rounded hover:border-gray-500 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">OpenAI Docs</span>
                          <AiIcon name="external" size={16} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">API reference, guides, best practices</p>
                      </a>
                      <a href="#" className="block p-3 bg-white border border-gray-300 rounded hover:border-gray-500 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">Anthropic Docs</span>
                          <AiIcon name="external" size={16} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Claude API, constitutional AI</p>
                      </a>
                      <a href="#" className="block p-3 bg-white border border-gray-300 rounded hover:border-gray-500 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">Google AI Docs</span>
                          <AiIcon name="external" size={16} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Gemini, PaLM, Vertex AI</p>
                      </a>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800">O'QUV PLATFORMALAR</h4>
                    <div className="space-y-2">
                      <a href="#" className="block p-3 bg-white border border-gray-300 rounded hover:border-gray-500 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">Fast.ai</span>
                          <AiIcon name="external" size={16} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Practical deep learning courses</p>
                      </a>
                      <a href="#" className="block p-3 bg-white border border-gray-300 rounded hover:border-gray-500 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">DeepLearning.AI</span>
                          <AiIcon name="external" size={16} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Andrew Ng's courses</p>
                      </a>
                      <a href="#" className="block p-3 bg-white border border-gray-300 rounded hover:border-gray-500 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">Hugging Face Course</span>
                          <AiIcon name="external" size={16} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">NLP va transformers</p>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ExpandableCard
              term="LEARNING PATH"
              definition="AI/ML ni o'rganish uchun tavsiya etilgan yo'l"
              icon={<AiIcon name="road" size={24} />}
              examples={[
                "1. Python asoslari (2-4 hafta)",
                "2. ML fundamentals (1-2 oy)",
                "3. Deep Learning basics (1-2 oy)",
                "4. LLMs va Prompting (2-4 hafta)",
                "5. Production deployment (ongoing)"
              ]}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-2 border-black">
                <div className="bg-gray-700 p-3">
                  <h4 className="text-white font-bold">KITOBLAR</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="space-y-3 text-sm">
                    <li>
                      <strong>Pattern Recognition and ML</strong>
                      <p className="text-xs text-gray-600">Christopher Bishop</p>
                    </li>
                    <li>
                      <strong>Deep Learning</strong>
                      <p className="text-xs text-gray-600">Ian Goodfellow</p>
                    </li>
                    <li>
                      <strong>The Alignment Problem</strong>
                      <p className="text-xs text-gray-600">Brian Christian</p>
                    </li>
                    <li>
                      <strong>Designing ML Systems</strong>
                      <p className="text-xs text-gray-600">Chip Huyen</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-black">
                <div className="bg-gray-700 p-3">
                  <h4 className="text-white font-bold">YOUTUBE KANALLAR</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="space-y-3 text-sm">
                    <li>
                      <strong>Two Minute Papers</strong>
                      <p className="text-xs text-gray-600">Eng so'nggi tadqiqotlar</p>
                    </li>
                    <li>
                      <strong>Yannic Kilcher</strong>
                      <p className="text-xs text-gray-600">Paper reviews</p>
                    </li>
                    <li>
                      <strong>3Blue1Brown</strong>
                      <p className="text-xs text-gray-600">Math visualizations</p>
                    </li>
                    <li>
                      <strong>Andrej Karpathy</strong>
                      <p className="text-xs text-gray-600">Neural networks from scratch</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-2 border-gray-600 bg-gray-50">
              <AiIcon name="rocket" size={20} className="text-black" />
              <AlertDescription className="text-gray-800">
                <strong>Pro tip:</strong> Dokumentatsiyani o'qish o'rniga amaliy loyihalar qiling. 
                "Learning by doing" eng samarali usul. Har kuni 30 daqiqa amaliyot ko'proq samara beradi 3 soat nazariyadan!
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const hamjamiyat: SectionContent = {
  title: "HAMJAMIYAT VA TARMOQLAR",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                AI hamjamiyati - bu o'zaro yordam, bilim almashish va hamkorlik markazi. 
                To'g'ri hamjamiyatda bo'lish sizning o'sishingizni tezlashtiradi.
              </p>
              <p className="text-lg leading-relaxed">
                Bu yerda eng faol va foydali AI hamjamiyatlari, ularning xususiyatlari va 
                qo'shilish usullari haqida ma'lumot berilgan.
              </p>
            </div>

            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <AiIcon name="community" size={24} />
                  AI HAMJAMIYATLAR
                </h3>
                
                <div className="space-y-4">
                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl"></div>
                      <div>
                        <h4 className="font-bold text-gray-800">DISCORD SERVERS</h4>
                        <p className="text-sm text-gray-600">Real-time suhbat va yordam</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-gray-50 rounded">OpenAI Discord</div>
                      <div className="p-2 bg-gray-50 rounded">Hugging Face</div>
                      <div className="p-2 bg-gray-50 rounded">AI Developers</div>
                      <div className="p-2 bg-gray-50 rounded">LocalLLama</div>
                    </div>
                  </div>

                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl"></div>
                      <div>
                        <h4 className="font-bold text-gray-800">TELEGRAM GROUPS</h4>
                        <p className="text-sm text-gray-600">O'zbek tilida AI muhokamalar</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-gray-50 rounded">UzDev AI</div>
                      <div className="p-2 bg-gray-50 rounded">AI Uzbekistan</div>
                      <div className="p-2 bg-gray-50 rounded">ML Engineers UZ</div>
                      <div className="p-2 bg-gray-50 rounded">Data Science UZ</div>
                    </div>
                  </div>

                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl"></div>
                      <div>
                        <h4 className="font-bold text-gray-800">X (TWITTER)</h4>
                        <p className="text-sm text-gray-600">Eng so'nggi yangiliklar va trendlar</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-gray-50 rounded">@AnthropicAI</div>
                      <div className="p-2 bg-gray-50 rounded">@OpenAI</div>
                      <div className="p-2 bg-gray-50 rounded">@GoodFellowIan</div>
                      <div className="p-2 bg-gray-50 rounded">@karpathy</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <ExpandableCard
                term="NETWORKING TIPS"
                definition="Hamjamiyatda faol bo'lish va tarmoq yaratish"
                icon={<AiIcon name="network" size={24} />}
                examples={[
                  "Savol berishdan qo'rkmang",
                  "O'z tajribangizni ulashing",
                  "Open source loyihalarga hissa qo'shing",
                  "Hackathon va meetup'larda qatnashing"
                ]}
              />

              <ExpandableCard
                term="CONTRIBUTION"
                definition="Hamjamiyatga qanday hissa qo'shish mumkin"
                icon={<AiIcon name="contribute" size={24} />}
                examples={[
                  "Blog yozish va tajriba ulashish",
                  "Open source kutubxonalar yaratish",
                  "Boshqalarga yordam berish",
                  "Dokumentatsiya yaxshilash"
                ]}
              />
            </div>

            <Card className="border-2 border-black">
              <div className="bg-black p-4">
                <h3 className="text-white font-bold uppercase">KONFERENSIYALAR VA MEETUP'LAR</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2"></div>
                    <h4 className="font-bold mb-2">GLOBAL</h4>
                    <ul className="text-sm space-y-1">
                      <li>• NeurIPS</li>
                      <li>• ICML</li>
                      <li>• CVPR</li>
                      <li>• ACL</li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2"></div>
                    <h4 className="font-bold mb-2">INDUSTRY</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Google I/O</li>
                      <li>• OpenAI DevDay</li>
                      <li>• AWS re:Invent</li>
                      <li>• Microsoft Build</li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2"></div>
                    <h4 className="font-bold mb-2">LOCAL</h4>
                    <ul className="text-sm space-y-1">
                      <li>• IT Park Events</li>
                      <li>• GDG Tashkent</li>
                      <li>• AI Meetup UZ</li>
                      <li>• Tech Talks</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-2 border-gray-600 bg-gray-50">
              <AiIcon name="users" size={20} className="text-black" />
              <AlertDescription className="text-gray-800">
                <strong>Eslatma:</strong> Hamjamiyatda hurmat va professional munosabat muhim. 
                Boshqalarga yordam bering va o'z navbatida yordam so'rashdan tortinmang!
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const vositalarAPI: SectionContent = {
  title: "VOSITALAR VA API'LAR",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                AI loyihalarni yaratish uchun turli vositalar va API'lar mavjud. To'g'ri vositani 
                tanlash loyihangiz muvaffaqiyatiga katta ta'sir ko'rsatadi.
              </p>
              <p className="text-lg leading-relaxed">
                Bu bo'limda eng yaxshi AI vositalar, API'lar, ularning narxlari va 
                qo'llanish sohalari haqida ma'lumot berilgan.
              </p>
            </div>

            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-center">AI DEVELOPMENT TOOLS</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800">CODE ASSISTANTS</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-white border border-gray-300 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-sm">GitHub Copilot</h5>
                          <Badge className="text-xs">$10/mo</Badge>
                        </div>
                        <p className="text-xs text-gray-600">AI pair programming</p>
                        <div className="mt-2 flex gap-1">
                          <div className="w-full h-1 bg-gray-600 rounded"></div>
                          <div className="w-full h-1 bg-gray-600 rounded"></div>
                          <div className="w-full h-1 bg-gray-600 rounded"></div>
                          <div className="w-full h-1 bg-gray-600 rounded"></div>
                          <div className="w-full h-1 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white border border-gray-300 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-sm">Cursor</h5>
                          <Badge className="text-xs">$20/mo</Badge>
                        </div>
                        <p className="text-xs text-gray-600">AI-first code editor</p>
                        <div className="mt-2 flex gap-1">
                          <div className="w-full h-1 bg-gray-600 rounded"></div>
                          <div className="w-full h-1 bg-gray-600 rounded"></div>
                          <div className="w-full h-1 bg-gray-600 rounded"></div>
                          <div className="w-full h-1 bg-gray-600 rounded"></div>
                          <div className="w-full h-1 bg-gray-600 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800">API PROVIDERS</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-white border border-gray-300 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-sm">OpenAI API</h5>
                          <Badge className="text-xs">Pay-as-you-go</Badge>
                        </div>
                        <p className="text-xs text-gray-600">GPT-4, DALL-E, Whisper</p>
                        <div className="mt-2 text-xs">
                          <span className="text-gray-500">Starting:</span> $0.0005/1K tokens
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white border border-gray-300 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-sm">Anthropic API</h5>
                          <Badge className="text-xs">Pay-as-you-go</Badge>
                        </div>
                        <p className="text-xs text-gray-600">Claude 3 family</p>
                        <div className="mt-2 text-xs">
                          <span className="text-gray-500">Starting:</span> $0.0025/1K tokens
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CodeExample
              title="API INTEGRATION"
              badExample={`# API kalitni kodga yozish
import openai

# XAVFLI! Hech qachon bunday qilmang
openai.api_key = "sk-proj-abc123def456..."`}
              goodExample={`# Environment variables ishlatish
import os
from dotenv import load_dotenv
import openai

# .env fayldan yuklash
load_dotenv()

# Xavfsiz usul
openai.api_key = os.getenv("OPENAI_API_KEY")

# Yoki configuration class
class Config:
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        
        if not self.openai_key:
            raise ValueError("OPENAI_API_KEY not set!")
            
config = Config()`}
              explanation="API kalitlarni hech qachon kodga yozmang. Har doim environment variables ishlating."
            />

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 border-black">
                <div className="bg-gray-700 p-3">
                  <h4 className="text-white font-bold text-sm text-center">PROTOTYPING</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <AiIcon name="tool" size={14} className="mt-0.5" />
                      <span><strong>Colab:</strong> Free GPU</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="tool" size={14} className="mt-0.5" />
                      <span><strong>Replit:</strong> Online IDE</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="tool" size={14} className="mt-0.5" />
                      <span><strong>Vercel:</strong> Quick deploy</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-black">
                <div className="bg-gray-700 p-3">
                  <h4 className="text-white font-bold text-sm text-center">TESTING</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <AiIcon name="test" size={14} className="mt-0.5" />
                      <span><strong>Postman:</strong> API testing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="test" size={14} className="mt-0.5" />
                      <span><strong>Poe:</strong> LLM testing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="test" size={14} className="mt-0.5" />
                      <span><strong>LangSmith:</strong> Tracing</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-black">
                <div className="bg-gray-700 p-3">
                  <h4 className="text-white font-bold text-sm text-center">PRODUCTION</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <AiIcon name="cloud" size={14} className="mt-0.5" />
                      <span><strong>Railway:</strong> Easy deploy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="cloud" size={14} className="mt-0.5" />
                      <span><strong>Modal:</strong> Serverless</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="cloud" size={14} className="mt-0.5" />
                      <span><strong>Supabase:</strong> Backend</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-2 border-gray-600 bg-gray-50">
              <AiIcon name="warning" size={20} className="text-gray-700" />
              <AlertDescription className="text-gray-800">
                <strong>Xavfsizlik:</strong> API kalitlarini GitHub'ga push qilmang! .gitignore fayliga 
                .env ni qo'shing va har doim environment variables ishlating.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const ozbekistonAI: SectionContent = {
  title: "O'ZBEKISTONDA AI",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                O'zbekistonda AI sohasida qiziqarli o'zgarishlar yuz bermoqda. Davlat dasturlari, 
                xususiy sektor tashabbusalari va ta'lim muassasalarining sa'y-harakatlari bu sohani 
                jadal rivojlantirmoqda.
              </p>
              <p className="text-lg leading-relaxed">
                Bu bo'limda O'zbekistondagi AI ekosistemasi, imkoniyatlar va kelajak 
                istiqbollari haqida ma'lumot berilgan.
              </p>
            </div>

            <Card className="border-2 border-black bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span className="text-2xl"></span>
                  O'ZBEKISTON AI EKOSISTEMASI
                </h3>
                
                <div className="space-y-4">
                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-2">DAVLAT TASHABBUSLARI</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded">
                        <h5 className="font-semibold text-sm mb-1">IT Park</h5>
                        <p className="text-xs">Rezidentlar uchun soliq imtiyozlari</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <h5 className="font-semibold text-sm mb-1">Digital Uzbekistan 2030</h5>
                        <p className="text-xs">Raqamlashtirish strategiyasi</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <h5 className="font-semibold text-sm mb-1">AI Research Centers</h5>
                        <p className="text-xs">Universitetlarda tadqiqot markazlari</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <h5 className="font-semibold text-sm mb-1">Startup Grants</h5>
                        <p className="text-xs">500 mln so'mgacha grantlar</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-2">KOMPANIYALAR VA STARTUPLAR</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-semibold text-sm">UZINFOCOM</span>
                        <Badge className="text-xs">Gov Tech</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-semibold text-sm">Payme</span>
                        <Badge className="text-xs">FinTech AI</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-semibold text-sm">Uzum</span>
                        <Badge className="text-xs">E-commerce AI</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-semibold text-sm">Local AI Startups</span>
                        <Badge className="text-xs">50+ companies</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-gray-600 bg-white rounded-lg p-4">
                    <h4 className="font-bold text-gray-800 mb-2">TA'LIM VA KADRLAR</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded text-center">
                        <div className="text-2xl mb-1"></div>
                        <h5 className="font-semibold text-sm">TATU</h5>
                        <p className="text-xs">AI fakulteti</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded text-center">
                        <div className="text-2xl mb-1"></div>
                        <h5 className="font-semibold text-sm">INHA</h5>
                        <p className="text-xs">ML kurslari</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded text-center">
                        <div className="text-2xl mb-1"></div>
                        <h5 className="font-semibold text-sm">IT Academy</h5>
                        <p className="text-xs">AI bootcamps</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded text-center">
                        <div className="text-2xl mb-1"></div>
                        <h5 className="font-semibold text-sm">Online</h5>
                        <p className="text-xs">MOOC platformalar</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <ExpandableCard
                term="IMKONIYATLAR"
                definition="O'zbekistonda AI sohasidagi imkoniyatlar"
                icon={<AiIcon name="opportunity" size={24} />}
                examples={[
                  "Arzon IT xizmatlar eksporti",
                  "Katta ichki bozor (35+ mln)",
                  "Yosh aholi (60% < 30 yosh)",
                  "Davlat qo'llab-quvvatlashi"
                ]}
              />

              <ExpandableCard
                term="MUAMMOLAR"
                definition="Hal qilinishi kerak bo'lgan masalalar"
                icon={<AiIcon name="challenge" size={24} />}
                examples={[
                  "Malakali kadrlar yetishmasligi",
                  "Infrastructure cheklovlari",
                  "Venture capital kamligi",
                  "Til resurslari yetishmasligi"
                ]}
              />
            </div>

            <Card className="border-2 border-gray-600 bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  O'ZBEK TILI UCHUN AI RESURSLAR
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white border border-gray-300 rounded">
                    <h5 className="font-semibold mb-2">Speech Recognition</h5>
                    <p className="text-sm">Google Speech-to-Text o'zbek tilini qo'llab-quvvatlaydi</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-300 rounded">
                    <h5 className="font-semibold mb-2">NLP Models</h5>
                    <p className="text-sm">UzBERT, multilingual models (mBERT, XLM-R)</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-300 rounded">
                    <h5 className="font-semibold mb-2">Datasets</h5>
                    <p className="text-sm">UzWiki corpus, parallel corpora, news datasets</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-300 rounded">
                    <h5 className="font-semibold mb-2">Tools</h5>
                    <p className="text-sm">UzMorphAnalyser, spell checkers, transliterators</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-2 border-gray-600 bg-gray-50">
              <AiIcon name="rocket" size={20} className="text-black" />
              <AlertDescription className="text-gray-800">
                <strong>Kelajak:</strong> O'zbekiston 2030 yilga kelib regional AI hub bo'lish 
                imkoniyatiga ega. Buning uchun ta'lim, infratuzilma va ekosistemaga investitsiyalar zarur!
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

// Remove placeholder export since we now have all content