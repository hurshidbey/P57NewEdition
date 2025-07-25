import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Lock, Unlock, TrendingUp, Users, DollarSign, FileText, Edit, Trash2, Plus, Tag, Calendar, Percent, Hash, RefreshCw, AlertCircle } from 'lucide-react';
import AnalyticsDashboard from '@/components/analytics-dashboard';

interface Protocol {
  id: number;
  number: number;
  title: string;
  description: string;
  badExample?: string;
  goodExample?: string;
  categoryId: number;
  notes?: string;
  problemStatement?: string;
  whyExplanation?: string;
  solutionApproach?: string;
  difficultyLevel?: string;
  levelOrder?: number;
  isFreeAccess: boolean;
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Prompt {
  id: number;
  title: string;
  content: string;
  description?: string;
  category: string;
  isPremium: boolean;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  tier: 'free' | 'paid';
  createdAt: string;
}

interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  originalPrice: number;
  maxUses?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
}

interface CouponUsage {
  id: number;
  couponId: number;
  userId: string;
  userEmail: string;
  paymentId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedAt: string;
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponUsages, setCouponUsages] = useState<CouponUsage[]>([]);
  const [activeTab, setActiveTab] = useState('protocols');
  const [stats, setStats] = useState({
    totalUsers: 0,
    paidUsers: 0,
    totalRevenue: 0,
    totalProtocols: 0,
    freeProtocols: 0,
    activeCoupons: 0,
    totalCouponUsage: 0
  });
  
  // Individual loading states
  const [loadingStates, setLoadingStates] = useState({
    protocols: false,
    prompts: false,
    categories: false,
    users: false,
    payments: false,
    coupons: false
  });
  
  // Error states
  const [errors, setErrors] = useState({
    protocols: null as string | null,
    prompts: null as string | null,
    categories: null as string | null,
    users: null as string | null,
    payments: null as string | null,
    coupons: null as string | null
  });

  // Dialog states
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [couponUsageDialogOpen, setCouponUsageDialogOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);

  // Form states
  const [protocolForm, setProtocolForm] = useState<Partial<Protocol>>({});
  const [promptForm, setPromptForm] = useState<Partial<Prompt>>({});
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({});

  // Check if user is admin
  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL || 
                  user?.email === 'hurshidbey@gmail.com' || 
                  user?.email === 'mustafaabdurahmonov7777@gmail.com';
  
  console.log('[Admin Page] Rendering', {
    userEmail: user?.email,
    isAuthenticated,
    isAdmin,
    VITE_ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL
  });

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  const loadData = async () => {
    setLoading(true);
    
    // Reset errors
    setErrors({
      protocols: null,
      prompts: null,
      categories: null,
      users: null,
      payments: null,
      coupons: null
    });
    
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('No auth token - please login first');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load data in parallel with individual error handling
      const loadProtocols = async () => {
        setLoadingStates(prev => ({ ...prev, protocols: true }));
        try {
          const protocolsRes = await fetch('/api/admin/protocols', { headers });
          if (!protocolsRes.ok) {
            const error = await protocolsRes.json();
            throw new Error(error.message || error.error || 'Failed to load protocols');
          }
          const data = await protocolsRes.json();
          setProtocols(data);
          
          // Calculate stats
          const freeCount = data.filter((p: Protocol) => p.isFreeAccess).length;
          setStats(prev => ({
            ...prev,
            totalProtocols: data.length,
            freeProtocols: freeCount
          }));
        } catch (error: any) {
          setErrors(prev => ({ ...prev, protocols: error.message }));
          console.error('Failed to load protocols:', error);
        } finally {
          setLoadingStates(prev => ({ ...prev, protocols: false }));
        }
      };

      const loadCategories = async () => {
        setLoadingStates(prev => ({ ...prev, categories: true }));
        try {
          const categoriesRes = await fetch('/api/categories', { headers });
          if (!categoriesRes.ok) {
            throw new Error('Failed to load categories');
          }
          const data = await categoriesRes.json();
          setCategories(data);
        } catch (error: any) {
          setErrors(prev => ({ ...prev, categories: error.message }));
          console.error('Failed to load categories:', error);
        } finally {
          setLoadingStates(prev => ({ ...prev, categories: false }));
        }
      };

      const loadPrompts = async () => {
        setLoadingStates(prev => ({ ...prev, prompts: true }));
        try {
          const promptsRes = await fetch('/api/admin/prompts', { headers });
          if (!promptsRes.ok) {
            const error = await promptsRes.json();
            throw new Error(error.message || error.error || 'Failed to load prompts');
          }
          const data = await promptsRes.json();
          setPrompts(data);
        } catch (error: any) {
          setErrors(prev => ({ ...prev, prompts: error.message }));
          console.error('Failed to load prompts:', error);
        } finally {
          setLoadingStates(prev => ({ ...prev, prompts: false }));
        }
      };

      const loadUsers = async () => {
        setLoadingStates(prev => ({ ...prev, users: true }));
        try {
          const usersRes = await fetch('/api/admin/users', { headers });
          if (!usersRes.ok) {
            const error = await usersRes.json();
            throw new Error(error.message || error.error || 'Failed to load users');
          }
          const data = await usersRes.json();
          setUsers(data);
          
          const paidCount = data.filter((u: User) => u.tier === 'paid').length;
          setStats(prev => ({
            ...prev,
            totalUsers: data.length,
            paidUsers: paidCount
          }));
        } catch (error: any) {
          setErrors(prev => ({ ...prev, users: error.message }));
          console.error('Failed to load users:', error);
        } finally {
          setLoadingStates(prev => ({ ...prev, users: false }));
        }
      };

      const loadPayments = async () => {
        setLoadingStates(prev => ({ ...prev, payments: true }));
        try {
          const paymentsRes = await fetch('/api/admin/payments', { headers });
          if (!paymentsRes.ok) {
            const error = await paymentsRes.json();
            throw new Error(error.message || error.error || 'Failed to load payments');
          }
          const data = await paymentsRes.json();
          setPayments(data);
          
          const revenue = data
            .filter((p: Payment) => p.status === 'completed')
            .reduce((sum: number, p: Payment) => sum + p.amount, 0);
          
          setStats(prev => ({
            ...prev,
            totalRevenue: revenue
          }));
        } catch (error: any) {
          setErrors(prev => ({ ...prev, payments: error.message }));
          console.error('Failed to load payments:', error);
        } finally {
          setLoadingStates(prev => ({ ...prev, payments: false }));
        }
      };

      const loadCoupons = async () => {
        setLoadingStates(prev => ({ ...prev, coupons: true }));
        try {
          const couponsRes = await fetch('/api/admin/coupons', { headers });
          if (!couponsRes.ok) {
            const error = await couponsRes.json();
            throw new Error(error.message || error.error || 'Failed to load coupons');
          }
          const data = await couponsRes.json();
          setCoupons(data);
          
          const activeCount = data.filter((c: Coupon) => c.isActive).length;
          const totalUsage = data.reduce((sum: number, c: Coupon) => sum + c.usedCount, 0);
          
          setStats(prev => ({
            ...prev,
            activeCoupons: activeCount,
            totalCouponUsage: totalUsage
          }));
        } catch (error: any) {
          setErrors(prev => ({ ...prev, coupons: error.message }));
          console.error('Failed to load coupons:', error);
        } finally {
          setLoadingStates(prev => ({ ...prev, coupons: false }));
        }
      };

      // Load all data in parallel
      await Promise.all([
        loadProtocols(),
        loadCategories(),
        loadPrompts(),
        loadUsers(),
        loadPayments(),
        loadCoupons()
      ]);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load admin data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProtocolAccess = async (protocolId: number, currentAccess: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`/api/admin/protocols/${protocolId}/toggle-free`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFreeAccess: !currentAccess })
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: `Protocol access updated`
        });
        loadData(); // Reload data
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update protocol access',
        variant: 'destructive'
      });
    }
  };

  // Protocol CRUD functions
  const openProtocolDialog = (protocol?: Protocol) => {
    if (protocol) {
      setEditingProtocol(protocol);
      setProtocolForm(protocol);
    } else {
      setEditingProtocol(null);
      setProtocolForm({
        number: protocols.length + 1,
        title: '',
        description: '',
        categoryId: 1,
        isFreeAccess: false
      });
    }
    setProtocolDialogOpen(true);
  };

  const saveProtocol = async () => {
    // Validation
    if (!protocolForm.title?.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Protokol nomi kiritilishi shart',
        variant: 'destructive'
      });
      return;
    }

    if (!protocolForm.description?.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Protokol tavsifi kiritilishi shart',
        variant: 'destructive'
      });
      return;
    }

    if (!protocolForm.categoryId) {
      toast({
        title: 'Xatolik',
        description: 'Kategoriya tanlanishi shart',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Autentifikatsiya xatosi - iltimos qaytadan kiring');
      }

      const url = editingProtocol 
        ? `/api/admin/protocols/${editingProtocol.id}`
        : '/api/admin/protocols';
      
      const method = editingProtocol ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(protocolForm)
      });

      if (res.ok) {
        toast({
          title: 'Muvaffaqiyat',
          description: `Protokol ${editingProtocol ? 'yangilandi' : 'yaratildi'}`
        });
        setProtocolDialogOpen(false);
        setProtocolForm({});
        setEditingProtocol(null);
        loadData();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Protokolni saqlashda xatolik yuz berdi');
      }
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'Protokolni saqlashda xatolik yuz berdi',
        variant: 'destructive'
      });
    }
  };

  const deleteProtocol = async (protocolId: number) => {
    if (!confirm('Ushbu protokolni o\'chirishni xohlaysizmi? Bu amalni bekor qilib bo\'lmaydi.')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`/api/admin/protocols/${protocolId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Protocol deleted successfully'
        });
        loadData();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete protocol',
        variant: 'destructive'
      });
    }
  };

  // Prompt CRUD functions
  const openPromptDialog = (prompt?: Prompt) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setPromptForm(prompt);
    } else {
      setEditingPrompt(null);
      setPromptForm({
        title: '',
        content: '',
        description: '',
        category: 'General',
        isPremium: false,
        isPublic: true
      });
    }
    setPromptDialogOpen(true);
  };

  const savePrompt = async () => {
    // Validation
    if (!promptForm.title?.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Prompt nomi kiritilishi shart',
        variant: 'destructive'
      });
      return;
    }

    if (!promptForm.content?.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Prompt matni kiritilishi shart',
        variant: 'destructive'
      });
      return;
    }

    if (!promptForm.category?.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Kategoriya kiritilishi shart',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Autentifikatsiya xatosi - iltimos qaytadan kiring');
      }

      const url = editingPrompt 
        ? `/api/admin/prompts/${editingPrompt.id}`
        : '/api/admin/prompts';
      
      const method = editingPrompt ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promptForm)
      });

      if (res.ok) {
        toast({
          title: 'Muvaffaqiyat',
          description: `Prompt ${editingPrompt ? 'yangilandi' : 'yaratildi'}`
        });
        setPromptDialogOpen(false);
        setPromptForm({});
        setEditingPrompt(null);
        loadData();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Promptni saqlashda xatolik yuz berdi');
      }
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'Promptni saqlashda xatolik yuz berdi',
        variant: 'destructive'
      });
    }
  };

  const deletePrompt = async (promptId: number) => {
    if (!confirm('Ushbu promptni o\'chirishni xohlaysizmi? Bu amalni bekor qilib bo\'lmaydi.')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`/api/admin/prompts/${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Prompt deleted successfully'
        });
        loadData();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete prompt',
        variant: 'destructive'
      });
    }
  };

  // Coupon CRUD functions
  const openCouponDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponForm(coupon);
    } else {
      setEditingCoupon(null);
      setCouponForm({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 60,
        originalPrice: 1425000,
        isActive: true
      });
    }
    setCouponDialogOpen(true);
  };

  const generateCouponCode = () => {
    const prefix = 'P57';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponForm(prev => ({ ...prev, code }));
  };

  const saveCoupon = async () => {
    // Validation
    if (!couponForm.code?.trim()) {
      toast({
        title: 'Xatolik',
        description: 'Kupon kodi kiritilishi shart',
        variant: 'destructive'
      });
      return;
    }

    if (!couponForm.discountValue || couponForm.discountValue <= 0) {
      toast({
        title: 'Xatolik',
        description: 'Chegirma miqdori kiritilishi shart',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Autentifikatsiya xatosi - iltimos qaytadan kiring');
      }

      const url = editingCoupon 
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons';
      
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(couponForm)
      });

      if (res.ok) {
        toast({
          title: 'Muvaffaqiyat',
          description: `Kupon ${editingCoupon ? 'yangilandi' : 'yaratildi'}`
        });
        setCouponDialogOpen(false);
        setCouponForm({});
        setEditingCoupon(null);
        loadData();
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Kuponni saqlashda xatolik yuz berdi');
      }
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'Kuponni saqlashda xatolik yuz berdi',
        variant: 'destructive'
      });
    }
  };

  const deleteCoupon = async (couponId: number) => {
    if (!confirm('Ushbu kuponni o\'chirishni xohlaysizmi? Bu amalni bekor qilib bo\'lmaydi.')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        toast({
          title: 'Muvaffaqiyat',
          description: 'Kupon o\'chirildi'
        });
        loadData();
      } else {
        throw new Error('Kuponni o\'chirishda xatolik');
      }
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'Kuponni o\'chirishda xatolik yuz berdi',
        variant: 'destructive'
      });
    }
  };

  const toggleCouponActive = async (couponId: number, currentActive: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`/api/admin/coupons/${couponId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentActive })
      });

      if (res.ok) {
        toast({
          title: 'Muvaffaqiyat',
          description: `Kupon ${!currentActive ? 'faollashtirildi' : 'o\'chirildi'}`
        });
        loadData();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'Kupon holatini o\'zgartirishda xatolik',
        variant: 'destructive'
      });
    }
  };

  const viewCouponUsage = async (couponId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`/api/admin/coupons/${couponId}/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setCouponUsages(data);
        setSelectedCouponId(couponId);
        setCouponUsageDialogOpen(true);
      } else {
        throw new Error('Failed to fetch usage');
      }
    } catch (error) {
      toast({
        title: 'Xatolik',
        description: 'Foydalanish tarixini yuklashda xatolik',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-black text-foreground mb-4">Kirish taqiqlangan</h1>
            <p className="text-muted-foreground">Faqat administratorlar kira oladi</p>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-black text-foreground mb-8">Admin Panel</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami Foydalanuvchilar</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PRO Foydalanuvchilar</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Umumiy Daromad</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} UZS</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami Protokollar</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProtocols}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bepul Protokollar</CardTitle>
              <Unlock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.freeProtocols}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="protocols">Protokollar</TabsTrigger>
            <TabsTrigger value="prompts">Promptlar</TabsTrigger>
            <TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
            <TabsTrigger value="payments">To'lovlar</TabsTrigger>
            <TabsTrigger value="coupons">Kuponlar</TabsTrigger>
            <TabsTrigger value="analytics">Analitika</TabsTrigger>
          </TabsList>

          {/* Protocols Tab */}
          <TabsContent value="protocols">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Protokollarni boshqarish</CardTitle>
                  <CardDescription>Protokollarni yaratish, tahrirlash va boshqarish</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadData}
                    disabled={loadingStates.protocols}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingStates.protocols ? 'animate-spin' : ''}`} />
                    Yangilash
                  </Button>
                  <Button onClick={() => openProtocolDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Yangi protokol
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {errors.protocols && (
                  <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p>{errors.protocols}</p>
                  </div>
                )}
                
                {loadingStates.protocols ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : protocols.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Hech qanday protokol topilmadi
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>№</TableHead>
                        <TableHead>Nomi</TableHead>
                        <TableHead>Kategoriya</TableHead>
                        <TableHead>Kirish</TableHead>
                        <TableHead>Yaratilgan</TableHead>
                        <TableHead>Harakatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {protocols.map((protocol) => (
                        <TableRow key={protocol.id}>
                          <TableCell>{protocol.number}</TableCell>
                          <TableCell className="font-medium">{protocol.title}</TableCell>
                          <TableCell>
                            {categories.find(c => c.id === protocol.categoryId)?.name || protocol.categoryId}
                          </TableCell>
                          <TableCell>
                            <Badge variant={protocol.isFreeAccess ? 'default' : 'secondary'}>
                              {protocol.isFreeAccess ? (
                                <><Unlock className="h-3 w-3 mr-1" /> Bepul</>
                              ) : (
                                <><Lock className="h-3 w-3 mr-1" /> PRO</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {protocol.createdAt ? new Date(protocol.createdAt).toLocaleDateString('uz-UZ') : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={protocol.isFreeAccess}
                                onCheckedChange={() => toggleProtocolAccess(protocol.id, protocol.isFreeAccess)}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openProtocolDialog(protocol)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteProtocol(protocol.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Promptlarni boshqarish</CardTitle>
                  <CardDescription>Promptlarni yaratish, tahrirlash va boshqarish</CardDescription>
                </div>
                <Button onClick={() => openPromptDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi prompt
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomi</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Turi</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead>Yaratilgan</TableHead>
                      <TableHead>Harakatlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prompts.map((prompt) => (
                      <TableRow key={prompt.id}>
                        <TableCell className="font-medium">{prompt.title}</TableCell>
                        <TableCell>{prompt.category}</TableCell>
                        <TableCell>
                          <Badge variant={prompt.isPremium ? 'secondary' : 'default'}>
                            {prompt.isPremium ? 'Premium' : 'Bepul'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={prompt.isPublic ? 'default' : 'outline'}>
                            {prompt.isPublic ? 'Ommaviy' : 'Yashirin'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {prompt.createdAt ? new Date(prompt.createdAt).toLocaleDateString('uz-UZ') : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPromptDialog(prompt)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deletePrompt(prompt.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Foydalanuvchilar</CardTitle>
                  <CardDescription>Barcha ro'yxatdan o'tgan foydalanuvchilar</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  disabled={loadingStates.users}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingStates.users ? 'animate-spin' : ''}`} />
                  Yangilash
                </Button>
              </CardHeader>
              <CardContent>
                {errors.users && (
                  <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p>{errors.users}</p>
                  </div>
                )}
                
                {loadingStates.users ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Hech qanday foydalanuvchi topilmadi
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Daraja</TableHead>
                        <TableHead>Ro'yxatdan o'tgan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.tier === 'paid' ? 'default' : 'secondary'}>
                              {user.tier === 'paid' ? 'PRO' : 'Bepul'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString('uz-UZ')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>To'lovlar</CardTitle>
                  <CardDescription>Barcha to'lov tranzaksiyalari</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  disabled={loadingStates.payments}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingStates.payments ? 'animate-spin' : ''}`} />
                  Yangilash
                </Button>
              </CardHeader>
              <CardContent>
                {errors.payments && (
                  <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p>{errors.payments}</p>
                  </div>
                )}
                
                {loadingStates.payments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Hali hech qanday to'lov amalga oshirilmagan</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Foydalanuvchi</TableHead>
                        <TableHead>Asl summa</TableHead>
                        <TableHead>Chegirma</TableHead>
                        <TableHead>To'langan</TableHead>
                        <TableHead>Holat</TableHead>
                        <TableHead>Sana</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.userEmail}</TableCell>
                          <TableCell>
                            {payment.originalAmount 
                              ? `${payment.originalAmount.toLocaleString()} UZS`
                              : `${payment.amount.toLocaleString()} UZS`
                            }
                          </TableCell>
                          <TableCell>
                            {payment.discountAmount 
                              ? <span className="text-red-600">-{payment.discountAmount.toLocaleString()} UZS</span>
                              : '-'
                            }
                          </TableCell>
                          <TableCell className="font-semibold">
                            {payment.amount.toLocaleString()} UZS
                          </TableCell>
                          <TableCell>
                            <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                              {payment.status === 'completed' ? 'Muvaffaqiyatli' : payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(payment.createdAt).toLocaleDateString('uz-UZ')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Kuponlarni boshqarish</CardTitle>
                  <CardDescription>Chegirma kuponlarini yaratish va boshqarish</CardDescription>
                </div>
                <Button onClick={() => openCouponDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi kupon
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kod</TableHead>
                      <TableHead>Tavsif</TableHead>
                      <TableHead>Chegirma</TableHead>
                      <TableHead>Foydalanilgan</TableHead>
                      <TableHead>Muddat</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead>Harakatlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <code className="font-mono font-bold text-lg">{coupon.code}</code>
                        </TableCell>
                        <TableCell>{coupon.description || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {coupon.discountType === 'percentage' ? (
                              <><Percent className="h-3 w-3 mr-1" />{coupon.discountValue}%</>
                            ) : (
                              <>{coupon.discountValue.toLocaleString()} UZS</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{coupon.usedCount}</span>
                            {coupon.maxUses && (
                              <span className="text-muted-foreground">/ {coupon.maxUses}</span>
                            )}
                            {coupon.usedCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewCouponUsage(coupon.id)}
                              >
                                Ko'rish
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const now = new Date();
                            const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
                            const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;
                            
                            if (validUntil && validUntil < now) {
                              return <Badge variant="destructive">Muddati tugagan</Badge>;
                            } else if (validFrom && validFrom > now) {
                              return <Badge variant="outline">Kutilmoqda</Badge>;
                            } else if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
                              return <Badge variant="secondary">Tugagan</Badge>;
                            } else {
                              return <Badge variant="default">Faol</Badge>;
                            }
                          })()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                            {coupon.isActive ? 'Yoqilgan' : 'O\'chirilgan'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={coupon.isActive}
                              onCheckedChange={() => toggleCouponActive(coupon.id, coupon.isActive)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCouponDialog(coupon)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCoupon(coupon.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>

        {/* Protocol Dialog */}
        <Dialog open={protocolDialogOpen} onOpenChange={setProtocolDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProtocol ? 'Protokolni tahrirlash' : 'Yangi protokol yaratish'}
              </DialogTitle>
              <DialogDescription>
                Protokol ma'lumotlarini kiriting yoki tahrirlang
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className="text-right">Raqam</Label>
                <Input
                  id="number"
                  type="number"
                  value={protocolForm.number || ''}
                  onChange={(e) => setProtocolForm({...protocolForm, number: parseInt(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Nomi</Label>
                <Input
                  id="title"
                  value={protocolForm.title || ''}
                  onChange={(e) => setProtocolForm({...protocolForm, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Kategoriya</Label>
                <Select
                  value={protocolForm.categoryId?.toString()}
                  onValueChange={(value) => setProtocolForm({...protocolForm, categoryId: parseInt(value)})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right mt-2">Tavsif</Label>
                <Textarea
                  id="description"
                  value={protocolForm.description || ''}
                  onChange={(e) => setProtocolForm({...protocolForm, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="badExample" className="text-right mt-2">Yomon misol</Label>
                <Textarea
                  id="badExample"
                  value={protocolForm.badExample || ''}
                  onChange={(e) => setProtocolForm({...protocolForm, badExample: e.target.value})}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="goodExample" className="text-right mt-2">Yaxshi misol</Label>
                <Textarea
                  id="goodExample"
                  value={protocolForm.goodExample || ''}
                  onChange={(e) => setProtocolForm({...protocolForm, goodExample: e.target.value})}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right mt-2">Izohlar</Label>
                <Textarea
                  id="notes"
                  value={protocolForm.notes || ''}
                  onChange={(e) => setProtocolForm({...protocolForm, notes: e.target.value})}
                  className="col-span-3"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isFreeAccess" className="text-right">Bepul kirish</Label>
                <Switch
                  id="isFreeAccess"
                  checked={protocolForm.isFreeAccess || false}
                  onCheckedChange={(checked) => setProtocolForm({...protocolForm, isFreeAccess: checked})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={saveProtocol}>
                {editingProtocol ? 'Saqlash' : 'Yaratish'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Prompt Dialog */}
        <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPrompt ? 'Promptni tahrirlash' : 'Yangi prompt yaratish'}
              </DialogTitle>
              <DialogDescription>
                Prompt ma'lumotlarini kiriting yoki tahrirlang
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="promptTitle" className="text-right">Nomi</Label>
                <Input
                  id="promptTitle"
                  value={promptForm.title || ''}
                  onChange={(e) => setPromptForm({...promptForm, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="promptCategory" className="text-right">Kategoriya</Label>
                <Input
                  id="promptCategory"
                  value={promptForm.category || ''}
                  onChange={(e) => setPromptForm({...promptForm, category: e.target.value})}
                  className="col-span-3"
                  placeholder="Masalan: AI, Development, Marketing"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="promptDescription" className="text-right mt-2">Tavsif</Label>
                <Textarea
                  id="promptDescription"
                  value={promptForm.description || ''}
                  onChange={(e) => setPromptForm({...promptForm, description: e.target.value})}
                  className="col-span-3"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="promptContent" className="text-right mt-2">Prompt matni</Label>
                <Textarea
                  id="promptContent"
                  value={promptForm.content || ''}
                  onChange={(e) => setPromptForm({...promptForm, content: e.target.value})}
                  className="col-span-3"
                  rows={8}
                  placeholder="Prompt matnini kiriting..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isPremium" className="text-right">Premium</Label>
                <Switch
                  id="isPremium"
                  checked={promptForm.isPremium || false}
                  onCheckedChange={(checked) => setPromptForm({...promptForm, isPremium: checked})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isPublic" className="text-right">Ommaviy</Label>
                <Switch
                  id="isPublic"
                  checked={promptForm.isPublic !== false}
                  onCheckedChange={(checked) => setPromptForm({...promptForm, isPublic: checked})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={savePrompt}>
                {editingPrompt ? 'Saqlash' : 'Yaratish'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Coupon Dialog */}
        <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Kuponni tahrirlash' : 'Yangi kupon yaratish'}
              </DialogTitle>
              <DialogDescription>
                Kupon ma'lumotlarini kiriting yoki tahrirlang
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="couponCode" className="text-right">Kod</Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="couponCode"
                    value={couponForm.code || ''}
                    onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                    placeholder="Masalan: LAUNCH60"
                    className="flex-1 font-mono uppercase"
                  />
                  {!editingCoupon && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCouponCode}
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      Generatsiya
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="couponDescription" className="text-right">Tavsif</Label>
                <Input
                  id="couponDescription"
                  value={couponForm.description || ''}
                  onChange={(e) => setCouponForm({...couponForm, description: e.target.value})}
                  className="col-span-3"
                  placeholder="Masalan: Yangi foydalanuvchilar uchun 60% chegirma"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountType" className="text-right">Chegirma turi</Label>
                <Select
                  value={couponForm.discountType || 'percentage'}
                  onValueChange={(value: 'percentage' | 'fixed') => setCouponForm({...couponForm, discountType: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Foizda (%)</SelectItem>
                    <SelectItem value="fixed">Belgilangan summa (UZS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountValue" className="text-right">Chegirma miqdori</Label>
                <div className="col-span-3 flex gap-2 items-center">
                  <Input
                    id="discountValue"
                    type="number"
                    value={couponForm.discountValue || ''}
                    onChange={(e) => setCouponForm({...couponForm, discountValue: parseInt(e.target.value) || 0})}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">
                    {couponForm.discountType === 'percentage' ? '%' : 'UZS'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="originalPrice" className="text-right">Asl narx</Label>
                <div className="col-span-3 flex gap-2 items-center">
                  <Input
                    id="originalPrice"
                    type="number"
                    value={couponForm.originalPrice || 1425000}
                    onChange={(e) => setCouponForm({...couponForm, originalPrice: parseInt(e.target.value) || 0})}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">UZS</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxUses" className="text-right">Maksimal foydalanish</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={couponForm.maxUses || ''}
                  onChange={(e) => setCouponForm({...couponForm, maxUses: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="col-span-3"
                  placeholder="Cheklanmagan uchun bo'sh qoldiring"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="validFrom" className="text-right">Boshlanish sanasi</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={couponForm.validFrom ? new Date(couponForm.validFrom).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setCouponForm({...couponForm, validFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="validUntil" className="text-right">Tugash sanasi</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  value={couponForm.validUntil ? new Date(couponForm.validUntil).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setCouponForm({...couponForm, validUntil: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">Faol</Label>
                <Switch
                  id="isActive"
                  checked={couponForm.isActive !== false}
                  onCheckedChange={(checked) => setCouponForm({...couponForm, isActive: checked})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={saveCoupon}>
                {editingCoupon ? 'Saqlash' : 'Yaratish'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Coupon Usage Dialog */}
        <Dialog open={couponUsageDialogOpen} onOpenChange={setCouponUsageDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Kupon foydalanish tarixi</DialogTitle>
              <DialogDescription>
                {coupons.find(c => c.id === selectedCouponId)?.code} kuponi uchun foydalanish ma'lumotlari
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Foydalanuvchi</TableHead>
                    <TableHead>Asl summa</TableHead>
                    <TableHead>Chegirma</TableHead>
                    <TableHead>To'langan</TableHead>
                    <TableHead>Sana</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {couponUsages.map((usage) => (
                    <TableRow key={usage.id}>
                      <TableCell>{usage.userEmail}</TableCell>
                      <TableCell>{usage.originalAmount.toLocaleString()} UZS</TableCell>
                      <TableCell className="text-red-600">-{usage.discountAmount.toLocaleString()} UZS</TableCell>
                      <TableCell className="font-bold">{usage.finalAmount.toLocaleString()} UZS</TableCell>
                      <TableCell>{new Date(usage.usedAt).toLocaleDateString('uz-UZ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {couponUsages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Bu kupon hali ishlatilmagan
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
      <AppFooter />
    </div>
  );
}