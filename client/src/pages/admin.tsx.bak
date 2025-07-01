import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
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
import { Loader2, Lock, Unlock, TrendingUp, Users, DollarSign, FileText, Edit, Trash2, Plus } from 'lucide-react';
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

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('protocols');
  const [stats, setStats] = useState({
    totalUsers: 0,
    paidUsers: 0,
    totalRevenue: 0,
    totalProtocols: 0,
    freeProtocols: 0
  });

  // Dialog states
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  // Form states
  const [protocolForm, setProtocolForm] = useState<Partial<Protocol>>({});
  const [promptForm, setPromptForm] = useState<Partial<Prompt>>({});

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
    try {
      // Import supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
      
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

      // Load protocols
      const protocolsRes = await fetch('/api/admin/protocols', { headers });
      if (protocolsRes.ok) {
        const data = await protocolsRes.json();
        setProtocols(data);
        
        // Calculate stats
        const freeCount = data.filter((p: Protocol) => p.isFreeAccess).length;
        setStats(prev => ({
          ...prev,
          totalProtocols: data.length,
          freeProtocols: freeCount
        }));
      }

      // Load categories
      const categoriesRes = await fetch('/api/categories', { headers });
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data);
      }

      // Load prompts
      const promptsRes = await fetch('/api/admin/prompts', { headers });
      if (promptsRes.ok) {
        const data = await promptsRes.json();
        setPrompts(data);
      }

      // Load users
      const usersRes = await fetch('/api/admin/users', { headers });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data);
        
        const paidCount = data.filter((u: User) => u.tier === 'paid').length;
        setStats(prev => ({
          ...prev,
          totalUsers: data.length,
          paidUsers: paidCount
        }));
      }

      // Load payments
      const paymentsRes = await fetch('/api/admin/payments', { headers });
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data);
        
        const revenue = data
          .filter((p: Payment) => p.status === 'completed')
          .reduce((sum: number, p: Payment) => sum + p.amount, 0);
        
        setStats(prev => ({
          ...prev,
          totalRevenue: revenue
        }));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProtocolAccess = async (protocolId: number, currentAccess: boolean) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
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
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
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
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
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
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
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
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="protocols">Protokollar</TabsTrigger>
            <TabsTrigger value="prompts">Promptlar</TabsTrigger>
            <TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
            <TabsTrigger value="payments">To'lovlar</TabsTrigger>
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
                <Button onClick={() => openProtocolDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi protokol
                </Button>
              </CardHeader>
              <CardContent>
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
              <CardHeader>
                <CardTitle>Foydalanuvchilar</CardTitle>
                <CardDescription>Barcha ro'yxatdan o'tgan foydalanuvchilar</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>To'lovlar</CardTitle>
                <CardDescription>Barcha to'lov tranzaksiyalari</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Foydalanuvchi</TableHead>
                      <TableHead>Summa</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead>Sana</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.userEmail}</TableCell>
                        <TableCell>{payment.amount.toLocaleString()} UZS</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(payment.createdAt).toLocaleDateString('uz-UZ')}</TableCell>
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
      </main>
      <AppFooter />
    </div>
  );
}