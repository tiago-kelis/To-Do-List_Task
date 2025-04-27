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

// Configuração do axios com proxy CORS para evitar problemas de CORS
const axiosInstance = axios.create({
  baseURL: 'https://corsproxy.io/?https://to-do-list-task-wqkq.onrender.com',
  // Não inclua nenhum header personalizado aqui para evitar problemas de CORS
});

console.log("API URL com proxy CORS:", axiosInstance.defaults.baseURL);

// Interceptor básico para logs de requisições sem adicionar headers
axiosInstance.interceptors.request.use(request => {
  console.log('Iniciando requisição:', request.method, request.url);
  
  // IMPORTANTE: Remove os headers problemáticos (se existirem)
  if (request.headers) {
    delete request.headers['Cache-Control'];
    delete request.headers['Pragma'];
    delete request.headers['X-Client-Info'];
  }
  
  return request;
});

// Interceptor para logs em todas as respostas
axiosInstance.interceptors.response.use(
  response => {
    console.log('Resposta recebida:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('Erro na requisição:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setError(null);
    setLoading(true);
    
    console.log("Iniciando useEffect - fazendo requisição para:", axiosInstance.defaults.baseURL + '/api/tasks');
    
    const controller = new AbortController();
    const signal = controller.signal;
    
    axiosInstance.get('/api/tasks', { signal })
      .then(response => {
        console.log("Resposta recebida com status:", response.status);
        if (isMounted) {
          console.log("Dados recebidos:", response.data);
          
          // Verificação de conteúdo válido
          if (!Array.isArray(response.data)) {
            console.error("Resposta não é um array:", response.data);
            setError("Formato de dados inesperado");
            setTasks([]);
          } else {
            console.log("Atualizando estado com dados recebidos, total de tarefas:", response.data.length);
            setTasks(response.data);
          }
          
          setLoading(false);
        }
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          console.log('Requisição cancelada');
          return;
        }
        
        console.error("Error fetching tasks: ", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          } : 'No response',
          request: error.request ? 'Request was made but no response' : 'Request not sent'
        });
        
        if (isMounted) {
          setError("Não foi possível carregar as tarefas. Por favor, tente novamente mais tarde.");
          setLoading(false);
          setTasks([]);
        }
      });
    
    // Cleanup function
    return () => {
      console.log("Limpeza do useEffect - abortando requisição pendente");
      isMounted = false;
      controller.abort();
    };
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

  // Função para tentar novamente o carregamento de tarefas
  const handleRetryFetch = () => {
    console.log("Tentando carregar tarefas novamente...");
    setLoading(true);
    setError(null);
    
    axiosInstance.get('/api/tasks')
      .then(response => {
        console.log("Retry successful, fetched tasks:", response.data);
        if (Array.isArray(response.data)) {
          setTasks(response.data);
          setError(null);
        } else {
          console.error("Resposta não é um array:", response.data);
          setError("Formato de dados inesperado");
          setTasks([]);
        }
      })
      .catch(error => {
        console.error("Retry failed:", error);
        setError("Falha ao tentar carregar as tarefas novamente.");
        setTasks([]);
      })
      .finally(() => {
        setLoading(false);
      });
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
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleRetryFetch}>Tentar novamente</button>
        </div>
      )}
      
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