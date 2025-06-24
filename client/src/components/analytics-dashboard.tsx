import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
        <CardDescription>Usage statistics and insights</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Analytics features coming soon...</p>
      </CardContent>
    </Card>
  );
}