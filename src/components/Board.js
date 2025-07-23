import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import Column from './Column';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import '../stylesheets/BoardColumn.css';
import axios from 'axios';

export default function Board({ tasks, onMoveTask, boardId, userId, onSelectTask, selectedSprint, token, refreshTasks }) {
  const [activeId, setActiveId] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskEstado, setNewTaskEstado] = useState('TO-DO'); // Estado por defecto
  const [addTaskColumn, setAddTaskColumn] = useState('TO-DO');
  const { stompClient, addOnConnectListener } = useWebSocket();

  // Columnas
  const columns = [
    { id: 'TO-DO', title: 'Pendiente' },
    { id: 'DOING', title: 'En progreso' },
    { id: 'DONE', title: 'Hecho' }
  ];

  // Agrupa tareas por estado
  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.estado === col.id);
    return acc;
  }, {});

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || !active) return;
    const dndTaskId = String(active.id);
    const newStatus = String(over.id);
    const task = tasks.find(t => String(t.id) === dndTaskId);
    if (task && task.estado !== newStatus) {
      onMoveTask(task.id, newStatus);
      // Enviar evento WebSocket si lo necesitas
      if (stompClient?.current && stompClient.current.connected) {
        stompClient.current.publish({
          destination: `/app/task/drag`,
          body: JSON.stringify({
            taskId: task.id,
            fromStatus: task.estado,
            toStatus: newStatus,
            boardId,
            userId
          })
        });
      }
    }
  };

  useEffect(() => {
    if (!stompClient?.current) return;
    let subscription;
    const subscribe = () => {
      if (stompClient.current.connected) {
        subscription = stompClient.current.subscribe(`/topic/task-drag.${boardId}`, (message) => {
          const event = JSON.parse(message.body);
          const task = tasks.find(t => String(t.id) === String(event.taskId));
          // Solo mueve si la tarea existe en este usuario
          if (event.userId !== userId && task) {
            onMoveTask(task.id, event.toStatus);
          }
        });
      }
    };
    let removeListener;
    if (stompClient.current.connected) {
      subscribe();
    } else {
      removeListener = addOnConnectListener(subscribe);
    }
    return () => {
      if (subscription) subscription.unsubscribe();
      if (removeListener) removeListener();
    };
  }, [stompClient, addOnConnectListener, boardId, userId, onMoveTask, tasks]);

  const activeTask = tasks.find(t => String(t.id) === String(activeId));

  // Handler para mostrar el formulario de nueva tarea
  const handleShowAddTask = (colId) => {
    setAddTaskColumn(colId);
    setNewTaskEstado(colId);
    setShowAddTask(true);
  };

  // Handler para crear la tarea
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/tasks', {
        titulo: newTaskTitle,
        descripcion: newTaskDesc,
        estado: newTaskEstado,
        boardId,
        sprintId: selectedSprint
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddTask(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      if (refreshTasks) refreshTasks(); // Refresca las tareas
    } catch {
      alert('No se pudo crear la tarea');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta tarea?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (refreshTasks) refreshTasks();
    } catch {
      alert('No se pudo eliminar la tarea');
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="board-container">
        {columns.map(col => (
          <Column
            key={col.id}
            column={col}
            tasks={tasksByColumn[col.id]}
            onMoveTask={onMoveTask}
            onSelectTask={onSelectTask}
            onAddTask={handleShowAddTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
        {showAddTask && (
          <div className="modal-overlay">
            <div className="modal-content">
              <form onSubmit={handleAddTask} className="add-sprint-form">
                <h3>Nueva tarea ({addTaskColumn})</h3>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Título"
                  required
                />
                <textarea
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  placeholder="Descripción"
                  required
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" className="btn-primary">Crear</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowAddTask(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
