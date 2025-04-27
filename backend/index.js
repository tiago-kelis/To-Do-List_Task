// Importando o Express
const express = require('express');
const cors = require('cors');
const app = express();

// Importando apenas o controller de tarefas
const taskController = require('./controller/TaskController');

// Middleware

// Configuração CORS explícita
app.use(cors({
  origin: [
    'https://frontend-five-kappa-76.vercel.app',  // Seu domínio na Vercel
    'http://localhost:3000'  // Para desenvolvimento local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Client-Info',
    'Cache-Control',    // Adicionando este cabeçalho que estava causando problemas
    'Pragma',           // Outro cabeçalho comum que pode causar problemas
    'X-Requested-With'  // Cabeçalho usado em algumas requisições AJAX
  ],
  credentials: true,
  maxAge: 86400  // 24 horas em segundos
}));

// Middleware para debugging de CORS (opcional, remova em produção)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

app.use(express.json());

// Rota padrão para testar o servidor
app.get('/', (req, res) => {
  res.status(200).send('Servidor rodando com sucesso!');
});

// Rotas de tarefas
app.get('/api/tasks', taskController.getAllTasks);
app.post('/api/tasks', taskController.addTask);
app.put('/api/tasks/:id', taskController.updateTask);
app.delete('/api/tasks/:id', taskController.deleteTask);

// Endpoint de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Rota para testar a conexão com o banco de dados
app.get('/api/test-db', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Tenta executar uma consulta simples
    const result = await prisma.$queryRaw`SELECT NOW()`;
    
    res.status(200).json({
      status: 'Conectado',
      time: result[0].now,
      message: 'Conexão com o banco de dados estabelecida com sucesso!'
    });
  } catch (error) {
    console.error('Erro na conexão com o banco de dados:', error);
    res.status(500).json({
      status: 'Erro',
      message: 'Falha na conexão com o banco de dados',
      error: error.message
    });
  }
});

// Middleware para tratar rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    status: 'Erro',
    message: `Rota não encontrada: ${req.method} ${req.path}`
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    status: 'Erro',
    message: 'Erro interno no servidor',
    error: process.env.NODE_ENV === 'production' ? 'Detalhes omitidos em produção' : err.message
  });
});

// Vinculando a porta fornecida pela Render
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`CORS configurado para: ${JSON.stringify(cors().origin)}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});