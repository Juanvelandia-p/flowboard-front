import React, { useState } from 'react';
import './App.css';
import Board from './components/Board';
import TaskChat from './components/TaskChat';
import SprintSelector from './components/SprintSelector';
import LoginPage from './components/LoginPage';
import BoardListPage from './components/BoardListPage';
import './stylesheets/AppLayout.css';
import './stylesheets/BoardListPage.css';
import logo from './assets/logo.png';

// Simulación de sprints y tareas por sprint
const sprints = [
  { id: 1, name: 'Sprint 1' },
  { id: 2, name: 'Sprint 2' },
  { id: 3, name: 'Sprint 3' }
];

const tasksBySprint = {
  1: [
    { id: 1, title: 'Diseñar UI', description: 'Crear wireframes para el tablero', status: 'todo' },
    { id: 2, title: 'Configurar backend', description: 'Inicializar Spring Boot', status: 'inprogress' },
    { id: 3, title: 'Reunión diaria', description: 'Daily stand-up con el equipo', status: 'done' },
  ],
  2: [
    { id: 4, title: 'Testear API', description: 'Pruebas unitarias para endpoints', status: 'todo' },
    { id: 5, title: 'Documentar código', description: 'Agregar comentarios y documentación', status: 'inprogress' },
  ],
  3: [
    { id: 6, title: 'Desplegar en producción', description: 'Deploy final', status: 'todo' },
  ]
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(sprints[0].id);
  const [tasks, setTasks] = useState(tasksBySprint[selectedSprint]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Puedes cambiar estos valores por los reales de tu app
  const boardId = selectedBoard ? selectedBoard.id : 'demo-board';
  const userId = 'user-' + Math.floor(Math.random() * 10000);

  const handleSprintChange = (e) => {
    const sprintId = Number(e.target.value);
    setSelectedSprint(sprintId);
    setTasks(tasksBySprint[sprintId] || []);
    setSelectedTaskId(null);
  };

  const handleMoveTask = (taskId, newStatus) => {
    setTasks(tasks =>
      tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // 1. Si no hay token, muestra login
  if (!token) {
    return <LoginPage onLogin={setToken} />;
  }

  // 2. Si no hay tablero seleccionado, muestra lista de tableros
  if (!selectedBoard) {
    return <BoardListPage token={token} onSelectBoard={setSelectedBoard} />;
  }

  // 3. Si hay tablero, muestra el tablero y tareas
  return (
    <div className="app-root">
      <header className="header-bar">
        <img src={logo} alt="FlowBoard logo" className="header-logo" />
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('token');
            setToken(null);
            setSelectedBoard(null);
            setSelectedTaskId(null);
          }}
        >
          Cerrar sesión
        </button>
      </header>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1400 }}>
          <div className="sprint-selector-bar">
            <span className="sprint-selector-label">Sprint:</span>
            <SprintSelector
              sprints={sprints}
              selectedSprint={selectedSprint}
              onChange={handleSprintChange}
              selectClassName="sprint-selector-select"
            />
          </div>
          <Board
            tasks={tasks}
            onMoveTask={handleMoveTask}
            boardId={boardId}
            userId={userId}
            onSelectTask={setSelectedTaskId}
          />
        </div>
        {selectedTaskId && (
          <TaskChat taskId={selectedTaskId} userId={userId} onClose={() => setSelectedTaskId(null)} />
        )}
      </div>
    </div>
  );
}

export default App;
