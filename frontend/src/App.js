import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import './App.css';

const cors = require('cors');
const express = require('express');
const app = express();


app.use(cors({
  origin: [
    'https://seu-app.vercel.app', // URL do seu frontend na Vercel
    'http://localhost:3000'       // URL para desenvolvimento local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging para debug da variável de ambiente
console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);

// Configuração atualizada do axios
const axiosInstance = axios.create({
  // Substitua pelo URL do seu backend no Render - use http não https para localhost
  baseURL: process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'localhost' ? 
      'http://localhost:3001' : 
      'https://to-do-list-task.onrender.com') // Substitua por sua URL real de backend
});

console.log("Usando API URL:", axiosInstance.defaults.baseURL);
const App = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Adicionando tratamento de erro mais detalhado
    setError(null);
    axiosInstance.get('/tasks')
      .then(response => {
        console.log("Fetched tasks:", response.data);
        setTasks(response.data);
      })
      .catch(error => {
        console.error("Error fetching tasks: ", error);
        setError("Não foi possível carregar as tarefas. Por favor, tente novamente mais tarde.");
        // Opcional: use um fallback de dados para desenvolvimento
        if (process.env.NODE_ENV !== 'production') {
          setTasks([]);
        }
      });
  }, []);

  const addTask = (task) => {
    setError(null);
    axiosInstance.post('/tasks', { ...task, status: 'To Do' })
      .then(response => {
        console.log("Added task:", response.data);
        setTasks([...tasks, response.data]);
      })
      .catch(error => {
        console.error("Error adding task: ", error);
        setError("Não foi possível adicionar a tarefa. Por favor, tente novamente.");
      });
  };

  // O resto do seu código permanece igual...
  const updateTask = (id, updates) => {
    axiosInstance.put(`/tasks/${id}`, updates)
      .then(response => {
        console.log("Updated task:", response.data);
        setTasks(tasks.map(task => task.id === id ? response.data : task));
      })
      .catch(error => {
        console.error("Error updating task: ", error);
        setError("Não foi possível atualizar a tarefa.");
      });
  };

  const deleteTask = (id) => {
    axiosInstance.delete(`/tasks/${id}`)
      .then(() => {
        console.log("Deleted task:", id);
        setTasks(tasks.filter(task => task.id !== id));
      })
      .catch(error => {
        console.error("Error deleting task: ", error);
        setError("Não foi possível excluir a tarefa.");
      });
  };

  const moveTask = (id) => {
    const task = tasks.find(task => task.id === id);
    if (task) {
      let newStatus;
      switch (task.status) {
        case 'To Do':
          newStatus = 'In Progress';
          break;
        case 'In Progress':
          newStatus = 'Completed';
          break;
        default:
          return;
      }
      updateTask(id, { status: newStatus });
    }
  };

  return (
    <div className="App">
      <h1 style={{ margin: '0', padding: '0' }}>
        <img 
          src={process.env.PUBLIC_URL + '/logoWeb-removebg-preview.png'} 
          alt="Logo" 
          style={{ width: '150px', height: '90px', padding: '0', margin: '0' }} 
        />
      </h1>
      
      {/* Exibe mensagens de erro quando ocorrerem */}
      {error && <div className="error-message">{error}</div>}
      
      <TaskForm onAddTask={addTask} />
      <div className="TaskListColumns">
        <div className="TaskListColumn">
          <h2>To Do</h2>
          <TaskList tasks={tasks.filter(task => task.status === 'To Do')} onUpdateTask={updateTask} onDeleteTask={deleteTask} onMoveTask={moveTask} />
        </div>
        <div className="TaskListColumn">
          <h2>In Progress</h2>
          <TaskList tasks={tasks.filter(task => task.status === 'In Progress')} onUpdateTask={updateTask} onDeleteTask={deleteTask} onMoveTask={moveTask} />
        </div>
        <div className="TaskListColumn">
          <h2>Completed</h2>
          <TaskList tasks={tasks.filter(task => task.status === 'Completed')} onUpdateTask={updateTask} onDeleteTask={deleteTask} onMoveTask={moveTask} />
        </div>
      </div>
    </div>
  );
};

export default App;