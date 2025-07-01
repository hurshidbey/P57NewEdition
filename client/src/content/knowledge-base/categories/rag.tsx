import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AiIcon } from "@/components/ai-icon";
import { ExpandableCard } from "../components/ExpandableCard";
import { CodeExample } from "../components/CodeExample";
import type { SectionContent } from "../components/types";

export const ragAsoslari: SectionContent = {
  title: "RAG NIMA?",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                RAG (Retrieval-Augmented Generation) - bu AI modellarni tashqi ma'lumot manbalari bilan 
                boyitish texnologiyasi. Bu orqali AI real vaqtda yangi ma'lumotlarni olish va 
                aniqroq javoblar berish imkoniyatiga ega bo'ladi.
              </p>
              <p className="text-lg leading-relaxed">
                RAG yordamida AI modellar o'z treninig ma'lumotlaridan tashqaridagi bilimlarni 
                ishlatishi mumkin, bu esa ularni ancha kuchli va ishonchli qiladi.
              </p>
            </div>

            <Card className="border-2 border-black bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 text-center">RAG ARXITEKTURASI</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <div className="flex-1">
                      <h4 className="font-bold">SAVOL</h4>
                      <p className="text-sm text-gray-700">Foydalanuvchi savolini qabul qilish</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <div className="flex-1">
                      <h4 className="font-bold">QIDIRUV</h4>
                      <p className="text-sm text-gray-700">Ma'lumotlar bazasidan tegishli hujjatlarni topish</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                    <div className="flex-1">
                      <h4 className="font-bold">BIRLASHMA</h4>
                      <p className="text-sm text-gray-700">Savol va topilgan ma'lumotlarni birlashtirish</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                    <div className="flex-1">
                      <h4 className="font-bold">GENERATSIYA</h4>
                      <p className="text-sm text-gray-700">AI model orqali to'liq javob yaratish</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-2 border-green-600">
                <div className="bg-green-600 p-3">
                  <h4 className="text-white font-bold">RAG AFZALLIKLARI</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} className="mt-0.5 text-green-600" />
                      <span>Doim yangi ma'lumotlar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} className="mt-0.5 text-green-600" />
                      <span>Manbaga asoslangan javoblar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} className="mt-0.5 text-green-600" />
                      <span>Kamroq gallyutsinatsiya</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="checked" size={16} className="mt-0.5 text-green-600" />
                      <span>Domain-specific bilimlar</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-600">
                <div className="bg-orange-600 p-3">
                  <h4 className="text-white font-bold">QACHON ISHLATISH?</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>Kompaniya ichki hujjatlari</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>Yangiliklar va real vaqt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>Ilmiy tadqiqotlar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      <span>Qonunchilik bazasi</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <CodeExample
              title="RAG VS ODDIY AI"
              badExample={`# Oddiy AI (bilimi cheklangan)
user: "2024-yil O'zbekistonda inflyatsiya qancha?"
ai: "Kechirasiz, mening ma'lumotlarim 2023-yilgacha. 
     Aniq ma'lumot uchun rasmiy manbalarni tekshiring."`}
              goodExample={`# RAG bilan boyitilgan AI
user: "2024-yil O'zbekistonda inflyatsiya qancha?"
rag_ai: 
  [Ma'lumotlar bazasidan qidirish...]
  [O'zbekiston Markaziy Banki ma'lumotlari topildi]
  
  "O'zbekiston Markaziy Banki ma'lumotlariga ko'ra, 
   2024-yil oktabr oyida yillik inflyatsiya 9.4% ni tashkil etdi.
   Manba: cbu.uz, 2024-yil 5-noyabr"`}
              explanation="RAG tizimi real vaqtda yangi ma'lumotlarni topib, manbaga asoslangan aniq javob beradi."
            />

            <Alert className="border-2 border-blue-500 bg-blue-50">
              <AiIcon name="info" size={20} className="text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Muhim:</strong> RAG tizimi faqat ma'lumotlar bazasidagi sifatga bog'liq. 
                Shuning uchun ma'lumotlarni doimiy yangilab turish zarur.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const vektorQidiruv: SectionContent = {
  title: "VEKTOR QIDIRUV",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Vektor qidiruv - bu matnlarni matematik vektorlarga aylantirib, ularning ma'nosiga 
                qarab o'xshashligini topish texnologiyasi. Bu RAG tizimlarining asosiy komponenti.
              </p>
              <p className="text-lg leading-relaxed">
                An'anaviy kalit so'z qidiruvdan farqli o'laroq, vektor qidiruv semantik (ma'no) 
                o'xshashlikni tushunadi va aniqroq natijalar beradi.
              </p>
            </div>

            <ExpandableCard
              term="EMBEDDING"
              definition="Matnni raqamli vektor shaklida ifodalash"
              icon={<AiIcon name="grid" size={24} />}
              examples={[
                "\"mushuk\" → [0.2, -0.5, 0.8, ...]",
                "\"pishiq\" → [0.21, -0.48, 0.79, ...]",
                "O'xshash ma'noli so'zlar yaqin vektorlarga ega"
              ]}
            />

            <Card className="border-2 border-black">
              <div className="bg-black p-4">
                <h3 className="text-white font-bold uppercase">VEKTOR QIDIRUV JARAYONI</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-bold mb-1">EMBEDDING YARATISH</h4>
                      <p className="text-sm text-gray-700">Barcha hujjatlarni vektorlarga aylantirish</p>
                      <div className="mt-2 p-3 bg-gray-100 rounded border border-gray-300">
                        <code className="text-xs">embeddings = model.encode(documents)</code>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-bold mb-1">VEKTOR BAZASIGA SAQLASH</h4>
                      <p className="text-sm text-gray-700">Vektorlarni maxsus bazaga yozish</p>
                      <div className="mt-2 p-3 bg-gray-100 rounded border border-gray-300">
                        <code className="text-xs">vector_db.add(embeddings, metadata)</code>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-bold mb-1">QIDIRUV AMALGA OSHIRISH</h4>
                      <p className="text-sm text-gray-700">Savol vektorini yaratib, eng yaqinlarini topish</p>
                      <div className="mt-2 p-3 bg-gray-100 rounded border border-gray-300">
                        <code className="text-xs">results = vector_db.search(query_embedding, k=5)</code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 border-black">
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2 text-center">COSINE SIMILARITY</h4>
                  <div className="text-center text-3xl my-3">📐</div>
                  <p className="text-sm text-center">Vektorlar orasidagi burchakni o'lchash</p>
                  <p className="text-xs text-center mt-2 text-gray-600">Eng mashhur usul</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-black">
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2 text-center">EUCLIDEAN DISTANCE</h4>
                  <div className="text-center text-3xl my-3">📏</div>
                  <p className="text-sm text-center">To'g'ri chiziq masofasi</p>
                  <p className="text-xs text-center mt-2 text-gray-600">Oddiy va tez</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-black">
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2 text-center">DOT PRODUCT</h4>
                  <div className="text-center text-3xl my-3">⚡</div>
                  <p className="text-sm text-center">Vektorlar ko'paytmasi</p>
                  <p className="text-xs text-center mt-2 text-gray-600">Eng tez usul</p>
                </CardContent>
              </Card>
            </div>

            <CodeExample
              title="VEKTOR QIDIRUV MISOLI"
              badExample={`# An'anaviy kalit so'z qidiruvi
search("mashina")
# Natijalar:
- "Mashina sotib oldim" ✓
- "Avtomobil haydash" ✗ (topilmadi)
- "Transport vositasi" ✗ (topilmadi)`}
              goodExample={`# Vektor qidiruv
vector_search("mashina")
# Natijalar:
- "Mashina sotib oldim" (0.98)
- "Avtomobil haydash" (0.89)
- "Transport vositasi" (0.82)
- "Yengil avtomashina" (0.80)`}
              explanation="Vektor qidiruv semantik o'xshashlikni tushunadi va sinonimlarni ham topadi."
            />

            <Alert className="border-2 border-purple-500 bg-purple-50">
              <AiIcon name="rocket" size={20} className="text-purple-600" />
              <AlertDescription className="text-purple-800">
                <strong>Maslahat:</strong> Embedding modeli tanlashda tilni hisobga oling. 
                O'zbek tili uchun multilingual modellar yaxshi ishlaydi.
              </AlertDescription>
            </Alert>
          </div>
        )
      }
    }
  ]
};

