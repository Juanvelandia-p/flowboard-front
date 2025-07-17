
import React from 'react';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';


const Column = ({ column, tasks, onMoveTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 300,
        background: isOver ? '#e0e7ff' : '#f4f4f4',
        borderRadius: 8,
        padding: 16,
        minHeight: 200
      }}
    >
      <h2>{column.title}</h2>
      {tasks.map((task, idx) => (
        <TaskCard key={task.id} task={task} onMoveTask={onMoveTask} index={idx} />
      ))}
    </div>
  );
};

export default Column;
