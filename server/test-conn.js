import pg from 'pg';

const { Client } = pg;

async function testConnection() {
  console.log('Testing connection to PostgreSQL 43.173.12.46:5432...');

  // Test 1: Connect to postgres default db
  const client1 = new Client({
    connectionString: 'postgresql://postgres:31122000Hfz@43.173.12.46:5432/postgres'
  });

  try {
    await client1.connect();
    console.log('✅ Success connecting to postgres server!');
    const res = await client1.query("SELECT datname FROM pg_database WHERE datname IN ('tahfidz_db', 'mathfingers_db');");
    console.log('Databases found:', res.rows.map(r => r.datname));
    
    // Check if tahfidz_db exists, if not create it
    const hasTahfidzDb = res.rows.some(r => r.datname === 'tahfidz_db');
    if (!hasTahfidzDb) {
      console.log('Creating database tahfidz_db...');
      await client1.query('CREATE DATABASE tahfidz_db;');
      console.log('✅ Database tahfidz_db created successfully!');
    }
    await client1.end();
  } catch (err) {
    console.error('❌ Error with postgres db:', err.message);
  }

  // Test 2: Connect to tahfidz_db
  const client2 = new Client({
    connectionString: 'postgresql://postgres:31122000Hfz@43.173.12.46:5432/tahfidz_db'
  });

  try {
    await client2.connect();
    console.log('✅ Success connecting to tahfidz_db!');
    const tablesRes = await client2.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log('Tables in tahfidz_db:', tablesRes.rows.map(r => r.table_name));
    await client2.end();
  } catch (err) {
    console.error('❌ Error with tahfidz_db:', err.message);
  }
}

testConnection();
