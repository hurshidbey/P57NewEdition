// Test ATMOS API directly
const https = require('https');

const ATMOS_CONSUMER_KEY = 'UhGzIAQ10FhOZiZ9KTHH_3NhTZ8a';
const ATMOS_CONSUMER_SECRET = 'JCuvoGpaV6VHf3migqRy7r6qtiMa';

async function testAtmosToken() {
  console.log('Testing ATMOS API token endpoint...\n');
  
  const credentials = Buffer.from(`${ATMOS_CONSUMER_KEY}:${ATMOS_CONSUMER_SECRET}`).toString('base64');
  
  const options = {
    hostname: 'partner.atmos.uz',
    port: 443,
    path: '/token',
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Status Message: ${res.statusMessage}`);
      console.log('Headers:', res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\nResponse Body:');
        console.log(data);
        
        try {
          const parsed = JSON.parse(data);
          console.log('\nParsed JSON:', parsed);
        } catch (e) {
          console.log('\nFailed to parse as JSON. Response might be HTML or plain text.');
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error);
      reject(error);
    });

    req.write('grant_type=client_credentials');
    req.end();
  });
}

// Run the test
testAtmosToken().catch(console.error);
