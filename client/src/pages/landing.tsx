import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Zap, 
  Target, 
  Brain,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  TrendingUp,
  BookOpen,
  Award,
  Sparkles
} from "lucide-react";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    window.location.href = "/auth";
  };

  const handleTryDemo = () => {
    window.location.href = "/auth?demo=true";
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slideInLeft 1s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 1s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .visible {
          opacity: 1;
          transform: translateY(0);
        }

        .gradient-text {
          background: linear-gradient(135deg, #fff 0%, #888 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-gradient {
          background: radial-gradient(ellipse at center top, rgba(255,79,48,0.15) 0%, transparent 50%);
        }
      `}</style>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-black/90 backdrop-blur-lg border-b border-gray-800' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="font-inter font-black text-2xl lg:text-3xl tracking-tight">
            PROTOKOL57
          </div>
          <Button 
            onClick={handleGetStarted}
            className="font-inter font-bold bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-full transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            Premium
          </Button>
        </div>
      </header>

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
          <div className="animate-fade-in-up">
            <Badge className="mb-10 bg-gray-900/60 backdrop-blur text-gray-200 border-gray-600 font-inter font-medium text-base px-8 py-3 rounded-full">
              <Sparkles className="w-4 h-4 mr-3" />
              AI inqilobi boshlandi
            </Badge>
          </div>
          
          <h1 
            className="font-inter font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.85] tracking-tight mb-12 animate-fade-in-up"
            style={{ 
              animationDelay: '0.2s',
              lineHeight: '0.85',
              letterSpacing: '-0.02em'
            }}
          >
            <span className="block mb-2">Sun'iy intellekt sizni</span>
            <span className="block gradient-text mb-2">chetlab o'tishidan</span>
            <span className="block">oldin uni boshqaring</span>
          </h1>
          
          <p 
            className="font-inter font-light text-lg md:text-xl lg:text-2xl text-gray-300 max-w-5xl mx-auto mb-16 leading-relaxed animate-fade-in-up"
            style={{ 
              animationDelay: '0.4s',
              lineHeight: '1.7',
              letterSpacing: '0.01em'
            }}
          >
            <span className="block mb-3">Goldman Sachs: 300 million ish o'rni xavf ostida.</span>
            <span className="block font-medium text-white">AI'dan 5x yaxshi natijalar olishning maxfiy formulasi.</span>
          </p>

          <div 
            className="flex flex-col sm:flex-row gap-8 justify-center animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <Button 
              onClick={handleTryDemo}
              variant="outline"
              className="font-inter font-medium bg-transparent border-2 border-gray-500 text-white hover:bg-gray-800 hover:border-gray-400 px-12 py-6 text-lg rounded-full transition-all duration-300 hover:scale-[1.02]"
            >
              Bepul demo versiya
            </Button>
            <Button 
              onClick={handleGetStarted}
              className="font-inter font-bold bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-gray-200 px-12 py-6 text-lg rounded-full group transition-all duration-300 hover:scale-[1.02] shadow-2xl hover:shadow-white/20"
            >
              <span className="tracking-tight">Premium — 199,000 so'm</span>
              <ArrowRight className="ml-4 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Stats */}
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-28 animate-fade-in-up"
            style={{ animationDelay: '0.8s' }}
          >
            {[
              { number: "300M", label: "ish o'rni xavf ostida" },
              { number: "5x", label: "yaxshiroq natijalar" },
              { number: "57", label: "professional protokol" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="font-inter font-black text-6xl md:text-7xl lg:text-8xl text-white mb-4 tracking-tight group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="font-inter font-light text-lg text-gray-300 tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-gray-600 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Problems Section with Dramatic Reveal */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div 
            id="problems-header"
            className={`text-center mb-20 animate-on-scroll transition-all duration-1000 ${
              isVisible['problems-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="font-inter font-black text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight mb-8">
              <span className="block mb-2">Sizda shunday</span>
              <span className="block text-red-500">muammolar</span>
              <span className="block">bormi?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Clock,
                title: "Vaqt yo'qotish",
                description: "ChatGPT yoki boshqa AI'lardan aniq javob olish uchun soatlab vaqt sarflaysizmi?",
                color: "text-blue-500"
              },
              {
                icon: AlertTriangle,
                title: "Tushunarsiz javoblar", 
                description: "AI sizga umumiy, yuzaki va kutilganingizdan past sifatli javoblar beryaptimi?",
                color: "text-yellow-500"
              },
              {
                icon: TrendingUp,
                title: "Qo'rquv",
                description: "Sun'iy intellekt tufayli o'z kasbingizda ortda qolishdan xavotirdamisiz?",
                color: "text-red-500"
              },
              {
                icon: Zap,
                title: "Samarasizlik",
                description: "G'oyalaringizni AI yordamida amaliy natijalarga aylantira olmayapsizmi?",
                color: "text-purple-500"
              }
            ].map((problem, idx) => (
              <div
                key={idx}
                id={`problem-${idx}`}
                className={`animate-on-scroll transition-all duration-700 ${
                  isVisible[`problem-${idx}`] ? 'opacity-100 translate-x-0' : 
                  idx % 2 === 0 ? 'opacity-0 -translate-x-20' : 'opacity-0 translate-x-20'
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <Card className="bg-gray-900/50 backdrop-blur border-gray-800 p-8 h-full hover:bg-gray-900/70 transition-all hover:scale-105 hover:border-gray-700">
                  <CardContent className="p-0">
                    <problem.icon className={`w-12 h-12 ${problem.color} mb-6`} />
                    <h3 className="font-inter font-bold text-2xl lg:text-3xl mb-5 tracking-tight">{problem.title}</h3>
                    <p className="font-inter font-light text-base lg:text-lg text-gray-300 leading-relaxed">{problem.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div 
            id="problems-cta"
            className={`text-center mt-16 animate-on-scroll transition-all duration-1000 ${
              isVisible['problems-cta'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <p className="font-inter font-light text-xl lg:text-2xl text-gray-300 leading-relaxed">
              <span className="block mb-3">Agar shu savollarning birortasiga "ha" deb javob bergan bo'lsangiz,</span>
              <span className="font-black text-2xl lg:text-3xl text-white tracking-tight">demak siz to'g'ri joydasiz.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section with Split Screen */}
      <section className="py-32 px-6 bg-gradient-to-b from-black via-gray-900/20 to-black">
        <div className="max-w-7xl mx-auto">
          <div 
            id="solution-header"
            className={`text-center mb-20 animate-on-scroll transition-all duration-1000 ${
              isVisible['solution-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="font-inter font-black text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight mb-10">
              <span className="block mb-2">"57PROTOCOLS"</span>
              <span className="block gradient-text">sizning qo'llanmangiz</span>
            </h2>
            <p className="font-inter font-light text-lg md:text-xl lg:text-2xl text-gray-300 max-w-5xl mx-auto leading-relaxed">
              <span className="block mb-2">Muallif Xurshid Maroziqov 15+ ilmiy maqola, OpenAI va Anthropic hujjatlarini o'rganib,</span>
              <span className="font-medium text-white">eng samarali 57 ta protokolni siz uchun jamladi.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {[
                {
                  icon: Brain,
                  title: "57 ta sinalgan protokol",
                  description: "Sun'iy intellektdan 5 barobar yaxshi va aniqroq javoblar olish uchun maxsus ishlab chiqilgan taktikalar"
                },
                {
                  icon: Target,
                  title: "Tanqidiy fikrlash va prompt asoslari",
                  description: "Har qanday vaziyatda AI'ga to'g'ri savol berish va natijalarni tanqidiy tahlil qilish ko'nikmalari"
                },
                {
                  icon: BookOpen,
                  title: "50+ tayyor premium promptlar",
                  description: "Biznes, marketing, ta'lim va boshqa sohalar uchun darhol qo'llash mumkin bo'lgan professional so'rovlar"
                },
                {
                  icon: Award,
                  title: "AI yordamida promptlarni test qilish",
                  description: "O'z promptingizni maxsus AI yordamida tekshirib, uni yanada kuchaytirish va ballash imkoniyati"
                }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  id={`feature-${idx}`}
                  className={`flex items-start gap-6 animate-on-scroll transition-all duration-700 ${
                    isVisible[`feature-${idx}`] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
                  }`}
                  style={{ transitionDelay: `${idx * 150}ms` }}
                >
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-inter font-bold text-xl lg:text-2xl mb-4 tracking-tight">{feature.title}</h3>
                    <p className="font-inter font-light text-base lg:text-lg text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div 
              id="solution-visual"
              className={`relative animate-on-scroll transition-all duration-1000 ${
                isVisible['solution-visual'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 border border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 text-center">
                  <div className="text-7xl font-black mb-4 gradient-text">5x</div>
                  <div className="text-2xl text-gray-300 mb-8">Yaxshiroq natijalar</div>
                  
                  <div className="space-y-4">
                    <div className="bg-black/50 backdrop-blur rounded-xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Samaradorlik</span>
                        <span className="text-3xl font-bold text-green-400">+400%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-black/50 backdrop-blur rounded-xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Vaqt tejash</span>
                        <span className="text-3xl font-bold text-blue-400">90%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Cards */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div 
            id="pricing-header"
            className={`text-center mb-20 animate-on-scroll transition-all duration-1000 ${
              isVisible['pricing-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              Demo yoki Premium?
              <br />
              <span className="gradient-text">Tanlov sizniki.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Demo */}
            <div
              id="pricing-demo"
              className={`animate-on-scroll transition-all duration-700 ${
                isVisible['pricing-demo'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
            >
              <Card className="bg-gray-900/30 backdrop-blur border-gray-800 p-10 h-full hover:bg-gray-900/50 transition-all">
                <CardContent className="p-0">
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold mb-4">Bepul Demo</h3>
                    <p className="text-xl text-gray-400">Platformani sinab ko'ring</p>
                  </div>

                  <div className="space-y-4 mb-10">
                    {[
                      "3-5 ta protokol",
                      "Platforma bilan tanishish", 
                      "AI bilan ishlashning oddiy usullari"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <span className="text-lg text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={handleTryDemo}
                    variant="outline"
                    className="w-full bg-transparent border-2 border-gray-600 text-white hover:bg-gray-800 py-7 text-lg rounded-xl transition-all hover:scale-105"
                  >
                    Demo versiyani sinab ko'rish
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Premium */}
            <div
              id="pricing-premium"
              className={`animate-on-scroll transition-all duration-700 ${
                isVisible['pricing-premium'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-black border-2 border-accent/30 p-10 h-full relative overflow-hidden hover:border-accent/50 transition-all transform hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl"></div>
                <Badge className="absolute -top-4 left-10 bg-accent text-white text-lg px-6 py-2">
                  Tavsiya etiladi
                </Badge>
                <CardContent className="p-0 relative z-10">
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold mb-4">Premium Hisob</h3>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-6xl font-black">199,000</span>
                      <span className="text-xl text-gray-400">so'm</span>
                    </div>
                    <p className="text-xl text-gray-400">Bir martalik to'lov</p>
                  </div>

                  <div className="space-y-4 mb-10">
                    {[
                      "✅ Barcha 57 ta protokol",
                      "✅ \"Prompt asoslari va tanqidiy fikrlash\" to'liq kursi",
                      "✅ 50+ premium tayyor promptlar", 
                      "✅ AI yordamida promptlarni test qilish va ballash",
                      "✅ Cheksiz kirish"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="text-lg text-white">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-r from-accent to-red-600 hover:from-red-600 hover:to-accent text-white py-7 text-lg font-bold rounded-xl group transition-all hover:scale-105"
                  >
                    Premium hisobni xarid qilish
                    <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </Button>

                  <p className="text-center text-gray-400 mt-6">
                    AI inqilobida shunchaki tomoshabin bo'lib qolishni istamasangiz
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-black via-gray-900/20 to-black">
        <div className="max-w-7xl mx-auto">
          <div 
            id="why-header"
            className={`text-center mb-20 animate-on-scroll transition-all duration-1000 ${
              isVisible['why-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              Nima uchun aynan
              <br />
              <span className="gradient-text">"57PROTOCOLS"?</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto">
              Chunki bu yerda faqat <span className="text-white font-bold">natija muhim</span>.
              ChatGPT sizning "iltimos", "rahmat" degan so'zlaringizni tushunmaydi.
              U kod va buyruqlar asosida ishlaydi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Vaqtni tejang",
                description: "Bir necha soatlik izlanish o'rniga, bir necha daqiqada kerakli natijaga erishing",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: TrendingUp,
                title: "Samaradorlikni oshiring",
                description: "G'oyalaringizni biznes-rejalarga, maqolalarga, marketing strategiyalariga aylantiring",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: Award,
                title: "Raqobatda ustunlik",
                description: "O'z sohangizda sun'iy intellektni qo'llay oladigan yetakchi mutaxassisga aylaning",
                gradient: "from-orange-500 to-red-500"
              }
            ].map((benefit, idx) => (
              <div
                key={idx}
                id={`benefit-${idx}`}
                className={`animate-on-scroll transition-all duration-700 ${
                  isVisible[`benefit-${idx}`] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-8 h-full hover:bg-gray-900/70 transition-all hover:scale-105 group">
                  <div className={`bg-gradient-to-br ${benefit.gradient} p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{benefit.title}</h3>
                  <p className="text-gray-400 text-lg">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div 
            id="transform-text"
            className={`text-center mt-20 animate-on-scroll transition-all duration-1000 ${
              isVisible['transform-text'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <p className="text-3xl md:text-4xl font-bold">
              Ushbu qo'llanma sizni shunchaki foydalanuvchidan
              <br />
              <span className="text-6xl md:text-7xl gradient-text">qo'mordonga</span>
              <br />
              aylantiradi.
            </p>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div 
            id="guarantee"
            className={`animate-on-scroll transition-all duration-1000 ${
              isVisible['guarantee'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <Shield className="w-20 h-20 text-green-500 mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-black mb-8">
              100% Qoniqish Kafolati
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Biz mahsulotimiz sifatiga ishonamiz. Agar siz 14 kun ichida "57PROTOCOLS" 
              siz uchun foydali emas deb hisoblasangiz, biz pulingizni to'liq qaytarib beramiz. 
              Hech qanday savollar berilmaydi. Siz hech narsa yo'qotmaysiz.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-t from-gray-900/50 to-black">
        <div className="max-w-5xl mx-auto text-center">
          <div 
            id="final-cta"
            className={`animate-on-scroll transition-all duration-1000 ${
              isVisible['final-cta'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8">
              Hozir harakat qilmasangiz,
              <br />
              <span className="text-red-500">ertaga kech bo'ladi.</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto mb-16">
              Har kuni minglab mutaxassislar AI'dan foydalanishni boshlayapti. 
              Bu poygada g'olib bo'lish yoki chetda qolish — <span className="text-white font-bold">sizning tanlovingiz</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                onClick={handleTryDemo}
                variant="outline"
                className="bg-transparent border-2 border-gray-600 text-white hover:bg-gray-900 px-10 py-8 text-xl rounded-full transition-all hover:scale-105"
              >
                Avval bepul demoni sinab ko'raman
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-accent to-red-600 hover:from-red-600 hover:to-accent text-white px-10 py-8 text-xl font-bold rounded-full group transition-all hover:scale-110 animate-pulse"
              >
                Premiumga o'tish va kelajakni qo'lga olish
                <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-3" />
              </Button>
            </div>

            <p className="text-3xl font-bold mt-16 gradient-text">
              Kelajagingiz uchun bugun investitsiya qiling!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-black mb-6 md:mb-0">
              PROTOKOL57
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">100% Qoniqish Kafolati</p>
              <p className="text-gray-500 text-sm">14 kun ichida pul qaytarish</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}