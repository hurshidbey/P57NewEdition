import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Tag, DollarSign, Users, Percent, Calendar } from 'lucide-react';

interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUsage: number;
  totalDiscountGiven: number;
  mostUsedCoupon: {
    code: string;
    usedCount: number;
  } | null;
  recentUsage: Array<{
    code: string;
    userEmail: string;
    discountAmount: number;
    usedAt: string;
  }>;
}

export default function AnalyticsDashboard() {
  const [couponStats, setCouponStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );
      
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load analytics data from the new endpoint
      const analyticsRes = await fetch('/api/admin/analytics/coupons', { headers });
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setCouponStats(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Coupon Analytics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Kupon Statistikasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jami Kuponlar</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{couponStats?.totalCoupons || 0}</div>
              <p className="text-xs text-muted-foreground">
                {couponStats?.activeCoupons || 0} ta faol
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Umumiy Foydalanish</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{couponStats?.totalUsage || 0}</div>
              <p className="text-xs text-muted-foreground">
                marta ishlatilgan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eng Ko'p Ishlatilgan</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {couponStats?.mostUsedCoupon ? (
                <>
                  <div className="text-lg font-bold font-mono">
                    {couponStats.mostUsedCoupon.code}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {couponStats.mostUsedCoupon.usedCount} marta
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Ma'lumot yo'q</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Umumiy Chegirma</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(couponStats?.totalDiscountGiven || 0).toLocaleString()} <span className="text-sm">UZS</span>
              </div>
              <p className="text-xs text-muted-foreground">
                jami chegirma berilgan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Usage */}
        {couponStats?.recentUsage && couponStats.recentUsage.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Oxirgi Foydalanishlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {couponStats.recentUsage.slice(0, 5).map((usage, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold">{usage.code}</code>
                      <span className="text-muted-foreground">{usage.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">-{usage.discountAmount.toLocaleString()} UZS</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(usage.usedAt).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* General Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Umumiy Statistika</CardTitle>
          <CardDescription>Platforma faoliyati va o'sish ko'rsatkichlari</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>To'liq analitika tez orada qo'shiladi...</p>
            <p className="text-sm mt-2">Hozircha kupon statistikasini ko'rishingiz mumkin</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}