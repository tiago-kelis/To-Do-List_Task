// test-db.js
require('dotenv').config(); // Para carregar variáveis do arquivo .env

// Verifica se a variável DATABASE_URL existe
console.log("Verificando configuração de conexão...");
if (!process.env.DATABASE_URL) {
  console.error("Erro: Variável DATABASE_URL não encontrada no arquivo .env");
  process.exit(1);
}

// Esconde a senha ao exibir a URL
const displayUrl = process.env.DATABASE_URL.replace(
  /(postgresql:\/\/[^:]+:)([^@]+)(@.+)/,
  "$1******$3"
);
console.log("Tentando conectar usando:", displayUrl);

// Teste usando Prisma
async function testWithPrisma() {
  try {
    console.log("\n--- Teste com Prisma ---");
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: ['warn', 'error']
    });
    
    console.log("Conectando com Prisma...");
    const result = await prisma.$queryRaw`SELECT current_timestamp as time, current_database() as db, version() as version`;
    
    console.log("✅ Conexão Prisma bem-sucedida!");
    console.log("Banco de dados:", result[0].db);
    console.log("Versão PostgreSQL:", result[0].version);
    console.log("Horário do servidor:", result[0].time);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error("❌ Erro na conexão com Prisma:");
    console.error("Mensagem:", error.message);
    if (error.meta) console.error("Detalhes:", error.meta);
    return false;
  }
}

// Teste usando pg diretamente
async function testWithPg() {
  try {
    console.log("\n--- Teste com módulo pg ---");
    const { Client } = require('pg');
    
    // Extrair componentes da URL
    const url = new URL(process.env.DATABASE_URL);
    const client = new Client({
      user: url.username,
      password: url.password,
      host: url.hostname,
      port: url.port || 5432,
      database: url.pathname.substring(1),
      ssl: url.searchParams.get('sslmode') === 'require' ? {
        rejectUnauthorized: false
      } : undefined
    });
    
    console.log("Conectando com pg...");
    await client.connect();
    
    const result = await client.query('SELECT current_timestamp as time, current_database() as db, version() as version');
    console.log("✅ Conexão pg bem-sucedida!");
    console.log("Banco de dados:", result.rows[0].db);
    console.log("Versão PostgreSQL:", result.rows[0].version);
    console.log("Horário do servidor:", result.rows[0].time);
    
    await client.end();
    return true;
  } catch (error) {
    console.error("❌ Erro na conexão com pg:");
    console.error("Mensagem:", error.message);
    console.error("Detalhes:", error);
    return false;
  }
}

// Executar testes
async function runTests() {
  console.log("Iniciando testes de conexão com o banco de dados...\n");
  
  // Testar conectividade de rede básica
  const { execSync } = require('child_process');
  try {
    const url = new URL(process.env.DATABASE_URL);
    const host = url.hostname;
    const port = url.port || 5432;
    
    console.log(`Verificando conectividade com ${host}:${port}...`);
    // Comando depende do sistema operacional
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      execSync(`ping -n 1 ${host}`, { stdio: 'ignore' });
    } else {
      execSync(`ping -c 1 ${host}`, { stdio: 'ignore' });
    }
    console.log("✅ Host atingível via ping");
  } catch (error) {
    console.log("❌ Host não respondeu ao ping (isso pode ser normal em alguns casos)");
  }
  
  // Executar testes de conexão
  const prismaResult = await testWithPrisma();
  const pgResult = await testWithPg();
  
  console.log("\n--- Resumo dos Testes ---");
  console.log("Prisma:", prismaResult ? "✅ Sucesso" : "❌ Falha");
  console.log("Node-PG:", pgResult ? "✅ Sucesso" : "❌ Falha");
  
  if (!prismaResult && !pgResult) {
    console.log("\n❌ Todos os testes falharam. Possíveis problemas:");
    console.log("1. Verifique se o PostgreSQL está rodando");
    console.log("2. Verifique as credenciais na variável DATABASE_URL");
    console.log("3. Verifique se o banco de dados existe");
    console.log("4. Verifique configurações de firewall/rede");
    process.exit(1);
  } else {
    console.log("\n✅ Pelo menos um teste bem-sucedido!");
    process.exit(0);
  }
}

// Instala dependências necessárias se não existirem
function installDependencies() {
  const { execSync } = require('child_process');
  const dependencies = ['dotenv', 'pg'];
  
  dependencies.forEach(dep => {
    try {
      require.resolve(dep);
    } catch (e) {
      console.log(`Instalando dependência necessária: ${dep}`);
      execSync(`npm install ${dep}`, { stdio: 'inherit' });
    }
  });
}

// Verifica se Prisma está instalado, se não instala
function checkPrisma() {
  try {
    require.resolve('@prisma/client');
  } catch (e) {
    console.log("Prisma não encontrado, instalando...");
    const { execSync } = require('child_process');
    execSync(`npm install @prisma/client`, { stdio: 'inherit' });
    execSync(`npx prisma generate`, { stdio: 'inherit' });
  }
}

// Executar tudo
installDependencies();
checkPrisma();
runTests();