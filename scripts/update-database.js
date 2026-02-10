// Node.js script to update database schema and generate seed data
// Usage: node scripts/update-database.js [--url <worker-url>]

const https = require('https');
const http = require('http');

const args = process.argv.slice(2);
let workerUrl = 'http://localhost:8787';

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    workerUrl = args[i + 1];
    i++;
  }
}

// Remove trailing slash
workerUrl = workerUrl.replace(/\/$/, '');

async function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ ok: false, error: 'Invalid JSON response', raw: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  console.log('=== Database Update Script ===\n');
  console.log(`Worker URL: ${workerUrl}\n`);

  try {
    // Step 1: Run migration
    console.log('Step 1: Running database migration...');
    console.log('This will add new columns (user_name, rating, category, tags, verified) to raw_feedback table\n');
    
    const migrateResponse = await makeRequest(`${workerUrl}/api/migrate`, 'POST');
    
    if (migrateResponse.ok) {
      console.log('✓ Migration completed successfully');
      if (migrateResponse.migrations && migrateResponse.migrations.length > 0) {
        console.log('Applied migrations:');
        migrateResponse.migrations.forEach(m => console.log(`  - ${m}`));
      } else {
        console.log('Database schema is already up to date');
      }
      if (migrateResponse.errors && migrateResponse.errors.length > 0) {
        console.log('Errors:');
        migrateResponse.errors.forEach(e => console.log(`  - ${e}`));
      }
    } else {
      console.error('✗ Migration failed:', migrateResponse.error || migrateResponse);
      process.exit(1);
    }

    console.log('\n');

    // Step 2: Generate seed data
    console.log('Step 2: Generating seed data...');
    console.log('This will generate 2000 feedback items with the new format\n');
    
    const seedResponse = await makeRequest(`${workerUrl}/api/seed`, 'POST');
    
    if (seedResponse.ok) {
      console.log('✓ Seed data generated successfully');
      console.log(`Inserted ${seedResponse.inserted || 0} feedback items`);
    } else {
      console.error('✗ Seed data generation failed:', seedResponse.error || seedResponse);
      process.exit(1);
    }

    console.log('\n=== All done! ===');
    console.log('Your database has been updated and populated with new seed data.');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nMake sure your Cloudflare Worker is running and accessible at:', workerUrl);
    console.error('\nFor local development:');
    console.error('  npx wrangler dev');
    console.error('\nFor production:');
    console.error('  node scripts/update-database.js --url https://your-worker.your-subdomain.workers.dev');
    process.exit(1);
  }
}

main();
