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

// Configuração para diferentes tipos de requisições
const baseApiUrl = 'https://to-do-list-task-wqkq.onrender.com';
// Para GET - usando AllOrigins
const readProxyUrl = 'https://api.allorigins.win/raw?url=';
// Para POST, PUT, DELETE - usando CORS Anywhere (ou outro proxy que suporte requisições POST)
const writeProxyUrl = 'https://corsproxy.io/?url=';

console.log("API URL base:", baseApiUrl);
console.log("Proxy para leitura:", readProxyUrl);
console.log("Proxy para escrita:", writeProxyUrl);

// Função auxiliar para criar URLs completas para leitura (GET)
const getReadUrl = (path) => {
  const fullUrl = `${readProxyUrl}${encodeURIComponent(`${baseApiUrl}${path}`)}`;
  console.log("URL gerada para leitura:", fullUrl);
  return fullUrl;
};

// Função auxiliar para criar URLs completas para escrita (POST/PUT/DELETE)
const getWriteUrl = (path) => {
  const fullUrl = `${writeProxyUrl}${encodeURIComponent(`${baseApiUrl}${path}`)}`;
  console.log("URL gerada para escrita:", fullUrl);
  return fullUrl;
};

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setError(null);
    setLoading(true);
    
    const tasksUrl = getReadUrl('/api/tasks');
    console.log("Iniciando useEffect - fazendo requisição para:", tasksUrl);
    
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Usando uma URL completa em vez de baseURL + path
    axios.get(tasksUrl, { signal })
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
    
    // Gerar ID temporário para caso a requisição falhe
    const tempId = Date.now();
    
    // Criar objeto de tarefa com ID temporário
    const newTask = {
      id: tempId,
      title: task.title,
      description: task.description,
      status: 'To Do',
      userId: 1
    };
    
    // Adicionar ao estado imediatamente para feedback rápido ao usuário
    setTasks([...tasks, newTask]);
    
    // URL para operação POST
    const postUrl = getWriteUrl('/api/tasks');
    console.log("Adicionando tarefa para:", postUrl);
    console.log("Dados da tarefa:", newTask);
    
    // Configurações para a requisição
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Enviar para o backend
    axios.post(postUrl, newTask, config)
      .then(response => {
        console.log("Added task:", response.data);
        
        // Atualizar a tarefa com o ID real retornado pelo servidor (se houver)
        if (response.data && response.data.id) {
          setTasks(prevTasks => prevTasks.map(t => 
            t.id === tempId ? response.data : t
          ));
        }
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
        
        // Não remover a tarefa do estado para manter UX, mas mostrar erro
        setError("A tarefa foi adicionada localmente, mas não foi sincronizada com o servidor.");
      });
  };

  const updateTask = (id, updates) => {
    // Atualizar localmente primeiro para UX responsiva
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, ...updates };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    
    // URL para operação PUT
    const updateUrl = getWriteUrl(`/api/tasks/${id}`);
    console.log("Atualizando tarefa:", updateUrl);
    console.log("Dados de atualização:", updates);
    
    // Configurações para a requisição
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Enviar para o backend
    axios.put(updateUrl, updates, config)
      .then(response => {
        console.log("Updated task:", response.data);
        // Estado já foi atualizado acima, não é necessário atualizar novamente
      })
      .catch(error => {
        console.error("Error updating task: ", error);
        setError("A tarefa foi atualizada localmente, mas não foi sincronizada com o servidor.");
      });
  };

  const deleteTask = (id) => {
    // Remover localmente primeiro para UX responsiva
    const filteredTasks = tasks.filter(task => task.id !== id);
    setTasks(filteredTasks);
    
    // URL para operação DELETE
    const deleteUrl = getWriteUrl(`/api/tasks/${id}`);
    console.log("Deletando tarefa:", deleteUrl);
    
    // Enviar para o backend
    axios.delete(deleteUrl)
      .then(() => {
        console.log("Deleted task:", id);
        // Estado já foi atualizado acima, não é necessário atualizar novamente
      })
      .catch(error => {
        console.error("Error deleting task: ", error);
        setError("A tarefa foi removida localmente, mas não foi sincronizada com o servidor.");
        
        // Opcional: restaurar a tarefa na interface se a exclusão falhar no servidor
        // setTasks(previousTasks);
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
    
    const retryUrl = getReadUrl('/api/tasks');
    
    axios.get(retryUrl)
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
      
      {/* Aviso de modo semi-offline para o usuário */}
      <div style={{
        backgroundColor: '#e2f0ff',
        color: '#0066cc',
        padding: '10px',
        borderRadius: '5px',
        margin: '10px 0',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0' }}>
          ℹ️ A aplicação está operando em modo híbrido: ações são executadas localmente primeiro e depois sincronizadas com o servidor.
        </p>
      </div>
      
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