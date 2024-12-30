import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './GoalsPage.css';
import recommendedGoalsImage from "./Recommended Goals.png";
import GoalCard from './GoalCard';

const GoalsPage = ({ onEarnPoints }) => { // Accept onEarnPoints as a prop
  const [menuOpen, setMenuOpen] = useState(false);
  const [goals, setGoals] = useState([
    { id: 1, text: 'I will sleep from 11 PM to 8 AM.', progress: 50 },
    { id: 2, text: 'I will sleep for 9 hours.', progress: 70 },
    { id: 3, text: 'I will avoid a variance of more than 15 minutes every night.', progress: 30 },
    { id: 4, text: 'I will sleep for 8 hours every night.', progress: 100, points: 400 } // Add points property
  ]);

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  return (
    <div className={`goals-page ${menuOpen ? "menu-open" : ""}`}>
      <div className="goal-box">
        <img src={recommendedGoalsImage} alt="Recommended Goals" className="goal-image" />
      </div>
      <div className="current-goals">
        <h2>Current Goals</h2>
        {goals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
            onDelete={handleDeleteGoal} 
            onEarnPoints={onEarnPoints} // Pass down the onEarnPoints function
          />
        ))}
      </div>
    </div>
  );
};

export default GoalsPage;
