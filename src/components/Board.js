import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import Column from './Column';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import '../stylesheets/BoardColumn.css';

const columns = [
  { id: 'todo', title: 'Pendiente' },
  { id: 'inprogress', title: 'En Progreso' },
  { id: 'done', title: 'Hecho' }
];


const Board = ({ tasks, onMoveTask, boardId, userId, onSelectTask }) => {
  const [activeId, setActiveId] = useState(null);
  const { stompClient, addOnConnectListener } = useWebSocket();

  // Agrupar tareas por columna
  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || !active) return;
    const taskId = Number(active.id);
    const newStatus = over.id;
    // Solo mover si cambia de columna
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      onMoveTask(taskId, newStatus);
      // Enviar evento WebSocket
      if (stompClient.current && stompClient.current.connected) {
        console.log('[WebSocket] Enviando evento:', {
          taskId: taskId,
          fromStatus: task.status,
          toStatus: newStatus,
          boardId: boardId,
          userId: userId
        });
        stompClient.current.publish({
          destination: '/app/task/drag',
          body: JSON.stringify({
            taskId: taskId,
            fromStatus: task.status,
            toStatus: newStatus,
            boardId: boardId,
            userId: userId
          })
        });
      } else {
        console.warn('[WebSocket] No conectado, no se envió el evento');
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
          if (event.userId !== userId) {
            onMoveTask(Number(event.taskId), event.toStatus);
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
  }, [stompClient, addOnConnectListener, boardId, userId, onMoveTask]);

  const activeTask = tasks.find(t => t.id === Number(activeId));

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
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Board;
