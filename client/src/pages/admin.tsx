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
import { Loader2, Lock, Unlock, TrendingUp, Users, DollarSign, FileText } from 'lucide-react';
import AnalyticsDashboard from '@/components/analytics-dashboard';

interface Protocol {
  id: number;
  number: number;
  title: string;
  categoryId: number;
  isFreeAccess: boolean;
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

  // Check if user is admin
  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL || user?.email === 'hurshidbey@gmail.com';

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
      
      const res = await fetch(`/api/admin/protocols/${protocolId}/access`, {
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="protocols">Protokollar</TabsTrigger>
            <TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
            <TabsTrigger value="payments">To'lovlar</TabsTrigger>
            <TabsTrigger value="analytics">Analitika</TabsTrigger>
          </TabsList>

          {/* Protocols Tab */}
          <TabsContent value="protocols">
            <Card>
              <CardHeader>
                <CardTitle>Protokollarni boshqarish</CardTitle>
                <CardDescription>Protokollarning kirish darajasini o'zgartiring</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>№</TableHead>
                      <TableHead>Nomi</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead>Kirish</TableHead>
                      <TableHead>Harakat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {protocols.map((protocol) => (
                      <TableRow key={protocol.id}>
                        <TableCell>{protocol.number}</TableCell>
                        <TableCell>{protocol.title}</TableCell>
                        <TableCell>{protocol.categoryId}</TableCell>
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
                          <Switch
                            checked={protocol.isFreeAccess}
                            onCheckedChange={() => toggleProtocolAccess(protocol.id, protocol.isFreeAccess)}
                          />
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
      </main>
      <AppFooter />
    </div>
  );
}