/**
 * Migration script to parse new protocol content and transform it 
 * to match the enhanced database schema
 */

// New protocol content from user's selection
const newProtocolsContent = `
## BEGINNER LEVEL (1-20)

### Protokol 1: Aniq So'z Soni Belgilash
**Muammo:** "Nega ChatGPT ba'zan juda uzun yoki juda qisqa javob beradi? Men shunchaki oddiy javob xohlagan edim!"

**Nega bunday bo'ladi?** AI modellar sizning xohishingizni taxmin qilishga harakat qiladi. Aniq ko'rsatma bo'lmasa, o'zi "o'rtacha" deb o'ylagan hajmda javob beradi.

**Yechim:** Aniq so'z soni yoki hajm belgilang. "100 so'zda", "3 paragrafda", "5 ta bandda" kabi aniq ko'rsatmalar bering.

**Yomon misol:** "Menga marketing haqida aytib ber"
**Yaxshi misol:** "Marketing strategiyasini 150 so'zda, 3 ta asosiy nuqta bilan tushuntir"

### Protokol 2: Raqamlangan Ro'yxat Formati
**Muammo:** "ChatGPT bergan javobni o'qib chiqish qiyin, hamma narsa aralashib ketgan!"

**Nega bunday bo'ladi?** Matn formati ko'rsatilmasa, AI uzluksiz paragraflar shaklida yozadi, bu esa o'qishni qiyinlashtiradi.

**Yechim:** Doim raqamlangan yoki belgilangan ro'yxat formatini talab qiling.

**Yomon misol:** "Veb-sayt yaratish qadamlarini ayt"
**Yaxshi misol:** "Veb-sayt yaratishning 7 ta qadamini raqamlangan ro'yxat shaklida, har biri 1-2 gapda yoz"

### Protokol 3: Oddiy Til Talab Qilish
**Muammo:** "ChatGPT juda murakkab, ilmiy tilda gapiradi, tushunmayapman!"

**Nega bunday bo'ladi?** AI o'zining bilim bazasidan "professional" ko'rinishga harakat qilib, murakkab atamalarni ishlatadi.

**Yechim:** "10 yoshli bolaga tushuntirgandek", "oddiy so'zlar bilan", "kundalik tilda" kabi ko'rsatmalar qo'shing.

**Yomon misol:** "Blockchain texnologiyasini tushuntir"
**Yaxshi misol:** "Blockchain nima ekanini 12 yoshli bolaga tushuntirgandek, oddiy so'zlar bilan izohlang"

### Protokol 4: Aniq Misol Talab Qilish
**Muammo:** "ChatGPT faqat nazariya aytadi, amalda qanday qilishni tushunmayapman!"

**Nega bunday bo'ladi?** Ko'rsatma bo'lmasa, AI umumiy ma'lumot beradi, aniq misollar keltirmaydi.

**Yechim:** Har doim "real misol bilan", "amaliy misol", "aniq vaziyatda" kabi so'zlarni qo'shing.

**Yomon misol:** "Email marketing qanday ishlaydi?"
**Yaxshi misol:** "Email marketing qanday ishlashini kichik restoran misolida 3 ta aniq kampaniya bilan ko'rsat"

### Protokol 5: Maqsadli Auditoriya Belgilash
**Muammo:** "ChatGPT bergan javob mening holatimga to'g'ri kelmaydi!"

**Nega bunday bo'ladi?** Auditoriya aniqlanmasa, AI "o'rtacha" foydalanuvchi uchun javob beradi.

**Yechim:** Kim uchun javob kerakligini aniq ayting: "boshlang'ich", "professional", "5 yillik tajriba" kabi.

**Yomon misol:** "Python dasturlashni o'rgat"
**Yaxshi misol:** "Python dasturlashni hech qachon kod yozmagan 35 yoshli buxgalterga o'rgat"

### Protokol 6: Dalillar Bilan Asoslash

**Muammo:** "ChatGPT shunchaki o'z fikrini aytadi, ishonish qiyin! Qayerdan olganini bilmayman!"

**Nega bunday bo'ladi?** AI o'z bilim bazasidan javob beradi, lekin manba ko'rsatmasa, bu shunchaki fikr bo'lib qoladi.

**Yechim:** "Har bir da'voni dalil bilan", "statistika bilan", "ilmiy tadqiqot bilan" kabi so'zlarni qo'shing.

**Yomon misol:** "Onlayn biznes qanday o'sadi?"
**Yaxshi misol:** "Onlayn biznes o'sishining 5 ta strategiyasini ayt, har birini muvaffaqiyatli kompaniya misoli yoki statistika bilan asosla"

### Protokol 7: Paragraf Uzunligini Cheklash

**Muammo:** "ChatGPT shunday uzun paragraflar yozadiki, o'qib o'tirib, nimani o'qiganimni unutib qo'yaman!"

**Nega bunday bo'ladi?** Paragraf uzunligi belgilanmasa, AI bir paragrafga ko'p fikrlarni joylashtiradi.

**Yechim:** "Har bir paragraf maksimum 3-4 gap", "qisqa paragraflar" kabi cheklovlar qo'ying.

**Yomon misol:** "Marketing strategiyasi haqida yoz"
**Yaxshi misol:** "Marketing strategiyasi haqida yoz, har bir paragraf maksimum 3 gapdan iborat bo'lsin"

### Protokol 8: Temperatura Nazorati (Kreativlik Darajasi)

**Muammo:** "ChatGPT ba'zan juda g'alati, ba'zan juda zerikarli javoblar beradi!"

**Nega bunday bo'ladi?** AI ning kreativlik darajasi vazifaga mos kelmayapti - faktlar uchun juda kreativ, ijod uchun juda qattiq.

**Yechim:** "Faktlarga asoslangan", "konservativ" yoki "kreativ", "noodatiy" kabi yo'nalish bering.

**Yomon misol:** "Biznes g'oyalar ber"
**Yaxshi misol:** "5 ta noodatiy, kreativ biznes g'oya ber, har biri hech kim sinab ko'rmagan bo'lsin"

### Protokol 9: Ikki Yoki Ko'p Soha Bilan Tahlil

**Muammo:** "ChatGPT faqat bitta tomondan ko'radi, boshqa imkoniyatlarni ko'rsatmaydi!"

**Nega bunday bo'ladi?** Aniq so'ralmasa, AI eng tanish bo'lgan bir sohadan javob beradi.

**Yechim:** Ikki yoki undan ko'p nuqtai nazarni birlashtiring: "texnik VA iqtisodiy", "psixologik VA biznes" kabi.

**Yomon misol:** "Bu muammoni qanday hal qilish mumkin?"
**Yaxshi misol:** "Bu muammoni avval texnologik, keyin psixologik, oxirida moliyaviy tomondan tahlil qil"

### Protokol 10: Keraksiz Mavzularni Taqiqlash

**Muammo:** "ChatGPT doim etik masalalar haqida gapiradi, menga faqat texnik yechim kerak edi!"

**Nega bunday bo'ladi?** AI har tomonlama bo'lishga harakat qiladi va ortiqcha ma'lumot beradi.

**Yechim:** "...haqida gapirma", "faqat ... tomoniga e'tibor ber" kabi cheklovlar qo'ying.

**Yomon misol:** "AI texnologiyasi qanday ishlaydi?"
**Yaxshi misol:** "AI texnologiyasi qanday ishlashini tushuntir, etik va falsafiy masalalarga to'xtalma, faqat texnik jarayonlar"

### Protokol 11: Manba Formatini Belgilash

**Muammo:** "ChatGPT manbalarni shunday ko'rsatadiki, ularni tekshirib bo'lmaydi!"

**Nega bunday bo'ladi?** Aniq format ko'rsatilmasa, AI o'zi bilgancha manba keltiradi.

**Yechim:** "APA formatida", "to'liq URL bilan", "muallif, yil, sarlavha" kabi aniq format talab qiling.

**Yomon misol:** "Manbalar bilan javob ber"
**Yaxshi misol:** "Har bir fakt uchun manba ko'rsat: [Muallif, Yil - Sarlavha] formatida"

### Protokol 12: Maxsus Belgilar Bilan Ajratish

**Muammo:** "ChatGPT javobidan kerakli qismlarni topish qiyin, hamma narsa bir-biriga aralashgan!"

**Nega bunday bo'ladi?** Muhim qismlar vizual ajratilmasa, matnda yo'qolib ketadi.

**Yechim:** Maxsus belgilar talab qiling: "### muhim ###", "**asosiy fikr**", "[XULOSA]" kabi.

**Yomon misol:** "Muhim nuqtalarni ajrat"
**Yaxshi misol:** "Har bir muhim xulosani === XULOSA === belgilari orasiga joylashtir"

### Protokol 13: Qarshi Argumentlarni Talab Qilish

**Muammo:** "ChatGPT mening g'oyamni maqtaydi, lekin keyin muammo chiqib qoladi!"

**Nega bunday bo'ladi?** AI ijobiy bo'lishga moyil, salbiy tomonlarni ko'rsatmaydi.

**Yechim:** "Eng kuchli qarshi argument", "potensial muammolar", "tanqidiy nuqtai nazar" so'rang.

**Yomon misol:** "Bu biznes g'oya yaxshimi?"
**Yaxshi misol:** "Bu biznes g'oyaning 3 ta kuchli tomonini, keyin nima uchun muvaffaqiyatsiz bo'lishi mumkinligini 3 ta sabab bilan tushuntir"

### Protokol 14: Turli Kasb Vakillarining Fikri

**Muammo:** "ChatGPT bir xil fikr beradi, turli yondashuvlarni ko'rmayapman!"

**Nega bunday bo'ladi?** Aniq rol berilmasa, AI neytral pozitsiyadan javob beradi.

**Yechim:** Turli kasb vakillarining rolini bering: "investordek", "mijoz kabi", "texnik direktor sifatida".

**Yomon misol:** "Bu mahsulot qanday?"
**Yaxshi misol:** "Bu mahsulotni avval oddiy foydalanuvchi, keyin investor, oxirida texnik mutaxassis nuqtai nazaridan baholab ber"

### Protokol 15: Ishonch Darajasini Ko'rsatish

**Muammo:** "ChatGPT hamma narsani bilgandek javob beradi, keyin xato chiqib qoladi!"

**Nega bunday bo'ladi?** AI doim javob berishga harakat qiladi, ishonch darajasini ko'rsatmaydi.

**Yechim:** "Qanchalik ishonchli ekanini %da ko'rsat", "faqat 90% aniq bo'lgan ma'lumotlar" kabi talab qiling.

**Yomon misol:** "2024 yilda qaysi texnologiyalar mashhur?"
**Yaxshi misol:** "2024 yilda mashhur texnologiyalar haqida ayt, har birida qanchalik ishonchli ekaningni foizda ko'rsat"

### Protokol 16: Javob Shablonini Belgilash

**Muammo:** "ChatGPT har safar boshqacha formatda javob beradi, izchillik yo'q!"

**Nega bunday bo'ladi?** Aniq shablon berilmasa, AI har safar boshqacha struktura qiladi.

**Yechim:** Aniq format bering: "Muammo: ... | Sabab: ... | Yechim: ... | Natija: ..." kabi.

**Yomon misol:** "Mijozlar shikoyatlariga javob ber"
**Yaxshi misol:** "Mijoz shikoyatiga javobni shu formatda yoz: Tushunish | Kechirim | Yechim | Keyingi qadam"

### Protokol 17: "Ma'lumot Yetarli Emas" Signali

**Muammo:** "ChatGPT noto'g'ri ma'lumot berganidan ko'ra, bilmayman demaydi!"

**Nega bunday bo'ladi?** AI doim javob berishga dasturlangan, kamchilikni tan olmaydi.

**Yechim:** "Agar aniq bilmasang 'Ma'lumot yetarli emas' de", "taxmin qilma" kabi ko'rsatma bering.

**Yomon misol:** "2025 yil oktyabrda dollar kursi qancha bo'ladi?"
**Yaxshi misol:** "2025 yil oktyabrda dollar kursi haqida ayt, agar aniq ma'lumot bo'lmasa 'Bashorat qilib bo'lmaydi' deb yoz"

### Protokol 18: Javobni Qisqartirish

**Muammo:** "ChatGPT juda ko'p ortiqcha gap yozadi, asosiy fikr yo'qolib ketadi!"

**Nega bunday bo'ladi?** AI to'liq javob berishga harakat qilib, ortiqcha tafsilotlar qo'shadi.

**Yechim:** "Keyin 50% qisqartir", "faqat eng muhimini qoldir" kabi ikkinchi bosqich qo'shing.

**Yomon misol:** "Qisqa javob ber"
**Yaxshi misol:** "To'liq javob yoz, keyin uni eng muhim 3 ta fikrga qisqartir"

### Protokol 19: Eng Yomon Holatni Ko'rish

**Muammo:** "ChatGPT faqat yaxshi natijalar haqida gapiradi, keyin kutilmagan muammolar chiqadi!"

**Nega bunday bo'ladi?** AI optimistik javoblar berishga moyil, risklar haqida kam gapiradi.

**Yechim:** "Eng yomon senariy", "agar hammasi noto'g'ri ketsa", "maksimal risk" ni so'rang.

**Yomon misol:** "Bu investitsiya qanday?"
**Yaxshi misol:** "Bu investitsiyaning eng yaxshi, real va eng yomon natijalarini % ehtimollik bilan ko'rsat"

### Protokol 20: O'z-O'zini Tekshirish

**Muammo:** "ChatGPT o'z xatolarini ko'rmaydi, men topishim kerak!"

**Nega bunday bo'ladi?** AI birinchi javobdan qanoatlanadi, qayta ko'rib chiqmaydi.

**Yechim:** "Javobingni tekshir va xatolarni ko'rsat", "eng zaif 3 nuqtani aniqla" deb so'rang.

**Yomon misol:** "To'g'ri javob berdingmi?"
**Yaxshi misol:** "Javob bergandan keyin, o'z javobingdagi eng zaif 3 ta nuqtani va qanday yaxshilash mumkinligini ko'rsat"

## O'RTA DARAJA (21-40)

### Protokol 21: Qadam-Baqadam Ko'rsatmalar
**Muammo:** "ChatGPT hamma narsani bir vaqtda aytib yuboradi, qayerdan boshlashni bilmayman!"

**Nega bunday bo'ladi?** Aniq struktura so'ralmasa, AI barcha ma'lumotni tartibsiz berishi mumkin.

**Yechim:** "Qadam-baqadam", "bosqichma-bosqich", "avval...keyin...oxirida" strukturasini talab qiling.

**Yomon misol:** "Instagram'da qanday mashhur bo'lish mumkin?"
**Yaxshi misol:** "Instagram'da 0 dan 10K followergacha o'sish uchun 30 kunlik qadam-baqadam reja tuzing"

### Protokol 22: Muammoga Asoslangan Yechim
**Muammo:** "ChatGPT umumiy ma'lumot beradi, mening aniq muammomni hal qilmaydi!"

**Nega bunday bo'ladi?** Aniq muammo tavsiflanmasa, AI umumiy yechimlar taklif qiladi.

**Yechim:** Avval muammoni batafsil tavsiflang, keyin yechim so'rang.

**Yomon misol:** "Sotuvni qanday oshirish mumkin?"
**Yaxshi misol:** "Oyiga 50 ta mijozim bor, o'rtacha chek $30, sotuvni 2 baravarga oshirish uchun 5 ta aniq strategiya ber"

### Protokol 23: Jadval Formati
**Muammo:** "Turli variantlarni solishtirish qiyin, hammasi aralashib ketgan!"

**Nega bunday bo'ladi?** Solishtirish uchun vizual struktura bo'lmasa, farqlarni ko'rish qiyin.

**Yechim:** Jadval formatida taqdim etishni so'rang: ustunlar, qatorlar, aniq parametrlar.

**Yomon misol:** "iPhone va Samsung'ni solishtir"
**Yaxshi misol:** "iPhone 15 va Samsung S24 ni 5 ta parametr bo'yicha jadvalda solishtir: narx, kamera, batareya, xotira, dizayn"

### Protokol 24: Vaqt va Resurs Chegaralari
**Muammo:** "ChatGPT shunday yechim beradiki, menda bunga vaqt ham, pul ham yo'q!"

**Nega bunday bo'ladi?** Sizning imkoniyatlaringiz haqida ma'lumot bo'lmasa, AI ideal sharoitdagi yechimlarni taklif qiladi.

**Yechim:** Mavjud vaqt, byudjet va resurslarni aniq ko'rsating.

**Yomon misol:** "Biznesni qanday boshlash kerak?"
**Yaxshi misol:** "5000 dollar va haftada 10 soat vaqt bilan onlayn biznes boshlash uchun 3 ta variant"

### Protokol 25: Ijobiy va Salbiy Tomonlar
**Muammo:** "ChatGPT faqat yaxshi tomonlarini aytadi, xavf-xatarlarni aytmaydi!"

**Nega bunday bo'ladi?** Ko'pincha AI ijobiy va yordam beruvchi bo'lishga dasturlangan.

**Yechim:** "Afzalliklari va kamchiliklari", "risk va imkoniyatlar", "yaxshi va yomon tomonlari" so'rang.

**Yomon misol:** "Dropshipping biznes qanday?"
**Yaxshi misol:** "Dropshipping biznesning 5 ta afzalligi va 5 ta xavfli tomoni, har biri misol bilan"

### Protokol 26: Jadval Formatida Ko'rsatish

**Muammo:** "ChatGPT ma'lumotlarni shunday beradiki, solishtirish imkonsiz!"

**Nega bunday bo'ladi?** Jadval so'ralmasa, AI matn shaklida yozadi, bu solishtirish uchun noqulay.

**Yechim:** "3x3 jadval", "ustunlar: X, Y, Z", "markdown jadval" kabi aniq format bering.

**Yomon misol:** "Uch xil hosting xizmatini solishtir"
**Yaxshi misol:** "3 ta hosting xizmatini jadvalda solishtir: Narx | Tezlik | Support | Xususiyatlar"

### Protokol 27: Maqtovlardan Qochish

**Muammo:** "ChatGPT 'ajoyib', 'zo'r' deydi, lekin aniq nima yaxshi ekanini aytmaydi!"

**Nega bunday bo'ladi?** AI umumiy maqtov so'zlarni ishlatib, aniq ma'lumotdan qochadi.

**Yechim:** "'Ajoyib', 'zo'r', 'yaxshi' so'zlarini ishlatma" deb aniq taqiqlang.

**Yomon misol:** "Bu smartfonni tavsifla"
**Yaxshi misol:** "Bu smartfonni tavsifla, 'ajoyib', 'zo'r', 'mukammal' kabi so'zlarsiz, faqat aniq xususiyatlar"

### Protokol 28: 10 Yoshli Bolaga Tushuntirgandek

**Muammo:** "ChatGPT shunday murakkab tushuntiradi, oddiy odam tushunmaydi!"

**Nega bunday bo'ladi?** AI o'z bilim darajasidan kelib chiqadi, auditoriyani hisobga olmaydi.

**Yechim:** "10 yoshli bolaga", "buvimga", "hech narsa bilmaydigan odamga" tushuntirgandek so'rang.

**Yomon misol:** "Kriptovalyuta nima?"
**Yaxshi misol:** "Kriptovalyutani 10 yoshli bolaga tushuntirgandek, faqat oddiy so'zlar bilan, texnik atamalarsiz"

### Protokol 29: Rejadagi Zaif Nuqtalar

**Muammo:** "ChatGPT ajoyib reja beradi, keyin u ishlamay qoladi!"

**Nega bunday bo'ladi?** AI ideal sharoitni ko'zda tutadi, real muammolarni hisobga olmaydi.

**Yechim:** "Bu reja qayerda barbod bo'lishi mumkin?", "eng zaif nuqtalar" deb so'rang.

**Yomon misol:** "Yangi biznes rejasi tuz"
**Yaxshi misol:** "Yangi biznes rejasi tuz, keyin bu reja muvaffaqiyatsiz bo'lishining 5 ta eng katta xavfini ko'rsat"

### Protokol 30: Javobni Yaxshilashni So'rash

**Muammo:** "ChatGPT birinchi javobda to'xtaydi, yaxshiroq variant bo'lishi mumkin edi!"

**Nega bunday bo'ladi?** AI birinchi yetarli javobni beradi, optimal variantni qidirmaydi.

**Yechim:** "Buni qanday yaxshilash mumkin?", "2.0 versiyasi" deb davom ettiring.

**Yomon misol:** "Rahmat, yaxshi javob"
**Yaxshi misol:** "Bu javobni qanday 3 usulda yaxshilash mumkin? Ayt va yangi versiyasini yoz"

### Protokol 31: Teskari Fikrlash (Devil's Advocate)

**Muammo:** "ChatGPT mening fikrimni qo'llab-quvvatlaydi, ammo boshqalar qarshi!"

**Nega bunday bo'ladi?** AI sizga yoqadigan javob berishga harakat qiladi.

**Yechim:** "Mening fikrimga qarshi dal", "raqib pozitsiyasidan", "tanqidchi sifatida" so'rang.

**Yomon misol:** "Bu g'oya to'g'rimi?"
**Yaxshi misol:** "Avval bu g'oyaning 3 ta kuchli tomonini, keyin qattiq tanqidchi sifatida 3 ta zaif tomonini yoz"

### Protokol 32: Qisqa Xulosa (Executive Summary)

**Muammo:** "ChatGPT uzun javob beradi, asosiy fikr qayerda ekanini bilmayman!"

**Nega bunday bo'ladi?** AI hamma ma'lumotni bir xil ahamiyatda beradi.

**Yechim:** "30 so'zlik executive summary", "3 gaplik xulosa" bilan boshlashni so'rang.

**Yomon misol:** "Batafsil tushuntir"
**Yaxshi misol:** "Avval 30 so'zlik xulosa, keyin batafsil tushuntirish ber"

### Protokol 33: Foyda-Xarajat Tahlili

**Muammo:** "ChatGPT yaxshi g'oya deydi, lekin qancha turishi va qancha foyda berishini aytmaydi!"

**Nega bunday bo'ladi?** Moliyaviy tahlil so'ralmasa, AI faqat g'oya beradi.

**Yechim:** "Har 1 so'm uchun qancha qaytim", "ROI hisoblash", "break-even point" so'rang.

**Yomon misol:** "Bu investitsiya yaxshimi?"
**Yaxshi misol:** "Bu investitsiyaning foyda-xarajat tahlilini qil: boshlang'ich sarf, oylik xarajat, kutilgan daromad va 2 yilda ROI"

### Protokol 34: Muhimlik Darajasiga Ko'ra Saralash

**Muammo:** "ChatGPT hamma narsani bir xil muhim deb ko'rsatadi!"

**Nega bunday bo'ladi?** Prioritet so'ralmasa, AI barcha ma'lumotni teng beradi.

**Yechim:** "Muhimlik bo'yicha 1-10", "eng muhimdan boshla", "kritik vs yaxshi bo'lsa" deb saralang.

**Yomon misol:** "Veb-sayt uchun nimalar kerak?"
**Yaxshi misol:** "Veb-sayt uchun kerakli 10 ta narsani muhimlik darajasi bo'yicha sarala: Majburiy | Muhim | Yaxshi bo'lsa"

### Protokol 35: Raqib Ko'zi Bilan Ko'rish

**Muammo:** "ChatGPT mening strategiyam zo'r deydi, lekin raqiblar bizni yengib ketishyapti!"

**Nega bunday bo'ladi?** AI sizning nuqtai nazaringizdan ko'radi, raqib pozitsiyasini hisobga olmaydi.

**Yechim:** "Raqib sifatida", "competitor analysis", "dushman ko'zi bilan" deb so'rang.

**Yomon misol:** "Marketing strategiyam qanday?"
**Yaxshi misol:** "Mening marketing strategiyamni ko'rib, raqib sifatida uni qanday mag'lub qilish mumkinligini 5 ta usul bilan ko'rsat"

### Protokol 36: Har Bir Fikrga Aniq Misol

**Muammo:** "ChatGPT nazariya aytadi, qanday qilishni tushunmayapman!"

**Nega bunday bo'ladi?** Misol so'ralmasa, AI abstrakt tushunchalar bilan chegaralanadi.

**Yechim:** "Har bir nuqtaga real misol", "aniq kompaniya misoli", "step-by-step misol" talab qiling.

**Yomon misol:** "Mijozlar sodiqligini qanday oshirish mumkin?"
**Yaxshi misol:** "Mijozlar sodiqligini oshirishning 5 usuli, har biri muvaffaqiyatli kompaniya misolida"

### Protokol 37: G'ayrioddiy Kombinatsiyalar

**Muammo:** "ChatGPT odatdagi, zerikarli g'oyalar beradi!"

**Nega bunday bo'ladi?** Kreativ kombinatsiya so'ralmasa, AI standart javoblar beradi.

**Yechim:** Aloqasiz sohalarni birlashtiring: "Formula 1 + restoran", "balet + IT" kabi.

**Yomon misol:** "Yangi biznes g'oya ber"
**Yaxshi misol:** "Kosmonavtika prinsiplarini pitseria biznesiga qo'llab, 3 ta innovatsion g'oya ber"

### Protokol 38: Yashirin Taxminlarni Ochish

**Muammo:** "ChatGPT javob beradi, lekin noto'g'ri taxminlarga asoslanib qoladi!"

**Nega bunday bo'ladi?** AI o'z taxminlarini aniq aytmaydi, bu xatolarga olib keladi.

**Yechim:** "Qanday taxminlarga asoslanasan?", "assumptions ro'yxati" deb so'rang.

**Yomon misol:** "Ushbu strategiya ishlaydi?"
**Yaxshi misol:** "Ushbu strategiya haqida fikr bildirish oldidan, qanday 5 ta asosiy taxminga asoslanayotganingni ko'rsat"

### Protokol 39: Turli Vaqt Oraliqlarida Ko'rish

**Muammo:** "ChatGPT faqat hozirgi vaqt uchun javob beradi, uzoq muddatli ta'sirni aytmaydi!"

**Nega bunday bo'ladi?** Vaqt oralig'i ko'rsatilmasa, AI qisqa muddatli javob beradi.

**Yechim:** "1 oy, 1 yil, 5 yil", "qisqa va uzoq muddatli", "immediate vs long-term" so'rang.

**Yomon misol:** "Bu qaror to'g'rimi?"
**Yaxshi misol:** "Bu qarorning 1 oy, 1 yil va 5 yillik ta'sirini alohida tahlil qil"

### Protokol 40: Eng Kuchli Qarshi Argument

**Muammo:** "ChatGPT zaif qarshi fikrlar keltiradi, haqiqiy tanqidchilar kuchliroq dalillar keltiradi!"

**Nega bunday bo'ladi?** AI o'rtacha qarshi fikrlarni keltiradi, eng kuchlilarini emas.

**Yechim:** "Eng KUCHLI qarshi argument", "professional tanqidchi kabi", "destroy my idea" so'rang.

**Yomon misol:** "Qarshi fikrlar bormi?"
**Yaxshi misol:** "Mening g'oyamga qarshi eng KUCHLI 3 ta argument kel va nima uchun u barbod bo'lishi mumkinligini isbotla"

## YUQORI DARAJA (41-57)

### Protokol 41: Mental Model va Framework
**Muammo:** "ChatGPT har safar boshqacha javob beradi, izchillik yo'q!"

**Nega bunday bo'ladi?** Aniq framework yoki model ko'rsatilmasa, AI har safar boshqa yondashuvdan foydalanadi.

**Yechim:** Aniq framework yoki modelni ko'rsating: SWOT, 5W1H, SMART va hokazo.

**Yomon misol:** "Biznes g'oyamni tahlil qil"
**Yaxshi misol:** "Biznes g'oyamni SWOT tahlili bilan ko'rib chiq, har bir bo'limda 3 tadan nuqta"

### Protokol 42: Qarama-qarshi Fikrlar
**Muammo:** "ChatGPT doim rozi bo'ladi, tanqidiy fikr bildirmaydi!"

**Nega bunday bo'ladi?** AI ko'pincha foydalanuvchini xafa qilmaslikka harakat qiladi.

**Yechim:** "Devil's advocate", "qarshi argument", "tanqidiy nuqtai nazar" talab qiling.

**Yomon misol:** "Bu g'oya yaxshimi?"
**Yaxshi misol:** "Avval g'oyamning 3 ta kuchli tomonini, keyin investor nuqtai nazaridan 3 ta zaif tomonini tanqid qil"

### Protokol 43: Scenariy Rejalashtirish
**Muammo:** "ChatGPT faqat bitta variant beradi, boshqa imkoniyatlarni ko'rmayapman!"

**Nega bunday bo'ladi?** Ko'p scenariy so'ralmasa, AI eng ehtimoliy variantni taqdim etadi.

**Yechim:** "Best case", "worst case", "most likely case" scenariylarini so'rang.

**Yomon misol:** "Yangi mahsulot chiqarsam nima bo'ladi?"
**Yaxshi misol:** "Yangi mahsulot chiqarishning 3 scenariysini yoz: eng yaxshi (10% ehtimol), o'rtacha (70% ehtimol), eng yomon (20% ehtimol)"

### Protokol 44: Metrik va KPI
**Muammo:** "ChatGPT umumiy maslahat beradi, qanday o'lchashni aytmaydi!"

**Nega bunday bo'ladi?** O'lchanadigan natijalar so'ralmasa, AI umumiy tavsiyalar beradi.

**Yechim:** Aniq metrikalar, KPIlar va o'lchash usullarini talab qiling.

**Yomon misol:** "Content marketing qanday qilish kerak?"
**Yaxshi misol:** "Content marketing strategiyasi va uni o'lchash uchun 5 ta KPI: formula, maqsad raqam va o'lchash chastotasi bilan"

### Protokol 45: Tizimli Yondashuv
**Muammo:** "ChatGPT ayrim qismlarni tushuntiradi, lekin umumiy sistema qanday ishlashini ko'rsatmaydi!"

**Nega bunday bo'ladi?** Tizimli ko'rinish so'ralmasa, AI alohida elementlarga e'tibor beradi.

**Yechim:** "Tizim sifatida", "o'zaro bog'liqlik", "feedback loop" kabi tushunchalarni qo'shing.

**Yomon misol:** "Mijozlar bilan qanday ishlash kerak?"
**Yaxshi misol:** "Mijozlar bilan ishlash tizimini 5 bosqichda tasvirla: har bir bosqich qanday keyingisiga ta'sir qiladi"

### Protokol 46: ROI va Natija Hisoblash
**Muammo:** "ChatGPT yaxshi g'oyalar beradi, lekin ularning samarasi qanday bo'lishini aytmaydi!"

**Nega bunday bo'ladi?** Moliyaviy va vaqt bo'yicha ROI so'ralmasa, AI faqat g'oyalar beradi.

**Yechim:** "ROI hisoblash", "vaqt va pul sarfi", "kutilayotgan natija" so'rang.

**Yomon misol:** "Email automation qilish kerakmi?"
**Yaxshi misol:** "Email automation uchun sarflanadigan $500 va 20 soatdan 6 oy ichida qanday ROI kutish mumkin? Hisoblash bilan"

### Protokol 47: Prioritetlash va 80/20
**Muammo:** "ChatGPT juda ko'p ishlar ro'yxatini beradi, qayerdan boshlashni bilmayman!"

**Nega bunday bo'ladi?** Prioritet so'ralmasa, AI barcha mumkin bo'lgan variantlarni bir xil ahamiyatda ko'rsatadi.

**Yechim:** "80/20 qoidasi", "eng muhim 3 ta", "birinchi hafta uchun" kabi filtrlar qo'shing.

**Yomon misol:** "SEO uchun nima qilish kerak?"
**Yaxshi misol:** "SEO uchun 20 ta ish ichidan 80% natija beradigan 3 tasini ajrat va nega aynan ular ekanini tushuntir"

### Protokol 48: Iterativ Yaxshilash
**Muammo:** "ChatGPT bir marta javob beradi va bo'ldi, qanday yaxshilashni bilmayman!"

**Nega bunday bo'ladi?** Takroriy yaxshilash so'ralmasa, AI birinchi versiyada to'xtaydi.

**Yechim:** "Endi buni qanday 30% yaxshilash mumkin?", "2.0 versiyasi" so'rang.

**Yomon misol:** "Landing page matni yoz"
**Yaxshi misol:** "Landing page matni yoz, keyin uni konversiyani oshirish uchun 3 ta aniq yaxshilash kirit"

### Protokol 49: Cheklovlar va Innovatsiya
**Muammo:** "ChatGPT standart, zerikarli javoblar beradi!"

**Nega bunday bo'ladi?** Kreativ cheklovlar qo'yilmasa, AI eng xavfsiz va umumiy javoblarni tanlaydi.

**Yechim:** Sun'iy cheklovlar qo'ying: "emoji ishlat", "faqat savol shaklida", "hikoya orqali".

**Yomon misol:** "Produktimizni qanday reklama qilish mumkin?"
**Yaxshi misol:** "Produktimizni $0 byudjet va faqat WhatsApp orqali qanday 1000 kishiga yetkazish mumkin? 5 ta g'ayrioddiy usul"

### Protokol 50: Teskari Muhandislik
**Muammo:** "ChatGPT umumiy maslahat beradi, aniq qanday qilishni ko'rsatmaydi!"

**Nega bunday bo'ladi?** Maqsaddan boshlanmasa, AI umumiy yo'nalish ko'rsatadi.

**Yechim:** Oxirgi natijadan boshlab, orqaga qarab rejalashtiring.

**Yomon misol:** "YouTube kanalini qanday o'stirish mumkin?"
**Yaxshi misol:** "100K subscriber bo'lgan YouTube kanali bor deb faraz qil. U yerga yetish uchun oxirgi 90 kunning har biridagi aniq harakatlarni teskari tartibda yoz"

### Protokol 51: Kombinatsiya va Sintez
**Muammo:** "ChatGPT bir sohadan javob beradi, boshqa sohalardan foydalanmaydi!"

**Nega bunday bo'ladi?** Aniq aytilmasa, AI bitta domendan javob beradi.

**Yechim:** Ikki yoki undan ko'p sohani birlashtirishni so'rang.

**Yomon misol:** "Mijozlar xizmatini qanday yaxshilash mumkin?"
**Yaxshi misol:** "Disney parki tajribasi va Amazon tezligini birlashtirib, mijozlar xizmati uchun 5 ta innovatsion g'oya ber"

### Protokol 52: Prototip va MVP
**Muammo:** "ChatGPT katta, murakkab yechimlar taklif qiladi, men esa tez sinab ko'rmoqchiman!"

**Nega bunday bo'ladi?** MVP yondashuvi so'ralmasa, AI to'liq yechimlarni tavsiya qiladi.

**Yechim:** "MVP versiyasi", "24 soatda sinash", "eng oddiy variant" so'rang.

**Yomon misol:** "Yangi app g'oyam qanday?"
**Yaxshi misol:** "Bu app g'oyaning 48 soat ichida $50 dan kam sarf bilan sinaydigan MVP versiyasini qanday qilish mumkin?"

### Protokol 53: Dokumentatsiya va SOP
**Muammo:** "ChatGPT bir martalik javob beradi, buni takrorlash qiyin!"

**Nega bunday bo'ladi?** Qayta foydalanish uchun format so'ralmasa, AI bir martalik javob beradi.

**Yechim:** "SOP formati", "checklist", "template" shaklida so'rang.

**Yomon misol:** "Mijoz bilan qanday gaplashish kerak?"
**Yaxshi misol:** "Yangi mijoz bilan birinchi qo'ng'iroq uchun SOP yoz: 10 qadam, har birida aniq gaplar va maqsad"

### Protokol 54: A/B Test va Eksperiment
**Muammo:** "ChatGPT bitta yechim beradi, qaysi biri yaxshi ishlashini bilmayman!"

**Nega bunday bo'ladi?** Test variantlari so'ralmasa, AI bitta "eng yaxshi" javob beradi.

**Yechim:** "A/B test variantlari", "3 xil yondashuv", "turli segmentlar uchun" so'rang.

**Yomon misol:** "Email subject line yoz"
**Yaxshi misol:** "Bir xil taklifning 3 xil psixologik yondashuvdagi email subject line'larini yoz: urgency, social proof, curiosity"

### Protokol 55: Masshtablash va Avtomatlashtirish
**Muammo:** "ChatGPT yaxshi g'oya beradi, lekin buni 10x qilish kerak bo'lsa-chi?"

**Nega bunday bo'ladi?** Masshtab haqida o'ylanmasa, AI bitta holatga javob beradi.

**Yechim:** "10x hajmda", "avtomatlashgan", "tizimlashtirish" so'rang.

**Yomon misol:** "Mijozlarga minnatdorchilik qanday bildirish mumkin?"
**Yaxshi misol:** "1 ta emas, 1000 ta mijozga shaxsiylashtirilgan minnatdorchilik bildirish tizimini qanday qurish mumkin? Jarayon va toollar"

### Protokol 56: Feedback Loop va Iteratsiya
**Muammo:** "ChatGPT statik javob beradi, doimiy yaxshilanish yo'li ko'rsatmaydi!"

**Nega bunday bo'ladi?** Feedback mexanizmi so'ralmasa, AI bir martalik yechim taklif qiladi.

**Yechim:** "Feedback loop", "continuous improvement", "o'lchash va optimizatsiya" qo'shing.

**Yomon misol:** "Mahsulot sifatini qanday oshirish mumkin?"
**Yaxshi misol:** "Mahsulot sifatini doimiy oshirish uchun haftalik feedback loop qur: kimdan, qanday, qachon va natijalarni qanday implement qilish"

### Protokol 57: Exit Strategy va Plan B
**Muammo:** "ChatGPT faqat muvaffaqiyat haqida gapiradi, agar ishlamasa nima qilishni aytmaydi!"

**Nega bunday bo'ladi?** Risk management so'ralmasa, AI optimistik scenario taqdim etadi.

**Yechim:** "Exit strategy", "Plan B", "risk mitigation" so'rang.

**Yomon misol:** "Yangi xizmat turini qo'shsam bo'ladimi?"
**Yaxshi misol:** "Yangi xizmat qo'shish rejasi va agar 3 oy ichida muvaffaqiyatsiz bo'lsa, minimal zarar bilan chiqish strategiyasi"
`;

