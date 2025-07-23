import React from 'react';


const SprintSelector = ({ sprints, selectedSprint, onChange, selectClassName }) => (
  <select
    id="sprint-select"
    value={selectedSprint}
    onChange={onChange}
    className={selectClassName || ''}
  >
    {sprints.map(sprint => (
      <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
    ))}
  </select>
);

export default SprintSelector;
