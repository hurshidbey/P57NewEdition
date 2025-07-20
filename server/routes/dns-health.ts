import { Router } from 'express';
import dns from 'dns/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';

const router = Router();
const execAsync = promisify(exec);

interface DNSHealthCheck {
  domain: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    resolution: {
      success: boolean;
      ips: string[];
      error?: string;
    };
    propagation: {
      consistent: boolean;
      servers: Record<string, string[]>;
    };
    connectivity: {
      http: boolean;
      https: boolean;
      responseTime?: number;
    };
    ssl: {
      valid: boolean;
      expiresIn?: number;
      error?: string;
    };
  };
  recommendations: string[];
  timestamp: string;
}

// Domains to monitor
const MONITORED_DOMAINS = [
  'p57.birfoiz.uz',
  'protokol.1foiz.com',
  'srv852801.hstgr.cloud',
  'p57.uz'
];

// DNS servers to check propagation
const DNS_SERVERS = {
  'Google': ['8.8.8.8', '8.8.4.4'],
  'Cloudflare': ['1.1.1.1', '1.0.0.1'],
  'OpenDNS': ['208.67.222.222', '208.67.220.220']
};

// Expected server IP
const EXPECTED_IP = '69.62.126.73';

/**
 * Check DNS resolution for a domain
 */
async function checkDNSResolution(domain: string): Promise<DNSHealthCheck['checks']['resolution']> {
  try {
    const addresses = await dns.resolve4(domain);
    return {
      success: true,
      ips: addresses
    };
  } catch (error: any) {
    return {
      success: false,
      ips: [],
      error: error.message
    };
  }
}

/**
 * Check DNS propagation across multiple servers
 */
async function checkDNSPropagation(domain: string): Promise<DNSHealthCheck['checks']['propagation']> {
  const results: Record<string, string[]> = {};
  
  for (const [provider, servers] of Object.entries(DNS_SERVERS)) {
    for (const server of servers) {
      try {
        // Use dig command to query specific DNS server
        const { stdout } = await execAsync(`dig +short @${server} ${domain} A`);
        const ips = stdout.trim().split('\n').filter(ip => ip.length > 0);
        results[`${provider} (${server})`] = ips;
      } catch (error) {
        results[`${provider} (${server})`] = [];
      }
    }
  }

  // Check consistency
  const allIPs = Object.values(results).flat();
  const uniqueIPs = [...new Set(allIPs)];
  const consistent = uniqueIPs.length <= 1 && allIPs.length > 0;

  return {
    consistent,
    servers: results
  };
}

/**
 * Check HTTP/HTTPS connectivity
 */
async function checkConnectivity(domain: string): Promise<DNSHealthCheck['checks']['connectivity']> {
  const result = {
    http: false,
    https: false,
    responseTime: undefined as number | undefined
  };

  // Check HTTPS
  const startTime = Date.now();
  try {
    await new Promise<void>((resolve, reject) => {
      https.get(`https://${domain}`, { timeout: 10000 }, (res) => {
        result.https = res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302;
        result.responseTime = Date.now() - startTime;
        res.destroy();
        resolve();
      }).on('error', reject);
    });
  } catch (error) {
    // Ignore errors, already false
  }

  // Check HTTP redirect
  try {
    const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://${domain}`, {
      timeout: 10000
    });
    result.http = stdout === '301' || stdout === '302';
  } catch (error) {
    // Ignore errors, already false
  }

  return result;
}

/**
 * Check SSL certificate
 */
