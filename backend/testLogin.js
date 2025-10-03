const http = require('http');

async function testLogin() {
  try {
    console.log('🧪 Testing login API...');
    
    const postData = JSON.stringify({
      email: 'lakshan',
      password: 'lakshan123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Login successful!');
          console.log('Response:', JSON.parse(data));
        } else {
          console.log('❌ Login failed!');
          console.log('Status:', res.statusCode);
          console.log('Response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request failed!');
      console.log('Error:', error.message);
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.log('❌ Test failed!');
    console.log('Error:', error.message);
  }
}

testLogin();