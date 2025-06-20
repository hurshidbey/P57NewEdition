import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Crown, 
  Activity, 
  BarChart3, 
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-react';
import { analytics, type TierMetrics } from '@/utils/analytics';

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<TierMetrics | null>(null);
  const [conversionRates, setConversionRates] = useState<{
    upgradeCTR: number;
    conversionRate: number;
    completionToUpgradeRate: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMetrics = () => {
    setIsLoading(true);
    try {
      const currentMetrics = analytics.getMetrics();
      const currentRates = analytics.getConversionRates();
      
      setMetrics(currentMetrics);
      setConversionRates(currentRates);
    } catch (error) {
      console.error('Failed to load analytics metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleExportData = () => {
    const data = analytics.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `p57-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetMetrics = () => {
    if (confirm('Barcha analytics ma\'lumotlarini o\'chirmoqchimisiz? Bu amalni bekor qilib bo\'lmaydi.')) {
      analytics.resetMetrics();
      loadMetrics();
    }
  };

  if (!metrics || !conversionRates) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Analytics yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Tier sistemasi va konversiya metrikalaringiz</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadMetrics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={handleResetMetrics}>
            Reset
          </Button>
        </div>
      </div>

      {/* Conversion Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upgrade CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRates.upgradeCTR}%</div>
            <p className="text-xs text-muted-foreground">
              Upgrade tugmalarini bosish ko'rsatkichi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Konversiya</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRates.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Premium ga o'tgan foydalanuvchilar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRates.completionToUpgradeRate}%</div>
            <p className="text-xs text-muted-foreground">
              3 protokol tugatib Premium olganlar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Protocol Access Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Protokol Kirish Bloklari
            </CardTitle>
            <CardDescription>
              Bepul foydalanuvchilar uchun bloklangan urinishlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Limit tugagan foydalanuvchilar:</span>
              <Badge variant="secondary">{metrics.protocolAccess.freeUsersBlocked}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Upgrade promptlar ko'rsatilgan:</span>
              <Badge variant="secondary">{metrics.protocolAccess.upgradePromptShown}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Upgrade tugmalar bosilgan:</span>
              <Badge variant="secondary">{metrics.protocolAccess.upgradePromptClicked}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Baholash Limitleri
            </CardTitle>
            <CardDescription>
              Foydalanuvchilarning baholash faoliyati
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Bepul foydalanuvchilar limit tugagan:</span>
              <Badge variant="secondary">{metrics.evaluationLimits.freeUsersHitLimit}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Faol Premium foydalanuvchilar:</span>
              <Badge variant="secondary">{metrics.evaluationLimits.premiumUsersActive}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Konversiya Voronkasi
          </CardTitle>
          <CardDescription>
            Foydalanuvchilarning Premium ga o'tish jarayoni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Signup to Premium conversion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Bepul ro'yxatdan o'tganlar</span>
                <span>{metrics.conversionFunnel.freeUsersSignup}</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>3 protokol tugatganlar</span>
                <span>{metrics.conversionFunnel.freeUsersCompleted3Protocols}</span>
              </div>
              <Progress 
                value={metrics.conversionFunnel.freeUsersSignup > 0 
                  ? (metrics.conversionFunnel.freeUsersCompleted3Protocols / metrics.conversionFunnel.freeUsersSignup) * 100 
                  : 0} 
                className="h-2" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Upgrade sahifasiga o'tganlar</span>
                <span>{metrics.conversionFunnel.upgradeAttempts}</span>
              </div>
              <Progress 
                value={metrics.conversionFunnel.freeUsersSignup > 0 
                  ? (metrics.conversionFunnel.upgradeAttempts / metrics.conversionFunnel.freeUsersSignup) * 100 
                  : 0} 
                className="h-2" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Muvaffaqiyatli Premium olganlar</span>
                <span className="font-bold text-green-600">{metrics.conversionFunnel.upgradeSuccess}</span>
              </div>
              <Progress 
                value={metrics.conversionFunnel.freeUsersSignup > 0 
                  ? (metrics.conversionFunnel.upgradeSuccess / metrics.conversionFunnel.freeUsersSignup) * 100 
                  : 0} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Tavsiyalar</CardTitle>
          <CardDescription>Analytics asosida yaxshilash bo'yicha tavsiyalar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conversionRates.upgradeCTR < 5 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Past Upgrade CTR ({conversionRates.upgradeCTR}%)
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Upgrade tugmalarining ko'rinishi yoki matinini yaxshilang
                  </p>
                </div>
              </div>
            )}

            {conversionRates.conversionRate < 2 && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Past konversiya darajasi ({conversionRates.conversionRate}%)
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Premium rejaning qiymatini ko'rsatishni yaxshilang
                  </p>
                </div>
              </div>
            )}

            {metrics.protocolAccess.freeUsersBlocked > 50 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Yuqori blok soni ({metrics.protocolAccess.freeUsersBlocked})
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    Foydalanuvchilar faol, upgrade prompts samarali
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}