const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '2804:14d:78d0:4256:f94b:6243:c8ef:6f04',
  database: 'db_Task',
  password: 'a995359204A#$AAA',
  port: 5433,
  // Aumentar o timeout
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false
  }
});

async function test() {
  try {
    console.log('Tentando conectar...');
    await client.connect();
    console.log('Conexão estabelecida com sucesso!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Hora do servidor:', res.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error('Erro na conexão:', err);
  }
}

test();