const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Tentando conectar ao banco de dados...');
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('Conexão estabelecida com sucesso!');
    console.log('Hora do servidor:', result[0].now);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Erro na conexão com o banco de dados:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();