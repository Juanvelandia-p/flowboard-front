import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import '../stylesheets/TaskCard.css';

const TaskCard = ({ task, onMoveTask, index, onSelectTask, onDeleteTask }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: String(task.id) });
  return (
    <div
      ref={setNodeRef}
      className={`task-card${isDragging ? ' dragging' : ''}`}
    >
      <span
        {...attributes}
        {...listeners}
        className="task-card-handle"
        title="Arrastrar tarea"
        aria-label="Arrastrar tarea"
      >☰</span>
      <div className="task-card-content">
        <div className="task-card-title">{task.title}</div>
        <div>{task.description}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          className="task-card-chat-btn"
          title="Abrir chat"
          onClick={e => {
            e.stopPropagation();
            if (onSelectTask) onSelectTask(task.id);
          }}
          tabIndex={0}
        >💬</button>
        <button
          className="task-card-delete-btn"
          title="Eliminar tarea"
          onClick={e => {
            e.stopPropagation();
            if (onDeleteTask) onDeleteTask(task.id);
          }}
          tabIndex={0}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#d32f2f',
            fontSize: 18,
            cursor: 'pointer'
          }}
        >🗑️</button>
      </div>
    </div>
  );
};

export default TaskCard;
