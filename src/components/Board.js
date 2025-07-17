
import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import Column from './Column';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import TaskCard from './TaskCard';

const columns = [
  { id: 'todo', title: 'Pendiente' },
  { id: 'inprogress', title: 'En Progreso' },
  { id: 'done', title: 'Hecho' }
];


const Board = ({ tasks, onMoveTask, boardId, userId }) => {
  const [activeId, setActiveId] = useState(null);
  const stompClient = useRef(null);

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
    // Conexión WebSocket
    console.log('[WebSocket] Intentando conectar a ws://localhost:8080/ws');
    const socket = new SockJS('http://localhost:8080/ws'); // Cambia la URL si es necesario
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[WebSocket] Conectado');
        // Suscribirse al topic del board
        client.subscribe(`/topic/task-drag.${boardId}`, (message) => {
          console.log('[WebSocket] Mensaje recibido:', message.body);
          const event = JSON.parse(message.body);
          // Evita procesar el evento si es tu propio drag (opcional)
          if (event.userId !== userId) {
            onMoveTask(Number(event.taskId), event.toStatus);
          } else {
            console.log('[WebSocket] Evento propio ignorado');
          }
        });
        console.log(`[WebSocket] Suscrito a /topic/task-drag.${boardId}`);
      },
      onStompError: (frame) => {
        console.error('[WebSocket] Error STOMP:', frame);
      },
      onWebSocketError: (event) => {
        console.error('[WebSocket] Error de conexión:', event);
      }
    });
    stompClient.current = client;
    client.activate();
    return () => {
      client.deactivate();
      console.log('[WebSocket] Desconectado');
    };
  }, [boardId, userId, onMoveTask]);

  const activeTask = tasks.find(t => t.id === Number(activeId));

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        {columns.map(col => (
          <Column
            key={col.id}
            column={col}
            tasks={tasksByColumn[col.id]}
            onMoveTask={onMoveTask}
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
