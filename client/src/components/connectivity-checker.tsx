import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, WifiOff, Globe, Shield, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ConnectivityTest {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  message?: string;
  details?: any;
}

interface DomainTest {
  domain: string;
  reachable: boolean;
  responseTime?: number;
  error?: string;
}

export function ConnectivityChecker() {
  const [tests, setTests] = useState<ConnectivityTest[]>([
    {
      name: 'Browser Connectivity',
      description: 'Checking your internet connection',
      status: 'pending'
    },
    {
      name: 'DNS Resolution',
      description: 'Testing domain name resolution',
      status: 'pending'
    },
    {
      name: 'Primary Domain',
      description: 'Checking p57.birfoiz.uz',
      status: 'pending'
    },
    {
      name: 'Backup Domains',
      description: 'Testing alternative access points',
      status: 'pending'
    },
    {
      name: 'API Connectivity',
      description: 'Verifying backend services',
      status: 'pending'
    },
    {
      name: 'SSL/TLS Security',
      description: 'Checking secure connection',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Domains to test
  const domainsToTest = [
    { url: 'https://p57.birfoiz.uz', name: 'Primary' },
    { url: 'https://protokol.1foiz.com', name: 'Backup 1' },
    { url: 'https://srv852801.hstgr.cloud', name: 'Backup 2' },
  ];

  const updateTestStatus = (index: number, updates: Partial<ConnectivityTest>) => {
    setTests(prev => {
      const newTests = [...prev];
      newTests[index] = { ...newTests[index], ...updates };
      return newTests;
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setRecommendations([]);

    // Test 1: Browser Connectivity
    updateTestStatus(0, { status: 'running' });
    const isOnline = navigator.onLine;
    if (isOnline) {
      updateTestStatus(0, { 
        status: 'success', 
        message: 'Internet connection detected' 
      });
    } else {
      updateTestStatus(0, { 
        status: 'error', 
        message: 'No internet connection detected' 
      });
      setRecommendations(prev => [...prev, 'Check your internet connection']);
    }
    setProgress(16);

    // Test 2: DNS Resolution
    updateTestStatus(1, { status: 'running' });
    try {
      // Try to resolve a well-known domain
      const testResponse = await fetch('https://dns.google/resolve?name=google.com', {
        mode: 'no-cors'
      });
      updateTestStatus(1, { 
        status: 'success', 
        message: 'DNS resolution working' 
      });
    } catch (error) {
      updateTestStatus(1, { 
        status: 'warning', 
        message: 'DNS resolution may have issues' 
      });
      setRecommendations(prev => [...prev, 'Try changing your DNS to 8.8.8.8 or 1.1.1.1']);
    }
    setProgress(32);

    // Test 3: Primary Domain
    updateTestStatus(2, { status: 'running' });
    const primaryResult = await testDomain(domainsToTest[0].url);
    if (primaryResult.reachable) {
      updateTestStatus(2, { 
        status: 'success', 
        message: `Accessible (${primaryResult.responseTime}ms)` 
      });
    } else {
      updateTestStatus(2, { 
        status: 'error', 
        message: 'Primary domain not accessible',
        details: primaryResult.error
      });
      setRecommendations(prev => [...prev, 'Primary domain is not accessible. Use backup domains.']);
    }
    setProgress(48);

    // Test 4: Backup Domains
    updateTestStatus(3, { status: 'running' });
    const backupResults: DomainTest[] = [];
    let anyBackupWorking = false;
    
    for (const domain of domainsToTest.slice(1)) {
      const result = await testDomain(domain.url);
      backupResults.push({ domain: domain.name, ...result });
      if (result.reachable) anyBackupWorking = true;
    }

    if (anyBackupWorking) {
      updateTestStatus(3, { 
        status: 'success', 
        message: 'Backup domains available',
        details: backupResults
      });
      
      const workingBackup = backupResults.find(r => r.reachable);
      if (workingBackup && !primaryResult.reachable) {
        setRecommendations(prev => [...prev, 
          `Use ${workingBackup.domain} as an alternative access point`
        ]);
      }
    } else {
      updateTestStatus(3, { 
        status: 'error', 
        message: 'No backup domains accessible',
        details: backupResults
      });
    }
    setProgress(64);

    // Test 5: API Connectivity
    updateTestStatus(4, { status: 'running' });
    const apiResult = await testAPI();
    if (apiResult.success) {
      updateTestStatus(4, { 
        status: 'success', 
        message: 'Backend services operational' 
      });
    } else {
      updateTestStatus(4, { 
        status: 'error', 
        message: 'Backend services unavailable',
        details: apiResult.error
      });
    }
    setProgress(80);

    // Test 6: SSL/TLS Security
    updateTestStatus(5, { status: 'running' });
    const isSecure = window.location.protocol === 'https:';
    if (isSecure) {
      updateTestStatus(5, { 
        status: 'success', 
        message: 'Secure connection established' 
      });
    } else {
      updateTestStatus(5, { 
        status: 'warning', 
        message: 'Not using secure connection' 
      });
      setRecommendations(prev => [...prev, 'Always use HTTPS for secure access']);
    }
    setProgress(100);

    // Generate final recommendations
    generateRecommendations();
    setIsRunning(false);
  };

  const testDomain = async (url: string): Promise<DomainTest> => {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        domain: url,
        reachable: response.ok,
        responseTime,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
    } catch (error: any) {
      return {
        domain: url,
        reachable: false,
        error: error.name === 'AbortError' ? 'Timeout' : error.message
      };
    }
  };

  const testAPI = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      return {
        success: response.ok,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  const generateRecommendations = () => {
    const allTests = tests;
    const failedTests = allTests.filter(t => t.status === 'error').length;
    const warningTests = allTests.filter(t => t.status === 'warning').length;

    if (failedTests === 0 && warningTests === 0) {
      setRecommendations(prev => [...prev, 'All systems operational! No issues detected.']);
    } else {
      // Add DNS-specific recommendations
      if (tests[1].status !== 'success' || tests[2].status !== 'success') {
        setRecommendations(prev => [
          ...prev,
          'Clear your browser cache and DNS cache',
          'Try using incognito/private browsing mode',
          'Restart your router/modem',
          'Contact your ISP if issues persist'
        ]);
      }
    }
  };

  const getStatusIcon = (status: ConnectivityTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Globe className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ConnectivityTest['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WifiOff className="w-6 h-6" />
          Connectivity Diagnostics
        </CardTitle>
        <CardDescription>
          Run diagnostics to identify and resolve connection issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Tests...' : 'Run Diagnostics'}
        </Button>

        {isRunning && (
          <Progress value={progress} className="w-full" />
        )}

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
            >
              <div className="mt-0.5">
                {getStatusIcon(test.status)}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${getStatusColor(test.status)}`}>
                  {test.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {test.description}
                </p>
                {test.message && (
                  <p className="text-sm mt-1 font-medium">
                    {test.message}
                  </p>
                )}
                {test.details && (
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer text-blue-600">
                      View details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>

        {recommendations.length > 0 && (
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertTitle>Recommendations</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Quick Fixes</AlertTitle>
          <AlertDescription className="text-blue-800">
            <div className="space-y-2 mt-2">
              <p className="font-medium">Change DNS Settings:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Primary DNS: 8.8.8.8 (Google)</li>
                <li>Secondary DNS: 1.1.1.1 (Cloudflare)</li>
              </ul>
              <p className="font-medium mt-3">Clear DNS Cache:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Windows: <code>ipconfig /flushdns</code></li>
                <li>Mac: <code>sudo dscacheutil -flushcache</code></li>
                <li>Chrome: Visit <code>chrome://net-internals/#dns</code></li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}