import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Star,
  Play,
  Timer,
  Shield,
  Users
} from "lucide-react";

export default function LandingTildaNew() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 23,
    seconds: 45
  });

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

  const stats = {
    activeUsers: "2,847",
    successRate: "94%"
  };

  return (
    <div style={{ backgroundColor: 'white', color: 'black', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }

        .text-gradient {
          background: linear-gradient(135deg, #FF4F30 0%, #FF6B47 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: #FF4F30;
        }
      `}</style>

      {/* Header */}
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50, 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '80px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="/attached_assets/p57LogoEmail.png" 
              alt="P57 Logo" 
              style={{ height: '32px', width: 'auto' }}
            />
            <div style={{ 
              fontWeight: '900', 
              fontSize: '24px', 
              letterSpacing: '-0.02em',
              color: 'black'
            }}>
              PROTOKOL57
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '14px', 
              color: '#6b7280' 
            }}>
              <Users style={{ width: '16px', height: '16px' }} />
              <span>{stats.activeUsers}+ o'quvchi</span>
            </div>
            <Button 
              onClick={handleTryDemo}
              variant="outline"
              style={{
                border: '2px solid #d1d5db',
                color: 'black',
                backgroundColor: 'transparent',
                padding: '8px 24px',
                borderRadius: '9999px',
                fontWeight: '500'
              }}
            >
              Demo
            </Button>
            <Button 
              onClick={handleGetStarted}
              style={{
                backgroundColor: 'black',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '9999px',
                fontWeight: '700',
                border: 'none'
              }}
            >
              Premium
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        paddingTop: '80px',
        backgroundColor: 'white'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'center'
        }}>
          {/* Hero Content - Left Side */}
          <div>
            {/* Urgency Banner */}
            <div style={{ marginBottom: '32px' }}>
              <Badge style={{ 
                backgroundColor: 'rgba(220, 38, 38, 0.1)', 
                border: '1px solid rgba(220, 38, 38, 0.3)', 
                color: '#dc2626', 
                padding: '12px 24px', 
                fontSize: '14px', 
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '9999px',
                width: 'fit-content'
              }}>
                <Timer style={{ width: '16px', height: '16px' }} />
                50% chegirma {timeLeft.days} kun {timeLeft.hours} soat {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, '0')} qoldi
              </Badge>
            </div>

            <h1 style={{ 
              fontWeight: '900', 
              fontSize: '64px', 
              lineHeight: '0.9', 
              letterSpacing: '-0.02em', 
              marginBottom: '32px',
              color: 'black'
            }}>
              <span style={{ display: 'block', marginBottom: '8px', color: 'black' }}>
                AI dan 5x yaxshi natijalar
              </span>
              <span className="text-gradient" style={{ display: 'block' }}>
                30 kun ichida
              </span>
            </h1>
            
            <p style={{ 
              fontWeight: '500', 
              fontSize: '24px', 
              color: '#374151', 
              maxWidth: '600px', 
              marginBottom: '32px', 
              lineHeight: '1.6'
            }}>
              57 ta maxfiy protokol bilan ChatGPT va boshqa AI'lardan professional natijalar oling
            </p>
            
            <p style={{ 
              fontWeight: '300', 
              fontSize: '18px', 
              color: '#6b7280', 
              maxWidth: '600px', 
              marginBottom: '48px',
              lineHeight: '1.7'
            }}>
              O'zbek tilida birinchi va yagona AI Prompting kursi - {stats.activeUsers}+ o'quvchi {stats.successRate} muvaffaqiyat ko'rsatkichi bilan
            </p>

            {/* Social Proof */}
            <div style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} style={{ width: '20px', height: '20px', fill: '#fbbf24', color: '#fbbf24' }} />
                ))}
                <span style={{ color: '#6b7280', marginLeft: '8px' }}>4.9/5 ({stats.activeUsers}+ baho)</span>
              </div>
            </div>

            {/* Dual CTAs */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <Button 
                onClick={handleTryDemo}
                variant="outline"
                style={{
                  border: '2px solid #d1d5db',
                  color: 'black',
                  backgroundColor: 'transparent',
                  padding: '16px 32px',
                  fontSize: '18px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Play style={{ width: '20px', height: '20px' }} />
                Bepul Demo Sinash
              </Button>
              <Button 
                onClick={handleGetStarted}
                style={{
                  backgroundColor: 'black',
                  color: 'white',
                  padding: '16px 32px',
                  fontSize: '18px',
                  borderRadius: '9999px',
                  fontWeight: '700',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                Premium - 570,000 so'm
                <ArrowRight style={{ width: '20px', height: '20px' }} />
              </Button>
            </div>

            {/* Risk Reversal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
              <Shield style={{ width: '16px', height: '16px', color: '#10b981' }} />
              <span>30 kun ichida pul qaytarish kafolati</span>
            </div>
          </div>

          {/* Hero Background - Right Side */}
          <div style={{
            backgroundImage: 'url(/attached_assets/ai_va_fikrlash.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '500px',
            width: '100%'
          }}>
          </div>
        </div>
      </section>
    </div>
  );
}