export const hybridSearch: SectionContent = {
  title: "HYBRID SEARCH",
  sections: [
    {
      type: 'custom',
      content: {
        render: () => (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed">
                Hybrid Search - bu an'anaviy kalit so'z qidiruvi (BM25) va zamonaviy vektor 
                qidiruvni birlashtirib, eng yaxshi natijalar olish texnologiyasi.
              </p>
              <p className="text-lg leading-relaxed">
                Bu yondashuv har ikki usulning kuchli tomonlaridan foydalanadi: aniq terminlar 
                uchun kalit so'z qidiruvi, semantik o'xshashlik uchun vektor qidiruv.
              </p>
            </div>

            <Card className="border-2 border-black bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 text-center">HYBRID SEARCH FORMULASI</h3>
                
                <div className="bg-white border-2 border-black p-4 rounded-lg font-mono text-center">
                  <p className="text-lg">
                    score = α × BM25_score + (1-α) × vector_score
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    α = 0.5 (balans koeffitsienti)
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-100 border-2 border-blue-600 p-4 rounded">
                    <h4 className="font-bold text-blue-800 mb-2">BM25 (Keyword)</h4>
                    <ul className="text-sm space-y-1">
                      <li>✓ Aniq terminlar</li>
                      <li>✓ Rare words</li>
                      <li>✓ Tez ishlaydi</li>
                      <li>✗ Semantikani tushunmaydi</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-100 border-2 border-purple-600 p-4 rounded">
                    <h4 className="font-bold text-purple-800 mb-2">Vector Search</h4>
                    <ul className="text-sm space-y-1">
                      <li>✓ Semantik o'xshashlik</li>
                      <li>✓ Sinonimlar</li>
                      <li>✓ Kontekstni tushunadi</li>
                      <li>✗ Sekinroq</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ExpandableCard
              term="RERANKING"
              definition="Qidiruv natijalarini qayta tartiblash va yaxshilash"
              icon={<AiIcon name="sort" size={24} />}
              examples={[
                "Cross-encoder modellari bilan reranking",
                "Machine learning asosida scoring",
                "User feedback orqali o'rganish",
                "Personalizatsiya qo'shish"
              ]}
            />

            <CodeExample
              title="HYBRID SEARCH IMPLEMENTATION"
              badExample={`# Faqat bitta usul
def search(query):
    # Yoki keyword
    return bm25_search(query)
    # Yoki vector
    return vector_search(query)`}
              goodExample={`# Hybrid yondashuv
def hybrid_search(query, alpha=0.5):
    # Ikkala usulda qidirish
    bm25_results = bm25_search(query)
    vector_results = vector_search(query)
    
    # Natijalarni birlashtirish
    combined = merge_results(
        bm25_results, 
        vector_results,
        alpha=alpha
    )
    
    # Reranking qilish
    return rerank(combined, query)`}
              explanation="Hybrid search ikkala usulning natijalarini oqilona birlashtiradi."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-2 border-black">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3">
                  <h4 className="text-white font-bold">QACHON HYBRID KERAK?</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <AiIcon name="target" size={16} className="mt-0.5 text-blue-600" />
                      <span>Aralash kontentlar (kod + matn)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="target" size={16} className="mt-0.5 text-blue-600" />
                      <span>Texnik dokumentatsiya</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="target" size={16} className="mt-0.5 text-blue-600" />
                      <span>Ko'p tilli kontentlar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="target" size={16} className="mt-0.5 text-blue-600" />
                      <span>E-commerce qidiruv</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-black">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 p-3">
                  <h4 className="text-white font-bold">OPTIMIZATSIYA</h4>
                </div>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <AiIcon name="lightning" size={16} className="mt-0.5 text-green-600" />
                      <span>Alpha parametrini sozlash</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="lightning" size={16} className="mt-0.5 text-green-600" />
                      <span>Index strategiyasi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="lightning" size={16} className="mt-0.5 text-green-600" />
                      <span>Caching natijalar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AiIcon name="lightning" size={16} className="mt-0.5 text-green-600" />
                      <span>Parallel qidiruv</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-2 border-orange-500 bg-orange-50">
              <AiIcon name="warning" size={20} className="text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Diqqat:</strong> Hybrid search konfiguratsiyasi use-case ga bog'liq. 
                A/B testing orqali optimal parametrlarni toping.
              </AlertDescription>
            </Alert>

            <Card className="border-2 border-black">
              <div className="bg-black p-4">
                <h3 className="text-white font-bold uppercase">REAL DUNYO MISOLI</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-2">📚 Texnik Dokumentatsiya Qidiruvi</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Savol: "Python'da async funksiya qanday ishlaydi?"
                    </p>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 border border-blue-300 rounded">
                        <span className="font-bold text-blue-700">BM25:</span> "async", "function", "Python" kalit so'zlari bo'yicha
                      </div>
                      <div className="p-3 bg-purple-50 border border-purple-300 rounded">
                        <span className="font-bold text-purple-700">Vector:</span> Asinxron dasturlash konseptlari bo'yicha
                      </div>
                      <div className="p-3 bg-green-50 border border-green-300 rounded">
                        <span className="font-bold text-green-700">Hybrid:</span> Eng relevant va to'liq natijalar
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
    }
  ]
};

// Remove placeholder export since we now have all content