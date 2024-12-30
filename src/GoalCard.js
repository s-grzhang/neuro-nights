// GoalCard.js
import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';

const GoalCard = ({ goal, onDelete }) => {
  return (
    <div className="goal-item">
      <p>Goal: {goal.text}</p>  {/* Display full goal text */}
      <FaTrashAlt className="trash-icon" onClick={() => onDelete(goal.id)} />
      <div className="progress-bar-goal">
        <div className="progress-goal" style={{ width: `${goal.progress}%` }}></div>
      </div>
    </div>
  );
};

export default GoalCard;
