import React, { useState } from 'react';
import { FaTrashAlt, FaPencilAlt, FaCheck, FaStar } from 'react-icons/fa';
import './GoalsPage.css';

const GoalCard = ({ goal, onDelete, onEdit, onCompleted }) => {
  const [claimed, setClaimed] = useState(false);

  const handleClaimPoints = () => {
    setClaimed(true);
    
    setTimeout(() => {
      // Call the parent's onCompleted function
      if (onCompleted) {
        onCompleted(goal);
      }
    }, 500);
  };

  // Determine progress bar color
  const getProgressColor = () => {
    if (goal.progress >= 100) {
      return '#4CAF50'; // Green for complete
    } else if (goal.progress > 66) {
      return '#8BC34A'; // Light green for almost there
    } else if (goal.progress > 33) {
      return '#FFC107'; // Yellow for halfway
    } else {
      return '#FF9800'; // Orange for just started
    }
  };

  return (
    <div className="goal-item">
      <div className="goal-header">
        <p className="goal-text">{goal.text}</p>
        <div className="goal-actions">
          {!claimed && (
            <>
              <FaPencilAlt 
                className="edit-icon" 
                onClick={() => onEdit(goal)} 
                title="Edit goal"
              />
              <FaTrashAlt 
                className="trash-icon" 
                onClick={() => onDelete(goal.id)} 
                title="Delete goal"
              />
            </>
          )}
        </div>
      </div>
      
      <div className="goal-progress-container">
        <div 
          className="goal-progress-bar" 
          style={{ 
            width: `${goal.progress}%`,
            backgroundColor: getProgressColor() 
          }}
        >
          {goal.progress > 0 && (
            <FaStar className="progress-star" />
          )}
        </div>
      </div>
      
      <div className="progress-info">
        <span className="progress-label">
          {goal.progress >= 100 ? 'Goal Complete!' : `${goal.progress}% complete`}
        </span>
        <span className="progress-days">
          {goal.progress > 0 ? 
            `${Math.floor(21 * (goal.progress / 100))} of 21 days` : 
            'Start tracking your sleep to make progress'
          }
        </span>
      </div>
      
      {goal.progress === 100 && !goal.pointsAwarded && !claimed && (
        <button className="rewards-button" onClick={handleClaimPoints}>
          <FaCheck className="check-icon" /> CLAIM {goal.points || 400} POINTS
        </button>
      )}
      
      {claimed && (
        <div className="claimed-message">
          <FaCheck className="claimed-icon" /> Points claimed!
        </div>
      )}
    </div>
  );
};

export default GoalCard;