function parseProtocol(protocolText) {
  const lines = protocolText.split('\n').filter(line => line.trim());
  
  let currentProtocol = null;
  let protocols = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for protocol header
    const protocolMatch = trimmedLine.match(/^### Protokol (\d+): (.+)/);
    if (protocolMatch) {
      // Save previous protocol if exists
      if (currentProtocol) {
        protocols.push(currentProtocol);
      }
      
      const protocolNumber = parseInt(protocolMatch[1]);
      const title = protocolMatch[2];
      
      // Determine difficulty level based on number
      let difficultyLevel, levelOrder;
      if (protocolNumber <= 20) {
        difficultyLevel = 'BEGINNER';
        levelOrder = protocolNumber;
      } else if (protocolNumber <= 40) {
        difficultyLevel = 'O\'RTA DARAJA';
        levelOrder = protocolNumber - 20;
      } else {
        difficultyLevel = 'YUQORI DARAJA';
        levelOrder = protocolNumber - 40;
      }
      
      currentProtocol = {
        number: protocolNumber,
        title: title,
        difficultyLevel: difficultyLevel,
        levelOrder: levelOrder,
        problemStatement: '',
        whyExplanation: '',
        solutionApproach: '',
        badExample: '',
        goodExample: '',
        categoryId: 1, // Default category
        notes: null
      };
      continue;
    }
    
    if (!currentProtocol) continue;
    
    // Parse content sections
    if (trimmedLine.startsWith('**Muammo:**')) {
      currentProtocol.problemStatement = trimmedLine.replace('**Muammo:**', '').trim().replace(/^"|"$/g, '');
    } else if (trimmedLine.startsWith('**Nega bunday bo\'ladi?**')) {
      currentProtocol.whyExplanation = trimmedLine.replace('**Nega bunday bo\'ladi?**', '').trim();
    } else if (trimmedLine.startsWith('**Yechim:**')) {
      currentProtocol.solutionApproach = trimmedLine.replace('**Yechim:**', '').trim();
    } else if (trimmedLine.startsWith('**Yomon misol:**')) {
      currentProtocol.badExample = trimmedLine.replace('**Yomon misol:**', '').trim().replace(/^"|"$/g, '');
    } else if (trimmedLine.startsWith('**Yaxshi misol:**')) {
      currentProtocol.goodExample = trimmedLine.replace('**Yaxshi misol:**', '').trim().replace(/^"|"$/g, '');
    }
  }
  
  // Don't forget the last protocol
  if (currentProtocol) {
    protocols.push(currentProtocol);
  }
  
  return protocols;
}