async function checkSSLCertificate(domain: string): Promise<DNSHealthCheck['checks']['ssl']> {
  try {
    const { stdout } = await execAsync(
      `echo | openssl s_client -servername ${domain} -connect ${domain}:443 2>/dev/null | openssl x509 -noout -dates`,
      { timeout: 10000 }
    );

    const notAfterMatch = stdout.match(/notAfter=(.+)/);
    if (notAfterMatch) {
      const expiryDate = new Date(notAfterMatch[1]);
      const now = new Date();
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        valid: true,
        expiresIn: daysUntilExpiry
      };
    }

    return {
      valid: false,
      error: 'Could not parse certificate dates'
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Generate recommendations based on health check results
 */
function generateRecommendations(domain: string, checks: DNSHealthCheck['checks']): string[] {
  const recommendations: string[] = [];

  // DNS Resolution issues
  if (!checks.resolution.success) {
    recommendations.push(`DNS resolution failing for ${domain} - Contact DNS provider`);
    recommendations.push('Consider adding redundant DNS providers');
  } else if (!checks.resolution.ips.includes(EXPECTED_IP)) {
    recommendations.push(`DNS pointing to wrong IP for ${domain} - Update A record to ${EXPECTED_IP}`);
  }

  // Propagation issues
  if (!checks.propagation.consistent) {
    recommendations.push('DNS propagation inconsistent - Lower TTL to 300 seconds');
    recommendations.push('Wait 24-48 hours for full propagation');
  }

  // Connectivity issues
  if (!checks.connectivity.https) {
    recommendations.push(`HTTPS connectivity failing for ${domain} - Check server configuration`);
  }
  if (!checks.connectivity.http) {
    recommendations.push('HTTP to HTTPS redirect not working - Update nginx configuration');
  }
  if (checks.connectivity.responseTime && checks.connectivity.responseTime > 5000) {
    recommendations.push('High response time detected - Check server load and network');
  }

  // SSL issues
  if (!checks.ssl.valid) {
    recommendations.push(`SSL certificate issue for ${domain} - ${checks.ssl.error}`);
  } else if (checks.ssl.expiresIn && checks.ssl.expiresIn < 30) {
    recommendations.push(`SSL certificate expiring in ${checks.ssl.expiresIn} days - Renew certificate`);
  }

  return recommendations;
}

/**
 * Perform comprehensive health check for a domain
 */
async function performHealthCheck(domain: string): Promise<DNSHealthCheck> {
  const [resolution, propagation, connectivity, ssl] = await Promise.all([
    checkDNSResolution(domain),
    checkDNSPropagation(domain),
    checkConnectivity(domain),
    checkSSLCertificate(domain)
  ]);

  const checks = { resolution, propagation, connectivity, ssl };
  const recommendations = generateRecommendations(domain, checks);

  // Determine overall status
  let status: DNSHealthCheck['status'] = 'healthy';
  if (!resolution.success || !connectivity.https || !ssl.valid) {
    status = 'unhealthy';
  } else if (!propagation.consistent || recommendations.length > 0) {
    status = 'degraded';
  }

  return {
    domain,
    status,
    checks,
    recommendations,
    timestamp: new Date().toISOString()
  };
}

/**
 * DNS health check endpoint
 */
router.get('/dns-health', async (req, res) => {
  try {
    const results = await Promise.all(
      MONITORED_DOMAINS.map(domain => performHealthCheck(domain))
    );

    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' :
                         results.some(r => r.status === 'unhealthy') ? 'unhealthy' : 'degraded';

    res.json({
      status: overallStatus,
      domains: results,
      summary: {
        healthy: results.filter(r => r.status === 'healthy').length,
        degraded: results.filter(r => r.status === 'degraded').length,
        unhealthy: results.filter(r => r.status === 'unhealthy').length,
        total: results.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('DNS health check error:', error);
    res.status(500).json({
      error: 'Failed to perform DNS health check',
      message: error.message
    });
  }
});

/**
 * Single domain health check
 */
router.get('/dns-health/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Validate domain
    if (!domain || !/^[a-zA-Z0-9.-]+$/.test(domain)) {
      return res.status(400).json({ error: 'Invalid domain format' });
    }

    const result = await performHealthCheck(domain);
    res.json(result);
  } catch (error: any) {
    console.error('DNS health check error:', error);
    res.status(500).json({
      error: 'Failed to perform DNS health check',
      message: error.message
    });
  }
});

/**
 * Quick DNS resolution test
 */
router.get('/dns-resolve/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Validate domain
    if (!domain || !/^[a-zA-Z0-9.-]+$/.test(domain)) {
      return res.status(400).json({ error: 'Invalid domain format' });
    }

    const addresses = await dns.resolve4(domain);
    const isCorrect = addresses.includes(EXPECTED_IP);

    res.json({
      domain,
      resolved: true,
      addresses,
      expectedIP: EXPECTED_IP,
      isCorrect,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.json({
      domain: req.params.domain,
      resolved: false,
      error: error.message,
      expectedIP: EXPECTED_IP,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;