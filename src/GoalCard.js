import React, { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import './GoalsPage.css';

const GoalCard = ({ goal, onDelete, onEarnPoints }) => {
  const [animationActive, setAnimationActive] = useState(false);

  const handleEarnPoints = () => {
    setAnimationActive(true);
    setTimeout(() => {
      onEarnPoints(goal.points || 0); // Ensure points are passed correctly
      onDelete(goal.id); // Delete the goal after earning points
      setAnimationActive(false);
    }, 1000);
  };

  return (
    <div className={`goal-item ${animationActive ? 'animate' : ''}`}>
      <p>Goal: {goal.text}</p>
      <FaTrashAlt className="trash-icon" onClick={() => onDelete(goal.id)} />
      <div className="progress-bar-goal">
        <div className="progress-goal" style={{ width: `${goal.progress}%` }}></div>
      </div>
      {goal.progress === 100 && (
        <button className="rewards-button" onClick={handleEarnPoints}>
          400 PTS
        </button>
      )}
    </div>
  );
};

export default GoalCard;
