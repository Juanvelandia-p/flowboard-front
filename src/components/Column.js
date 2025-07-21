
import React from 'react';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import '../stylesheets/BoardColumn.css';


const Column = ({ column, tasks, onMoveTask, onSelectTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      className={`column${isOver ? ' over' : ''}`}
    >
      <h2 className="column-title">{column.title}</h2>
      {tasks.map((task, idx) => (
        <TaskCard
          key={task.id}
          task={task}
          onMoveTask={onMoveTask}
          index={idx}
          onSelectTask={onSelectTask}
        />
      ))}
    </div>
  );
};

export default Column;
