import React from 'react';
import TaskCard from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import '../stylesheets/BoardColumn.css';


const Column = ({ column, tasks, onMoveTask, onSelectTask, onAddTask, onDeleteTask }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div
      ref={setNodeRef}
      className={`column${isOver ? ' over' : ''}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="column-title">{column.title}</h2>
        <button
          className="add-task-btn"
          title="Agregar tarea"
          onClick={() => onAddTask(String(column.id))}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: 22,
            cursor: 'pointer',
            marginRight: 4
          }}
        >+</button>
      </div>
      {tasks.map((task, idx) => (
        <TaskCard
          key={task.id}
          task={task}
          onMoveTask={onMoveTask}
          index={idx}
          onSelectTask={onSelectTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  );
};

export default Column;
