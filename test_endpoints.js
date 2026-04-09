const http = require('http');

const request = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

(async () => {
  try {
    console.log('--- TEST 1: Register ---');
    const email = `test_${Date.now()}@example.com`;
    let res = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email, password: 'password123' });
    console.log('Register statusCode:', res.statusCode, res.data.success);
    
    console.log('--- TEST 2: Login ---');
    res = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email, password: 'password123' });
    console.log('Login statusCode:', res.statusCode, res.data.success);
    const token = res.data.token;
    
    if (!token) throw new Error('No token mapped!');

    // Note: Can't test Convert fully until Mongoose binds properly (needs real URL if we didn't mock readyState)
    // Oh wait we disabled strict readyState fail! It will run through fine.
    console.log('--- TEST 3: Convert with Auth ---');
    res = await request({
      hostname: 'localhost', port: 5000, path: '/api/convert', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, { sql: 'CREATE TABLE posts (id INT AUTO_INCREMENT PRIMARY KEY);', sourceDb: 'mysql' });
    console.log('Convert statusCode:', res.statusCode, res.data.success);
    const slug = res.data.slug;

    console.log('--- TEST 4: Get History ---');
    res = await request({
      hostname: 'localhost', port: 5000, path: '/api/history', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Get History count:', res.data.count);

    if (slug) {
        console.log('--- TEST 5: Get History by Slug ---');
        res = await request({
        hostname: 'localhost', port: 5000, path: `/api/history/${slug}`, method: 'GET'
        });
        console.log('Get by Slug statusCode:', res.statusCode, res.data.success);
    }
    
    console.log('All tests finished.');
  } catch(e) {
    console.error(e.message);
  }
})();
