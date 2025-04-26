// Importando o Express
const express = require('express');
const cors = require('cors'); // Você precisará instalar: npm install cors
const app = express();

// Importando controllers
// Suposição de caminhos corretos com base nos arquivos compartilhados
const taskController = require('./controller/TaskController');
const userController = require('./controller/UserController');

// Middleware
app.use(cors({
  origin: ['http://to-do-list-task-omega.vercel.app/', 'http://localhost:3000'],
  credentials: true
}));

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

// Rotas de usuários
app.get('/api/users', userController.getAllUsers);
app.post('/api/users', userController.addUser);

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

// Vinculando a porta fornecida pela Render
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});