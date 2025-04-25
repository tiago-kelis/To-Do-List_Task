// Importando o Express
const express = require('express');
const app = express();

// Middleware para lidar com JSON no corpo das requisições
app.use(express.json());

// Rota padrão para testar o servidor
app.get('/', (req, res) => {
  res.status(200).send('Servidor rodando com sucesso!');
});

// Outra rota de exemplo
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Olá, este é seu backend com Express!' });
});

// Endpoint de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Vinculando a porta fornecida pela Render
const PORT = process.env.PORT || 3001; // A Render define PORT automaticamente
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});                                                                                                                   