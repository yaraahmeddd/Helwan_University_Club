const { createConnection } = require('typeorm');
const bcrypt = require('bcrypt');

async function createSecurityAccount() {
  const { Client } = require('pg');
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '0000',
    database: 'Deploy'
  });

  await client.connect();
  try {
    // Check if security account already exists
    const res = await client.query(`SELECT id FROM accounts WHERE email = 'security@uni.local'`);
    if (res.rows.length > 0) {
      console.log('Security account already exists!');
      return;
    }

    // Create the account
    const hashedPassword = await bcrypt.hash('security123', 10);
    const insertRes = await client.query(
      `INSERT INTO accounts (email, password, role, status, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id`,
      ['security@uni.local', hashedPassword, 'security', 'active', true]
    );

    console.log('Security account created with ID:', insertRes.rows[0].id);
    console.log('Email: security@uni.local');
    console.log('Password: security123');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

createSecurityAccount();
