import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import '../stylesheets/TaskCard.css';

const TaskCard = ({ task, onMoveTask, index, onSelectTask }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
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
      <button
        className="task-card-chat-btn"
        title="Abrir chat"
        onClick={e => {
          e.stopPropagation();
          if (onSelectTask) onSelectTask(task.id);
        }}
        tabIndex={0}
      >💬</button>
    </div>
  );
};

export default TaskCard;
