import React from 'react';
import { useDraggable } from '@dnd-kit/core';

const TaskCard = ({ task, onMoveTask, index }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        background: isDragging ? '#dbeafe' : '#fff',
        margin: '8px 0',
        padding: 12,
        borderRadius: 6,
        boxShadow: '0 1px 4px #ccc',
        cursor: 'grab',
        opacity: isDragging ? 0.7 : 1
      }}
    >
      <div><strong>{task.title}</strong></div>
      <div>{task.description}</div>
    </div>
  );
};

export default TaskCard;
