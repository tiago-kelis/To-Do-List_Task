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

// URLs e configurações
const baseApiUrl = 'https://to-do-list-task-wqkq.onrender.com';
// Para GET - usando AllOrigins
const readProxyUrl = 'https://api.allorigins.win/raw?url=';
// Para POST, PUT, DELETE - usando CORS Anywhere (requer ativação inicial)
const writeProxyUrl = 'https://cors-proxy.htmldriven.com/?url=';

console.log("API URL base:", baseApiUrl);
console.log("Proxy para leitura:", readProxyUrl);
console.log("Proxy para escrita:", writeProxyUrl);

// Função auxiliar para criar URLs completas para leitura (GET)
const getReadUrl = (path) => {
  return `${readProxyUrl}${encodeURIComponent(`${baseApiUrl}${path}`)}`;
};

// Função auxiliar para criar URLs completas para escrita (POST/PUT/DELETE)
const getWriteUrl = (path) => {
  return `${writeProxyUrl}${encodeURIComponent(`${baseApiUrl}${path}`)}`;
};

// SOLUÇÃO SIMPLES: Usar JSONPlaceholder para simulação
// JSONPlaceholder é um serviço que simula uma API REST e não tem problemas de CORS
const useJsonPlaceholder = true; // Defina como false quando quiser usar sua API real
const jsonPlaceholderUrl = 'https://jsonplaceholder.typicode.com';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setError(null);
    setLoading(true);
    
    // Decide qual URL usar baseado na configuração
    let fetchUrl;
    if (useJsonPlaceholder) {
      fetchUrl = `${jsonPlaceholderUrl}/todos?_limit=10`;
      console.log("Usando JSONPlaceholder para simulação:", fetchUrl);
    } else {
      fetchUrl = getReadUrl('/api/tasks');
      console.log("Usando API real com proxy CORS:", fetchUrl);
    }
    
    const controller = new AbortController();
    const signal = controller.signal;
    
    axios.get(fetchUrl, { signal })
      .then(response => {
        console.log("Resposta recebida com status:", response.status);
        if (isMounted) {
          console.log("Dados recebidos:", response.data);
          
          let processedData = response.data;
          
          // Processamento específico para JSONPlaceholder
          if (useJsonPlaceholder) {
            processedData = response.data.map(item => ({
              id: item.id,
              title: item.title,
              description: 'Descrição simulada',
              status: item.completed ? 'Completed' : (Math.random() > 0.5 ? 'In Progress' : 'To Do')
            }));
          }
          
          // Verificação de conteúdo válido
          if (!Array.isArray(processedData)) {
            console.error("Resposta não é um array:", processedData);
            setError("Formato de dados inesperado");
            setTasks([]);
          } else {
            console.log("Atualizando estado com dados processados, total de tarefas:", processedData.length);
            setTasks(processedData);
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
    
    let postUrl;
    let postData;
    
    if (useJsonPlaceholder) {
      postUrl = `${jsonPlaceholderUrl}/todos`;
      postData = { 
        title: task.title,
        completed: false,
        userId: 1
      };
      console.log("Simulando adição de tarefa:", postUrl);
    } else {
      postUrl = getWriteUrl('/api/tasks');
      postData = { ...task, status: 'To Do', userId: 1 };
      console.log("Adicionando tarefa para:", postUrl);
    }
    
    console.log("Dados da tarefa:", postData);
    
    axios.post(postUrl, postData)
      .then(response => {
        console.log("Added task:", response.data);
        
        // Para JSONPlaceholder, precisamos criar um objeto completo
        // pois a API simulada retorna apenas os campos enviados
        let newTask;
        if (useJsonPlaceholder) {
          newTask = {
            id: response.data.id || Date.now(), // JSONPlaceholder retorna id, mas por segurança
            title: task.title,
            description: task.description || 'Descrição simulada',
            status: 'To Do'
          };
        } else {
          newTask = response.data;
        }
        
        setTasks([...tasks, newTask]);
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
        
        // Para demonstração, simula sucesso mesmo com erro para JSONPlaceholder
        if (useJsonPlaceholder) {
          console.log("Simulando sucesso apesar do erro");
          const newTask = {
            id: Date.now(),
            title: task.title,
            description: task.description || 'Descrição simulada',
            status: 'To Do'
          };
          setTasks([...tasks, newTask]);
        } else {
          setError("Não foi possível adicionar a tarefa. Por favor, tente novamente.");
        }
      });
  };

  const updateTask = (id, updates) => {
    let updateUrl;
    let updateData;
    
    if (useJsonPlaceholder) {
      updateUrl = `${jsonPlaceholderUrl}/todos/${id}`;
      updateData = { completed: updates.status === 'Completed' };
      console.log("Simulando atualização de tarefa:", updateUrl);
    } else {
      updateUrl = getWriteUrl(`/api/tasks/${id}`);
      updateData = updates;
      console.log("Atualizando tarefa:", updateUrl);
    }
    
    console.log("Dados de atualização:", updateData);
    
    axios.put(updateUrl, updateData)
      .then(response => {
        console.log("Updated task:", response.data);
        
        // Atualizando localmente para não depender da resposta da API
        const updatedTasks = tasks.map(task => {
          if (task.id === id) {
            return { ...task, ...updates };
          }
          return task;
        });
        
        setTasks(updatedTasks);
      })
      .catch(error => {
        console.error("Error updating task: ", error);
        
        // Para demonstração, atualiza localmente mesmo com erro para JSONPlaceholder
        if (useJsonPlaceholder) {
          console.log("Simulando sucesso apesar do erro");
          const updatedTasks = tasks.map(task => {
            if (task.id === id) {
              return { ...task, ...updates };
            }
            return task;
          });
          setTasks(updatedTasks);
        } else {
          setError("Não foi possível atualizar a tarefa.");
        }
      });
  };

  const deleteTask = (id) => {
    let deleteUrl;
    
    if (useJsonPlaceholder) {
      deleteUrl = `${jsonPlaceholderUrl}/todos/${id}`;
      console.log("Simulando exclusão de tarefa:", deleteUrl);
    } else {
      deleteUrl = getWriteUrl(`/api/tasks/${id}`);
      console.log("Deletando tarefa:", deleteUrl);
    }
    
    axios.delete(deleteUrl)
      .then(() => {
        console.log("Deleted task:", id);
        setTasks(tasks.filter(task => task.id !== id));
      })
      .catch(error => {
        console.error("Error deleting task: ", error);
        
        // Para demonstração, remove localmente mesmo com erro para JSONPlaceholder
        if (useJsonPlaceholder) {
          console.log("Simulando sucesso apesar do erro");
          setTasks(tasks.filter(task => task.id !== id));
        } else {
          setError("Não foi possível excluir a tarefa.");
        }
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
    
    let retryUrl;
    if (useJsonPlaceholder) {
      retryUrl = `${jsonPlaceholderUrl}/todos?_limit=10`;
    } else {
      retryUrl = getReadUrl('/api/tasks');
    }
    
    axios.get(retryUrl)
      .then(response => {
        console.log("Retry successful, fetched tasks:", response.data);
        
        let processedData = response.data;
        
        // Processamento específico para JSONPlaceholder
        if (useJsonPlaceholder) {
          processedData = response.data.map(item => ({
            id: item.id,
            title: item.title,
            description: 'Descrição simulada',
            status: item.completed ? 'Completed' : (Math.random() > 0.5 ? 'In Progress' : 'To Do')
          }));
        }
        
        if (Array.isArray(processedData)) {
          setTasks(processedData);
          setError(null);
        } else {
          console.error("Resposta não é um array:", processedData);
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
      
      {useJsonPlaceholder && (
        <div className="demo-notice">
          <p>⚠️ Modo de demonstração ativo: usando API simulada (JSONPlaceholder)</p>
        </div>
      )}
      
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