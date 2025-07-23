import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Board from './components/Board';
import TaskChat from './components/TaskChat';
import SprintSelector from './components/SprintSelector';
import LoginPage from './components/LoginPage';
import MainMenu from './components/MainMenu';
import './stylesheets/AppLayout.css';
import './stylesheets/BoardListPage.css';
import logo from './assets/logo.png';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [board, setBoard] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');

  const [showAddSprint, setShowAddSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintStart, setNewSprintStart] = useState('');
  const [newSprintEnd, setNewSprintEnd] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');

  // 1. Cuando seleccionas un equipo, obtén el tablero
  useEffect(() => {
    if (!selectedTeam) {
      setBoard(null);
      setSprints([]);
      setSelectedSprint(null);
      setTasks([]);
      return;
    }
    const fetchBoardAndSprints = async () => {
      try {
        // Obtener el tablero del equipo (asumiendo solo uno por equipo)
        const boardRes = await axios.get(`http://localhost:8080/api/boards/team/${selectedTeam.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const boardData = Array.isArray(boardRes.data) ? boardRes.data[0] : boardRes.data;
        setBoard(boardData);

        // Obtener sprints del tablero
        const sprintsRes = await axios.get(`http://localhost:8080/api/sprints/board/${boardData.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSprints(sprintsRes.data);

        // Selecciona el primer sprint si existe
        if (sprintsRes.data.length > 0) {
          setSelectedSprint(sprintsRes.data[0].id);
        } else {
          setSelectedSprint(null);
          setTasks([]);
        }
      } catch (err) {
        setBoard(null);
        setSprints([]);
        setSelectedSprint(null);
        setTasks([]);
      }
    };
    fetchBoardAndSprints();
  }, [selectedTeam, token]);

  // 2. Cuando cambia el sprint seleccionado, obtén las tareas
  useEffect(() => {
    if (!selectedSprint) {
      setTasks([]);
      return;
    }
    const fetchTasks = async () => {
      try {
        const tasksRes = await axios.get(`http://localhost:8080/api/sprints/${selectedSprint}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(tasksRes.data.map(t => ({
          ...t,
          title: t.titulo,
          description: t.descripcion
        })));
      } catch (err) {
        setTasks([]);
      }
    };
    fetchTasks();
  }, [selectedSprint, token]);

  const handleSprintChange = (e) => {
    setSelectedSprint(e.target.value);
    setSelectedTaskId(null);
  };

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:8080/api/tasks/${taskId}/estado`,
        newStatus,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'text/plain'
          }
        }
      );
      // Refresca tareas
      const tasksRes = await axios.get(`http://localhost:8080/api/sprints/${selectedSprint}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasksRes.data.map(t => ({
        ...t,
        title: t.titulo,
        description: t.descripcion
      })));
    } catch (err) {
      alert('No se pudo mover la tarea');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setSelectedTeam(null);
    setBoard(null);
    setSelectedSprint(null);
    setTasks([]);
    setSelectedTaskId(null);
  };

  const refreshTasks = async () => {
    if (!selectedSprint) return;
    try {
      const tasksRes = await axios.get(`http://localhost:8080/api/sprints/${selectedSprint}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasksRes.data.map(t => ({
        ...t,
        title: t.titulo,
        description: t.descripcion
      })));
    } catch {
      setTasks([]);
    }
  };

  const handleAddSprint = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/sprints', {
        nombre: newSprintName,
        boardId: board.id,
        fechaInicio: newSprintStart,
        fechaFin: newSprintEnd,
        objetivo: newSprintGoal
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSprints(prev => [...prev, res.data]);
      setSelectedSprint(res.data.id); // <-- Selecciona automáticamente el nuevo sprint
      setShowAddSprint(false);
      setNewSprintName('');
      setNewSprintStart('');
      setNewSprintEnd('');
      setNewSprintGoal('');
    } catch {
      alert('No se pudo crear el sprint');
    }
  };

  // 1. Si no hay token, muestra login
  if (!token) {
    return <LoginPage onLogin={setToken} />;
  }

  // 2. Si no hay equipo seleccionado, muestra menú principal
  if (!selectedTeam) {
    return (
      <MainMenu
        token={token}
        onLogout={handleLogout}
        onSelectTeam={setSelectedTeam}
        userId={userId}
      />
    );
  }

  // 3. Si hay equipo seleccionado, muestra el tablero real
  return (
    <div className="app-root">
      <header className="header-bar">
        <img src={logo} alt="FlowBoard logo" className="header-logo" />
        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </header>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 1400 }}>
          <div className="sprint-selector-bar">
            <span className="sprint-selector-label">Sprint:</span>
            <SprintSelector
              sprints={sprints.map(s => ({ ...s, name: s.nombre }))}
              selectedSprint={selectedSprint || ""}
              onChange={handleSprintChange}
              selectClassName="sprint-selector-select"
            />
            <button
              className="add-sprint-btn"
              onClick={() => setShowAddSprint(true)}
              style={{
                marginLeft: 12,
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '4px 12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              + Sprint
            </button>
          </div>
          <Board
            tasks={tasks}
            onMoveTask={handleMoveTask}
            boardId={board ? board.id : ''}
            userId={userId}
            onSelectTask={setSelectedTaskId}
            selectedSprint={selectedSprint}
            token={token} // <-- ¡Esto debe estar!
            refreshTasks={refreshTasks}
          />
        </div>
        {selectedTaskId && (
          <TaskChat taskId={selectedTaskId} userId={userId} onClose={() => setSelectedTaskId(null)} />
        )}
      </div>
      {showAddSprint && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleAddSprint} className="add-sprint-form">
              <h3>Nuevo Sprint</h3>
              <input
                type="text"
                value={newSprintName}
                onChange={e => setNewSprintName(e.target.value)}
                placeholder="Nombre del sprint"
                required
              />
              <input
                type="date"
                value={newSprintStart}
                onChange={e => setNewSprintStart(e.target.value)}
                placeholder="Fecha inicio"
                required
              />
              <input
                type="date"
                value={newSprintEnd}
                onChange={e => setNewSprintEnd(e.target.value)}
                placeholder="Fecha fin"
                required
              />
              <textarea
                value={newSprintGoal}
                onChange={e => setNewSprintGoal(e.target.value)}
                placeholder="Objetivo"
                style={{ resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn-primary">Crear</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddSprint(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
