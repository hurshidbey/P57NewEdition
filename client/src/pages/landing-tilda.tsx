import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Zap,
  Award,
  Users,
  Brain,
  Shield,
  Star,
  Play,
  Timer,
  TrendingDown
} from "lucide-react";

export default function LandingTilda() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 23,
    seconds: 45
  });

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

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Social proof data
  const testimonials = [
    {
      name: "Sardor Rahimov",
      role: "Marketing Manager",
      text: "57 protokol yordamida ishimda 400% samaradorlik oshirdim. ChatGPT endi menga aniq va professional javoblar beradi.",
      rating: 5
    },
    {
      name: "Nilufar Karimova",
      role: "Content Creator",
      text: "Ilgari soatlab vaqt ketgan ishlarni endi 15 daqiqada bajaraman. Bu platform hayotimni o'zgartirdi!",
      rating: 5
    },
    {
      name: "Bekzod Toshmatov",
      role: "IT Consultant",
      text: "Mijozlarim uchun yechimlar topishda AI dan 5 barobar yaxshi natijalar olishni o'rgandim.",
      rating: 5
    }
  ];

  const stats = {
    activeUsers: "2,847",
    protocols: "57",
    successRate: "94%",
    avgImprovement: "380%"
  };

  return (
    <div className="min-h-screen bg-white text-black font-inter">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .animate-fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gradient-accent {
          background: linear-gradient(135deg, #FF4F30 0%, #FF6B47 100%);
        }

        .text-gradient {
          background: linear-gradient(135deg, #FF4F30 0%, #FF6B47 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }

        .text-gradient-fallback {
          color: #FF4F30;
        }

        @supports not (-webkit-background-clip: text) {
          .text-gradient {
            background: none;
            color: #FF4F30;
          }
        }

        .section-padding {
          padding: 120px 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
      `}</style>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-lg border-b border-gray-200' : ''
      }`}>
        <div className="container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <img 
                src="/attached_assets/protokol57-logo-logo-black-rgb.svg" 
                alt="Protokol57 Logo" 
                className="h-8 w-8"
              />
              <div className="font-inter font-black text-2xl tracking-tight text-black">
                P57
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{stats.activeUsers}+ o'quvchi</span>
              </div>
              <Button 
                onClick={handleTryDemo}
                variant="outline"
                className="hidden sm:flex font-inter font-medium border-gray-300 text-black hover:bg-gray-100 px-6 py-2 rounded-full transition-all duration-300"
              >
                Demo
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="font-inter font-bold bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-full transition-all duration-300 hover:scale-105"
              >
                Premium
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20"></div>
        
        <div className="container relative z-10 text-center">
          {/* Urgency Banner */}
          <div className="animate-fade-in-up mb-8">
            <Badge className="bg-red-600/20 border border-red-500/30 text-red-300 px-6 py-3 text-sm font-medium backdrop-blur">
              <Timer className="w-4 h-4 mr-2" />
              50% chegirma {timeLeft.days} kun {timeLeft.hours} soat {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, '0')} qoldi
            </Badge>
          </div>

          <div className="animate-fade-in-up">
            <h1 className="font-inter font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight mb-8">
              <span className="block mb-2">AI dan 5x yaxshi natijalar</span>
              <span className="block text-gradient">30 kun ichida</span>
            </h1>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="font-inter font-medium text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              57 ta maxfiy protokol bilan ChatGPT va boshqa AI'lardan professional natijalar oling
            </p>
            <p className="font-inter font-light text-lg text-gray-400 max-w-5xl mx-auto mb-12">
              O'zbek tilida birinchi va yagona AI Prompting kursi - {stats.activeUsers}+ o'quvchi {stats.successRate} muvaffaqiyat ko'rsatkichi bilan
            </p>
          </div>

          {/* Social Proof */}
          <div className="animate-fade-in-up mb-12" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-gray-400 ml-2">4.9/5 ({stats.activeUsers}+ baho)</span>
            </div>
          </div>

          {/* Dual CTAs */}
          <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-center items-center" style={{ animationDelay: '0.4s' }}>
            <Button 
              onClick={handleTryDemo}
              variant="outline"
              className="font-inter font-medium bg-transparent border-2 border-gray-500 text-white hover:bg-gray-800 px-8 py-4 text-lg rounded-full group transition-all duration-300 hover:scale-105"
            >
              <Play className="mr-3 w-5 h-5" />
              Bepul Demo Sinash
            </Button>
            <Button 
              onClick={handleGetStarted}
              className="font-inter font-bold gradient-accent text-white px-8 py-4 text-lg rounded-full group transition-all duration-300 hover:scale-105 shadow-2xl relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                <span className="tracking-tight">Premium - 570,000 so'm</span>
                <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </Button>
          </div>

          {/* Risk Reversal */}
          <div className="animate-fade-in-up mt-8" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Shield className="w-4 h-4 text-green-400" />
              <span>30 kun ichida pul qaytarish kafolati</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-gradient-to-b from-black via-gray-900/10 to-black">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { stat: stats.activeUsers + "+", desc: "faol o'quvchi", highlight: true },
              { stat: stats.successRate, desc: "muvaffaqiyat ko'rsatkichi", highlight: true },
              { stat: stats.avgImprovement + "%", desc: "o'rtacha yaxshilanish", highlight: true },
              { stat: stats.protocols, desc: "maxfiy protokol", highlight: true }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="animate-fade-in-up p-8 rounded-2xl bg-gray-900/30 backdrop-blur border border-gray-800 hover:border-orange-500/30 transition-all"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="font-inter font-black text-4xl md:text-5xl mb-4 text-gradient">
                  {item.stat}
                </div>
                <div className="font-inter font-medium text-lg text-gray-700">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-inter font-black text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-8 text-black">
              O'quvchilarimiz nima deydi?
            </h2>
            <p className="font-inter font-medium text-xl text-gray-600 max-w-3xl mx-auto">
              {stats.activeUsers}+ o'quvchi hayotini o'zgartirdi. Sizning navbatingiz!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-2xl bg-white backdrop-blur border border-gray-200 hover:border-orange-500/30 transition-all duration-300 hover:scale-105 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="font-inter font-light text-lg text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-inter font-bold text-black text-lg">
                    {testimonial.name}
                  </div>
                  <div className="font-inter font-medium text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA in testimonials */}
          <div className="text-center mt-16">
            <p className="font-inter font-medium text-xl text-gray-700 mb-8">
              Sizham ularga qo'shiling va AI'dan professional foydalanishni boshlang!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleTryDemo}
                variant="outline"
                className="font-inter font-medium bg-transparent border-2 border-gray-300 text-black hover:bg-gray-100 px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105"
              >
                <Play className="mr-3 w-5 h-5" />
                Bepul Demo
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="font-inter font-bold gradient-accent text-white px-8 py-4 text-lg rounded-full group transition-all duration-300 hover:scale-105 shadow-2xl"
              >
                Premium olish
                <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-inter font-black text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight mb-8">
              Lekin sizda quyidagi
              <br />
              <span className="text-red-500">muammolardan</span>
              <br />
              biri bormi?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "ChatGPT javoblarida aniqlik yetishmayaptimi? Javoblar umumiymi?",
              "Har safar javoblar formatida va sifatida farq bormi?",
              "Professional natijaga erisha olmayapsiz S.I bilan.",
              "Yolg'on gapiryaptimi ochiqchasiga?",
              "Kreativ g'oya so'rasangiz, umumiy kopiya gaplar.",
              "Doim bir hil shablon javoblar"
            ].map((problem, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-2xl bg-gray-900/50 backdrop-blur border border-gray-800 hover:border-red-500/50 transition-all duration-300"
              >
                <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
                <p className="font-inter font-medium text-lg text-gray-300 leading-relaxed">
                  {problem}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="section-padding bg-gradient-to-b from-black via-gray-900/20 to-black">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-inter font-black text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight mb-8">
              <span className="block mb-2">P57 PLATFORMASI</span>
              <span className="block text-gradient">sizning yechimingiz</span>
            </h2>
            <p className="font-inter font-medium text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto">
              Sizga S.I bilan ishlash asosi hissoblangan promptlash texnikalarini o'rgatadi
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {[
                {
                  icon: BookOpen,
                  title: "57 ta aniq protokol",
                  description: "har biri amaliy misol va tushuntirish bilan"
                },
                {
                  icon: Brain,
                  title: "Promptlash asoslari mini kursi",
                  description: "Promptlash asoslarini o'rganing"
                },
                {
                  icon: Target,
                  title: "Sun'iy Intellekt va Tanqidiy fikrlash",
                  description: "mini kursi - boshlang'ich darajadan yuqori darajagacha"
                },
                {
                  icon: Zap,
                  title: "50+ Premium promptlar",
                  description: "Biznes, shaxsiy rivojlanish va kontentga aloqador"
                },
                {
                  icon: Users,
                  title: "Asosiy LLMlar bilan ishlaydi",
                  description: "ChatGPT, Claude, Grok va Gemini bilan ishlaydi"
                },
                {
                  icon: Award,
                  title: "Bonus: Sun'iy Intellekt bilan mashq qilish",
                  description: "(BETA) - yangi funksiyalarini bepul olish"
                }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-inter font-bold text-xl lg:text-2xl mb-3 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="font-inter font-light text-base lg:text-lg text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 border border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 text-center">
                  <div className="text-8xl font-black mb-6 text-gradient">57</div>
                  <div className="text-2xl text-gray-300 mb-8">Professional Protokol</div>
                  
                  <div className="space-y-4">
                    <div className="bg-black/50 backdrop-blur rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Samaradorlik</span>
                        <span className="text-2xl font-bold text-green-400">+500%</span>
                      </div>
                    </div>
                    
                    <div className="bg-black/50 backdrop-blur rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Vaqt tejash</span>
                        <span className="text-2xl font-bold text-blue-400">90%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-padding bg-gradient-to-b from-black via-gray-900/20 to-black">
        <div className="container">
          <div className="text-center mb-16">
            {/* Urgency Countdown */}
            <div className="mb-8">
              <Badge className="bg-red-600/20 border border-red-500/30 text-red-300 px-6 py-3 text-lg font-bold backdrop-blur animate-pulse">
                <Timer className="w-5 h-5 mr-2" />
                Chegirma tugaydi: {timeLeft.days}k {timeLeft.hours}s {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, '0')}
              </Badge>
            </div>

            <h2 className="font-inter font-black text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-8">
              Tanlov vaqti keldi
            </h2>
            <p className="font-inter font-medium text-xl text-gray-400 mb-4">
              AI inqilob boshlandi. Tomoshabin bo'lib qoling yoki yetakchi bo'ling?
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-800 via-gray-900 to-black border-2 border-orange-500/50 p-8 md:p-12 relative overflow-hidden hover:border-orange-500/70 transition-all hover:scale-105">
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/20 rounded-full blur-3xl"></div>
              
              <Badge className="absolute -top-4 left-8 gradient-accent text-white text-lg px-6 py-2 font-bold">
                🔥 50% Chegirma
              </Badge>
              
              <CardContent className="p-0 relative z-10">
                <div className="text-center mb-8">
                  <h3 className="font-inter font-black text-2xl md:text-3xl mb-6">Premium - Barcha Protokollar</h3>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <span className="text-3xl md:text-4xl text-gray-500 line-through">1,140,000 so'm</span>
                      <Badge className="bg-red-600 text-white px-3 py-1 text-sm">-50%</Badge>
                    </div>
                    <div className="flex items-baseline justify-center gap-3 mb-4">
                      <span className="text-6xl md:text-7xl font-black text-gradient">570,000</span>
                      <span className="text-xl md:text-2xl text-gray-400">so'm</span>
                    </div>
                    <p className="text-gray-400">Bir martalik to'lov • Hayotiy foydalanish</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  <div className="space-y-4">
                    {[
                      "✅ Barcha 57 ta maxfiy protokol",
                      "✅ 50+ tayyor premium promptlar", 
                      "✅ Promptlash asoslari to'liq kursi",
                      "✅ Tanqidiy fikrlash bo'yicha darslar"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="font-inter font-medium text-base text-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[
                      "✅ AI bilan mashq qilish (BETA)",
                      "✅ Yangi protokollar bepul",
                      "✅ 30 kun pul qaytarish kafolati",
                      "✅ Hayotiy texnik yordam"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="font-inter font-medium text-base text-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Value Proposition */}
                <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-6 mb-8">
                  <div className="text-center">
                    <h4 className="font-inter font-bold text-xl text-green-400 mb-2">💰 ROI Hisobi</h4>
                    <p className="text-gray-300 text-lg">
                      Agar AI orqali oyiga atigi <span className="font-bold text-white">2 soat vaqt tejasangiz</span>, 
                      570,000 so'm <span className="font-bold text-green-400">3 oyda o'zini qopladi</span>!
                    </p>
                  </div>
                </div>

                {/* Risk Reversal */}
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <h4 className="font-inter font-bold text-xl text-blue-400">100% Xavfsiz Xarid</h4>
                  </div>
                  <p className="text-center text-gray-300">
                    30 kun ichida to'liq pul qaytarish. Agar natija ko'rmasangiz - pulingizni qaytaramiz. Hech qanday savol-javobsiz.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button 
                    onClick={handleGetStarted}
                    className="w-full gradient-accent text-white py-6 text-xl font-bold rounded-xl group transition-all hover:scale-105 shadow-2xl relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <span className="tracking-tight">Premium olish - 570,000 so'm</span>
                      <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-2" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  </Button>
                  
                  <Button 
                    onClick={handleTryDemo}
                    variant="outline"
                    className="w-full font-inter font-medium bg-transparent border-2 border-gray-500 text-white hover:bg-gray-800 py-4 text-lg rounded-xl transition-all duration-300"
                  >
                    <Play className="mr-3 w-5 h-5" />
                    Avval bepul demo'ni sinab ko'raman
                  </Button>
                </div>

                <p className="text-center text-gray-400 text-sm mt-6">
                  {stats.activeUsers}+ o'quvchi ishonch bildirdi • {stats.successRate} muvaffaqiyat ko'rsatkichi
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding bg-gradient-to-t from-gray-900/50 via-red-900/10 to-black">
        <div className="container text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="font-inter font-black text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-8">
                Hozir harakat qilmasangiz,
                <br />
                <span className="text-red-400">ertaga kech bo'ladi</span>
              </h2>
              <p className="font-inter font-medium text-xl text-gray-300 mb-8">
                Har kuni minglab mutaxassislar AI'dan foydalanishni boshlayapti. 
                Bu poygada g'olib bo'lish yoki chetda qolish - <span className="text-white font-bold">sizning tanlovingiz</span>.
              </p>
            </div>

            {/* Final Urgency */}
            <div className="bg-red-600/10 border border-red-500/30 rounded-2xl p-8 mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <TrendingDown className="w-8 h-8 text-red-400" />
                <h3 className="font-inter font-bold text-2xl text-red-400">Chegirma Tugaydi!</h3>
              </div>
              <div className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-6">
                <div className="bg-red-600/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-white">{timeLeft.days}</div>
                  <div className="text-sm text-gray-400">kun</div>
                </div>
                <div className="bg-red-600/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-white">{timeLeft.hours}</div>
                  <div className="text-sm text-gray-400">soat</div>
                </div>
                <div className="bg-red-600/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-white">{timeLeft.minutes}</div>
                  <div className="text-sm text-gray-400">daqiqa</div>
                </div>
                <div className="bg-red-600/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-white">{timeLeft.seconds}</div>
                  <div className="text-sm text-gray-400">soniya</div>
                </div>
              </div>
              <p className="text-gray-300 text-lg">
                Chegirma tugagach, narx <span className="font-bold text-white">1,140,000 so'm</span> ga qaytadi
              </p>
            </div>

            {/* Final CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
              <Button 
                onClick={handleTryDemo}
                variant="outline"
                className="flex-1 font-inter font-medium bg-transparent border-2 border-gray-500 text-white hover:bg-gray-800 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Play className="mr-3 w-5 h-5" />
                Avval demo'ni sinab ko'raman
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="flex-1 font-inter font-bold gradient-accent text-white py-6 text-lg rounded-xl group transition-all duration-300 hover:scale-110 shadow-2xl animate-pulse"
              >
                Premium olish va kelajakni boshqarish
                <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-3" />
              </Button>
            </div>

            <div className="mt-12 text-center">
              <p className="text-2xl font-bold text-gradient">
                Kelajagingiz uchun bugun investitsiya qiling!
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm">30 kun ichida 100% pul qaytarish kafolati</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-16 bg-gray-900/30">
        <div className="container">
          <div className="text-center">
            <div className="font-inter font-black text-4xl mb-8 text-gradient">
              P57
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div>
                <h4 className="font-inter font-bold text-lg text-white mb-4">Mahsulot</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>57 ta protokol</li>
                  <li>Premium promptlar</li>
                  <li>AI mashq qilish</li>
                </ul>
              </div>
              <div>
                <h4 className="font-inter font-bold text-lg text-white mb-4">Yordam</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>30 kun pul qaytarish</li>
                  <li>Texnik yordam</li>
                  <li>Savol-javoblar</li>
                </ul>
              </div>
              <div>
                <h4 className="font-inter font-bold text-lg text-white mb-4">Statistika</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>{stats.activeUsers}+ o'quvchi</li>
                  <li>{stats.successRate} muvaffaqiyat</li>
                  <li>{stats.avgImprovement}% yaxshilanish</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 pt-8">
              <p className="text-gray-400 mb-2">© 2025 P57 - AI Prompting Platformasi</p>
              <p className="text-gray-500 text-sm">Sun'iy Intellektdan Professional Foydalaning</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}