const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obter todos os usuários
const getAllUsers = async (req, res) => {
  try {
    // Verificar se o modelo User existe
    if (!prisma.user) {
      console.error('Modelo User não está definido no schema Prisma');
      return res.status(500).json({ 
        error: 'Erro ao obter usuários: Modelo não definido',
        message: 'O modelo User precisa ser adicionado ao schema Prisma'
      });
    }
    
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({ 
      error: 'Erro ao obter usuários',
      message: error.message 
    });
  }
};

// Adicionar novo usuário
const addUser = async (req, res) => {
  try {
    // Verificar se o modelo User existe
    if (!prisma.user) {
      console.error('Modelo User não está definido no schema Prisma');
      return res.status(500).json({ 
        error: 'Erro ao criar usuário: Modelo não definido',
        message: 'O modelo User precisa ser adicionado ao schema Prisma'
      });
    }
    
    const { name, email } = req.body;
    
    // Validação básica
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }
    
    const newUser = await prisma.user.create({
      data: { name, email },
    });
    
    console.log('Novo usuário criado:', newUser);
    res.json(newUser);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao criar usuário',
      message: error.message 
    });
  }
};

module.exports = {
  getAllUsers,
  addUser,
};