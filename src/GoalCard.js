import React, { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import './GoalsPage.css';  // Ensure this line is present at the top of your GoalsPage.js

const GoalCard = ({ goal, onDelete, onEarnPoints }) => {
  const [animationActive, setAnimationActive] = useState(false);

  const handleEarnPoints = () => {
    setAnimationActive(true);
    setTimeout(() => {
      onEarnPoints(goal.points);  // Pass the points to the parent
      setAnimationActive(false);
    }, 1000); // Adjust duration of the animation here
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
