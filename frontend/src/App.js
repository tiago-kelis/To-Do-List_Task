import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import './App.css';

// Configuração para ignorar erros de certificado apenas durante o desenvolvimento
const axiosInstance = axios.create({
  baseURL: 'https://[2804:14d:78d0:4256:f94b:6243:c8ef:6f04]:3001',
  httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
});

const App = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axiosInstance.get('/tasks')
      .then(response => {
        console.log("Fetched tasks:", response.data);
        setTasks(response.data);
      })
      .catch(error => {
        console.error("Error fetching tasks: ", error);
      });
  }, []);

  const addTask = (task) => {
    axiosInstance.post('/tasks', { ...task, status: 'To Do' })
      .then(response => {
        console.log("Added task:", response.data);
        setTasks([...tasks, response.data]);
      })
      .catch(error => {
        console.error("Error adding task: ", error);
      });
  };

  const updateTask = (id, updates) => {
    axiosInstance.put(`/tasks/${id}`, updates)
      .then(response => {
        console.log("Updated task:", response.data);
        setTasks(tasks.map(task => task.id === id ? response.data : task));
      })
      .catch(error => {
        console.error("Error updating task: ", error);
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