function transformToLegacyFormat(protocol) {
  return {
    id: protocol.number,
    number: protocol.number,
    title: protocol.title,
    description: `${protocol.problemStatement} ${protocol.whyExplanation} ${protocol.solutionApproach}`.trim(),
    badExample: protocol.badExample || null,
    goodExample: protocol.goodExample || null,
    categoryId: protocol.categoryId,
    notes: protocol.notes,
    createdAt: null,
    // New fields
    problemStatement: protocol.problemStatement || null,
    whyExplanation: protocol.whyExplanation || null,
    solutionApproach: protocol.solutionApproach || null,
    difficultyLevel: protocol.difficultyLevel || null,
    levelOrder: protocol.levelOrder || null
  };
}

// Main execution
console.log('🚀 Starting protocol migration...');

try {
  const parsedProtocols = parseProtocol(newProtocolsContent);
  console.log(`✅ Parsed ${parsedProtocols.length} protocols`);
  
  const transformedProtocols = parsedProtocols.map(transformToLegacyFormat);
  
  // Export as both JSON and JavaScript for flexibility
  import fs from 'fs';
  import path from 'path';
  import { fileURLToPath } from 'url';
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // JSON format for data import
  fs.writeFileSync(
    path.join(__dirname, '../supabase/seed/new-protocols.json'),
    JSON.stringify(transformedProtocols, null, 2)
  );
  
  // JavaScript format for backward compatibility
  const jsContent = `export const protocols = ${JSON.stringify(transformedProtocols, null, 2)};`;
  fs.writeFileSync(
    path.join(__dirname, '../supabase/seed/new-protocols.js'),
    jsContent
  );
  
  console.log('✅ Migration files created:');
  console.log('  - /supabase/seed/new-protocols.json');
  console.log('  - /supabase/seed/new-protocols.js');
  
  // Show first few protocols for verification
  console.log('\n📋 Sample protocols:');
  transformedProtocols.slice(0, 3).forEach(p => {
    console.log(`  ${p.number}. ${p.title} (${p.difficultyLevel})`);
  });
  
  console.log(`\n🎯 Total protocols by difficulty:`);
  const byDifficulty = transformedProtocols.reduce((acc, p) => {
    acc[p.difficultyLevel] = (acc[p.difficultyLevel] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byDifficulty).forEach(([level, count]) => {
    console.log(`  ${level}: ${count} protocols`);
  });
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}