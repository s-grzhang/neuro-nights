import React, { useState } from 'react';
import { FaTrashAlt, FaPencilAlt, FaCheck, FaLock } from 'react-icons/fa';
import './GoalsPage.css';

const GoalCard = ({ goal, onDelete, onEarnPoints, onEdit }) => {
  const [animationActive, setAnimationActive] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleEarnPoints = () => {
    setAnimationActive(true);
    setClaimed(true);
    
    setTimeout(() => {
      // Call the parent's onEarnPoints function with the goal's points
      onEarnPoints(goal.points || 400); // Default to 400 if no points specified
      
      // Delete the goal after a slight delay (for animation to complete)
      setTimeout(() => {
        onDelete(goal.id);
        setAnimationActive(false);
      }, 500);
    }, 1000);
  };

  // Get the text for the progress bar label
  const getProgressText = () => {
    if (goal.progress >= 100) {
      return 'Goal Complete!';
    } else if (goal.progress === 0) {
      return 'Just started';
    } else {
      return `${goal.progress}% complete`;
    }
  };

  // Determine if the goal is in progress (not 0% and not 100%)
  const isInProgress = goal.progress > 0 && goal.progress < 100;
  
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
    <div className={`goal-item ${animationActive ? 'animate' : ''} ${goal.progress >= 100 ? 'completed' : ''}`}>
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
      
      <div className="progress-section">
        <div className="progress-bar-goal">
          <div 
            className="progress-goal" 
            style={{ 
              width: `${goal.progress}%`,
              backgroundColor: getProgressColor()
            }}
          >
            {isInProgress && <span className="progress-text">{goal.progress}%</span>}
          </div>
        </div>
        
        <div className="progress-info">
          <span className="progress-label">{getProgressText()}</span>
          {goal.progress < 100 && (
            <span className="progress-days">
              {goal.progress > 0 ? 
                `${Math.floor(21 * (goal.progress / 100))} of 21 days` : 
                'Start tracking your sleep to make progress'}
            </span>
          )}
        </div>
      </div>
      
      {goal.progress === 100 && !claimed && (
        <button className="rewards-button" onClick={handleEarnPoints}>
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
