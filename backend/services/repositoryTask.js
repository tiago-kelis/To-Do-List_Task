const { PrismaClient } = require('@prisma/client');
const Task = require('../../core/src/model/Task');

const prisma = new PrismaClient();

class TaskRepository {
  async getAllTasks() {
    try {
      const tasks = await prisma.task.findMany();
      return tasks.map(task => new Task(task.id, task.title, task.description, task.status, task.userId));
    } catch (error) {
      console.error('Erro ao obter tarefas no repositório:', error); // Adicionar log de erro
      throw error;
    }
  }

  async addTask(title, description, status, userId) {
    try {
      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          status: status || 'Pendente',
          userId: parseInt(userId), // Certifique-se de que userId é um número
        },
      });
      return new Task(newTask.id, newTask.title, newTask.description, newTask.status, newTask.userId);
    } catch (error) {
      console.error('Erro ao adicionar tarefa no repositório:', error); // Adicionar log de erro
      throw error;
    }
  }

  async updateTask(id, title, description, status) {
    try {
      const updatedTask = await prisma.task.update({
        where: { id: parseInt(id) },
        data: { title, description, status },
      });
      return new Task(updatedTask.id, updatedTask.title, updatedTask.description, updatedTask.status, updatedTask.userId);
    } catch (error) {
      console.error('Erro ao atualizar tarefa no repositório:', error); // Adicionar log de erro
      throw error;
    }
  }

  async deleteTask(id) {
    try {
      await prisma.task.delete({
        where: { id: parseInt(id) },
      });
    } catch (error) {
      console.error('Erro ao deletar tarefa no repositório:', error); // Adicionar log de erro
      throw error;
    }
  }
}

module.exports = TaskRepository;
