#!/usr/bin/env node

/**
 * P57 Deployment Validation Script
 * 
 * This script performs automated validation of the deployed P57 application
 * to ensure all tier system functionality is working correctly.
 */

import { execSync } from 'child_process'

const APP_URL = 'https://p57.birfoiz.uz'
const BACKUP_URL = 'https://srv852801.hstgr.cloud'

class DeploymentValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: []
    }
  }

  async runAllTests() {
    console.log('🚀 Starting P57 Deployment Validation...\n')
    
    await this.testBasicConnectivity()
    await this.testAPIEndpoints()
    await this.testStaticAssets()
    await this.testDatabaseConnection()
    await this.testTierSystemLogic()
    
    this.printSummary()
  }

  async testBasicConnectivity() {
    console.log('🌐 Testing Basic Connectivity...')
    
    try {
      const response = await fetch(APP_URL, { timeout: 10000 })
      if (response.ok) {
        this.pass('Primary URL accessible')
        
        // Check for expected content
        const html = await response.text()
        if (html.includes('Protokol57') || html.includes('P57')) {
          this.pass('Application content detected')
        } else {
          this.warning('Application content not detected in HTML')
        }
      } else {
        this.fail(`Primary URL returned ${response.status}`)
      }
    } catch (error) {
      this.fail(`Primary URL not accessible: ${error.message}`)
      
      // Try backup URL
      try {
        const backupResponse = await fetch(BACKUP_URL, { timeout: 10000 })
        if (backupResponse.ok) {
          this.warning('Backup URL accessible (primary failed)')
        }
      } catch (backupError) {
        this.fail('Backup URL also not accessible')
      }
    }
    
    console.log('')
  }

  async testAPIEndpoints() {
    console.log('🔌 Testing API Endpoints...')
    
    const endpoints = [
      '/api/protocols',
      '/api/categories',
      '/api/admin/protocols'
    ]
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${APP_URL}${endpoint}`, { 
          timeout: 5000,
          headers: {
            'User-Agent': 'P57-Deployment-Validator/1.0'
          }
        })
        
        if (response.ok) {
          this.pass(`${endpoint} accessible`)
          
          // Try to parse JSON
          try {
            const data = await response.json()
            if (Array.isArray(data) && data.length > 0) {
              this.pass(`${endpoint} returns valid data (${data.length} items)`)
            } else {
              this.warning(`${endpoint} returns empty or invalid data`)
            }
          } catch (parseError) {
            this.warning(`${endpoint} returns non-JSON data`)
          }
        } else if (response.status === 401 || response.status === 403) {
          this.pass(`${endpoint} properly protected (${response.status})`)
        } else {
          this.fail(`${endpoint} returned ${response.status}`)
        }
      } catch (error) {
        this.fail(`${endpoint} not accessible: ${error.message}`)
      }
    }
    
    console.log('')
  }

  async testStaticAssets() {
    console.log('📦 Testing Static Assets...')
    
    try {
      const response = await fetch(APP_URL)
      const html = await response.text()
      
      // Extract asset URLs from HTML
      const jsMatches = html.match(/src="([^"]*\.js[^"]*)"/g) || []
      const cssMatches = html.match(/href="([^"]*\.css[^"]*)"/g) || []
      
      console.log(`  Found ${jsMatches.length} JS assets, ${cssMatches.length} CSS assets`)
      
      // Test a few critical assets
      const criticalAssets = [
        ...jsMatches.slice(0, 2).map(m => m.match(/src="([^"]*)"/)[1]),
        ...cssMatches.slice(0, 1).map(m => m.match(/href="([^"]*)"/)[1])
      ]
      
      for (const asset of criticalAssets) {
        const assetUrl = asset.startsWith('http') ? asset : `${APP_URL}${asset}`
        try {
          const assetResponse = await fetch(assetUrl, { timeout: 5000 })
          if (assetResponse.ok) {
            this.pass(`Asset accessible: ${asset.split('/').pop()}`)
          } else {
            this.fail(`Asset not accessible: ${asset}`)
          }
        } catch (error) {
          this.fail(`Asset failed to load: ${asset}`)
        }
      }
    } catch (error) {
      this.warning('Could not test static assets')
    }
    
    console.log('')
  }

  async testDatabaseConnection() {
    console.log('🗄️ Testing Database Connection...')
    
    try {
      // Test protocols endpoint which requires DB
      const response = await fetch(`${APP_URL}/api/protocols?limit=1`, { timeout: 5000 })
      
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          this.pass('Database connection working')
          
          // Check for expected protocol structure
          const protocol = data[0]
          const requiredFields = ['id', 'title', 'number', 'description']
          const hasAllFields = requiredFields.every(field => protocol.hasOwnProperty(field))
          
          if (hasAllFields) {
            this.pass('Protocol data structure valid')
          } else {
            this.warning('Protocol data structure incomplete')
          }
        } else {
          this.warning('Database returns no data')
        }
      } else {
        this.fail('Database endpoint not accessible')
      }
    } catch (error) {
      this.fail(`Database test failed: ${error.message}`)
    }
    
    console.log('')
  }

  async testTierSystemLogic() {
    console.log('🎯 Testing Tier System Logic...')
    
    try {
      // Test protocols endpoint for tier-specific data
      const response = await fetch(`${APP_URL}/api/protocols`, { timeout: 5000 })
      
      if (response.ok) {
        const protocols = await response.json()
        
        if (Array.isArray(protocols)) {
          const totalProtocols = protocols.length
          const freeProtocols = protocols.filter(p => p.isFreeAccess).length
          const premiumProtocols = totalProtocols - freeProtocols
          
          console.log(`  Total protocols: ${totalProtocols}`)
          console.log(`  Free protocols: ${freeProtocols}`)
          console.log(`  Premium protocols: ${premiumProtocols}`)
          
          if (totalProtocols >= 50) {
            this.pass(`Sufficient protocol count (${totalProtocols})`)
          } else {
            this.warning(`Low protocol count (${totalProtocols})`)
          }
          
          if (freeProtocols >= 3) {
            this.pass(`Sufficient free protocols (${freeProtocols})`)
          } else {
            this.warning(`Limited free protocols (${freeProtocols})`)
          }
          
          if (premiumProtocols > 0) {
            this.pass(`Premium protocols available (${premiumProtocols})`)
          } else {
            this.warning('No premium protocols found')
          }
          
          // Check for proper isFreeAccess field
          const hasProperTierFlags = protocols.every(p => 
            typeof p.isFreeAccess === 'boolean'
          )
          
          if (hasProperTierFlags) {
            this.pass('Tier access flags properly set')
          } else {
            this.fail('Tier access flags missing or invalid')
          }
        } else {
          this.fail('Protocols endpoint returns invalid data')
        }
      } else {
        this.fail('Could not fetch protocols for tier testing')
      }
    } catch (error) {
      this.fail(`Tier system test failed: ${error.message}`)
    }
    
    console.log('')
  }

  async testDeploymentHealth() {
    console.log('💓 Testing Deployment Health...')
    
    try {
      // Check if the service is running via SSH (if possible)
      const sshCommand = 'ssh -i ~/.ssh/protokol57_ed25519 root@69.62.126.73 "docker ps | grep protokol57"'
      
      try {
        const output = execSync(sshCommand, { timeout: 10000, encoding: 'utf8' })
        if (output.includes('protokol57')) {
          this.pass('Docker container running')
        } else {
          this.warning('Docker container status unclear')
        }
      } catch (sshError) {
        this.warning('Could not check Docker status via SSH')
      }
      
      // Check response headers for deployment info
      const response = await fetch(APP_URL, { method: 'HEAD' })
      const server = response.headers.get('server')
      const deployTime = response.headers.get('x-deploy-time')
      
      if (server) {
        this.pass(`Server identified: ${server}`)
      }
      
      if (deployTime) {
        this.pass(`Deployment time: ${deployTime}`)
      }
      
    } catch (error) {
      this.warning('Health check partially failed')
    }
    
    console.log('')
  }

  pass(message) {
    console.log(`✅ ${message}`)
    this.results.passed++
  }

  fail(message) {
    console.log(`❌ ${message}`)
    this.results.failed++
    this.results.issues.push(`FAIL: ${message}`)
  }

  warning(message) {
    console.log(`⚠️ ${message}`)
    this.results.warnings++
    this.results.issues.push(`WARN: ${message}`)
  }

  printSummary() {
    console.log('📊 Validation Summary:')
    console.log(`  ✅ Passed: ${this.results.passed}`)
    console.log(`  ❌ Failed: ${this.results.failed}`)
    console.log(`  ⚠️ Warnings: ${this.results.warnings}`)
    console.log('')
    
    if (this.results.issues.length > 0) {
      console.log('🔍 Issues Found:')
      this.results.issues.forEach(issue => {
        console.log(`  • ${issue}`)
      })
      console.log('')
    }
    
    const totalTests = this.results.passed + this.results.failed + this.results.warnings
    const successRate = ((this.results.passed / totalTests) * 100).toFixed(1)
    
    console.log(`🎯 Success Rate: ${successRate}%`)
    
    if (this.results.failed === 0) {
      console.log('🎉 Deployment validation PASSED!')
      process.exit(0)
    } else {
      console.log('🚨 Deployment validation FAILED!')
      process.exit(1)
    }
  }
}

// Run validation if this script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new DeploymentValidator()
  validator.runAllTests().catch(error => {
    console.error('❌ Validation script failed:', error)
    process.exit(1)
  })
}

export default DeploymentValidator