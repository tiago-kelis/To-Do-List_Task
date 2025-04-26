import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import './App.css';

// Logging para ambiente e diagnóstico
console.log("Frontend environment:", {
  nodeEnv: process.env.NODE_ENV,
  apiUrl: process.env.REACT_APP_API_URL,
  hostname: window.location.hostname
});

// Configuração fixa do axios - sem lógica condicional
const axiosInstance = axios.create({
  baseURL: 'https://to-do-list-task-wqkq.onrender.com',
});

console.log("API URL definitivamente sendo usada:", axiosInstance.defaults.baseURL);

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Adicionando tratamento de erro mais detalhado
    setError(null);
    setLoading(true);
    
    console.log("Fazendo requisição para:", axiosInstance.defaults.baseURL + '/api/tasks');
    
    axiosInstance.get('/api/tasks')
      .then(response => {
        console.log("Fetched tasks:", response.data);
        setTasks(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching tasks: ", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : 'No response',
          request: error.request ? 'Request was made but no response' : 'Request not sent'
        });
        
        setError("Não foi possível carregar as tarefas. Por favor, tente novamente mais tarde.");
        setLoading(false);
        setTasks([]);
      });
  }, []);

  const addTask = (task) => {
    setError(null);
    
    console.log("Adicionando tarefa para:", axiosInstance.defaults.baseURL + '/api/tasks');
    console.log("Dados da tarefa:", { ...task, status: 'To Do' });
    
    axiosInstance.post('/api/tasks', { ...task, status: 'To Do', userId: 1 })
      .then(response => {
        console.log("Added task:", response.data);
        setTasks([...tasks, response.data]);
      })
      .catch(error => {
        console.error("Error adding task: ", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : 'No response'
        });
        
        setError("Não foi possível adicionar a tarefa. Por favor, tente novamente.");
      });
  };

  const updateTask = (id, updates) => {
    console.log("Atualizando tarefa:", axiosInstance.defaults.baseURL + `/api/tasks/${id}`);
    console.log("Dados de atualização:", updates);
    
    axiosInstance.put(`/api/tasks/${id}`, updates)
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
    console.log("Deletando tarefa:", axiosInstance.defaults.baseURL + `/api/tasks/${id}`);
    
    axiosInstance.delete(`/api/tasks/${id}`)
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
      
      {/* Exibe indicador de carregamento */}
      {loading && <div className="loading-message">Carregando tarefas...</div>}
      
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