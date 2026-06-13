const { createConnection, getConnectionOptions } = require('typeorm');

async function check() {
  const { Client } = require('pg');
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '0000',
    database: 'Deploy'
  });

  await client.connect();
  
  const result = await client.query(`
    SELECT id, first_name_ar, last_name_ar, national_id_front, national_id_back
    FROM members
    WHERE id = 41
  `);
  console.log('Member 41:', result.rows);

  await client.end();
}

check().catch(console.error);
