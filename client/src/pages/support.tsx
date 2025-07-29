import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import { Loader2, Send, CheckCircle, AlertCircle, MessageSquare, Mail, User, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';

type SupportTopic = 'technical' | 'payment' | 'feature' | 'other';

interface SupportFormData {
  name: string;
  email: string;
  phone: string;
  telegram: string;
  sameAsPhone: boolean;
  topic: SupportTopic;
  message: string;
}

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<SupportFormData>({
    name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    telegram: '',
    sameAsPhone: false,
    topic: 'technical',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<SupportFormData>>({});

  const topicLabels: Record<SupportTopic, string> = {
    technical: 'Texnik muammo',
    payment: 'To\'lov bilan bog\'liq',
    feature: 'Yangi funksiya so\'rovi',
    other: 'Boshqa'
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SupportFormData> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email manzil kiritish shart';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email manzil noto\'g\'ri';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon raqam kiritish shart';
    } else if (!/^(\+998)?[0-9]{9}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Telefon raqam noto\'g\'ri (masalan: +998901234567)';
    }
    
    if (!formData.sameAsPhone && !formData.telegram.trim()) {
      newErrors.telegram = 'Telegram username yoki raqam kiritish shart';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Xabar kiritish shart';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Xabar kamida 10 ta belgidan iborat bo\'lishi kerak';
    } else if (formData.message.length > 1000) {
      newErrors.message = 'Xabar 1000 ta belgidan oshmasligi kerak';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/support/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          telegram: formData.sameAsPhone ? formData.phone : formData.telegram
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Xatolik yuz berdi');
      }
      
      setSubmitted(true);
      toast({
        title: 'Muvaffaqiyatli yuborildi!',
        description: 'Sizning xabaringiz qabul qilindi. Tez orada javob beramiz.',
      });
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
          email: user?.email || '',
          phone: '',
          telegram: '',
          sameAsPhone: false,
          topic: 'technical',
          message: ''
        });
      }, 5000);
      
    } catch (error: any) {
      console.error('Support form error:', error);
      
      let errorMessage = 'Xabarni yuborishda xatolik yuz berdi';
      
      if (error.message.includes('rate limit') || error.message.includes('ko\'p')) {
        errorMessage = 'Juda ko\'p so\'rov yuborildi. Iltimos biroz kuting.';
      }
      
      toast({
        title: 'Xatolik',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-2xl mx-auto px-4 py-16">
          <Card className="border-2 border-theme shadow-brutal">
            <CardContent className="py-16 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-foreground mb-4">
                Xabaringiz yuborildi!
              </h2>
              <p className="text-muted-foreground mb-8">
                Sizning murojatingiz qabul qilindi. Tez orada ko'rsatilgan telegram manzilingizga javob yuboramiz.
              </p>
              <Link href="/">
                <Button className="bg-accent hover:bg-accent/90 text-white font-bold uppercase">
                  Bosh sahifaga qaytish
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="border-2 border-theme shadow-brutal">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-black uppercase flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Yordam markazi
            </CardTitle>
            <CardDescription className="text-base">
              Savollaringiz bormi? Bizga yozing, tez orada javob beramiz.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold uppercase flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Ismingiz (ixtiyoriy)
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ismingizni kiriting"
                  className="border-2 border-theme focus:border-accent"
                  disabled={loading}
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold uppercase flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email manzilingiz *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className={`border-2 ${errors.email ? 'border-red-500' : 'border-theme'} focus:border-accent`}
                  disabled={loading}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500 font-bold">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-bold uppercase flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefon raqamingiz *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+998901234567"
                  className={`border-2 ${errors.phone ? 'border-red-500' : 'border-theme'} focus:border-accent`}
                  disabled={loading}
                  required
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 font-bold">{errors.phone}</p>
                )}
              </div>

              {/* Telegram Field */}
              <div className="space-y-2">
                <Label htmlFor="telegram" className="text-sm font-bold uppercase flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Telegram username yoki raqam *
                </Label>
                
                {/* Same as phone checkbox */}
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="sameAsPhone"
                    checked={formData.sameAsPhone}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, sameAsPhone: checked as boolean })
                    }
                    disabled={loading}
                  />
                  <label
                    htmlFor="sameAsPhone"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Shu raqamda telegram bor
                  </label>
                </div>
                
                <Input
                  id="telegram"
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  placeholder={formData.sameAsPhone ? "Telefon raqamingiz ishlatiladi" : "@username yoki +998901234567"}
                  className={`border-2 ${errors.telegram ? 'border-red-500' : 'border-theme'} focus:border-accent`}
                  disabled={loading || formData.sameAsPhone}
                  required={!formData.sameAsPhone}
                />
                {errors.telegram && (
                  <p className="text-sm text-red-500 font-bold">{errors.telegram}</p>
                )}
              </div>

              {/* Topic Field */}
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-sm font-bold uppercase">
                  Murojaat mavzusi *
                </Label>
                <Select
                  value={formData.topic}
                  onValueChange={(value: SupportTopic) => setFormData({ ...formData, topic: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="border-2 border-theme focus:border-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(topicLabels) as SupportTopic[]).map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topicLabels[topic]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-bold uppercase">
                  Xabaringiz *
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Muammongizni batafsil yozing..."
                  className={`border-2 ${errors.message ? 'border-red-500' : 'border-theme'} focus:border-accent min-h-[150px] resize-none`}
                  disabled={loading}
                  required
                />
                <div className="flex justify-between text-sm">
                  <span className={`font-bold ${errors.message ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {errors.message || `${formData.message.length}/1000 belgi`}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-white font-bold uppercase py-6 text-lg border-2 border-theme hover:shadow-brutal-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Xabarni yuborish
                  </>
                )}
              </Button>

              {/* Info Alert */}
              <Alert className="border-2 border-theme">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-bold">
                  Javoblarni telegram orqali yuqoridagi manzilga yuboramiz. 
                  Telegram akkountingizda xabarlarni qabul qilish ochiq bo'lishi kerak.
                </AlertDescription>
              </Alert>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <AppFooter />
    </div>
  );
}