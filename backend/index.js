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
    'https://frontend-five-kappa-76.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Client-Info',
    'Cache-Control',
    'Pragma',
    'X-Requested-With'
  ],
  credentials: true,
  maxAge: 86400
}));

// Middleware para debugging de CORS (modificado para ignorar health checks)
app.use((req, res, next) => {
  // Apenas loga rotas da API, ignorando health checks e outras rotas de sistema
  if (req.path.startsWith('/api/')) {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No Origin'}`);
  }
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

// Endpoint de verificação de saúde - implementação mais eficiente
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
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
  // Não loga erros 404 para health checks
  if (req.path !== '/health') {
    console.log(`Rota não encontrada: ${req.method} ${req.path}`);
  }
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
  console.log(`CORS configurado para: ${JSON.stringify(app.get('corsConfig') || 'default')}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});