import React from 'react';
import { useUserTier } from '@/hooks/use-user-tier';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  protocolId?: number;
  isFreeAccess?: boolean;
  requiresPaid?: boolean;
  fallbackContent?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  protocolId, 
  isFreeAccess = false, 
  requiresPaid = false,
  fallbackContent 
}: ProtectedRouteProps) {
  const { tier, canAccessProtocol, getAccessedProtocolsCount, canAccessNewProtocol, loading } = useUserTier();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Check access permissions
  let canAccess = true;
  let upgradeReason = '';

  if (requiresPaid && tier === 'free') {
    canAccess = false;
    upgradeReason = 'Bu xususiyat faqat Premium foydalanuvchilar uchun';
  } else if (protocolId !== undefined) {
    canAccess = canAccessProtocol(protocolId, isFreeAccess);
    if (!canAccess && tier === 'free') {
      if (!isFreeAccess) {
        upgradeReason = 'Bu protokol Premium foydalanuvchilar uchun';
      } else if (!canAccessNewProtocol()) {
        const accessedCount = getAccessedProtocolsCount();
        upgradeReason = `Siz maksimal ${accessedCount}/3 bepul protokolga kirdingiz`;
      }
    }
  }

  if (canAccess) {
    return <>{children}</>;
  }

  // Show upgrade CTA if custom fallback not provided
  if (fallbackContent) {
    return <>{fallbackContent}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-orange-100">
            {tier === 'free' && !canAccessNewProtocol() ? (
              <Lock className="h-6 w-6 text-orange-600" />
            ) : (
              <Crown className="h-6 w-6 text-orange-600" />
            )}
          </div>
          <CardTitle>Premium xususiyat</CardTitle>
          <CardDescription>{upgradeReason}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Premium rejada:</p>
            <ul className="space-y-1">
              <li>• Barcha 57 protokolga kirish</li>
              <li>• Cheksiz AI baholash</li>
              <li>• Premium promptlar</li>
              <li>• Batafsil progress tracking</li>
            </ul>
          </div>
          
          {tier === 'free' && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Hozir:</strong> {getAccessedProtocolsCount()}/3 bepul protokol ishlatilgan
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={() => window.location.href = '/premium'}
            >
              Premium olish
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Orqaga
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Convenience component for protocol-specific protection
export function ProtectedProtocol({ 
  protocolId, 
  isFreeAccess, 
  children 
}: { 
  protocolId: number; 
  isFreeAccess: boolean; 
  children: React.ReactNode; 
}) {
  return (
    <ProtectedRoute protocolId={protocolId} isFreeAccess={isFreeAccess}>
      {children}
    </ProtectedRoute>
  );
}

// Convenience component for premium-only features
export function PremiumOnly({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiresPaid={true}>
      {children}
    </ProtectedRoute>
  );
}