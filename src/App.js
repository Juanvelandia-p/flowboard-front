
import React, { useState } from 'react';
import './App.css';
import Board from './components/Board';

const initialTasks = [
  { id: 1, title: 'Diseñar UI', description: 'Crear wireframes para el tablero', status: 'todo' },
  { id: 2, title: 'Configurar backend', description: 'Inicializar Spring Boot', status: 'inprogress' },
  { id: 3, title: 'Reunión diaria', description: 'Daily stand-up con el equipo', status: 'done' },
];

function App() {
  const [tasks, setTasks] = useState(initialTasks);

  const handleMoveTask = (taskId, newStatus) => {
    setTasks(tasks =>
      tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Puedes cambiar estos valores por los reales de tu app
  const boardId = 'demo-board';
  const userId = 'user-' + Math.floor(Math.random() * 10000); // Simula un usuario aleatorio por pestaña

  return (
    <div className="App">
      <h1>FlowBoard</h1>
      <Board
        tasks={tasks}
        onMoveTask={handleMoveTask}
        boardId={boardId}
        userId={userId}
      />
    </div>
  );
}

export default App;
