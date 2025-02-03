const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const TaskController = require('./controller/TaskController');
const UserController = require('./controller/UserController');
require('dotenv').config(); // Carrega as variáveis de ambiente do .env

const app = express();

// Configurando o CORS para permitir múltiplas origens
const allowedOrigins = ['https://to-do-list-task-phi.vercel.app', 'http://localhost:3000'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Testar a conexão com o banco de dados
prisma.$connect()
  .then(() => {
    console.log('Conexão com o banco de dados bem-sucedida!');
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
  });

// Rotas de Tarefas
app.get('/tasks', TaskController.getAllTasks);
app.post('/tasks', TaskController.addTask);
app.put('/tasks/:id', TaskController.updateTask);
app.delete('/tasks/:id', TaskController.deleteTask);

// Rotas de Usuários
app.get('/users', UserController.getAllUsers);
app.post('/users', UserController.addUser);

// Configurando a porta do servidor e permitindo conexões de qualquer interface
const PORT = process.env.PORT || 3001;
app.listen(PORT, '::', () => {
  console.log(`Server running on port ${PORT}`);
});
