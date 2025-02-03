const TaskRepository = require('../services/repositoryTask');


const taskRepository = new TaskRepository();

// Obter todas as tarefas
const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskRepository.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao obter tarefas:', error); // Adicionar log de erro
    res.status(500).json({ error: 'Erro ao obter tarefas' });
  }
};

// Adicionar nova tarefa
const addTask = async (req, res) => {
  try {
    const { title, description, status, userId } = req.body;
    console.log('Dados da nova tarefa:', { title, description, status, userId }); // Adicionar log de depuração
    const newTask = await taskRepository.addTask(title, description, status, userId);
    console.log('Nova tarefa criada:', newTask); // Adicionar log de depuração
    res.json(newTask);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error); // Adicionar log de erro
    res.status(500).json({ error: 'Erro ao criar tarefa' });
  }
};

// Atualizar tarefa
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    console.log('Atualizando tarefa:', { id, updates: { title, description, status } }); // Adicionar log de depuração
    const updatedTask = await taskRepository.updateTask(id, title, description, status);
    console.log('Tarefa atualizada:', updatedTask); // Adicionar log de depuração
    res.json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error); // Adicionar log de erro
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
};

// Deletar tarefa
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deletando tarefa com ID:', id); // Adicionar log de depuração
    await taskRepository.deleteTask(id);
    console.log('Tarefa deletada com sucesso'); // Adicionar log de depuração
    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error); // Adicionar log de erro
    res.status(500).json({ error: 'Erro ao deletar tarefa' });
  }
};

module.exports = {
  getAllTasks,
  addTask,
  updateTask,
  deleteTask,
};
