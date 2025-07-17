import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Ommaviy Oferta - P57.uz";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black">Ommaviy Oferta</CardTitle>
          <p className="text-muted-foreground text-lg">
            P57.uz platformasi foydalanish shartlari
          </p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-xs leading-relaxed space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-none p-4 mb-6">
            <p className="text-blue-800 font-medium text-sm">
              <strong>Xush kelibsiz!</strong> Ushbu shartlar P57.uz platformasida xavfsiz va qulay ta'lim muhitini ta'minlash uchun yaratilgan. 
              Platformadan foydalanish orqali siz quyidagi shartlarni qabul qilasiz.
            </p>
          </div>

          <section>
            <h2 className="text-lg font-bold mb-3 text-foreground">1. Umumiy qoidalar va rozilik</h2>
            <div className="space-y-2">
              <p><strong>1.1.</strong> Ushbu Ommaviy Oferta (keyingi o'rinlarda "Oferta") P57.uz veb-saytida (keyingi o'rinlarda "Platforma") xizmatlardan foydalanish shartlarini belgilaydi.</p>
              
              <p><strong>1.2.</strong> Platformadan foydalanish, ro'yxatdan o'tish yoki platformaga kirish orqali siz:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Ushbu Oferta shartlarini to'liq va so'zsiz qabul qilasiz</li>
                <li>Qonuniy jihatdan majburiy shartnoma tuzayotganingizni tasdiqlaysiz</li>
                <li>18 yoshdan oshganingizni va huquqiy qobiliyatingiz borligini tasdiqlovchi kafolat berasiz</li>
              </ul>
              
              <p><strong>1.3.</strong> Agar siz ushbu shartlarning biron bir qismiga rozi bo'lmasangiz, platformadan foydalanishni darhol to'xtating.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-foreground">2. Ta'riflar va tushunchalar</h2>
            <div className="space-y-2">
              <p><strong>2.1. Platforma</strong> - P57.uz veb-sayti va uning barcha xizmatlari</p>
              <p><strong>2.2. Foydalanuvchi</strong> - platformadan foydalanuvchi shaxs</p>
              <p><strong>2.3. Mazmun</strong> - platformadagi barcha ma'lumotlar, protokollar, matnlar, rasmlar va boshqa materiallar</p>
              <p><strong>2.4. Xizmatlar</strong> - platformada taqdim etiladigan barcha funksiyalar va imkoniyatlar</p>
              <p><strong>2.5. Kompaniya</strong> - YATT XURSHID MAROZIQOV tashkil etgan korxona</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-foreground">3. Platformaning maqsadi va xizmatlar</h2>
            <div className="space-y-2">
              <p><strong>3.1.</strong> P57.uz - bu AI prompting protokollarini o'rganish va amaliyotda qo'llash uchun mo'ljallangan ta'lim platformasidir.</p>
              
              <p><strong>3.2.</strong> Platforma quyidagi xizmatlarni taqdim etadi:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>AI prompting protokollarini o'rganish</li>
                <li>Interaktiv mashqlar va amaliyotlar</li>
                <li>AI baholash tizimi orqali natijalarni tahlil qilish</li>
                <li>Premium obuna xizmatlari</li>
                <li>Qo'shimcha ta'lim materiallari</li>
              </ul>
              
              <p><strong>3.3.</strong> Barcha xizmatlar "BORICHA" ("AS IS") asosida taqdim etiladi va kompaniya ularning uzluksizligi, aniqligi yoki samaradorligiga kafolat bermaydi.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-foreground">4. Obuna va to'lov shartlari</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-base mb-2">4.1 Bepul tarif</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Har bir protokolni 1 marta baholash imkoniyati</li>
                  <li>Asosiy ta'lim materiallariga cheklangan kirish</li>
                  <li>Reklama ko'rsatilishi mumkin</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-base mb-2">4.2 Premium tarif</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Har bir protokolni 5 martagacha baholash</li>
                  <li>Kengaytirilgan AI tahlil va hisobotlar</li>
                  <li>Premium prompting protokollari</li>
                  <li>Ekskluziv ta'lim materiallari</li>
                  <li>Ustuvor texnik yordam</li>
                  <li>Reklamasiz tajriba</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-base mb-2">4.3 To'lov shartlari va siyosatlari</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>BIR MARTALIK TO'LOV:</strong> Premium xizmat uchun faqat bir marta to'lov qilinadi</li>
                  <li>To'lovlar faqat Atmos to'lov tizimi orqali qabul qilinadi</li>
                  <li><strong>Qaytarish siyosati:</strong> To'lovlar texnik muammolar yuzaga kelgan hollarda qaytariladi</li>
                  <li>Qaytarish so'rovi 7 kun ichida yuborilishi kerak</li>
                  <li>Yangi xizmatlar narxi va shartlari faqat kompaniya qaroriga bog'liq</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-foreground">5. Intellektual mulk huquqlari</h2>
            <div className="space-y-2">
              <p><strong>5.1. Mualliflik huquqi:</strong> Platformadagi barcha mazmun, protokollar va materiallar mualliflik huquqi bilan himoyalangan.</p>
              
              <p><strong>5.2. Foydalanish ruxsati:</strong> Foydalanuvchiga shaxsiy va ta'lim maqsadlarida foydalanish uchun ruxsat beriladi.</p>
              
              <p><strong>5.3. Cheklovlar:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Har qanday shaklda nusxalash, ko'chirish, tarqatish</li>
                <li>Tijorat maqsadlarda foydalanish</li>
                <li>O'zgartirish, qayta ishlash yoki moslashtirish</li>
                <li>Teskari muhandislik (reverse engineering)</li>
                <li>Boshqa platformalarda qayta nashr etish</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-foreground">6. Javobgarlik chegaralari va istisnolik</h2>
            <div className="space-y-2">
              <p><strong>6.1. Javobgarlik chegaralari:</strong> Platforma "boricha" asosida taqdim etiladi va quyidagi vaziyatlarda javobgarlik cheklangan:</p>
              
              <ul className="list-disc pl-6 space-y-1">
                <li>Xizmatda uzilishlar, xatolar yoki nosozliklar</li>
                <li>Ma'lumotlarning yo'qolishi yoki buzilishi</li>
                <li>Foydalanuvchi harakatlari natijasida yuzaga kelgan zararlar</li>
                <li>Uchinchi tomon xizmatlari (to'lov tizimlari, internet provayderlar)</li>
                <li>AI baholash natijalarining noto'g'riligi</li>
                <li>Texnik muammolar va server ishlamay qolishi</li>
                <li>Kiber hujumlar yoki ma'lumotlar buzilishi</li>
                <li>Biznes yo'qotishlari, foyda kaybı yoki bilvosita zararlar</li>
              </ul>
              
              <p><strong>6.2. MAKSIMAL JAVOBGARLIK:</strong> Har qanday holatda ham kompaniyaning umumiy javobgarligi foydalanuvchi tomonidan to'langan miqdordan oshmaydi.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-foreground">7. AI baholash tizimi</h2>
            <div className="space-y-2">
              <p><strong>7.1.</strong> AI baholash <strong>bonus xususiyat</strong> hisoblanadi va uni bekor qilish kafolati mavjud</p>
              <p><strong>7.2.</strong> Kompaniya bu xizmatni <strong>istalgan vaqtda va sababsiz</strong> to'xtatish, o'zgartirish yoki yaxshilash huquqiga ega</p>
              <p><strong>7.3.</strong> Baholash natijalarining aniqligi <strong>kafolatlanmaydi</strong> va faqat ta'lim maqsadlarida ishlatiladi</p>
              <p><strong>7.4.</strong> AI natijalariga asoslanib qabul qilingan qarorlar uchun kompaniya javobgar emas</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-foreground">8. Majburiy arbitraj va nizolarni hal qilish</h2>
            <div className="space-y-2">
              <p><strong>8.1. MAJBURIY ARBITRAJ:</strong> Barcha nizolar O'zbekiston Respublikasi Arbitraj sudida hal qilinadi.</p>
              <p><strong>8.2. SUDGACHA TARTIB:</strong> Nizolarni sudga berish dan oldin majburiy ravishda muzokaralar olib borilishi kerak (30 kun).</p>
              <p><strong>8.3. YURISDIKTSIYA:</strong> Toshkent shahar sudlari eksklyuziv yurisdiktsiyaga ega.</p>
              <p><strong>8.4. QO'LLANILADIGAN QONUN:</strong> Faqat O'zbekiston Respublikasi qonunlari qo'llaniladi.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-foreground">9. Favqulodda vaziyatlar (Force Majeure)</h2>
            <div className="space-y-2">
              <p><strong>9.1.</strong> Kompaniya quyidagi vaziyatlarda javobgarlikdan ozod etiladi:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Tabiiy ofatlar va meteorologik hodisalar</li>
                <li>Urush, teraktlar, fuqarolik tartibsizliklari</li>
                <li>Hukumat qarori va qonun o'zgarishlari</li>
                <li>Internet infrastrukturasining ishlamay qolishi</li>
                <li>Kiber hujumlar va hakerlık</li>
                <li>COVID-19 va boshqa pandemiyalar</li>
                <li>Ommaviy texnik nosozliklar</li>
              </ul>
              <p><strong>9.2.</strong> Bunday vaziyatlarda xizmat to'xtatilishi yoki cheklanishi mumkin va kompensatsiya to'lanmaydi.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-foreground">10. Oferta o'zgarishlari</h2>
            <div className="space-y-2">
              <p><strong>10.1. Shartlarni yangilash:</strong> Kompaniya xizmatni yaxshilash maqsadida ushbu shartlarni yangilashi mumkin.</p>
              <p><strong>10.2. XABARDORLIK:</strong> O'zgarishlar platformada e'lon qilinadi va u o'sha paytdan kuchga kiradi.</p>
              <p><strong>10.3. DAVOM ETGAN FOYDALANISH:</strong> Oferta o'zgarganidan keyin platformadan foydalanish yangi shartlarni qabul qilish deb hisoblanadi.</p>
            </div>
          </section>

          <Separator className="my-6" />

          <div className="bg-gray-50 p-4 rounded-none space-y-2">
            <p className="font-semibold text-sm">Aloqa ma'lumotlari:</p>
            <ul className="space-y-1">
              <li><strong>Huquqiy murojaatlar:</strong> legal@p57.uz</li>
              <li><strong>Qo'llab-quvvatlash:</strong> support@p57.uz</li>
              <li><strong>Telegram:</strong> @protokol57bot</li>
              <li><strong>Veb-sayt:</strong> https://p57.uz</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-none p-4">
            <p className="text-gray-800 font-medium text-sm">
              <strong>Eslatma:</strong> Ushbu shartlarni diqqat bilan o'qib chiqing. 
              Savollaringiz bo'lsa, support@p57.uz orqali biz bilan bog'laning.
            </p>
          </div>

          <div className="text-center space-y-2 pt-4 border-t">
            <p><strong>Oferta kuchga kirish sanasi:</strong> 2024-yil 29-dekabr</p>
            <p><strong>Oxirgi yangilanish:</strong> 2024-yil 29-dekabr</p>
            <p><strong>Platforma egasi:</strong> YATT XURSHID MAROZIQOV</p>
            <p><strong>Platforma nomi:</strong> P57.uz</p>
            <p className="text-red-600 font-medium">
              <strong>Huquqiy status:</strong> Ushbu hujjat yuridik jihatdan majburiy shartnoma hisoblanadi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}